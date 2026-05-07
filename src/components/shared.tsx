import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
}

export function SectionCard({ title, subtitle, onPress }: SectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-emerald-900/40 border border-emerald-800/50 rounded-2xl p-4 mb-3 active:bg-emerald-800/60"
    >
      <Text className="text-emerald-100 text-base font-semibold">{title}</Text>
      {subtitle && <Text className="text-emerald-400/70 text-sm mt-1">{subtitle}</Text>}
    </Pressable>
  );
}

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export function ScreenWrapper({ children, title }: ScreenWrapperProps) {
  return (
    <View className="flex-1 bg-[#0a0f0d]">
      {title && (
        <View className="px-5 pt-4 pb-2">
          <Text className="text-emerald-100 text-xl font-bold">{title}</Text>
        </View>
      )}
      <View className="flex-1 px-4">{children}</View>
    </View>
  );
}
