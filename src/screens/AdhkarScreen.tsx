import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import { getAdhkarByTime } from '../services/localData';
import type { AdhkarTime } from '../types';

export function AdhkarScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { adhkarTime, setAdhkarTime, setImmersiveZikr, zikrList, incrementZikr, resetZikr, resetAllZikr } = useStore();

  const times: { key: AdhkarTime; label: string }[] = [
    { key: 'morning', label: 'morning_adhkar' },
    { key: 'evening', label: 'evening_adhkar' },
    { key: 'after_prayer', label: 'after_prayer_adhkar' },
  ];

  const adhkarData = getAdhkarByTime(adhkarTime);
  const displayList = zikrList.length > 0 && zikrList[0]?.category === adhkarTime ? zikrList : adhkarData;

  useEffect(() => {
    if (zikrList.length === 0 || zikrList[0]?.category !== adhkarTime) {
      useStore.setState({ zikrList: adhkarData });
    }
  }, [adhkarTime]);

  const completedCount = displayList.filter(a => a.completed >= a.count).length;

  return (
    <ScreenWrapper title={t('adhkar')}>
      {/* Time Selector */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {times.map((time) => (
          <Pressable
            key={time.key}
            onPress={() => setAdhkarTime(time.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              marginRight: 8,
              backgroundColor: adhkarTime === time.key ? '#10b981' : 'rgba(6,78,59,0.4)',
              borderWidth: adhkarTime === time.key ? 0 : 1,
              borderColor: 'rgba(6,78,59,0.5)',
            }}
          >
            <Text style={{ color: adhkarTime === time.key ? '#0a0f0d' : '#e8f5e9', fontSize: 13, fontWeight: '600' }}>
              {t(time.label)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Progress */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>{completedCount}/{displayList.length} {t('completed')}</Text>
        <Pressable onPress={resetAllZikr}>
          <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 12 }}>{t('reset_all')}</Text>
        </Pressable>
      </View>

      {/* Adhkar List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {displayList.map((item) => {
          const isDone = item.completed >= item.count;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setImmersiveZikr(item);
                navigation?.navigate('ImmersiveZikr');
              }}
              style={{
                backgroundColor: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(6,78,59,0.4)',
                borderWidth: 1,
                borderColor: isDone ? 'rgba(16,185,129,0.3)' : 'rgba(6,78,59,0.4)',
                borderRadius: 18,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{item.arabic}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 11, marginTop: 6, textAlign: 'center' }}>{item.transliteration}</Text>
              <Text style={{ color: 'rgba(232,245,233,0.8)', fontSize: 13, marginTop: 4, textAlign: 'center' }}>{item.translation}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopColor: 'rgba(6,78,59,0.3)', borderTopWidth: 1 }}>
                <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 11, flex: 1 }}>{item.reward}</Text>
                <Text style={{ color: isDone ? '#10b981' : 'rgba(251,191,36,0.8)', fontSize: 12, fontWeight: '600' }}>
                  {isDone ? '✓' : `${item.completed}/${item.count}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}
