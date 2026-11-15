import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Compass, Plus, CreditCard, User } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setTab, requireAuth } = useApp();

  const tabs = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'explore', label: 'Explore', Icon: Compass },
    { key: 'post', label: 'Post', Icon: Plus, isSpecial: true },
    { key: 'payments', label: 'Payments', Icon: CreditCard },
    { key: 'profile', label: 'Profile', Icon: User },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {tabs.map((item) => {
          const isActive = activeTab === item.key;

          if (item.isSpecial) {
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => requireAuth(undefined, { name: 'postProperty' }, 'Post Property')}
                style={styles.postTabContainer}
                activeOpacity={0.85}
              >
                <View style={styles.postButton}>
                  <Plus size={20} color="#FFFFFF" strokeWidth={2.8} />
                </View>
                <Text style={styles.postLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          }

          const IconComponent = item.Icon;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setTab(item.key)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={21}
                  color={isActive ? '#0F172A' : '#94A3B8'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive
                    ? { color: '#0F172A', fontWeight: '700' }
                    : { color: '#94A3B8', fontWeight: '500' },
                ]}
              >
                {item.label}
              </Text>
              {isActive ? <View style={styles.activeIndicator} /> : <View style={styles.inactiveIndicatorPlaceholder} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: -0.2,
  },
  activeIndicator: {
    width: 22,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    marginTop: 3,
  },
  inactiveIndicatorPlaceholder: {
    width: 22,
    height: 2.5,
    backgroundColor: 'transparent',
    marginTop: 3,
  },
  postTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  postButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  postLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
});
