import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';
import { getSingleHadith } from '../services/hadithService';
import type { HadithItem } from '../types';
import { trainOnContentEngagement } from '../services/aiRecommendations';

interface HadithDetailProps {
  route: { params: { hadithId?: string; collection?: string; hadithNumber?: string } };
}

export function HadithDetailScreen({ route }: HadithDetailProps) {
  const { t } = useTranslation();
  const { hadithId, collection, hadithNumber } = route.params ?? {};
  const [hadith, setHadith] = useState<HadithItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collection || !hadithNumber) { setLoading(false); return; }
    let mounted = true;
    getSingleHadith(collection, hadithNumber).then(h => {
      if (mounted && h) {
        setHadith({ ...h, isBookmarked: false });
        trainOnContentEngagement('hadith', true);
      }
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [collection, hadithNumber]);

  if (loading) {
    return (
      <ScreenWrapper title="Hadith">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 13, marginTop: 12 }}>Loading hadith...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!hadith) {
    return (
      <ScreenWrapper title="Hadith">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14 }}>Hadith not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={hadith.chapterTitle || 'Hadith'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Collection Header */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.5)', borderColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fbbf24', fontSize: 14, fontWeight: '600' }}>{hadith.collection}</Text>
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>#{hadith.hadithNumber}</Text>
          </View>
          <Text style={{ color: 'rgba(232,245,233,0.7)', fontSize: 13, marginTop: 4 }}>Book {hadith.bookNumber} · Chapter: {hadith.chapterTitle}</Text>
        </View>

        {/* Arabic Text */}
        {hadith.arabic ? (
          <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderRadius: 20, padding: 22, marginBottom: 16 }}>
            <Text style={{ color: '#fbbf24', fontSize: 22, textAlign: 'center', lineHeight: 38 }}>{hadith.arabic.replace(/<[^>]*>/g, '')}</Text>
          </View>
        ) : null}

        {/* English Translation */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 15, lineHeight: 24 }}>{hadith.english.replace(/<[^>]*>/g, '')}</Text>
        </View>

        {/* Grades */}
        {hadith.grades.length > 0 && (
          <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <Text style={{ color: 'rgba(16,185,129,0.6)', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>GRADING</Text>
            {hadith.grades.map((g, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: 'rgba(232,245,233,0.7)', fontSize: 12 }}>{g.graded_by}</Text>
                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '500' }}>{g.grade}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
