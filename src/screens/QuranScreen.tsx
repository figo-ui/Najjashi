import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper, PremiumCard, Badge, ProgressBar, SectionHeader } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';

const LAST_READ_SURAH = 1; // placeholder
const LAST_READ_AYAH = 7;

const FEATURED_SURAHS = [
  { id: 1, name: 'Al-Fatiha', nameAr: 'الفاتحة', verses: 7, type: 'Meccan' },
  { id: 36, name: 'Ya-Sin', nameAr: 'يس', verses: 83, type: 'Meccan' },
  { id: 67, name: 'Al-Mulk', nameAr: 'الملك', verses: 30, type: 'Meccan' },
  { id: 55, name: 'Ar-Rahman', nameAr: 'الرحمن', verses: 78, type: 'Medinan' },
  { id: 112, name: 'Al-Ikhlas', nameAr: 'الإخلاص', verses: 4, type: 'Meccan' },
  { id: 18, name: 'Al-Kahf', nameAr: 'الكهف', verses: 110, type: 'Meccan' },
];

export function QuranScreen() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper title={t('quran')} subtitle="The Noble Quran">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Continue Reading ─── */}
        <Pressable style={({ pressed }) => [styles.continueCard, pressed && styles.cardPressed]}>
          <View style={styles.continueGlow} />
          <View style={styles.continueContent}>
            <Text style={styles.continueLabel}>Continue Reading</Text>
            <Text style={styles.continueSurah}>Al-Fatiha</Text>
            <Text style={styles.continueAyah}>Ayah {LAST_READ_AYAH} / 7</Text>
            <ProgressBar progress={LAST_READ_AYAH / 7} variant="emerald" height={3} />
          </View>
          <Text style={styles.continueArabic}>ٱلْفَاتِحَة</Text>
        </Pressable>

        {/* ─── Featured Surahs ─── */}
        <SectionHeader title="Recommended" action="See All" />

        <View style={styles.surahGrid}>
          {FEATURED_SURAHS.map((surah) => (
            <Pressable
              key={surah.id}
              style={({ pressed }) => [styles.surahCard, pressed && styles.cardPressed]}
            >
              <View style={styles.surahNumber}>
                <Text style={styles.surahNumberText}>{surah.id}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{surah.name}</Text>
                <Text style={styles.surahMeta}>{surah.type} · {surah.verses} verses</Text>
              </View>
              <Text style={styles.surahNameAr}>{surah.nameAr}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  continueCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    ...CardPresets.active,
    padding: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  continueGlow: {
    position: 'absolute' as const,
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  continueContent: {
    flex: 1,
  },
  continueLabel: {
    ...Typography.overline,
    color: Colors.emerald[400],
    marginBottom: Spacing.xs,
  },
  continueSurah: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  continueAyah: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  continueArabic: {
    ...Typography.arabicLg,
    color: Colors.text.arabic,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  surahGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumberText: {
    ...Typography.caption,
    color: Colors.emerald[400],
    fontWeight: '600',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  surahMeta: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  surahNameAr: {
    ...Typography.arabicBase,
    color: Colors.text.arabic,
  },
});
