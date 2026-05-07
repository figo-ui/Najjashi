import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { useStore } from '../store/useStore';
import { HomeScreen } from '../screens/HomeScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { AdhkarScreen } from '../screens/AdhkarScreen';
import { TasbihScreen } from '../screens/TasbihScreen';
import { SahabaScreen } from '../screens/SahabaScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ImmersiveZikrScreen } from '../screens/ImmersiveZikrScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ focused, emoji, label }: { focused: boolean; emoji: string; label: string }) {
  return (
    <Text style={{ textAlign: 'center' }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>{'\n'}
      <Text style={{ fontSize: 10, color: focused ? '#10b981' : '#6b8f7a', fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
    </Text>
  );
}

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0a0f0d', borderTopColor: '#1e3a30', height: 70, paddingBottom: 8, paddingTop: 4 },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b8f7a',
        headerStyle: { backgroundColor: '#0a0f0d' },
        headerTintColor: '#e8f5e9',
        headerTitleStyle: { fontWeight: '600' },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: (p) => <TabIcon focused={p.focused} emoji="🏠" label={t('home')} />,
          title: t('home'),
        }}
      />
      <Tab.Screen
        name="Prayer"
        component={PrayerScreen}
        options={{
          tabBarIcon: (p) => <TabIcon focused={p.focused} emoji="🕌" label={t('prayer')} />,
          title: t('prayer'),
        }}
      />
      <Tab.Screen
        name="Adhkar"
        component={AdhkarScreen}
        options={{
          tabBarIcon: (p) => <TabIcon focused={p.focused} emoji="📿" label={t('adhkar')} />,
          title: t('adhkar'),
        }}
      />
      <Tab.Screen
        name="Tasbih"
        component={TasbihScreen}
        options={{
          tabBarIcon: (p) => <TabIcon focused={p.focused} emoji="✋" label={t('tasbih')} />,
          title: t('tasbih'),
        }}
      />
      <Tab.Screen
        name="Sahaba"
        component={SahabaScreen}
        options={{
          tabBarIcon: (p) => <TabIcon focused={p.focused} emoji="📖" label={t('sahaba')} />,
          title: t('sahaba'),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { preferences } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!preferences.onboardingComplete && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ImmersiveZikr" component={ImmersiveZikrScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
