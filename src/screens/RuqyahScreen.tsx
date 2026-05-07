import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function RuqyahScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('ruqyah')}>
      <View><Text>Ruqyah Screen</Text></View>
    </ScreenWrapper>
  );
}
