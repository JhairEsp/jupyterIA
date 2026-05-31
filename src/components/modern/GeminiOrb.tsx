import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Canvas, Circle, Path, vec, Paint } from '@shopify/react-native-skia';
import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GeminiOrbProps {
  isActive: boolean;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

export const GeminiOrb = ({ isActive, color, size = 'large' }: GeminiOrbProps) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  const getSize = () => {
    switch (size) {
      case 'small':
        return 100;
      case 'medium':
        return 150;
      case 'large':
        return 200;
      default:
        return 200;
    }
  };

  const orbSize = getSize();

  // Rotation animation
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.setValue(0);
    }
  }, [isActive, rotationAnim]);

  // Pulse animation
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0.8);
    }
  }, [isActive, pulseAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.orbWrapper,
          {
            transform: [
              { rotate: rotation },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Canvas
          style={{
            width: orbSize + 40,
            height: orbSize + 40,
          }}
        >
          {/* Outer glow rings */}
          <Circle
            cx={orbSize / 2 + 20}
            cy={orbSize / 2 + 20}
            r={orbSize / 2 + 10}
            color={`${color}20`}
          />
          <Circle
            cx={orbSize / 2 + 20}
            cy={orbSize / 2 + 20}
            r={orbSize / 2 + 5}
            color={`${color}30`}
          />

          {/* Main orb with gradient */}
          <Circle
            cx={orbSize / 2 + 20}
            cy={orbSize / 2 + 20}
            r={orbSize / 2}
            color={color}
            opacity={0.15}
          />

          {/* Core bright center */}
          <Circle
            cx={orbSize / 2 + 20}
            cy={orbSize / 2 + 20}
            r={orbSize / 2}
            color={color}
            opacity={0.3}
          />

          {/* Highlight */}
          <Circle
            cx={orbSize / 2 + 10}
            cy={orbSize / 2 + 10}
            r={orbSize / 4}
            color={`${color}80`}
          />
        </Canvas>

        {/* Inner rings for Gemini style */}
        <View
          style={[
            styles.innerRing,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              borderColor: `${color}40`,
            },
          ]}
        />
        <View
          style={[
            styles.innerRing,
            {
              width: orbSize * 0.7,
              height: orbSize * 0.7,
              borderRadius: orbSize * 0.35,
              borderColor: `${color}60`,
            },
          ]}
        />

        {/* Center core */}
        <View
          style={[
            styles.coreCenter,
            {
              width: orbSize * 0.4,
              height: orbSize * 0.4,
              borderRadius: orbSize * 0.2,
              backgroundColor: color,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  coreCenter: {
    position: 'absolute',
    boxShadow: `0 0 30px ${COLORS.glow}`,
  },
});
