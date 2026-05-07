import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function RadioScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('radio')}>
      <View><Text>Radio Screen</Text></View>
    </ScreenWrapper>
  );
}
