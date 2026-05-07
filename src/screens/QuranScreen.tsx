import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function QuranScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('quran')}>
      <View><Text>Quran Screen</Text></View>
    </ScreenWrapper>
  );
}
