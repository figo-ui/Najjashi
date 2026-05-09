import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flame, Sparkles } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { getEnrichedAdhkarByTime } from '../services/localData';
import { startFocusMode, stopFocusMode } from '../services/focusModeService';
import {
  startRecitationListening,
  stopRecitationListening,
  startSilenceMonitor,
  getEngagementScore,
  resetEngagementScore,
  assessAdhkarCompletion,
} from '../services/recognitionService';
import type { ZikrItem, RecitationState } from '../types';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { trainOnFocusSession, trainOnRecitation, trainOnStrugglingAdhkar, trainOnAdhkarSession } from '../services/aiRecommendations';

export function GuidedAdhkarScreen({ navigation }: any) {
  const { t } = useTranslation();
  const {
    focusPhase,
    setFocusPhase,
    focusSession,
    startFocusSession,
    completeFocusSession,
    focusSettings,
    guidedAdhkarIndex,
    setGuidedAdhkarIndex,
    focusBypassUsed,
    setFocusBypassUsed,
    recordAdhkarCompletion,
    updateAIPersonalization,
    adhkarStreak,
    setRecitationState,
    preferences,
  } = useStore();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [recitationStates, setRecitationStates] = useState<RecitationState[]>([]);
  const [showCompletionCelebration, setShowCelebration] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const sessionType = focusSession?.type ?? 'morning';
  const adhkarList = getEnrichedAdhkarByTime(sessionType === 'morning' ? 'morning' : 'evening');
  const currentItem = adhkarList[guidedAdhkarIndex];
  const progress = adhkarList.length > 0 ? completedIds.size / adhkarList.length : 0;

  // Start focus session if not active
  useEffect(() => {
    if (focusPhase === 'idle' || !focusSession) {
      const type = new Date().getHours() < 14 ? 'morning' : 'evening';
      startFocusSession(type, adhkarList.length);
    }
  }, []);

  // Start native focus mode overlay
  useEffect(() => {
    if (focusPhase === 'active' && focusSettings.enabled) {
      startFocusMode(focusSettings.blockedApps).catch(() => {});
    }
    return () => {
      stopFocusMode().catch(() => {});
    };
  }, [focusPhase, focusSettings.enabled]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [guidedAdhkarIndex]);

  // Pulse animation for active recitation
  useEffect(() => {
    if (focusPhase === 'reciting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [focusPhase]);

  // AI listening
  useEffect(() => {
    if (focusPhase === 'active' && focusSettings.aiListeningEnabled && currentItem) {
      startRecitationListening((state) => {
        setRecitationState(state);
        setRecitationStates(prev => [...prev.slice(-20), state]);

        if (state.isEngaged) {
          setFocusPhase('reciting');
        }
      }).catch(() => {});

      // Start silence monitor — remind after 30s of silence
      startSilenceMonitor(30000, () => {
        setFocusPhase('active'); // gentle nudge back
      });
    }

    return () => {
      stopRecitationListening();
    };
  }, [focusPhase, guidedAdhkarIndex, focusSettings.aiListeningEnabled]);

  const handleAdhkarComplete = useCallback(() => {
    if (!currentItem) return;

    if (preferences.hapticEnabled) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
    }

    const newCompleted = new Set(completedIds);
    newCompleted.add(currentItem.id);
    setCompletedIds(newCompleted);

    // Check if all adhkar are complete
    if (newCompleted.size >= adhkarList.length) {
      handleAllComplete();
      return;
    }

    // Move to next
    const nextIndex = guidedAdhkarIndex + 1;
    if (nextIndex < adhkarList.length) {
      setGuidedAdhkarIndex(nextIndex);
      setRecitationStates([]);
      resetEngagementScore();
      setFocusPhase('active');
    }
  }, [currentItem, completedIds, guidedAdhkarIndex, adhkarList.length]);

  const handleAllComplete = useCallback(() => {
    const score = getEngagementScore();
    completeFocusSession(score);
    recordAdhkarCompletion(sessionType);

    // Track struggling adhkar (those with low engagement)
    const struggling = adhkarList
      .filter((_: ZikrItem, i: number) => i === guidedAdhkarIndex && score < 0.3)
      .map((a: ZikrItem) => a.id);
    updateAIPersonalization(struggling);

    // Train AI engine
    trainOnStrugglingAdhkar(struggling);
    trainOnAdhkarSession(sessionType, completedIds.size, adhkarList.length, focusSession?.durationSeconds ?? 0);
    if (focusSession) trainOnFocusSession(focusSession);
    if (recitationStates.length > 0) trainOnRecitation(recitationStates, currentItem?.count ?? 1);

    // Stop native focus mode
    stopFocusMode().catch(() => {});

    // Show celebration
    setShowCelebration(true);
    if (preferences.hapticEnabled) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
    }
  }, [sessionType, guidedAdhkarIndex]);

  const handleBypass = useCallback(() => {
    setFocusBypassUsed(true);
    stopFocusMode().catch(() => {});
    setFocusPhase('idle');
    navigation?.goBack();
  }, []);

  const handleSkip = useCallback(() => {
    if (guidedAdhkarIndex < adhkarList.length - 1) {
      setGuidedAdhkarIndex(guidedAdhkarIndex + 1);
      setRecitationStates([]);
      resetEngagementScore();
    }
  }, [guidedAdhkarIndex, adhkarList.length]);

  // ─── Celebration Screen ───
  if (showCompletionCelebration) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f0d', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Sparkles size={48} color="#10b981" strokeWidth={1.5} style={{ marginBottom: 16 }} />
        <Text style={{ color: '#fbbf24', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          {t('focus_complete_title')}
        </Text>
        <Text style={{ color: '#e8f5e9', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
          {t('focus_complete_message')}
        </Text>
        <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 16, padding: 16, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Flame size={16} color="#10b981" strokeWidth={2} />
            <Text style={{ color: '#10b981', fontSize: 14, textAlign: 'center' }}>
              {adhkarStreak.currentStreak} {t('day_streak')}
            </Text>
          </View>
        </View>
        <Pressable
          style={{ backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}
          onPress={() => {
            setFocusPhase('idle');
            navigation?.goBack();
          }}
        >
          <Text style={{ color: '#0a0f0d', fontSize: 16, fontWeight: '600' }}>{t('continue')}</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Main Guided Experience ───
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      {/* Top Bar: Progress + Emergency */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>
          {completedIds.size}/{adhkarList.length} {t('completed')}
        </Text>
        <Pressable
          onPress={handleBypass}
          style={{ backgroundColor: 'rgba(220,38,38,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
        >
          <Text style={{ color: 'rgba(220,38,38,0.7)', fontSize: 11, fontWeight: '600' }}>{t('emergency_bypass')}</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 3, backgroundColor: 'rgba(6,78,59,0.3)', marginHorizontal: 20, borderRadius: 2 }}>
        <View style={{ height: 3, backgroundColor: '#10b981', borderRadius: 2, width: `${progress * 100}%` }} />
      </View>

      {/* Session Info */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
        <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
          {sessionType === 'morning' ? t('morning_adhkar') : t('evening_adhkar')} · {t('focus_mode')}
        </Text>
      </View>

      {/* Current Adhkar Card */}
      {currentItem && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} style={{ flex: 1 }}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: pulseAnim }] }}>
            <View style={{
              backgroundColor: focusPhase === 'reciting' ? 'rgba(16,185,129,0.08)' : 'rgba(6,78,59,0.25)',
              borderWidth: 1,
              borderColor: focusPhase === 'reciting' ? 'rgba(16,185,129,0.3)' : 'rgba(6,78,59,0.3)',
              borderRadius: 24,
              padding: 28,
              marginTop: 8,
            }}>
              {/* Arabic */}
              <Text style={{
                color: '#fbbf24',
                fontSize: 28,
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 44,
                writingDirection: 'rtl',
              }}>
                {currentItem.arabic}
              </Text>

              {/* Transliteration */}
              <Text style={{
                color: 'rgba(167,196,176,0.6)',
                fontSize: 14,
                marginTop: 16,
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                {currentItem.transliteration}
              </Text>

              {/* Translation */}
              <Text style={{
                color: 'rgba(232,245,233,0.8)',
                fontSize: 15,
                marginTop: 10,
                textAlign: 'center',
                lineHeight: 22,
              }}>
                {currentItem.translation}
              </Text>

              {/* Count + Reward */}
              <View style={{ marginTop: 20, paddingTop: 16, borderTopColor: 'rgba(6,78,59,0.3)', borderTopWidth: 1 }}>
                <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textAlign: 'center', marginBottom: 6 }}>
                  {currentItem.count}x · {currentItem.reward}
                </Text>
              </View>

              {/* AI Status */}
              {focusSettings.aiListeningEnabled && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: focusPhase === 'reciting' ? '#10b981' : 'rgba(167,196,176,0.3)',
                    marginRight: 8,
                  }} />
                  <Text style={{ color: focusPhase === 'reciting' ? '#10b981' : 'rgba(167,196,176,0.4)', fontSize: 11 }}>
                    {focusPhase === 'reciting' ? t('listening_active') : t('listening_waiting')}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={{ marginTop: 24, gap: 12 }}>
            <Pressable
              style={{ backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
              onPress={handleAdhkarComplete}
            >
              <Text style={{ color: '#0a0f0d', fontSize: 16, fontWeight: '600' }}>
                {t('mark_complete')}
              </Text>
            </Pressable>

            {!focusSettings.aiListeningEnabled && (
              <Pressable
                style={{ backgroundColor: 'rgba(6,78,59,0.4)', paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}
                onPress={handleSkip}
              >
                <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14 }}>{t('skip_adhkar')}</Text>
              </Pressable>
            )}
          </View>

          {/* Gentle Reminder */}
          {focusPhase === 'active' && !focusSettings.aiListeningEnabled && (
            <Text style={{
              color: 'rgba(167,196,176,0.3)',
              fontSize: 12,
              textAlign: 'center',
              marginTop: 20,
              fontStyle: 'italic',
            }}>
              {t('focus_gentle_reminder')}
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
