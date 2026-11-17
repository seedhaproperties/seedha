import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import colors from '../theme/colors';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

interface MarkProps {
  size?: 'default' | 'nav';
}

export function SeedhaMark({ size = 'default' }: MarkProps) {
  const isNav = size === 'nav';
  const dim = isNav ? 48 : 40;
  const radius = isNav ? 16 : 12;

  return (
    <View style={[styles.markContainer, { width: dim, height: dim, borderRadius: radius }]}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        {/* House outline */}
        <Path
          d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handshake inside house */}
        <Path
          d="M8.5 13.5l2 2 4.5-4.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export default function SeedhaLogo({ size = 'md', light = false }: Props) {
  const scales = { sm: 0.8, md: 1, lg: 1.2 };
  const scale = scales[size];
  const textColor = light ? '#FFFFFF' : '#000000';
  const subColor = light ? 'rgba(255,255,255,0.75)' : '#64748B';

  return (
    <View style={[styles.logoRow, { transform: [{ scale }] }]}>
      <SeedhaMark />
      <View style={styles.textColumn}>
        <Text style={[styles.brandTitle, { color: textColor }]}>Seedha Properties</Text>
        <Text style={[styles.brandSub, { color: subColor }]}>BUY · RENT · SELL · MANAGE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markContainer: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    marginLeft: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.8,
  },
});
