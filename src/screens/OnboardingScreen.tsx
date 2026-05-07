import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import type { SupportedLocale, AuthMethod } from '../types';

const LANGUAGES: { key: SupportedLocale; label: string; native: string }[] = [
  { key: 'en', label: 'English', native: 'English' },
  { key: 'am', label: 'Amharic', native: 'አማርኛ' },
  { key: 'om', label: 'Oromo', native: 'Afaan Oromoo' },
];

export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const { locale, setLocale, setPreferences } = useStore();
  const [step, setStep] = useState<'language' | 'auth' | 'permissions'>('language');

  const selectLanguage = (key: SupportedLocale) => {
    setLocale(key);
    i18n.changeLanguage(key);
  };

  const handleAuth = (method: AuthMethod) => {
    setPreferences({ authMethod: method });
    setStep('permissions');
  };

  const handleFinish = () => {
    setPreferences({ onboardingComplete: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 }}>
          <Text style={{ color: '#fbbf24', fontSize: 42, fontWeight: 'bold' }}>نجاشي</Text>
          <Text style={{ color: '#10b981', fontSize: 20, fontWeight: '600', marginTop: 4 }}>Najjashi</Text>
          <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 16 }}>
            {t('onboarding_subtitle')}
          </Text>
        </View>

        {/* Step: Language */}
        {step === 'language' && (
          <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 16, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('choose_language')}
            </Text>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.key}
                onPress={() => selectLanguage(lang.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  backgroundColor: locale === lang.key ? 'rgba(16,185,129,0.2)' : 'rgba(6,78,59,0.3)',
                  borderColor: locale === lang.key ? '#10b981' : 'rgba(6,78,59,0.4)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 18, height: 18, borderRadius: 9, borderWidth: 2, marginRight: 12,
                    borderColor: locale === lang.key ? '#10b981' : 'rgba(107,143,122,0.5)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {locale === lang.key && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />}
                  </View>
                  <Text style={{ color: '#e8f5e9', fontSize: 16 }}>{lang.label}</Text>
                </View>
                <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14 }}>{lang.native}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setStep('auth')}
              style={{ backgroundColor: '#10b981', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 20 }}
            >
              <Text style={{ color: '#0a0f0d', fontSize: 16, fontWeight: 'bold' }}>{t('continue')}</Text>
            </Pressable>
          </View>
        )}

        {/* Step: Auth */}
        {step === 'auth' && (
          <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 16, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('sign_in')}
            </Text>
            <Pressable
              onPress={() => handleAuth('google')}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.5)', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>G {t('google_login')}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAuth('email')}
              style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.5)', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>✉ {t('email_login')}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAuth('guest')}
              style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(6,78,59,0.4)', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: 'rgba(167,196,176,0.6)', fontSize: 14 }}>{t('guest_mode')}</Text>
            </Pressable>
          </View>
        )}

        {/* Step: Permissions */}
        {step === 'permissions' && (
          <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 16, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('permissions')}
            </Text>
            <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderRadius: 18, padding: 16, marginBottom: 10 }}>
              <Text style={{ color: '#e8f5e9', fontSize: 15, fontWeight: '600' }}>📍 {t('location_permission')}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 4 }}>{t('location_reason')}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(6,78,59,0.3)', borderRadius: 18, padding: 16, marginBottom: 10 }}>
              <Text style={{ color: '#e8f5e9', fontSize: 15, fontWeight: '600' }}>🔔 {t('notification_permission')}</Text>
              <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, marginTop: 4 }}>{t('notification_reason')}</Text>
            </View>
            <Pressable
              onPress={handleFinish}
              style={{ backgroundColor: '#10b981', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 20 }}
            >
              <Text style={{ color: '#0a0f0d', fontSize: 16, fontWeight: 'bold' }}>{t('get_started')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
