import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookOpen, HandHeart, Mic2, Music, Pause, User } from 'lucide-react-native';
import { ScreenWrapper, PremiumCard, Badge, ProgressBar, SectionHeader } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';

const RECITERS = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy', nameAr: 'مشاري راشد العفاسي', tag: 'Popular' },
  { id: 'abdulbaset', name: 'Abdul Basit', nameAr: 'عبد الباسط عبد الصمد', tag: 'Classic' },
  { id: 'sudais', name: 'Abdurrahman As-Sudais', nameAr: 'عبد الرحمن السديس', tag: 'Haramain' },
  { id: 'minshawi', name: 'Mohamed Siddiq El-Minshawi', nameAr: 'محمد صديق المنشاوي', tag: 'Tajweed' },
];

const CATEGORIES: { id: string; label: string; icon: React.ElementType; count: number }[] = [
  { id: 'quran', label: 'Quran Recitation', icon: BookOpen, count: 114 },
  { id: 'adhkar', label: 'Adhkar & Duas', icon: HandHeart, count: 48 },
  { id: 'lectures', label: 'Islamic Lectures', icon: Mic2, count: 120 },
  { id: 'nasheed', label: 'Nasheed', icon: Music, count: 65 },
];

export function AudioScreen() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <ScreenWrapper title={t('audio')} subtitle="Listen & Reflect">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Now Playing (if active) ─── */}
        {playing && (
          <View style={styles.nowPlaying}>
            <View style={styles.nowPlayingGlow} />
            <View style={styles.nowPlayingContent}>
              <View style={styles.nowPlayingIcon}>
                <Music size={20} color={Colors.emerald[400]} strokeWidth={2} />
              </View>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingTitle}>Al-Fatiha</Text>
                <Text style={styles.nowPlayingReciter}>Mishary Alafasy</Text>
              </View>
              <Pressable style={styles.playButton} onPress={() => setPlaying(null)}>
                <Pause size={18} color={Colors.text.inverse} strokeWidth={2.5} />
              </Pressable>
            </View>
            <ProgressBar progress={0.35} variant="emerald" height={2} />
          </View>
        )}

        {/* ─── Categories ─── */}
        <SectionHeader title="Browse" />

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [styles.categoryCard, pressed && styles.cardPressed]}
            >
              {(() => {
                const Icon = cat.icon;
                return <Icon size={28} color={Colors.emerald[400]} strokeWidth={1.8} />;
              })()}
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <Text style={styles.categoryCount}>{cat.count} tracks</Text>
            </Pressable>
          ))}
        </View>

        {/* ─── Reciters ─── */}
        <SectionHeader title="Reciters" action="See All" />

        <View style={styles.reciterList}>
          {RECITERS.map((reciter) => (
            <Pressable
              key={reciter.id}
              onPress={() => setPlaying(reciter.id)}
              style={({ pressed }) => [styles.reciterCard, pressed && styles.cardPressed]}
            >
              <View style={styles.reciterAvatar}>
                <User size={20} color={Colors.gold[400]} strokeWidth={2} />
              </View>
              <View style={styles.reciterInfo}>
                <Text style={styles.reciterName}>{reciter.name}</Text>
                <Text style={styles.reciterNameAr}>{reciter.nameAr}</Text>
              </View>
              <Badge label={reciter.tag} variant={reciter.tag === 'Popular' ? 'gold' : 'muted'} />
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
  nowPlaying: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    ...CardPresets.active,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  nowPlayingGlow: {
    position: 'absolute' as const,
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nowPlayingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  nowPlayingReciter: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  categoryGrid: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.lg,
  },
  categoryLabel: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  reciterList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  reciterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reciterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,168,67,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  reciterNameAr: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
});
