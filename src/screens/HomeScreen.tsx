import React, { useMemo, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HandHeart, Fingerprint, BookOpen, ScrollText, BookOpenCheck, Hand, Sparkles } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { ScreenWrapper, PremiumCard, Badge, ProgressBar, SectionHeader } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';
import { getPrayerTimes } from '../services/prayerTimes';
import { gregorianToHijri, formatHijriDate } from '../services/hijriCalendar';
import { getAdhkarByTime, getSahabaLessons } from '../services/localData';
import { buildRecommendationContext, generateRecommendations, fetchDailyInsights, trainOnDailyActivity } from '../services/aiRecommendations';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const QUICK_ACTION_ICONS: Record<string, React.ElementType> = {
  adhkar: HandHeart,
  tasbih: Fingerprint,
  sahaba: BookOpen,
};

const AI_REC_ICONS: Record<string, React.ElementType> = {
  adhkar: HandHeart,
  sahaba: BookOpen,
  hadith: ScrollText,
  quran: BookOpenCheck,
  dua: Hand,
  tasbih: Fingerprint,
};

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const { salahLog, preferences, recommendations, setRecommendations, sahabaLessons, currentLessonIndex, adhkarTime, zikrList, tasbihSessions, dailyHadith, setDailyHadith, dailyAyah, setDailyAyah } = useStore();
  const times = useMemo(() => getPrayerTimes(), []);
  const hijri = useMemo(() => gregorianToHijri(new Date()), []);

  const completedCount = Object.entries(salahLog).filter(
    ([k, v]) => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(k) && v
  ).length;

  const currentAdhkar = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'morning' as const;
    if (hour >= 12 && hour < 17) return 'after_prayer' as const;
    return 'evening' as const;
  }, []);

  const adhkarItems = useMemo(() => getAdhkarByTime(currentAdhkar), [currentAdhkar]);
  const adhkarCompleted = adhkarItems.filter(a => a.completed >= a.count).length;

  const lessons = sahabaLessons.length > 0 ? sahabaLessons : getSahabaLessons();
  const nextLesson = lessons[currentLessonIndex] || lessons[0];

  // AI Recommendations
  const aiRecs = useMemo(() => {
    const ctx = buildRecommendationContext({
      salahLog,
      adhkarTime,
      sahabaLessons: lessons,
      currentLessonIndex,
      tasbihSessions,
      zikrList,
      dailyHadith,
      dailyAyah,
    });
    return generateRecommendations(ctx);
  }, [salahLog, adhkarTime, lessons, currentLessonIndex, tasbihSessions, zikrList, dailyHadith, dailyAyah]);

  React.useEffect(() => {
    if (aiRecs.length > 0) setRecommendations(aiRecs);
  }, [aiRecs]);

  useEffect(() => {
    if (dailyHadith && dailyAyah) return;
    let mounted = true;
    fetchDailyInsights().then(({ hadith, ayah }) => {
      if (!mounted) return;
      if (hadith) setDailyHadith(hadith);
      if (ayah) setDailyAyah(ayah);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    trainOnDailyActivity();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('morning_greeting') || 'Assalamu Alaykum';
    if (hour < 17) return t('afternoon_greeting') || 'Assalamu Alaykum';
    return t('evening_greeting') || 'Assalamu Alaykum';
  }, []);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Greeting & Date ─── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <View style={styles.dateRow}>
            <View>
              <Text style={styles.dateLabel}>{t('hijri_date')}</Text>
              <Text style={styles.dateValue}>{formatHijriDate(hijri)}</Text>
            </View>
            <Text style={styles.dateArabic}>{hijri.monthNameAr}</Text>
          </View>
        </View>

        {/* ─── Hero Prayer Card ─── */}
        <Pressable onPress={() => (navigation as any).navigate('Prayer')}>
          <View style={styles.prayerHero}>
            {/* Ambient glow */}
            <View style={styles.prayerGlow} />
            <View style={styles.prayerHeroContent}>
              <View style={styles.prayerHeroTop}>
                <Badge label={t(times.nextPrayer)} variant="gold" />
                <Text style={styles.prayerLocation}>{preferences.locationCity}</Text>
              </View>
              <Text style={styles.prayerTime}>{times.nextPrayerTime}</Text>
              <Text style={styles.prayerRemaining}>{times.timeRemaining}</Text>
              <View style={styles.prayerProgressRow}>
                <ProgressBar progress={completedCount / 5} variant="gold" height={3} />
                <Text style={styles.prayerCount}>{completedCount}/5</Text>
              </View>
            </View>
          </View>
        </Pressable>

        {/* ─── Quick Actions Row ─── */}
        <View style={styles.quickActions}>
          <Pressable style={styles.quickAction} onPress={() => (navigation as any).navigate('Adhkar')}>
            <View style={styles.quickActionCircle}>
              {(() => { const I = QUICK_ACTION_ICONS.adhkar; return <I size={22} color={Colors.emerald[400]} strokeWidth={1.8} />; })()}
            </View>
            <Text style={styles.quickActionLabel}>{t(`${currentAdhkar}_adhkar`)}</Text>
            <Text style={styles.quickActionSub}>{adhkarCompleted}/{adhkarItems.length}</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => (navigation as any).navigate('Tasbih')}>
            <View style={styles.quickActionCircle}>
              {(() => { const I = QUICK_ACTION_ICONS.tasbih; return <I size={22} color={Colors.emerald[400]} strokeWidth={1.8} />; })()}
            </View>
            <Text style={styles.quickActionLabel}>{t('tasbih')}</Text>
            <Text style={styles.quickActionSub}>سُبْحَانَ ٱللَّهِ</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => (navigation as any).navigate('Sahaba')}>
            <View style={styles.quickActionCircle}>
              {(() => { const I = QUICK_ACTION_ICONS.sahaba; return <I size={22} color={Colors.emerald[400]} strokeWidth={1.8} />; })()}
            </View>
            <Text style={styles.quickActionLabel}>{nextLesson.characterName}</Text>
            <Text style={styles.quickActionSub}>{nextLesson.lessonNumber}/{nextLesson.totalLessons}</Text>
          </Pressable>
        </View>

        {/* ─── Sahaba Story Card ─── */}
        <Pressable onPress={() => (navigation as any).navigate('Sahaba')}>
          <View style={styles.storyCard}>
            <View style={styles.storyCardHeader}>
              <Text style={styles.storyCardTitle}>{nextLesson.title}</Text>
              <Badge label={`${nextLesson.lessonNumber}/${nextLesson.totalLessons}`} variant="emerald" />
            </View>
            <Text style={styles.storyCardNarration} numberOfLines={2}>{nextLesson.narration}</Text>
            <View style={styles.storyCardFooter}>
              <Text style={styles.storyCardCta}>{t('continue_journey') || 'Continue Journey'}</Text>
              <Text style={styles.storyCardArrow}>→</Text>
            </View>
          </View>
        </Pressable>

        {/* ─── Daily Inspiration ─── */}
        {dailyAyah && (
          <Pressable onPress={() => (navigation as any).navigate('QuranTab')}>
            <View style={styles.inspirationCard}>
              <Text style={styles.inspirationLabel}>Quran of the Day</Text>
              <Text style={styles.inspirationArabic}>{dailyAyah.arabic}</Text>
              <Text style={styles.inspirationTranslation} numberOfLines={3}>{dailyAyah.translation}</Text>
              <Text style={styles.inspirationRef}>{dailyAyah.surahName} {dailyAyah.ayahNumber}</Text>
            </View>
          </Pressable>
        )}

        {dailyHadith && (
          <Pressable onPress={() => (navigation as any).navigate('HadithDetail', { hadithId: dailyHadith.id, collection: dailyHadith.collection, hadithNumber: dailyHadith.hadithNumber })}>
            <View style={styles.inspirationCard}>
              <Text style={styles.inspirationLabel}>Hadith of the Day</Text>
              {dailyHadith.arabic && (
                <Text style={styles.inspirationArabic}>{dailyHadith.arabic.replace(/<[^>]*>/g, '')}</Text>
              )}
              <Text style={styles.inspirationTranslation} numberOfLines={3}>{dailyHadith.english.replace(/<[^>]*>/g, '')}</Text>
              {dailyHadith.grades.length > 0 && (
                <Text style={styles.inspirationGrade}>{dailyHadith.grades[0].grade} — {dailyHadith.grades[0].graded_by}</Text>
              )}
            </View>
          </Pressable>
        )}

        {/* ─── AI Suggestions ─── */}
        {aiRecs.length > 0 && (
          <View style={styles.aiSection}>
            <SectionHeader title={t('recommended')} />
            {aiRecs.slice(0, 3).map((rec) => {
              const RecIcon = AI_REC_ICONS[rec.type] || Sparkles;
              const target = rec.type === 'adhkar' ? 'Adhkar' : rec.type === 'sahaba' ? 'Sahaba' : rec.type === 'hadith' ? 'HadithDetail' : rec.type === 'quran' ? 'QuranTab' : rec.type === 'dua' ? 'HisnulMuslim' : 'Tasbih';
              return (
                <Pressable
                  key={rec.id}
                  onPress={() => (navigation as any).navigate(target)}
                  style={({ pressed }) => [styles.aiCard, pressed && styles.aiCardPressed]}
                >
                  <View style={styles.aiCardIconWrap}>
                    <RecIcon size={18} color={Colors.emerald[400]} strokeWidth={2} />
                  </View>
                  <View style={styles.aiCardContent}>
                    <Text style={styles.aiCardTitle}>{rec.title}</Text>
                    <Text style={styles.aiCardReason} numberOfLines={1}>{rec.reason}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  greetingSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.lg,
  },
  greetingText: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  dateLabel: {
    ...Typography.overline,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  dateValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  dateArabic: {
    ...Typography.arabicMd,
    color: Colors.gold[400],
  },
  prayerHero: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.emerald[900],
    borderWidth: 1,
    borderColor: Colors.border.active,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  prayerGlow: {
    position: 'absolute' as const,
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  prayerHeroContent: {
    padding: Spacing.xl,
  },
  prayerHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  prayerLocation: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  prayerTime: {
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
    color: Colors.text.primary,
    marginBottom: 2,
  },
  prayerRemaining: {
    ...Typography.bodyLg,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  prayerProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  prayerCount: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionSub: {
    ...Typography.overline,
    color: Colors.text.tertiary,
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  storyCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    ...CardPresets.gold,
    padding: Spacing.xl,
  },
  storyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  storyCardTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.md,
  },
  storyCardNarration: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  storyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyCardCta: {
    ...Typography.caption,
    color: Colors.gold[400],
    fontWeight: '600',
  },
  storyCardArrow: {
    ...Typography.body,
    color: Colors.gold[400],
  },
  inspirationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    ...CardPresets.primary,
    padding: Spacing.xl,
  },
  inspirationLabel: {
    ...Typography.overline,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  inspirationArabic: {
    ...Typography.arabicMd,
    color: Colors.text.arabic,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  inspirationTranslation: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  inspirationRef: {
    ...Typography.caption,
    color: Colors.emerald[400],
    marginTop: Spacing.sm,
  },
  inspirationGrade: {
    ...Typography.overline,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
  },
  aiSection: {
    paddingHorizontal: Spacing.lg,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  aiCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  aiCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  aiCardContent: {
    flex: 1,
  },
  aiCardTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  aiCardReason: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
});
