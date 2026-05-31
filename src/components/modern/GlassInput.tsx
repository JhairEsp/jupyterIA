import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { COLORS } from '../../theme/colors';

interface GlassInputProps extends TextInputProps {
  placeholder?: string;
  style?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  placeholder,
  style,
  ...props
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      style={[styles.input, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
