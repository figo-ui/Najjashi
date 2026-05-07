import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function HisnulMuslimScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('hisnul_muslim')}>
      <View><Text>Hisnul Muslim Screen</Text></View>
    </ScreenWrapper>
  );
}
