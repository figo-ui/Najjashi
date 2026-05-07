import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function FiqhScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('fiqh')}>
      <View><Text>Fiqh Screen</Text></View>
    </ScreenWrapper>
  );
}
