import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function ZakatScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('zakat')}>
      <View><Text>Zakat Calculator Screen</Text></View>
    </ScreenWrapper>
  );
}
