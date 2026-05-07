import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function DreamsScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('dreams')}>
      <View><Text>Dreams Screen</Text></View>
    </ScreenWrapper>
  );
}
