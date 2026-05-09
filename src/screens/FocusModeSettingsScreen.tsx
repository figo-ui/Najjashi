import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { ScreenWrapper } from '../components/shared';
import {
  checkAllPermissions,
  requestOverlayPermission,
  requestAccessibilityPermission,
  requestNotificationPermission,
  requestRecordAudioPermission,
  requestBatteryOptimizationExemption,
  type FocusModePermissionStatus,
} from '../services/focusModeService';
import type { FocusModeIntensity, BlockedAppCategory } from '../types';

export function FocusModeSettingsScreen() {
  const { t } = useTranslation();
  const { focusSettings, setFocusSettings, adhkarStreak } = useStore();
  const [permissions, setPermissions] = useState<FocusModePermissionStatus | null>(null);

  useEffect(() => {
    checkAllPermissions().then(setPermissions);
  }, []);

  const refreshPermissions = async () => {
    const status = await checkAllPermissions();
    setPermissions(status);
  };

  const handleRequestPermission = async (type: 'overlay' | 'accessibility' | 'notifications' | 'recordAudio' | 'battery') => {
    switch (type) {
      case 'overlay': await requestOverlayPermission(); break;
      case 'accessibility': await requestAccessibilityPermission(); break;
      case 'notifications': await requestNotificationPermission(); break;
      case 'recordAudio': await requestRecordAudioPermission(); break;
      case 'battery': await requestBatteryOptimizationExemption(); break;
    }
    setTimeout(refreshPermissions, 1000);
  };

  const intensities: { key: FocusModeIntensity; label: string; desc: string }[] = [
    { key: 'gentle', label: t('intensity_gentle'), desc: t('intensity_gentle_desc') },
    { key: 'moderate', label: t('intensity_moderate'), desc: t('intensity_moderate_desc') },
    { key: 'strict', label: t('intensity_strict'), desc: t('intensity_strict_desc') },
  ];

  const categories: { key: BlockedAppCategory; label: string }[] = [
    { key: 'social', label: t('category_social') },
    { key: 'video', label: t('category_video') },
    { key: 'games', label: t('category_games') },
    { key: 'entertainment', label: t('category_entertainment') },
  ];

  const permItems: { key: keyof FocusModePermissionStatus; label: string; desc: string; requestKey: 'overlay' | 'accessibility' | 'notifications' | 'recordAudio' | 'battery' }[] = [
    { key: 'overlay', label: t('perm_overlay'), desc: t('perm_overlay_desc'), requestKey: 'overlay' },
    { key: 'notifications', label: t('perm_notifications'), desc: t('perm_notifications_desc'), requestKey: 'notifications' },
    { key: 'recordAudio', label: t('perm_microphone'), desc: t('perm_microphone_desc'), requestKey: 'recordAudio' },
    { key: 'batteryOptimization', label: t('perm_battery'), desc: t('perm_battery_desc'), requestKey: 'battery' },
    { key: 'accessibility', label: t('perm_accessibility'), desc: t('perm_accessibility_desc'), requestKey: 'accessibility' },
  ];

  return (
    <ScreenWrapper title={t('focus_mode_settings')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Streak Card */}
        <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Flame size={16} color="#10b981" strokeWidth={2} />
            <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600', marginBottom: 0 }}>
              {adhkarStreak.currentStreak} {t('day_streak')}
            </Text>
          </View>
          <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12 }}>
            {t('longest_streak')}: {adhkarStreak.longestStreak}
          </Text>
        </View>

        {/* Enable Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>{t('focus_mode_enable')}</Text>
          <Switch
            value={focusSettings.enabled}
            onValueChange={(v) => setFocusSettings({ enabled: v })}
            trackColor={{ false: 'rgba(6,78,59,0.3)', true: '#10b981' }}
            thumbColor="#0a0f0d"
          />
        </View>

        {/* Permissions Section */}
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {t('permissions')}
        </Text>
        {permItems.map((item) => {
          const granted = permissions?.[item.key] ?? false;
          return (
            <View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, backgroundColor: 'rgba(6,78,59,0.2)', borderRadius: 12, padding: 12 }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: '#e8f5e9', fontSize: 14, fontWeight: '500' }}>{item.label}</Text>
                <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11, marginTop: 2 }}>{item.desc}</Text>
              </View>
              <Pressable
                onPress={() => handleRequestPermission(item.requestKey)}
                style={{
                  backgroundColor: granted ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: granted ? '#10b981' : '#fbbf24', fontSize: 12, fontWeight: '600' }}>
                  {granted ? '✓' : t('grant')}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Intensity */}
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10 }}>
          {t('restriction_intensity')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {intensities.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFocusSettings({ intensity: item.key })}
              style={{
                flex: 1,
                backgroundColor: focusSettings.intensity === item.key ? '#10b981' : 'rgba(6,78,59,0.3)',
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: focusSettings.intensity === item.key ? '#0a0f0d' : '#e8f5e9', fontSize: 12, fontWeight: '600' }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Schedule */}
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>
          {t('schedule')}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 14 }}>{t('morning_adhkar')}</Text>
          <Switch
            value={focusSettings.schedule.morningEnabled}
            onValueChange={(v) => setFocusSettings({ schedule: { ...focusSettings.schedule, morningEnabled: v } })}
            trackColor={{ false: 'rgba(6,78,59,0.3)', true: '#10b981' }}
            thumbColor="#0a0f0d"
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 14 }}>{t('evening_adhkar')}</Text>
          <Switch
            value={focusSettings.schedule.eveningEnabled}
            onValueChange={(v) => setFocusSettings({ schedule: { ...focusSettings.schedule, eveningEnabled: v } })}
            trackColor={{ false: 'rgba(6,78,59,0.3)', true: '#10b981' }}
            thumbColor="#0a0f0d"
          />
        </View>

        {/* Blocked Categories */}
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>
          {t('blocked_categories')}
        </Text>
        {categories.map((cat) => {
          const isBlocked = focusSettings.blockedCategories.includes(cat.key);
          return (
            <View key={cat.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#e8f5e9', fontSize: 14 }}>{cat.label}</Text>
              <Switch
                value={isBlocked}
                onValueChange={(v) => {
                  const cats = v
                    ? [...focusSettings.blockedCategories, cat.key]
                    : focusSettings.blockedCategories.filter(c => c !== cat.key);
                  setFocusSettings({ blockedCategories: cats });
                }}
                trackColor={{ false: 'rgba(6,78,59,0.3)', true: '#10b981' }}
                thumbColor="#0a0f0d"
              />
            </View>
          );
        })}

        {/* AI Listening */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#e8f5e9', fontSize: 14, fontWeight: '500' }}>{t('ai_listening')}</Text>
            <Text style={{ color: 'rgba(167,196,176,0.4)', fontSize: 11, marginTop: 2 }}>{t('ai_listening_desc')}</Text>
          </View>
          <Switch
            value={focusSettings.aiListeningEnabled}
            onValueChange={(v) => setFocusSettings({ aiListeningEnabled: v })}
            trackColor={{ false: 'rgba(6,78,59,0.3)', true: '#10b981' }}
            thumbColor="#0a0f0d"
          />
        </View>

        {/* Bypass Duration */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 14 }}>{t('bypass_duration')}</Text>
          <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600' }}>{focusSettings.bypassDurationMinutes} {t('minutes')}</Text>
        </View>

        {/* Recitation Speed */}
        <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10 }}>
          {t('recitation_speed')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['slow', 'normal', 'fast'] as const).map((speed) => (
            <Pressable
              key={speed}
              onPress={() => setFocusSettings({ recitationSpeed: speed })}
              style={{
                flex: 1,
                backgroundColor: focusSettings.recitationSpeed === speed ? '#10b981' : 'rgba(6,78,59,0.3)',
                borderRadius: 12,
                paddingVertical: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: focusSettings.recitationSpeed === speed ? '#0a0f0d' : '#e8f5e9', fontSize: 12, fontWeight: '600' }}>
                {t(`speed_${speed}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Ethical Notice */}
        <View style={{ backgroundColor: 'rgba(6,78,59,0.15)', borderRadius: 12, padding: 14, marginTop: 24 }}>
          <Text style={{ color: 'rgba(167,196,176,0.5)', fontSize: 11, lineHeight: 18, textAlign: 'center' }}>
            {t('focus_ethical_notice')}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
