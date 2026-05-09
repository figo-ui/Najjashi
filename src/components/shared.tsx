import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Radius, Typography, Shadows, CardPresets } from '../theme';

// ─── Screen Wrapper ───

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}

export function ScreenWrapper({ children, title, subtitle, noPadding }: ScreenWrapperProps) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
}

// ─── Premium Card ───

interface PremiumCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'elevated' | 'glass' | 'gold' | 'active';
  style?: any;
}

export function PremiumCard({ children, onPress, variant = 'primary', style }: PremiumCardProps) {
  const cardStyle = CardPresets[variant];
  const inner = (
    <View style={[cardStyle, { padding: Spacing.xl }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

// ─── Section Header ───

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Section Card (legacy compat) ───

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
}

export function SectionCard({ title, subtitle, onPress }: SectionCardProps) {
  return (
    <PremiumCard onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </PremiumCard>
  );
}

// ─── Divider ───

export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Badge ───

interface BadgeProps {
  label: string;
  variant?: 'emerald' | 'gold' | 'muted';
}

export function Badge({ label, variant = 'emerald' }: BadgeProps) {
  const bgMap = {
    emerald: 'rgba(16,185,129,0.15)',
    gold: 'rgba(212,168,67,0.15)',
    muted: 'rgba(90,112,104,0.2)',
  };
  const colorMap = {
    emerald: Colors.emerald[400],
    gold: Colors.gold[400],
    muted: Colors.charcoal[300],
  };
  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }]}>
      <Text style={[styles.badgeText, { color: colorMap[variant] }]}>{label}</Text>
    </View>
  );
}

// ─── Progress Bar ───

interface ProgressBarProps {
  progress: number;
  variant?: 'emerald' | 'gold';
  height?: number;
}

export function ProgressBar({ progress, variant = 'emerald', height = 3 }: ProgressBarProps) {
  const color = variant === 'gold' ? Colors.gold[400] : Colors.emerald[500];
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color, height }]} />
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
  pressed: {
    opacity: 0.85,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.emerald[400],
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.text.tertiary,
  },
  sectionAction: {
    ...Typography.caption,
    color: Colors.emerald[400],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: Spacing.lg,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.overline,
    fontSize: 10,
  },
  progressTrack: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: Radius.full,
  },
});
