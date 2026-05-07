import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import { getPrayerTimes } from '../services/prayerTimes';
import { gregorianToHijri, formatHijriDate } from '../services/hijriCalendar';
import { getAdhkarByTime, getSahabaLessons } from '../services/localData';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const { salahLog, preferences, recommendations, sahabaLessons, currentLessonIndex } = useStore();
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

  return (
    <ScreenWrapper title="أنا مسلم">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Prayer Card */}
        <Pressable onPress={() => (navigation as any).navigate('Prayer')}>
          <View style={{ backgroundColor: 'rgba(6,78,59,0.5)', borderColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold' }}>{t('prayer')}</Text>
              <Text style={{ color: 'rgba(16,185,129,0.6)', fontSize: 12 }}>{preferences.locationCity}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#e8f5e9', fontSize: 28, fontWeight: 'bold' }}>{times.nextPrayerTime}</Text>
                <Text style={{ color: 'rgba(167,196,176,0.7)', fontSize: 14 }}>{t(times.nextPrayer)} — {times.timeRemaining}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fbbf24', fontSize: 20, fontWeight: 'bold' }}>{completedCount}/5</Text>
                <Text style={{ color: 'rgba(16,185,129,0.6)', fontSize: 11 }}>{t('completed')}</Text>
              </View>
            </View>
            {/* Progress bar */}
            <View style={{ marginTop: 12, height: 4, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 2 }}>
              <View style={{ height: 4, backgroundColor: '#10b981', borderRadius: 2, width: `${(completedCount / 5) * 100}%` as any }} />
            </View>
          </View>
        </Pressable>

        {/* Hijri Date */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderColor: 'rgba(6,78,59,0.3)', borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 11 }}>{t('hijri_date')}</Text>
            <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>{formatHijriDate(hijri)}</Text>
          </View>
          <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 18 }}>{hijri.monthNameAr}</Text>
        </View>

        {/* Adhkar Recommendation */}
        <Pressable onPress={() => (navigation as any).navigate('Adhkar')}>
          <View style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(6,78,59,0.35)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>📿 {t(`${currentAdhkar}_adhkar`)}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>{adhkarCompleted}/{adhkarItems.length}</Text>
            </View>
            <Text style={{ color: 'rgba(167,196,176,0.7)', fontSize: 13 }}>{t('adhkar_recommendation')}</Text>
          </View>
        </Pressable>

        {/* Sahaba Lesson */}
        <Pressable onPress={() => (navigation as any).navigate('Sahaba')}>
          <View style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(6,78,59,0.35)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>📖 {nextLesson.characterName}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>{nextLesson.lessonNumber}/{nextLesson.totalLessons}</Text>
            </View>
            <Text style={{ color: '#e8f5e9', fontSize: 15, fontWeight: '500', marginBottom: 4 }}>{nextLesson.title}</Text>
            <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 12 }} numberOfLines={2}>{nextLesson.narration}</Text>
          </View>
        </Pressable>

        {/* Tasbih Quick Access */}
        <Pressable onPress={() => (navigation as any).navigate('Tasbih')}>
          <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderColor: 'rgba(6,78,59,0.3)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>✋ {t('tasbih')}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 12 }}>{t('tasbih_prompt')}</Text>
            </View>
            <Text style={{ color: '#fbbf24', fontSize: 24, fontWeight: 'bold' }}>سُبْحَانَ اللَّهِ</Text>
          </View>
        </Pressable>

        {/* Settings */}
        <Pressable onPress={() => (navigation as any).navigate('Settings')}>
          <View style={{ padding: 12, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 12 }}>⚙ {t('settings')}</Text>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
}
