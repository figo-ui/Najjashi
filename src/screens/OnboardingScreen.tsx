import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, StyleSheet, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Moon, BookOpen, HandHeart, MapPin, Bell } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets, ButtonPresets } from '../theme';
import type { SupportedLocale, AuthMethod } from '../types';
import { signInWithGoogle, signInWithEmail, signInAsGuest } from '../services/authService';
import { requestNotificationPermission } from '../services/messagingService';

const LANGUAGES: { key: SupportedLocale; label: string; native: string }[] = [
  { key: 'en', label: 'English', native: 'English' },
  { key: 'am', label: 'Amharic', native: 'አማርኛ' },
  { key: 'om', label: 'Oromo', native: 'Afaan Oromoo' },
];

const STEPS = ['welcome', 'language', 'auth', 'permissions'] as const;
type OnboardingStep = typeof STEPS[number];

export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const { locale, setLocale, setPreferences, setUser } = useStore();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const selectLanguage = (key: SupportedLocale) => {
    setLocale(key);
    i18n.changeLanguage(key);
  };

  const handleAuth = async (method: AuthMethod) => {
    setLoading(true);
    try {
      let profile = null;
      if (method === 'google') {
        profile = await signInWithGoogle();
      } else if (method === 'email') {
        if (!email || !password) {
          Alert.alert(t('sign_in'), 'Please enter email and password');
          setLoading(false);
          return;
        }
        profile = await signInWithEmail(email, password);
      } else {
        profile = await signInAsGuest();
      }
      if (profile) {
        setUser(profile);
        setPreferences({ authMethod: method });
        setStep('permissions');
      } else {
        Alert.alert(t('error_generic'), 'Authentication failed. Please try again.');
      }
    } catch (e) {
      Alert.alert(t('error_generic'), String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const granted = await requestNotificationPermission();
    setPreferences({
      onboardingComplete: true,
      notificationsEnabled: granted,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Step Indicator ─── */}
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i <= stepIndex && styles.stepDotActive,
                i === stepIndex && styles.stepDotCurrent,
              ]}
            />
          ))}
        </View>

        {/* ─── Welcome Step ─── */}
        {step === 'welcome' && (
          <View style={styles.stepContent}>
            <View style={styles.welcomeHero}>
              <View style={styles.welcomeGlow} />
              <Text style={styles.welcomeArabic}>نجاشي</Text>
              <Text style={styles.welcomeEnglish}>Najjashi</Text>
            </View>
            <Text style={styles.welcomeSubtitle}>
              {t('onboarding_subtitle') || 'Your spiritual companion for a more mindful life'}
            </Text>
            <View style={styles.welcomeFeatures}>
              <View style={styles.welcomeFeature}>
                <Moon size={20} color={Colors.emerald[400]} strokeWidth={1.8} />
                <Text style={styles.welcomeFeatureText}>Prayer tracking & reminders</Text>
              </View>
              <View style={styles.welcomeFeature}>
                <BookOpen size={20} color={Colors.emerald[400]} strokeWidth={1.8} />
                <Text style={styles.welcomeFeatureText}>Quran, Hadith & Sahaba stories</Text>
              </View>
              <View style={styles.welcomeFeature}>
                <HandHeart size={20} color={Colors.emerald[400]} strokeWidth={1.8} />
                <Text style={styles.welcomeFeatureText}>Adhkar, Tasbih & Dhikr</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setStep('language')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.primaryButtonText}>{t('continue') || 'Begin'}</Text>
            </Pressable>
          </View>
        )}

        {/* ─── Language Step ─── */}
        {step === 'language' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('choose_language')}</Text>
            <Text style={styles.stepSubtitle}>Choose your preferred language</Text>
            <View style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.key}
                  onPress={() => selectLanguage(lang.key)}
                  style={({ pressed }) => [
                    styles.languageCard,
                    locale === lang.key && styles.languageCardActive,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <View style={styles.languageLeft}>
                    <View style={[
                      styles.radioOuter,
                      locale === lang.key && styles.radioOuterActive,
                    ]}>
                      {locale === lang.key && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.languageLabel}>{lang.label}</Text>
                  </View>
                  <Text style={styles.languageNative}>{lang.native}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setStep('auth')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.primaryButtonText}>{t('continue')}</Text>
            </Pressable>
          </View>
        )}

        {/* ─── Auth Step ─── */}
        {step === 'auth' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('sign_in')}</Text>
            <Text style={styles.stepSubtitle}>Sign in to save your progress</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor={Colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={Colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              onPress={() => handleAuth('email')}
              disabled={loading}
              style={({ pressed }) => [styles.primaryButton, pressed && !loading && styles.buttonPressed, loading && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>✉ {t('email_login')}</Text>
            </Pressable>

            <Pressable
              onPress={() => handleAuth('google')}
              disabled={loading}
              style={({ pressed }) => [styles.secondaryButton, pressed && !loading && styles.buttonPressed, loading && styles.buttonDisabled]}
            >
              <Text style={styles.secondaryButtonText}>G {t('google_login')}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={() => handleAuth('guest')}
              disabled={loading}
              style={({ pressed }) => [styles.ghostButton, pressed && !loading && styles.buttonPressed]}
            >
              <Text style={styles.ghostButtonText}>{t('guest_mode')}</Text>
            </Pressable>
          </View>
        )}

        {/* ─── Permissions Step ─── */}
        {step === 'permissions' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('permissions')}</Text>
            <Text style={styles.stepSubtitle}>Allow Najjashi to support your worship</Text>

            <View style={styles.permissionCard}>
              <View style={styles.permissionIconWrap}>
                <MapPin size={22} color={Colors.emerald[400]} strokeWidth={2} />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>{t('location_permission')}</Text>
                <Text style={styles.permissionReason}>{t('location_reason')}</Text>
              </View>
            </View>

            <View style={styles.permissionCard}>
              <View style={styles.permissionIconWrap}>
                <Bell size={22} color={Colors.emerald[400]} strokeWidth={2} />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>{t('notification_permission')}</Text>
                <Text style={styles.permissionReason}>{t('notification_reason')}</Text>
              </View>
            </View>

            <Pressable
              onPress={handleFinish}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.primaryButtonText}>{t('get_started')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['6xl'],
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing['5xl'],
    marginBottom: Spacing['3xl'],
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.charcoal[600],
  },
  stepDotActive: {
    backgroundColor: Colors.emerald[700],
  },
  stepDotCurrent: {
    backgroundColor: Colors.gold[400],
    width: 20,
  },
  stepContent: {
    paddingHorizontal: Spacing.xl,
  },
  stepTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
  },
  // Welcome
  welcomeHero: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    paddingTop: Spacing['4xl'],
  },
  welcomeGlow: {
    position: 'absolute' as const,
    top: 0,
    left: '50%' as any,
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  welcomeArabic: {
    ...Typography.arabicXl,
    color: Colors.gold[400],
  },
  welcomeEnglish: {
    ...Typography.h3,
    color: Colors.emerald[400],
    marginTop: Spacing.xs,
  },
  welcomeSubtitle: {
    ...Typography.bodyLg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  welcomeFeatures: {
    gap: Spacing.lg,
    marginBottom: Spacing['5xl'],
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.lg,
  },
  welcomeFeatureText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  // Language
  languageList: {
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  languageCardActive: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: Colors.border.active,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.charcoal[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.emerald[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.emerald[500],
  },
  languageLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  languageNative: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  // Auth
  input: {
    backgroundColor: Colors.bg.input,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
    ...Typography.body,
  },
  // Buttons
  primaryButton: {
    ...ButtonPresets.primary,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.h4,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    ...ButtonPresets.secondary,
    marginBottom: Spacing.md,
  },
  secondaryButtonText: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  ghostButton: {
    ...ButtonPresets.ghost,
  },
  ghostButtonText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.subtle,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  // Permissions
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  permissionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  permissionReason: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    lineHeight: 18,
  },
});
