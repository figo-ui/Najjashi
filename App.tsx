import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { hydrateStore } from './src/store/useStore';
import { initializeFirebase } from './src/services/firebase';
import { onAuthStateChanged } from './src/services/authService';
import { configureGoogleSignIn } from './src/services/authService';
import { ENV } from './src/config/env';
import './src/services/i18n';
import './src/styles/global.css';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      // 1. Hydrate local store
      try {
        await hydrateStore();
      } catch (e) {
        console.warn('Store hydration skipped:', e);
      }

      // 2. Initialize Firebase
      try {
        const fbReady = await initializeFirebase();
        if (fbReady) {
          // Configure Google Sign-In with Firebase web client ID
          if (ENV.FIREBASE_MESSAGING_SENDER_ID) {
            configureGoogleSignIn(ENV.FIREBASE_MESSAGING_SENDER_ID);
          }
        }
      } catch (e) {
        console.warn('Firebase init skipped:', e);
      }

      setIsReady(true);
    }
    bootstrap();

    // 3. Listen for auth state changes
    let unsubscribe: (() => void) | undefined;
    try {
      const { useStore } = require('./src/store/useStore');
      unsubscribe = onAuthStateChanged((user) => {
        if (user) {
          useStore.getState().setUser(user);
        }
      });
    } catch (e) {
      // Firebase not available yet
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f0d', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fbbf24', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>نجاشي</Text>
        <Text style={{ color: '#10b981', fontSize: 18, marginBottom: 24 }}>Najjashi</Text>
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
