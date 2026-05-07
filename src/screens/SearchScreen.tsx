import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function SearchScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('search')}>
      <View><Text>Search Screen</Text></View>
    </ScreenWrapper>
  );
}
