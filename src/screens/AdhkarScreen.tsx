import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sunrise, Sunset, Moon, BedDouble, HandHeart } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { ScreenWrapper, Badge, ProgressBar, SectionHeader } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';
import { getAdhkarByTime } from '../services/localData';
import type { AdhkarTime } from '../types';

const TIME_ICONS: Record<AdhkarTime, React.ElementType> = {
  morning: Sunrise,
  evening: Sunset,
  after_prayer: Moon,
  sleep: BedDouble,
  general: HandHeart,
};

export function AdhkarScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { adhkarTime, setAdhkarTime, setImmersiveZikr, zikrList, incrementZikr, resetZikr, resetAllZikr, focusSettings } = useStore();

  const times: { key: AdhkarTime; label: string }[] = [
    { key: 'morning', label: 'morning_adhkar' },
    { key: 'evening', label: 'evening_adhkar' },
    { key: 'after_prayer', label: 'after_prayer_adhkar' },
    { key: 'sleep', label: 'sleep_adhkar' },
  ];

  const adhkarData = getAdhkarByTime(adhkarTime);
  const displayList = zikrList.length > 0 && zikrList[0]?.category === adhkarTime ? zikrList : adhkarData;

  useEffect(() => {
    if (zikrList.length === 0 || zikrList[0]?.category !== adhkarTime) {
      useStore.setState({ zikrList: adhkarData });
    }
  }, [adhkarTime]);

  const completedCount = displayList.filter(a => a.completed >= a.count).length;
  const progress = displayList.length > 0 ? completedCount / displayList.length : 0;

  return (
    <ScreenWrapper title={t('adhkar')} subtitle="Morning, Evening & After Prayer">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Time Selector ─── */}
        <View style={styles.timeSelector}>
          {times.map((time) => (
            <Pressable
              key={time.key}
              onPress={() => setAdhkarTime(time.key)}
              style={({ pressed }) => [
                styles.timeChip,
                adhkarTime === time.key && styles.timeChipActive,
                pressed && styles.chipPressed,
              ]}
            >
              {(() => {
                const Icon = TIME_ICONS[time.key];
                return <Icon size={14} color={adhkarTime === time.key ? Colors.text.inverse : Colors.text.secondary} strokeWidth={2} />;
              })()}
              <Text style={[styles.timeChipText, adhkarTime === time.key && styles.timeChipTextActive]}>
                {t(time.label)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ─── Progress ─── */}
        <View style={styles.progressRow}>
          <ProgressBar progress={progress} variant="emerald" height={3} />
          <Text style={styles.progressLabel}>{completedCount}/{displayList.length}</Text>
          <Pressable onPress={resetAllZikr}>
            <Text style={styles.resetAllText}>{t('reset_all')}</Text>
          </Pressable>
        </View>

        {/* ─── Focus Mode Card ─── */}
        {(adhkarTime === 'morning' || adhkarTime === 'evening') && (
          <Pressable
            onPress={() => navigation?.navigate('GuidedAdhkar')}
            style={({ pressed }) => [styles.focusCard, pressed && styles.cardPressed]}
          >
            <View style={styles.focusGlow} />
            <View style={styles.focusContent}>
              <View>
                <Text style={styles.focusTitle}>{t('focus_mode')}</Text>
                <Text style={styles.focusSubtitle}>
                  {adhkarTime === 'morning' ? t('morning_adhkar') : t('evening_adhkar')} · {t('focus_gentle_reminder')}
                </Text>
              </View>
              <Text style={styles.focusArrow}>→</Text>
            </View>
          </Pressable>
        )}

        {/* ─── Adhkar List ─── */}
        <View style={styles.adhkarList}>
          {displayList.map((item) => {
            const isDone = item.completed >= item.count;
            const itemProgress = item.count > 0 ? item.completed / item.count : 0;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setImmersiveZikr(item);
                  navigation?.navigate('ImmersiveZikr');
                }}
                style={({ pressed }) => [
                  styles.adhkarCard,
                  isDone && styles.adhkarCardDone,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.adhkarArabic}>{item.arabic}</Text>
                <Text style={styles.adhkarTransliteration}>{item.transliteration}</Text>
                <Text style={styles.adhkarTranslation} numberOfLines={2}>{item.translation}</Text>

                <View style={styles.adhkarFooter}>
                  <Text style={styles.adhkarReward} numberOfLines={1}>{item.reward}</Text>
                  {isDone ? (
                    <Badge label="✓" variant="emerald" />
                  ) : (
                    <Text style={styles.adhkarCount}>{item.completed}/{item.count}</Text>
                  )}
                </View>

                {!isDone && item.count > 1 && (
                  <ProgressBar progress={itemProgress} variant="gold" height={2} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: Spacing.xs,
  },
  timeChipActive: {
    backgroundColor: Colors.emerald[600],
    borderColor: Colors.emerald[500],
  },
  timeChipText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: Colors.text.inverse,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontVariant: ['tabular-nums'],
  },
  resetAllText: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginLeft: 'auto',
  },
  focusCard: {
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xl,
    ...CardPresets.active,
    padding: Spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusGlow: {
    position: 'absolute' as const,
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  focusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  focusTitle: {
    ...Typography.h4,
    color: Colors.emerald[400],
  },
  focusSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  focusArrow: {
    ...Typography.h4,
    color: Colors.emerald[400],
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  adhkarList: {
    gap: Spacing.md,
  },
  adhkarCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.xl,
  },
  adhkarCardDone: {
    backgroundColor: 'rgba(6,78,59,0.2)',
    borderColor: Colors.border.active,
  },
  adhkarArabic: {
    ...Typography.arabicBase,
    color: Colors.text.arabic,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  adhkarTransliteration: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  adhkarTranslation: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  adhkarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    marginBottom: Spacing.xs,
  },
  adhkarReward: {
    ...Typography.overline,
    color: Colors.text.muted,
    flex: 1,
    marginRight: Spacing.md,
  },
  adhkarCount: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
