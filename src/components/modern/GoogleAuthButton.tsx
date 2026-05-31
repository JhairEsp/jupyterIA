import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

interface GoogleAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onPress,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🔐</Text>
      <Text style={styles.text}>
        {loading ? 'Conectando...' : 'Conectar Google Calendar'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
