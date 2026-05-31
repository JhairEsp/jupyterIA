import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINIMIZED_SIZE = 72;

interface FloatingContainerProps {
  isMinimized: boolean;
  children: React.ReactNode;
  minimizedContent: React.ReactNode;
}

export const FloatingContainer: React.FC<FloatingContainerProps> = ({
  isMinimized,
  children,
  minimizedContent,
}) => {
  const translateX = useSharedValue(20);
  const translateY = useSharedValue(SCREEN_HEIGHT - MINIMIZED_SIZE - 80);
  const scale = useSharedValue(1);
  const progress = useSharedValue(0); // 0 = Fullscreen, 1 = Minimized

  useEffect(() => {
    if (isMinimized) {
      progress.value = withSpring(1, { damping: 15 });
      scale.value = withSpring(0.9, { damping: 15 });
    } else {
      progress.value = withSpring(0, { damping: 15 });
      scale.value = withSpring(1, { damping: 15 });
    }
  }, [isMinimized]);

  // Gesture handler for dragging the minimized widget
  const dragGesture = Gesture.Pan()
    .enabled(isMinimized)
    .onUpdate((event) => {
      translateX.value = event.absoluteX - MINIMIZED_SIZE / 2;
      translateY.value = event.absoluteY - MINIMIZED_SIZE / 2;
    })
    .onEnd(() => {
      // Snapping to left or right edge of screen
      const snapX = translateX.value < SCREEN_WIDTH / 2 ? 16 : SCREEN_WIDTH - MINIMIZED_SIZE - 16;
      translateX.value = withSpring(snapX);
      
      // Keep within vertical bounds
      if (translateY.value < 40) {
        translateY.value = withSpring(40);
      } else if (translateY.value > SCREEN_HEIGHT - MINIMIZED_SIZE - 40) {
        translateY.value = withSpring(SCREEN_HEIGHT - MINIMIZED_SIZE - 40);
      }
    });

  // Animated styles for fullscreen view vs floating bubble
  const animatedStyle = useAnimatedStyle(() => {
    const widthVal = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_WIDTH, MINIMIZED_SIZE],
      Extrapolation.CLAMP
    );
    const heightVal = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_HEIGHT, MINIMIZED_SIZE],
      Extrapolation.CLAMP
    );
    const borderRadiusVal = interpolate(
      progress.value,
      [0, 1],
      [0, MINIMIZED_SIZE / 2],
      Extrapolation.CLAMP
    );
    const leftVal = interpolate(progress.value, [0, 1], [0, translateX.value]);
    const topVal = interpolate(progress.value, [0, 1], [0, translateY.value]);
    const opacityVal = interpolate(progress.value, [0.8, 1], [1, 0.95]);

    return {
      position: "absolute",
      width: widthVal,
      height: heightVal,
      borderRadius: borderRadiusVal,
      transform: [{ scale: scale.value }],
      backgroundColor: isMinimized ? "#0B0B14" : "#05050A",
      borderColor: isMinimized ? "#8B5CF6" : "transparent",
      borderWidth: isMinimized ? 2 : 0,
      left: leftVal,
      top: topVal,
      opacity: opacityVal,
      overflow: "hidden",
      shadowColor: "#8B5CF6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isMinimized ? 0.4 : 0,
      shadowRadius: 10,
      elevation: isMinimized ? 12 : 0,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.4], [1, 0]),
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    };
  });

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0.6, 1], [0, 1]),
      position: "absolute",
      width: MINIMIZED_SIZE,
      height: MINIMIZED_SIZE,
      justifyContent: "center",
      alignItems: "center",
    };
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Fullscreen UI container */}
        <Animated.View style={contentStyle} pointerEvents={isMinimized ? "none" : "auto"}>
          {children}
        </Animated.View>

        {/* Minimized Bubble UI container */}
        {isMinimized && (
          <Animated.View style={bubbleStyle}>
            {minimizedContent}
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
});
