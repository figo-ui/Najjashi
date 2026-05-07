import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function HijriScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('hijri')}>
      <View><Text>Hijri Calendar Screen</Text></View>
    </ScreenWrapper>
  );
}
