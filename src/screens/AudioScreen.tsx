import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function AudioScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('audio')}>
      <View><Text>Audio Screen</Text></View>
    </ScreenWrapper>
  );
}
