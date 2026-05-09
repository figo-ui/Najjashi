import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ScreenWrapper, Badge, ProgressBar } from '../components/shared';
import { Colors, Spacing, Radius, Typography, Shadows } from '../theme';
import { trainOnContentEngagement } from '../services/aiRecommendations';

const PRESETS = [33, 100, 0]; // 0 = unlimited
const ZIKR_OPTIONS = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّهِ', transliteration: 'Subhanallah' },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah' },
  { id: 'allahuakbar', arabic: 'ٱللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar' },
  { id: 'lailaha', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', transliteration: 'La ilaha illallah' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّهَ', transliteration: 'Astaghfirullah' },
];

export function TasbihScreen() {
  const { t } = useTranslation();
  const { tasbihCount, incrementTasbih, resetTasbih, tasbihTarget, setTasbihTarget, preferences, saveTasbihSession } = useStore();

  const handleTap = useCallback(() => {
    if (preferences.hapticEnabled) {
      // Milestone haptics
      if (tasbihTarget > 0 && tasbihCount + 1 === tasbihTarget) {
        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      } else if (tasbihCount > 0 && tasbihCount % 33 === 0) {
        ReactNativeHapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
      } else {
        ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      }
    }
    incrementTasbih();
  }, [preferences.hapticEnabled, incrementTasbih, tasbihCount, tasbihTarget]);

  const handleReset = useCallback(() => {
    if (tasbihCount > 0) {
      saveTasbihSession({
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
        count: tasbihCount,
        target: tasbihTarget,
        zikrText: 'سُبْحَانَ ٱللَّهِ',
        completed: tasbihTarget > 0 && tasbihCount >= tasbihTarget,
        startedAt: Date.now() - tasbihCount * 3000,
        completedAt: Date.now(),
      });
      trainOnContentEngagement('dua', tasbihTarget > 0 && tasbihCount >= tasbihTarget);
    }
    resetTasbih();
  }, [tasbihCount, tasbihTarget]);

  const isComplete = tasbihTarget > 0 && tasbihCount >= tasbihTarget;
  const progress = tasbihTarget > 0 ? Math.min(tasbihCount / tasbihTarget, 1) : 0;
  const currentZikr = ZIKR_OPTIONS[0];

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* ─── Zikr Selector ─── */}
        <View style={styles.zikrSelector}>
          {ZIKR_OPTIONS.slice(0, 3).map((zikr) => (
            <Pressable
              key={zikr.id}
              style={[
                styles.zikrChip,
                zikr.id === currentZikr.id && styles.zikrChipActive,
              ]}
            >
              <Text style={[styles.zikrChipText, zikr.id === currentZikr.id && styles.zikrChipTextActive]}>
                {zikr.transliteration}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ─── Target Selector ─── */}
        <View style={styles.targetRow}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => { setTasbihTarget(preset); resetTasbih(); }}
              style={[styles.targetChip, tasbihTarget === preset && styles.targetChipActive]}
            >
              <Text style={[styles.targetChipText, tasbihTarget === preset && styles.targetChipTextActive]}>
                {preset === 0 ? '∞' : preset}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ─── Main Counter ─── */}
        <View style={styles.counterArea}>
          <Pressable
            onPress={isComplete ? undefined : handleTap}
            style={({ pressed }) => [
              styles.counterButton,
              isComplete && styles.counterButtonComplete,
              pressed && !isComplete && styles.counterButtonPressed,
            ]}
          >
            {/* Ambient glow ring */}
            <View style={[styles.counterGlow, isComplete && styles.counterGlowComplete]} />

            <Text style={[styles.counterNumber, isComplete && styles.counterNumberComplete]}>
              {tasbihCount}
            </Text>
            <Text style={styles.counterZikr}>{currentZikr.arabic}</Text>
            {tasbihTarget > 0 && !isComplete && (
              <Text style={styles.counterTarget}>{t('target')}: {tasbihTarget}</Text>
            )}
            {isComplete && (
              <Text style={styles.counterCompleteLabel}>✓ Complete</Text>
            )}
          </Pressable>
        </View>

        {/* ─── Progress Arc ─── */}
        {tasbihTarget > 0 && (
          <View style={styles.progressSection}>
            <ProgressBar progress={progress} variant={isComplete ? 'emerald' : 'gold'} height={4} />
            <Text style={styles.progressLabel}>
              {tasbihCount} / {tasbihTarget}
            </Text>
          </View>
        )}

        {/* ─── Reset ─── */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
        >
          <Text style={styles.resetButtonText}>{t('reset')}</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing['4xl'],
  },
  zikrSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  zikrChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  zikrChipActive: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: Colors.border.active,
  },
  zikrChipText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  zikrChipTextActive: {
    color: Colors.emerald[400],
    fontWeight: '600',
  },
  targetRow: {
    flexDirection: 'row',
    marginBottom: Spacing['4xl'],
    gap: Spacing.md,
  },
  targetChip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  targetChipActive: {
    backgroundColor: 'rgba(212,168,67,0.12)',
    borderColor: Colors.border.gold,
  },
  targetChipText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  targetChipTextActive: {
    color: Colors.gold[400],
  },
  counterArea: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  counterButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.bg.card,
    borderWidth: 2,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  counterButtonComplete: {
    backgroundColor: 'rgba(6,78,59,0.3)',
    borderColor: Colors.emerald[500],
    ...Shadows.glow,
  },
  counterButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  counterGlow: {
    position: 'absolute' as const,
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 140,
    backgroundColor: 'rgba(212,168,67,0.04)',
  },
  counterGlowComplete: {
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  counterNumber: {
    fontSize: 56,
    fontWeight: '300',
    lineHeight: 64,
    fontVariant: ['tabular-nums'],
    color: Colors.text.primary,
  },
  counterNumberComplete: {
    color: Colors.emerald[400],
  },
  counterZikr: {
    ...Typography.arabicBase,
    color: Colors.text.arabic,
    marginTop: Spacing.xs,
  },
  counterTarget: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  counterCompleteLabel: {
    ...Typography.caption,
    color: Colors.emerald[400],
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  progressSection: {
    width: '60%',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontVariant: ['tabular-nums'],
  },
  resetButton: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  resetButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  resetButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
