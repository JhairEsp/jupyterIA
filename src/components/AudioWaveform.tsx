import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import { Canvas, Path, Skia, LinearGradient, vec } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useVoiceStore, VoiceState } from "../store/voiceStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WAVE_HEIGHT = 160;

interface AudioWaveformProps {
  state: VoiceState;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ state }) => {
  const time = useSharedValue(0);
  const waveAmplitude = useSharedValue(0);
  const thinkingOffset = useSharedValue(0);

  // Trigger continuous time animation for morphing wave
  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Update target amplitude based on current state
  useEffect(() => {
    let targetAmp = 0.1;
    if (state === "escuchando") {
      targetAmp = 0.6;
    } else if (state === "hablando") {
      targetAmp = 0.8;
    } else if (state === "pensando") {
      targetAmp = 0.3;
    } else if (state === "dormido") {
      targetAmp = 0.05;
    } else if (state === "accion") {
      targetAmp = 0.4;
    }
    
    waveAmplitude.value = withTiming(targetAmp, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });

    if (state === "pensando") {
      thinkingOffset.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      thinkingOffset.value = withTiming(0, { duration: 500 });
    }
  }, [state]);

  // Wave path generators (drawn via Skia Path)
  const generateSineWavePath = (
    phaseShift: number,
    frequency: number,
    amplitudeMultiplier: number,
    t: number
  ) => {
    "worklet";
    const path = Skia.Path.Make();
    const midY = WAVE_HEIGHT / 2;
    
    path.moveTo(0, midY);

    for (let x = 0; x <= SCREEN_WIDTH; x += 5) {
      // Basic sine wave logic modulated by current time and amplitude
      const angle = (x / SCREEN_WIDTH) * Math.PI * 2 * frequency + t + phaseShift;
      
      // Add thinking pattern distortion if in thinking state
      const thinkingMod = state === "pensando" 
        ? Math.sin((x / SCREEN_WIDTH) * Math.PI * 8 + t * 2) * 8
        : 0;

      const y = midY + 
        Math.sin(angle) * (WAVE_HEIGHT * 0.4) * waveAmplitude.value * amplitudeMultiplier + 
        thinkingMod;
        
      path.lineTo(x, y);
    }

    path.lineTo(SCREEN_WIDTH, WAVE_HEIGHT);
    path.lineTo(0, WAVE_HEIGHT);
    path.close();

    return path;
  };

  // Reactively calculate paths based on the animated time and amplitudes
  const path1 = useDerivedValue(() => {
    return generateSineWavePath(0, 1.2, 1.0, time.value);
  });

  const path2 = useDerivedValue(() => {
    return generateSineWavePath(Math.PI / 3, 1.6, 0.75, time.value * 1.3);
  });

  const path3 = useDerivedValue(() => {
    return generateSineWavePath((2 * Math.PI) / 3, 0.8, 0.5, time.value * 0.7);
  });

  return (
    <Canvas style={{ width: SCREEN_WIDTH, height: WAVE_HEIGHT }}>
      {/* Wave 3 - Deep purple background wave */}
      <Path path={path3} opacity={0.3}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(SCREEN_WIDTH, WAVE_HEIGHT)}
          colors={["#8B5CF6", "#6366F1", "#0EA5E9"]}
        />
      </Path>

      {/* Wave 2 - Cyan/Blue mid wave */}
      <Path path={path2} opacity={0.55}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(SCREEN_WIDTH, WAVE_HEIGHT)}
          colors={["#0EA5E9", "#3B82F6", "#8B5CF6"]}
        />
      </Path>

      {/* Wave 1 - Bright glowing foreground wave */}
      <Path path={path1} opacity={0.85}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(SCREEN_WIDTH, WAVE_HEIGHT)}
          colors={["#6366F1", "#8B5CF6", "#0EA5E9"]}
        />
      </Path>
    </Canvas>
  );
};
