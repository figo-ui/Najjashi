import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { trainOnAdhkarSession } from '../services/aiRecommendations';

export function ImmersiveZikrScreen() {
  const { t } = useTranslation();
  const { immersiveZikr, immersiveCount, setImmersiveCount, setImmersiveZikr, preferences, incrementZikr } = useStore();

  if (!immersiveZikr) return null;

  const isComplete = immersiveCount >= immersiveZikr.count;

  const navigation = useNavigation();

  const handleTap = () => {
    if (immersiveCount < immersiveZikr.count) {
      if (preferences.hapticEnabled) {
        ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      }
      const nextCount = immersiveCount + 1;
      setImmersiveCount(nextCount);
      incrementZikr(immersiveZikr.id);
    }
  };

  return (
    <Pressable style={{ flex: 1, backgroundColor: '#0a0f0d', alignItems: 'center', justifyContent: 'center' }} onPress={handleTap}>
      <Text style={{ color: '#fbbf24', fontSize: 32, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 24 }}>
        {immersiveZikr.arabic}
      </Text>
      <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
        {immersiveZikr.transliteration}
      </Text>
      <Text style={{ color: 'rgba(232,245,233,0.7)', fontSize: 15, marginTop: 8, textAlign: 'center', paddingHorizontal: 24 }}>
        {immersiveZikr.translation}
      </Text>
      <Text style={{ color: isComplete ? '#10b981' : '#e8f5e9', fontSize: 22, marginTop: 32, fontWeight: '600' }}>
        {immersiveCount} / {immersiveZikr.count}
      </Text>
      {isComplete && (
        <Text style={{ color: '#10b981', fontSize: 14, marginTop: 8 }}>✓ {t('completed')}</Text>
      )}
      <View style={{ flexDirection: 'row', marginTop: 40, gap: 12 }}>
        <Pressable
          style={{ backgroundColor: 'rgba(6,78,59,0.5)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
          onPress={() => {
            // Train AI on adhkar session before leaving
            if (immersiveZikr) {
              trainOnAdhkarSession(immersiveZikr.category, immersiveCount, immersiveZikr.count, immersiveCount * 3);
            }
            setImmersiveZikr(null);
            navigation.goBack();
          }}
        >
          <Text style={{ color: '#e8f5e9', fontSize: 14 }}>{t('back')}</Text>
        </Pressable>
        <Pressable
          style={{ backgroundColor: 'rgba(6,78,59,0.5)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
          onPress={() => setImmersiveCount(0)}
        >
          <Text style={{ color: 'rgba(167,196,176,0.7)', fontSize: 14 }}>{t('reset')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
