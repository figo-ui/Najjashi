import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function TafsirScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('tafsir')}>
      <View><Text>Tafsir Screen</Text></View>
    </ScreenWrapper>
  );
}
