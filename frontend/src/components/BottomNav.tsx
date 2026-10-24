import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Compass, Plus, CreditCard, UserRound, Sparkles } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

export default function BottomNav() {
  const { activeTab, setTab } = useApp();

  const tabs = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'explore', label: 'Explore', Icon: Compass },
    { key: 'post', label: 'Post', Icon: Plus, isSpecial: true },
    { key: 'payments', label: 'Payments', Icon: CreditCard },
    { key: 'profile', label: 'Profile', Icon: UserRound },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {tabs.map(item => {
          const isActive = activeTab === item.key;

          if (item.isSpecial) {
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setTab('post')}
                style={styles.postTabContainer}
                activeOpacity={0.85}
              >
                <View style={styles.postButton}>
                  <Plus size={22} color={colors.textWhite} strokeWidth={2.8} />
                </View>
                <Text style={styles.postLabel}>Post</Text>
              </TouchableOpacity>
            );
          }

          const IconComponent = item.Icon;
          const activeColor = colors.primary;
          const inactiveColor = colors.textMuted;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setTab(item.key as any)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <IconComponent
                  size={20}
                  color={isActive ? activeColor : inactiveColor}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
              {isActive && <View style={styles.activePillIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  iconWrapper: {
    padding: 3,
    borderRadius: 12,
  },
  activeIconWrapper: {
    backgroundColor: colors.primaryBg,
  },
  tabLabel: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  activePillIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  postTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginTop: -16,
  },
  postButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  postLabel: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 2,
  },
});
