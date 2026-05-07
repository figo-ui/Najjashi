import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import { getSahabaLessons } from '../services/localData';

export function SahabaScreen() {
  const { t } = useTranslation();
  const { sahabaLessons, currentLessonIndex, markLessonComplete, setCurrentLessonIndex, setRecommendations } = useStore();

  const lessons = sahabaLessons.length > 0 ? sahabaLessons : getSahabaLessons();
  const current = lessons[currentLessonIndex] || lessons[0];

  useEffect(() => {
    if (sahabaLessons.length === 0) {
      const loaded = getSahabaLessons();
      useStore.setState({ sahabaLessons: loaded });
    }
  }, []);

  const completedCount = lessons.filter(l => l.isComplete).length;
  const progressPercent = (completedCount / lessons.length) * 100;

  const handleComplete = () => {
    markLessonComplete(current.id);
    const nextIdx = currentLessonIndex + 1;
    if (nextIdx < lessons.length) {
      setCurrentLessonIndex(nextIdx);
    }
    setRecommendations([
      { id: 'rec-sahaba', type: 'sahaba', title: lessons[nextIdx]?.title || t('sahaba_complete'), reason: t('continue_learning'), contentId: lessons[nextIdx]?.id || '', priority: 1 },
    ]);
  };

  return (
    <ScreenWrapper title={t('sahaba')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Character Header */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.5)', borderColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fbbf24', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{current.characterNameAr}</Text>
          <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600', marginTop: 4, textAlign: 'center' }}>{current.characterName} (RA)</Text>
          <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
            <View style={{ height: 4, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 2, width: 200 }}>
              <View style={{ height: 4, backgroundColor: '#10b981', borderRadius: 2, width: progressPercent }} />
            </View>
            <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 12, marginLeft: 8 }}>{completedCount}/{lessons.length}</Text>
          </View>
        </View>

        {/* Lesson Card */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(6,78,59,0.35)', borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>{t('lesson')} {current.lessonNumber}/{current.totalLessons}</Text>
            {current.isComplete && (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: '#10b981', fontSize: 11 }}>✓ {t('completed')}</Text>
              </View>
            )}
          </View>

          <Text style={{ color: '#e8f5e9', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{current.title}</Text>
          <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 16, marginBottom: 16 }}>{current.titleAr}</Text>

          <Text style={{ color: '#e8f5e9', fontSize: 15, lineHeight: 24, marginBottom: 16 }}>{current.narration}</Text>

          <View style={{ backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>💡 {t('takeaway')}</Text>
            <Text style={{ color: 'rgba(251,191,36,0.8)', fontSize: 14 }}>{current.takeaway}</Text>
          </View>

          {!current.isComplete && (
            <Pressable
              onPress={handleComplete}
              style={{ backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#0a0f0d', fontSize: 16, fontWeight: 'bold' }}>{t('mark_complete')}</Text>
            </Pressable>
          )}
        </View>

        {/* Lesson Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Pressable
            onPress={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
            style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ color: currentLessonIndex > 0 ? '#10b981' : 'rgba(167,196,176,0.3)', fontSize: 14 }}>← {t('previous')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
            style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ color: currentLessonIndex < lessons.length - 1 ? '#10b981' : 'rgba(167,196,176,0.3)', fontSize: 14 }}>{t('next')} →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
