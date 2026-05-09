import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper, Badge, ProgressBar } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';
import { getPrayerTimes } from '../services/prayerTimes';
import { trainOnPrayer } from '../services/aiRecommendations';
import { Sunrise, Sun, CloudSun, Sunset, Moon } from 'lucide-react-native';

const PRAYER_LUCIDE: Record<string, React.ElementType> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

export function PrayerScreen() {
  const { t } = useTranslation();
  const { salahLog, toggleSalah, preferences } = useStore();
  const times = useMemo(() => getPrayerTimes(), []);
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

  const completedCount = prayers.filter(p => salahLog[p]).length;

  return (
    <ScreenWrapper title={t('prayer')} subtitle={preferences.locationCity}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Next Prayer Countdown ─── */}
        <View style={styles.countdownHero}>
          <View style={styles.countdownGlow} />
          {(() => {
            const Icon = PRAYER_LUCIDE[times.nextPrayer] || Moon;
            return <Icon size={36} color={Colors.gold[400]} strokeWidth={1.8} />;
          })()}
          <Text style={styles.countdownTime}>{times.nextPrayerTime}</Text>
          <Text style={styles.countdownLabel}>{t(times.nextPrayer)}</Text>
          <Text style={styles.countdownRemaining}>{times.timeRemaining}</Text>
          <View style={styles.countdownProgressRow}>
            <ProgressBar progress={completedCount / 5} variant="gold" height={3} />
            <Text style={styles.countdownCount}>{completedCount}/5</Text>
          </View>
        </View>

        {/* ─── Prayer Timeline ─── */}
        <View style={styles.timeline}>
          {prayers.map((prayer, index) => {
            const pt = times[prayer];
            const isCompleted = salahLog[prayer];
            const isNext = pt.isNext;
            const isLast = index === prayers.length - 1;

            return (
              <View key={prayer} style={styles.timelineItem}>
                {/* Timeline connector */}
                {!isLast && (
                  <View style={[
                    styles.timelineConnector,
                    isCompleted && styles.timelineConnectorActive,
                  ]} />
                )}

                {/* Timeline dot */}
                <View style={[
                  styles.timelineDot,
                  isCompleted && styles.timelineDotCompleted,
                  isNext && styles.timelineDotNext,
                ]}>
                  {isCompleted && <Text style={styles.timelineDotCheck}>✓</Text>}
                  {isNext && !isCompleted && <View style={styles.timelineDotPulse} />}
                </View>

                {/* Prayer card */}
                <Pressable
                  onPress={() => {
                    const wasCompleted = salahLog[prayer];
                    toggleSalah(prayer);
                    trainOnPrayer(prayer, !wasCompleted);
                  }}
                  style={({ pressed }) => [
                    styles.prayerCard,
                    isCompleted && styles.prayerCardCompleted,
                    isNext && styles.prayerCardNext,
                    pressed && styles.prayerCardPressed,
                  ]}
                >
                  <View style={styles.prayerCardLeft}>
                    {(() => {
                      const PIcon = PRAYER_LUCIDE[prayer] || Moon;
                      return <PIcon size={20} color={isCompleted ? Colors.emerald[400] : Colors.text.tertiary} strokeWidth={1.8} />;
                    })()}
                    <View>
                      <Text style={[styles.prayerCardName, isCompleted && styles.prayerCardNameCompleted]}>
                        {t(prayer)}
                      </Text>
                      <Text style={styles.prayerCardArabic}>{pt.nameAr}</Text>
                    </View>
                  </View>
                  <View style={styles.prayerCardRight}>
                    <Text style={[styles.prayerCardTime, isNext && styles.prayerCardTimeNext]}>
                      {pt.time}
                    </Text>
                    {isCompleted && <Badge label={t('completed')} variant="emerald" />}
                    {isNext && !isCompleted && <Badge label={t('next_prayer')} variant="gold" />}
                    {!isCompleted && !isNext && pt.isPassed && (
                      <Text style={styles.prayerCardMissed}>{t('remaining')}</Text>
                    )}
                  </View>
                </Pressable>
              </View>
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
  countdownHero: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.emerald[900],
    borderWidth: 1,
    borderColor: Colors.border.active,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  countdownGlow: {
    position: 'absolute' as const,
    top: -60,
    left: '50%' as any,
    marginLeft: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  countdownTime: {
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
    color: Colors.text.primary,
  },
  countdownLabel: {
    ...Typography.h4,
    color: Colors.gold[400],
    marginTop: Spacing.xs,
  },
  countdownRemaining: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  countdownProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '80%',
  },
  countdownCount: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
  },
  timeline: {
    paddingHorizontal: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute' as const,
    left: 15,
    top: 32,
    width: 2,
    height: 24,
    backgroundColor: Colors.border.subtle,
  },
  timelineConnectorActive: {
    backgroundColor: Colors.emerald[600],
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg.card,
    borderWidth: 2,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.emerald[900],
    borderColor: Colors.emerald[500],
  },
  timelineDotNext: {
    borderColor: Colors.gold[400],
  },
  timelineDotCheck: {
    color: Colors.emerald[400],
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold[400],
  },
  prayerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  prayerCardCompleted: {
    backgroundColor: 'rgba(6,78,59,0.3)',
    borderColor: Colors.border.active,
  },
  prayerCardNext: {
    backgroundColor: 'rgba(42,26,10,0.2)',
    borderColor: Colors.border.gold,
    ...Shadows.glowGold,
  },
  prayerCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  prayerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  prayerCardName: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  prayerCardNameCompleted: {
    color: Colors.emerald[300],
  },
  prayerCardArabic: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  prayerCardRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  prayerCardTime: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  prayerCardTimeNext: {
    color: Colors.gold[400],
  },
  prayerCardMissed: {
    ...Typography.overline,
    color: Colors.text.muted,
  },
});
