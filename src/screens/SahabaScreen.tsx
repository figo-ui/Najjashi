import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper, Badge, ProgressBar, SectionHeader } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets, ButtonPresets } from '../theme';
import { getSahabaLessons } from '../services/localData';
import { Lightbulb } from 'lucide-react-native';

export function SahabaScreen() {
  const { t } = useTranslation();
  const { sahabaLessons, currentLessonIndex, markLessonComplete, setCurrentLessonIndex, setRecommendations } = useStore();

  const lessons = sahabaLessons.length > 0 ? sahabaLessons : getSahabaLessons();
  const current = lessons[currentLessonIndex] || lessons[0];

  useEffect(() => {
    if (sahabaLessons.length === 0) {
      const loaded = getSahabaLessons();
      useStore.setState({ sahabaLessons: loaded });
    }
  }, []);

  const completedCount = lessons.filter(l => l.isComplete).length;
  const progress = completedCount / lessons.length;

  const handleComplete = () => {
    markLessonComplete(current.id);
    const nextIdx = currentLessonIndex + 1;
    if (nextIdx < lessons.length) {
      setCurrentLessonIndex(nextIdx);
    }
    setRecommendations([
      { id: 'rec-sahaba', type: 'sahaba', title: lessons[nextIdx]?.title || t('sahaba_complete'), reason: t('continue_learning'), contentId: lessons[nextIdx]?.id || '', priority: 1, confidence: 0.8, reasoning: 'Next Sahaba lesson' },
    ]);
  };

  return (
    <ScreenWrapper title={t('sahaba')} subtitle="Stories of the Companions">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Character Hero ─── */}
        <View style={styles.characterHero}>
          <View style={styles.characterGlow} />
          <Text style={styles.characterArabic}>{current.characterNameAr}</Text>
          <Text style={styles.characterName}>{current.characterName} (RA)</Text>
          <View style={styles.characterProgressRow}>
            <ProgressBar progress={progress} variant="gold" height={3} />
            <Text style={styles.characterProgressLabel}>{completedCount}/{lessons.length}</Text>
          </View>
        </View>

        {/* ─── Lesson Card ─── */}
        <View style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <Badge label={`${t('lesson')} ${current.lessonNumber}/${current.totalLessons}`} variant="emerald" />
            {current.isComplete && <Badge label={t('completed')} variant="gold" />}
          </View>

          <Text style={styles.lessonTitle}>{current.title}</Text>
          <Text style={styles.lessonTitleAr}>{current.titleAr}</Text>

          <Text style={styles.lessonNarration}>{current.narration}</Text>

          {/* Takeaway */}
          <View style={styles.takeawayCard}>
            <View style={styles.takeawayLabelRow}>
              <Lightbulb size={14} color={Colors.gold[400]} strokeWidth={2} />
              <Text style={styles.takeawayLabel}>{t('takeaway')}</Text>
            </View>
            <Text style={styles.takeawayText}>{current.takeaway}</Text>
          </View>

          {/* Complete Button */}
          {!current.isComplete && (
            <Pressable
              onPress={handleComplete}
              style={({ pressed }) => [styles.completeButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.completeButtonText}>{t('mark_complete')}</Text>
            </Pressable>
          )}
        </View>

        {/* ─── Navigation ─── */}
        <View style={styles.navRow}>
          <Pressable
            onPress={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
            style={({ pressed }) => [
              styles.navButton,
              currentLessonIndex <= 0 && styles.navButtonDisabled,
              pressed && currentLessonIndex > 0 && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.navButtonText, currentLessonIndex <= 0 && styles.navButtonTextDisabled]}>
              ← {t('previous')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
            style={({ pressed }) => [
              styles.navButton,
              currentLessonIndex >= lessons.length - 1 && styles.navButtonDisabled,
              pressed && currentLessonIndex < lessons.length - 1 && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.navButtonText, currentLessonIndex >= lessons.length - 1 && styles.navButtonTextDisabled]}>
              {t('next')} →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  characterHero: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    ...CardPresets.gold,
    padding: Spacing['3xl'],
    alignItems: 'center',
    overflow: 'hidden',
  },
  characterGlow: {
    position: 'absolute' as const,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212,168,67,0.04)',
  },
  characterArabic: {
    ...Typography.arabicXl,
    color: Colors.gold[400],
    textAlign: 'center',
  },
  characterName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  characterProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '70%',
  },
  characterProgressLabel: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
  },
  lessonCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    ...CardPresets.primary,
    padding: Spacing.xl,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  lessonTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  lessonTitleAr: {
    ...Typography.arabicMd,
    color: Colors.gold[400],
    marginBottom: Spacing.lg,
  },
  lessonNarration: {
    ...Typography.bodyLg,
    color: Colors.text.secondary,
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },
  takeawayCard: {
    backgroundColor: 'rgba(212,168,67,0.08)',
    borderWidth: 1,
    borderColor: Colors.border.gold,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  takeawayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  takeawayLabel: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  takeawayText: {
    ...Typography.body,
    color: Colors.gold[200],
  },
  completeButton: {
    ...ButtonPresets.primary,
  },
  completeButtonText: {
    ...Typography.h4,
    color: Colors.text.inverse,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  navButton: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...Typography.body,
    color: Colors.emerald[400],
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: Colors.text.muted,
  },
});
