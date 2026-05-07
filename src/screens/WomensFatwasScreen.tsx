import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function WomensFatwasScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('womens_fatwas')}>
      <View><Text>Women's Fatwas Screen</Text></View>
    </ScreenWrapper>
  );
}
