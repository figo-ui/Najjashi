import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function QuestsScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('quests')}>
      <View><Text>Quests Screen</Text></View>
    </ScreenWrapper>
  );
}
