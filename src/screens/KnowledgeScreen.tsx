import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';
import { browseCollections, browseBooks, browseHadiths } from '../services/hadithService';
import type { UmmahHadithCollection, UmmahHadithBook } from '../services/sunnahApiService';
import type { HadithItem } from '../types';

export function KnowledgeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<UmmahHadithCollection[]>([]);
  const [books, setBooks] = useState<UmmahHadithBook[]>([]);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Load collections on mount
  useEffect(() => {
    let mounted = true;
    browseCollections().then(cols => {
      if (mounted) setCollections(cols);
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const selectCollection = async (key: string) => {
    setLoading(true);
    setSelectedCollection(key);
    setSelectedBook(null);
    setHadiths([]);
    const bks = await browseBooks(key);
    setBooks(bks);
    setLoading(false);
  };

  const selectBook = async (bookNumber: string) => {
    if (!selectedCollection) return;
    setLoading(true);
    setSelectedBook(bookNumber);
    const res = await browseHadiths(selectedCollection, bookNumber, 1);
    setHadiths(res.hadiths.map(x => ({ ...x, isBookmarked: false })));
    setLoading(false);
  };

  return (
    <ScreenWrapper title={t('knowledge')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Breadcrumb */}
        <View style={{ flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' }}>
          <Pressable onPress={() => { setSelectedCollection(null); setSelectedBook(null); setHadiths([]); setBooks([]); }}>
            <Text style={{ color: selectedCollection ? '#10b981' : '#e8f5e9', fontSize: 13, fontWeight: '600' }}>Collections</Text>
          </Pressable>
          {selectedCollection && (
            <>
              <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 13, marginHorizontal: 6 }}>›</Text>
              <Pressable onPress={() => { setSelectedBook(null); setHadiths([]); }}>
                <Text style={{ color: selectedBook ? '#10b981' : '#e8f5e9', fontSize: 13, fontWeight: '600' }}>{selectedCollection}</Text>
              </Pressable>
            </>
          )}
          {selectedBook && (
            <>
              <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 13, marginHorizontal: 6 }}>›</Text>
              <Text style={{ color: '#e8f5e9', fontSize: 13, fontWeight: '600' }}>Book {selectedBook}</Text>
            </>
          )}
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 8 }}>Loading...</Text>
          </View>
        ) : !selectedCollection ? (
          /* Collections List */
          collections.map((col) => (
            <Pressable
              key={col.key}
              onPress={() => selectCollection(col.key)}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.4)', borderRadius: 18, padding: 16, marginBottom: 10 }}
            >
              <Text style={{ color: '#e8f5e9', fontSize: 15, fontWeight: '600' }}>{col.name}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 4 }}>{col.reliability} · by {col.author}</Text>
              <Text style={{ color: 'rgba(16,185,129,0.4)', fontSize: 11, marginTop: 4 }}>{col.total_hadiths} hadiths</Text>
            </Pressable>
          ))
        ) : !selectedBook ? (
          /* Books List */
          books.map((bk) => (
            <Pressable
              key={bk.book_number}
              onPress={() => selectBook(bk.book_number)}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.4)', borderRadius: 18, padding: 16, marginBottom: 10 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#e8f5e9', fontSize: 14, fontWeight: '500' }}>Book {bk.book_number}: {bk.book_name}</Text>
                <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11 }}>{bk.number_of_hadiths} hadiths</Text>
              </View>
            </Pressable>
          ))
        ) : (
          /* Hadiths List */
          hadiths.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => navigation?.navigate('HadithDetail', { collection: h.collection, hadithNumber: h.hadithNumber })}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.4)', borderRadius: 18, padding: 16, marginBottom: 10 }}
            >
              <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>#{h.hadithNumber}</Text>
              <Text style={{ color: 'rgba(232,245,233,0.8)', fontSize: 13, lineHeight: 20 }} numberOfLines={4}>{h.english.replace(/<[^>]*>/g, '')}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
