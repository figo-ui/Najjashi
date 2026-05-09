import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { ScreenWrapper } from '../components/shared';
import { searchHisnulMuslim, getEnrichedAdhkarByTime } from '../services/localData';
import type { AdhkarTime } from '../types';
import { trainOnContentEngagement } from '../services/aiRecommendations';

type FilterTab = 'all' | 'morning' | 'evening' | 'sleep' | 'quran' | 'prayer' | 'travel' | 'food';

export function HisnulMuslimScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Train AI on dua engagement
  useEffect(() => {
    trainOnContentEngagement('dua', true);
  }, []);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'morning', label: t('morning_adhkar') },
    { key: 'evening', label: t('evening_adhkar') },
    { key: 'sleep', label: t('sleep_adhkar') },
    { key: 'quran', label: 'Quran' },
    { key: 'prayer', label: t('prayer') },
    { key: 'travel', label: t('travel') || 'Travel' },
    { key: 'food', label: t('food') || 'Food' },
  ];

  const entries = useMemo(() => {
    if (searchQuery.trim()) {
      return searchHisnulMuslim(searchQuery.trim());
    }

    if (activeTab === 'morning' || activeTab === 'evening' || activeTab === 'sleep') {
      const adhkar = getEnrichedAdhkarByTime(activeTab as AdhkarTime);
      return adhkar.map(a => ({
        reference: a.reward || a.id,
        arabic: a.arabic,
        english: `${a.transliteration}\n\n${a.translation}`,
        title: a.category,
      }));
    }

    // For other tabs, search by keyword in chapter titles
    const keywordMap: Record<string, string[]> = {
      all: [],
      quran: ['quran', 'reciting', 'reading'],
      prayer: ['prayer', 'after the prayer', 'mosque', 'adhan', 'call to prayer'],
      travel: ['travel', 'mounting', 'journey', 'returning'],
      food: ['eating', 'food', 'fast', 'meal', 'fruit', 'sneezing'],
    };

    const keywords = keywordMap[activeTab] || [];
    if (keywords.length === 0) {
      // "all" — load everything
      try {
        return require('../../data/hisnulmuslim.json');
      } catch { return []; }
    }

    try {
      const data = require('../../data/hisnulmuslim.json');
      return data.filter((e: any) =>
        keywords.some(kw => e.title?.toLowerCase().includes(kw))
      );
    } catch { return []; }
  }, [searchQuery, activeTab]);

  // Group by chapter
  const chapters = useMemo(() => {
    const map = new Map<string, any[]>();
    entries.forEach((entry: any) => {
      const title = entry.title || 'Uncategorized';
      if (!map.has(title)) map.set(title, []);
      map.get(title)!.push(entry);
    });
    return Array.from(map.entries());
  }, [entries]);

  return (
    <ScreenWrapper title={t('hisnul_muslim')}>
      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(6,78,59,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12 }}>
        <Search size={16} color="rgba(167,196,176,0.5)" strokeWidth={2} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search') + '...'}
          placeholderTextColor="rgba(167,196,176,0.3)"
          style={{ flex: 1, color: '#e8f5e9', fontSize: 14 }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 18 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => { setActiveTab(tab.key); setSearchQuery(''); }}
            style={{
              backgroundColor: activeTab === tab.key ? '#10b981' : 'rgba(6,78,59,0.3)',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              marginRight: 8,
            }}
          >
            <Text style={{ color: activeTab === tab.key ? '#0a0f0d' : '#e8f5e9', fontSize: 12, fontWeight: '600' }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11, marginBottom: 8 }}>
        {entries.length} {t('items')} · {chapters.length} chapters
      </Text>

      {/* Chapter List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {chapters.map(([chapterTitle, items]) => (
          <View key={chapterTitle} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#fbbf24', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              {chapterTitle}
            </Text>
            {items.map((entry: any, idx: number) => (
              <View
                key={idx}
                style={{
                  backgroundColor: 'rgba(6,78,59,0.2)',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: 'rgba(16,185,129,0.3)',
                }}
              >
                <Text style={{ color: '#e8f5e9', fontSize: 18, fontWeight: 'bold', writingDirection: 'rtl', lineHeight: 30 }}>
                  {entry.arabic?.replace(/\n/g, ' ').trim()}
                </Text>
                <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                  {entry.english?.split('\n\n')[0]?.replace(/\n/g, ' ').trim()}
                </Text>
                <Text style={{ color: 'rgba(232,245,233,0.7)', fontSize: 13, marginTop: 6, lineHeight: 20 }}>
                  {entry.english?.split('\n\n').slice(1).join('\n\n').split('Reference:')[0]?.replace(/\n/g, ' ').trim()}
                </Text>
                {entry.reference && (
                  <Text style={{ color: 'rgba(167,196,176,0.3)', fontSize: 10, marginTop: 6 }}>
                    {entry.reference?.replace(/\n/g, ' ').trim()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {entries.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: 'rgba(167,196,176,0.3)', fontSize: 14 }}>{t('no_results')}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
