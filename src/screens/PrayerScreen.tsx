import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import { getPrayerTimes } from '../services/prayerTimes';

export function PrayerScreen() {
  const { t } = useTranslation();
  const { salahLog, toggleSalah, preferences } = useStore();
  const times = useMemo(() => getPrayerTimes(), []);
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

  const completedCount = prayers.filter(p => salahLog[p]).length;

  return (
    <ScreenWrapper title={t('prayer')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Next Prayer Countdown */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 13 }}>{preferences.locationCity}</Text>
          <Text style={{ color: '#fbbf24', fontSize: 40, fontWeight: 'bold', marginTop: 8 }}>{times.nextPrayerTime}</Text>
          <Text style={{ color: 'rgba(167,196,176,0.7)', fontSize: 15, marginTop: 4 }}>
            {t(times.nextPrayer)} — {times.timeRemaining}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
            <View style={{ height: 4, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 2, width: 160 }}>
              <View style={{ height: 4, backgroundColor: '#10b981', borderRadius: 2, width: (completedCount / 5) * 160 }} />
            </View>
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginLeft: 8 }}>{completedCount}/5</Text>
          </View>
        </View>

        {/* Prayer Cards */}
        {prayers.map((prayer) => {
          const pt = times[prayer];
          const isCompleted = salahLog[prayer];
          const isNext = pt.isNext;
          const bg = isCompleted ? 'rgba(6,78,59,0.6)' : isNext ? 'rgba(6,78,59,0.5)' : 'rgba(6,78,59,0.3)';
          const border = isCompleted ? 'rgba(16,185,129,0.5)' : isNext ? 'rgba(251,191,36,0.4)' : 'rgba(6,78,59,0.4)';

          return (
            <Pressable
              key={prayer}
              onPress={() => toggleSalah(prayer)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 18, padding: 16, marginBottom: 10, backgroundColor: bg, borderWidth: 1, borderColor: border }}
            >
              <View>
                <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>{t(prayer)}</Text>
                <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 12, marginTop: 2 }}>{pt.nameAr}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#fbbf24', fontSize: 16, fontWeight: '600' }}>{pt.time}</Text>
                <Text style={{ color: isCompleted ? '#10b981' : 'rgba(167,196,176,0.5)', fontSize: 11, marginTop: 2 }}>
                  {isCompleted ? '✓ ' + t('completed') : isNext ? t('next_prayer') : pt.isPassed ? t('remaining') : t('track_prayer')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}
