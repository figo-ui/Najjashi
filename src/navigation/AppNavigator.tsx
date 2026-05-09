import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import { Home, BookOpen, Moon, HandHeart, Headphones } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Colors, Typography, Spacing } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { QuranScreen } from '../screens/QuranScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { AdhkarScreen } from '../screens/AdhkarScreen';
import { HisnulMuslimScreen } from '../screens/HisnulMuslimScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { RadioScreen } from '../screens/RadioScreen';
import { StoriesScreen } from '../screens/StoriesScreen';
import { TafsirScreen } from '../screens/TafsirScreen';
import { RuqyahScreen } from '../screens/RuqyahScreen';
import { FatwasScreen } from '../screens/FatwasScreen';
import { LearnPrayerScreen } from '../screens/LearnPrayerScreen';
import { TasbihScreen } from '../screens/TasbihScreen';
import { ZakatScreen } from '../screens/ZakatScreen';
import { HijriScreen } from '../screens/HijriScreen';
import { DreamsScreen } from '../screens/DreamsScreen';
import { QuestsScreen } from '../screens/QuestsScreen';
import { FiqhScreen } from '../screens/FiqhScreen';
import { WomensFatwasScreen } from '../screens/WomensFatwasScreen';
import { PropheticMedicineScreen } from '../screens/PropheticMedicineScreen';
import { SignsScreen } from '../screens/SignsScreen';
import { KnowledgeScreen } from '../screens/KnowledgeScreen';
import { SahabaScreen } from '../screens/SahabaScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ImmersiveZikrScreen } from '../screens/ImmersiveZikrScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { GuidedAdhkarScreen } from '../screens/GuidedAdhkarScreen';
import { FocusModeSettingsScreen } from '../screens/FocusModeSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TAB_ICONS: Record<string, React.ElementType> = {
  HomeTab: Home,
  QuranTab: BookOpen,
  PrayerTab: Moon,
  AdhkarTab: HandHeart,
  AudioTab: Headphones,
};

function TabIcon({ focused, routeName, label }: { focused: boolean; routeName: string; label: string }) {
  const IconComponent = TAB_ICONS[routeName] || Home;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.xs }}>
      <IconComponent
        size={22}
        color={focused ? Colors.emerald[400] : Colors.charcoal[400]}
        strokeWidth={focused ? 2.2 : 1.8}
      />
      <Text style={{
        ...Typography.overline,
        fontSize: 9,
        color: focused ? Colors.emerald[400] : Colors.charcoal[400],
        marginTop: 2,
      }}>
        {label}
      </Text>
      {focused && (
        <View style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: Colors.gold[400],
          marginTop: 3,
        }} />
      )}
    </View>
  );
}

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.charcoal[950],
          borderTopColor: Colors.border.subtle,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 6,
          paddingTop: 2,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.emerald[400],
        tabBarInactiveTintColor: Colors.charcoal[400],
        headerStyle: {
          backgroundColor: Colors.bg.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          ...Typography.h4,
          color: Colors.text.primary,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarIcon: (p) => <TabIcon focused={p.focused} routeName="HomeTab" label={t('home')} />, title: t('home') }} />
      <Tab.Screen name="QuranTab" component={QuranScreen} options={{ tabBarIcon: (p) => <TabIcon focused={p.focused} routeName="QuranTab" label={t('quran')} />, title: t('quran') }} />
      <Tab.Screen name="PrayerTab" component={PrayerScreen} options={{ tabBarIcon: (p) => <TabIcon focused={p.focused} routeName="PrayerTab" label={t('prayer')} />, title: t('prayer') }} />
      <Tab.Screen name="AdhkarTab" component={AdhkarScreen} options={{ tabBarIcon: (p) => <TabIcon focused={p.focused} routeName="AdhkarTab" label={t('adhkar')} />, title: t('adhkar') }} />
      <Tab.Screen name="AudioTab" component={AudioScreen} options={{ tabBarIcon: (p) => <TabIcon focused={p.focused} routeName="AudioTab" label={t('audio')} />, title: t('audio') }} />
    </Tab.Navigator>
  );
}

function AppDrawer() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: Colors.charcoal[900],
          width: 280,
        },
        drawerActiveTintColor: Colors.emerald[400],
        drawerInactiveTintColor: Colors.charcoal[200],
        headerStyle: {
          backgroundColor: Colors.bg.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.text.primary,
        drawerLabelStyle: {
          ...Typography.body,
          fontSize: 14,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginVertical: 1,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} options={{ drawerLabel: t('home'), headerShown: false }} />
      <Drawer.Screen name="HisnulMuslim" component={HisnulMuslimScreen} options={{ drawerLabel: t('hisnul_muslim'), title: t('hisnul_muslim') }} />
      <Drawer.Screen name="Radio" component={RadioScreen} options={{ drawerLabel: t('radio'), title: t('radio') }} />
      <Drawer.Screen name="Stories" component={StoriesScreen} options={{ drawerLabel: t('stories'), title: t('stories') }} />
      <Drawer.Screen name="Sahaba" component={SahabaScreen} options={{ drawerLabel: t('sahaba'), title: t('sahaba') }} />
      <Drawer.Screen name="Tafsir" component={TafsirScreen} options={{ drawerLabel: t('tafsir'), title: t('tafsir') }} />
      <Drawer.Screen name="Ruqyah" component={RuqyahScreen} options={{ drawerLabel: t('ruqyah'), title: t('ruqyah') }} />
      <Drawer.Screen name="Fatwas" component={FatwasScreen} options={{ drawerLabel: t('fatwas'), title: t('fatwas') }} />
      <Drawer.Screen name="LearnPrayer" component={LearnPrayerScreen} options={{ drawerLabel: t('learn_prayer'), title: t('learn_prayer') }} />
      <Drawer.Screen name="Tasbih" component={TasbihScreen} options={{ drawerLabel: t('tasbih'), title: t('tasbih') }} />
      <Drawer.Screen name="Zakat" component={ZakatScreen} options={{ drawerLabel: t('zakat'), title: t('zakat') }} />
      <Drawer.Screen name="Hijri" component={HijriScreen} options={{ drawerLabel: t('hijri'), title: t('hijri') }} />
      <Drawer.Screen name="Dreams" component={DreamsScreen} options={{ drawerLabel: t('dreams'), title: t('dreams') }} />
      <Drawer.Screen name="Quests" component={QuestsScreen} options={{ drawerLabel: t('quests'), title: t('quests') }} />
      <Drawer.Screen name="Fiqh" component={FiqhScreen} options={{ drawerLabel: t('fiqh'), title: t('fiqh') }} />
      <Drawer.Screen name="WomensFatwas" component={WomensFatwasScreen} options={{ drawerLabel: t('womens_fatwas'), title: t('womens_fatwas') }} />
      <Drawer.Screen name="PropheticMedicine" component={PropheticMedicineScreen} options={{ drawerLabel: t('prophetic_medicine'), title: t('prophetic_medicine') }} />
      <Drawer.Screen name="Signs" component={SignsScreen} options={{ drawerLabel: t('signs'), title: t('signs') }} />
      <Drawer.Screen name="Knowledge" component={KnowledgeScreen} options={{ drawerLabel: t('knowledge'), title: t('knowledge') }} />
      <Drawer.Screen name="FocusModeSettings" component={FocusModeSettingsScreen} options={{ drawerLabel: t('focus_mode'), title: t('focus_mode') }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerLabel: t('settings'), title: t('settings') }} />
    </Drawer.Navigator>
  );
}

export function AppNavigator() {
  const { preferences } = useStore();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.emerald[500],
          background: Colors.bg.primary,
          card: Colors.bg.card,
          text: Colors.text.primary,
          border: Colors.border.subtle,
          notification: Colors.gold[400],
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '900' as const },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!preferences.onboardingComplete && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        <Stack.Screen name="Drawer" component={AppDrawer} />
        <Stack.Screen name="GuidedAdhkar" component={GuidedAdhkarScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ImmersiveZikr" component={ImmersiveZikrScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
