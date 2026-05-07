import React from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import type { SupportedLocale } from '../types';

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { locale, setLocale, preferences, setPreferences } = useStore();

  const languages: { key: SupportedLocale; label: string }[] = [
    { key: 'en', label: t('english') },
    { key: 'am', label: t('amharic') },
    { key: 'om', label: t('oromo') },
  ];

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(6,78,59,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.4)',
  };

  return (
    <ScreenWrapper title={t('settings')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Language */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{t('language')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {languages.map((lang) => (
              <Pressable
                key={lang.key}
                onPress={() => { setLocale(lang.key); i18n.changeLanguage(lang.key); }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 14,
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: locale === lang.key ? '#10b981' : 'rgba(6,78,59,0.4)',
                  borderWidth: locale === lang.key ? 0 : 1,
                  borderColor: 'rgba(6,78,59,0.5)',
                }}
              >
                <Text style={{ color: locale === lang.key ? '#0a0f0d' : '#e8f5e9', fontSize: 13, fontWeight: '600' }}>{lang.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={rowStyle}>
          <Text style={{ color: '#e8f5e9', fontSize: 15 }}>{t('dark_mode')}</Text>
          <Switch value={preferences.darkMode} onValueChange={(v) => setPreferences({ darkMode: v })} trackColor={{ false: '#1e3a30', true: '#059669' }} />
        </View>

        <View style={rowStyle}>
          <Text style={{ color: '#e8f5e9', fontSize: 15 }}>{t('notifications')}</Text>
          <Switch value={preferences.notificationsEnabled} onValueChange={(v) => setPreferences({ notificationsEnabled: v })} trackColor={{ false: '#1e3a30', true: '#059669' }} />
        </View>

        <View style={rowStyle}>
          <Text style={{ color: '#e8f5e9', fontSize: 15 }}>{t('adhan_alert')}</Text>
          <Switch value={preferences.adhanEnabled} onValueChange={(v) => setPreferences({ adhanEnabled: v })} trackColor={{ false: '#1e3a30', true: '#059669' }} />
        </View>

        <View style={rowStyle}>
          <Text style={{ color: '#e8f5e9', fontSize: 15 }}>{t('haptic_enabled')}</Text>
          <Switch value={preferences.hapticEnabled} onValueChange={(v) => setPreferences({ hapticEnabled: v })} trackColor={{ false: '#1e3a30', true: '#059669' }} />
        </View>

        <View style={{ ...rowStyle, flexDirection: 'column' as const, alignItems: 'flex-start' as const }}>
          <Text style={{ color: '#e8f5e9', fontSize: 15, marginBottom: 6 }}>{t('calculation_method')}</Text>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 13 }}>{preferences.calculationMethod}</Text>
        </View>

        {/* App info */}
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold' }}>نجاشي</Text>
          <Text style={{ color: '#10b981', fontSize: 14, marginTop: 2 }}>Najjashi v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
