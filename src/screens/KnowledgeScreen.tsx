import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/shared';

export function KnowledgeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenWrapper title={t('knowledge')}>
      <View><Text>Knowledge Screen</Text></View>
    </ScreenWrapper>
  );
}
