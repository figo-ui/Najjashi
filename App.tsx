import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { hydrateStore } from './src/store/useStore';
import './src/services/i18n';
import './src/styles/global.css';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await hydrateStore();
      } catch (e) {
        console.warn('Store hydration skipped:', e);
      }
      // Firebase init will be added here when @react-native-firebase/app is configured
      // try { await firebaseApp.initializeApp(firebaseConfig); } catch(e) {}
      setIsReady(true);
    }
    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f0d', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fbbf24', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>أنا مسلم</Text>
        <Text style={{ color: '#10b981', fontSize: 18, marginBottom: 24 }}>I Am Muslim</Text>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
