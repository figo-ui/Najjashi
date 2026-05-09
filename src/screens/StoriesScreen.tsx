import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react-native';
import { ScreenWrapper } from '../components/shared';
import { browseHadiths, browseCollections, browseBooks } from '../services/hadithService';
import type { HadithItem } from '../types';
import { trainOnContentEngagement } from '../services/aiRecommendations';

export function StoriesScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Load stories from hadith collections — Bukhari Book 1
    browseHadiths('bukhari', '1', 1).then(({ hadiths: h }) => {
      if (mounted) {
        setHadiths(h.map(x => ({ ...x, isBookmarked: false })));
        trainOnContentEngagement('hadith', true);
      }
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <ScreenWrapper title={t('stories')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ScrollText size={16} color="#fbbf24" strokeWidth={2} />
            <Text style={{ color: '#fbbf24', fontSize: 16, fontWeight: '600' }}>Prophetic Stories</Text>
          </View>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 13, marginTop: 4 }}>Learn from the hadith — stories of the Prophet ﷺ and his companions</Text>
        </View>

        {/* Quick Collections */}
        <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { name: 'Bukhari', collection: 'bukhari', book: '1' },
            { name: 'Muslim', collection: 'muslim', book: '1' },
            { name: 'Tirmidhi', collection: 'tirmidhi', book: '1' },
            { name: 'Abu Dawud', collection: 'abudawud', book: '1' },
          ].map((col) => (
            <Pressable
              key={col.collection}
              onPress={async () => {
                setLoading(true);
                const res = await browseHadiths(col.collection, col.book, 1);
                setHadiths(res.hadiths.map(x => ({ ...x, isBookmarked: false })));
                setLoading(false);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: 'rgba(6,78,59,0.4)',
                borderWidth: 1,
                borderColor: 'rgba(6,78,59,0.5)',
              }}
            >
              <Text style={{ color: '#e8f5e9', fontSize: 13, fontWeight: '500' }}>{col.name}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 8 }}>Loading stories...</Text>
          </View>
        ) : hadiths.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 13 }}>No stories available offline</Text>
          </View>
        ) : (
          hadiths.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => navigation?.navigate('HadithDetail', { collection: h.collection, hadithNumber: h.hadithNumber })}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.4)', borderRadius: 18, padding: 16, marginBottom: 10 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600' }}>{h.collection} #{h.hadithNumber}</Text>
                <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11 }}>{h.chapterTitle}</Text>
              </View>
              {h.arabic ? (
                <Text style={{ color: '#e8f5e9', fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 4 }} numberOfLines={2}>{h.arabic.replace(/<[^>]*>/g, '')}</Text>
              ) : null}
              <Text style={{ color: 'rgba(232,245,233,0.7)', fontSize: 13, lineHeight: 20 }} numberOfLines={3}>{h.english.replace(/<[^>]*>/g, '')}</Text>
              {h.grades.length > 0 && (
                <Text style={{ color: 'rgba(16,185,129,0.4)', fontSize: 10, marginTop: 6 }}>{h.grades[0].grade}</Text>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
