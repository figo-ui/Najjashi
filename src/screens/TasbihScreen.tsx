import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ScreenWrapper } from '../components/shared';

const PRESETS = [33, 100, 0]; // 0 = unlimited

export function TasbihScreen() {
  const { t } = useTranslation();
  const { tasbihCount, incrementTasbih, resetTasbih, tasbihTarget, setTasbihTarget, preferences, saveTasbihSession } = useStore();

  const handleTap = useCallback(() => {
    if (preferences.hapticEnabled) {
      ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    }
    incrementTasbih();
  }, [preferences.hapticEnabled, incrementTasbih]);

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
    }
    resetTasbih();
  }, [tasbihCount, tasbihTarget]);

  const isComplete = tasbihTarget > 0 && tasbihCount >= tasbihTarget;
  const progress = tasbihTarget > 0 ? Math.min(tasbihCount / tasbihTarget, 1) : 0;

  return (
    <ScreenWrapper title={t('tasbih')}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Preset Selector */}
        <View style={{ flexDirection: 'row', marginBottom: 32 }}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => { setTasbihTarget(preset); resetTasbih(); }}
              style={{
                backgroundColor: tasbihTarget === preset ? 'rgba(16,185,129,0.3)' : 'rgba(6,78,59,0.3)',
                borderWidth: 1,
                borderColor: tasbihTarget === preset ? '#10b981' : 'rgba(6,78,59,0.4)',
                borderRadius: 12,
                paddingHorizontal: 18,
                paddingVertical: 8,
                marginHorizontal: 6,
              }}
            >
              <Text style={{ color: tasbihTarget === preset ? '#10b981' : 'rgba(167,196,176,0.6)', fontSize: 14, fontWeight: '600' }}>
                {preset === 0 ? '∞' : preset}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Main Counter Button */}
        <Pressable
          onPress={isComplete ? undefined : handleTap}
          style={{
            width: 224,
            height: 224,
            borderRadius: 112,
            backgroundColor: isComplete ? 'rgba(16,185,129,0.4)' : 'rgba(6,78,59,0.6)',
            borderWidth: 2,
            borderColor: isComplete ? '#10b981' : 'rgba(6,78,59,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: isComplete ? '#10b981' : '#fbbf24', fontSize: 52, fontWeight: 'bold' }}>
            {tasbihCount}
          </Text>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14, marginTop: 4 }}>سُبْحَانَ ٱللَّهِ</Text>
          {tasbihTarget > 0 && (
            <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 12, marginTop: 2 }}>
              {t('target')}: {tasbihTarget}
            </Text>
          )}
        </Pressable>

        {/* Progress Ring (visual) */}
        {tasbihTarget > 0 && (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <View style={{ width: 200, height: 4, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 2 }}>
              <View style={{ height: 4, backgroundColor: isComplete ? '#10b981' : '#fbbf24', borderRadius: 2, width: progress * 200 }} />
            </View>
          </View>
        )}

        {/* Reset Button */}
        <Pressable
          onPress={handleReset}
          style={{
            marginTop: 32,
            backgroundColor: 'rgba(6,78,59,0.4)',
            borderWidth: 1,
            borderColor: 'rgba(6,78,59,0.5)',
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: 'rgba(167,196,176,0.7)', fontSize: 14 }}>{t('reset')}</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
