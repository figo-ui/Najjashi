import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function FatwasScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('fatwas')}>
      <View><Text>Fatwas Screen</Text></View>
    </ScreenWrapper>
  );
}
