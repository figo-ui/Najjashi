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
      style={{ backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(6,78,59,0.5)', borderRadius: 18, padding: 16, marginBottom: 10 }}
    >
      <Text style={{ color: '#e8f5e9', fontSize: 16, fontWeight: '600' }}>{title}</Text>
      {subtitle && <Text style={{ color: 'rgba(16,185,129,0.7)', fontSize: 13, marginTop: 4 }}>{subtitle}</Text>}
    </Pressable>
  );
}

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export function ScreenWrapper({ children, title }: ScreenWrapperProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      {title && (
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: '#e8f5e9', fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
        </View>
      )}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>{children}</View>
    </View>
  );
}
