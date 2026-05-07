import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function LearnPrayerScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('learn_prayer')}>
      <View><Text>Learn Prayer Screen</Text></View>
    </ScreenWrapper>
  );
}
