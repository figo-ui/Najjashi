import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function StoriesScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('stories')}>
      <View><Text>Stories Screen</Text></View>
    </ScreenWrapper>
  );
}
