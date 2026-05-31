import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glassy?: boolean;
  elevated?: boolean;
  gradient?: boolean;
  onPress?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  glassy = true,
  elevated = false,
  gradient = false,
  onPress,
}) => {
  const cardStyle = [
    styles.card,
    glassy && styles.glassy,
    elevated && styles.elevated,
    gradient && styles.gradient,
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glassy: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassLight,
  } as any,
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
});
