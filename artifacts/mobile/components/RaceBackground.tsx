import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Ellipse, Rect, Defs, RadialGradient, Stop } from "react-native-svg";

const STAR_COLORS = ["#ffd166", "#4cc9f0", "#06d6a0", "#e63946", "#c77dff"];

interface StarDot {
  color: string;
  top: number;
  left: number;
  delay: number;
}

const STARS: StarDot[] = [
  { color: STAR_COLORS[0], top: 0.08, left: 0.12, delay: 0 },
  { color: STAR_COLORS[1], top: 0.12, left: 0.78, delay: 1 },
  { color: STAR_COLORS[2], top: 0.06, left: 0.55, delay: 0 },
  { color: STAR_COLORS[3], top: 0.18, left: 0.33, delay: 1 },
  { color: STAR_COLORS[4], top: 0.22, left: 0.88, delay: 0 },
];

function usePingPong(duration: number) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) run();
      });
    run();
  }, []);
  return anim;
}


function TwinklingStar({ color, delay }: { color: string; delay: number }) {
  const pulse = usePingPong(2000);
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: delay === 0 ? [0.15, 0.9] : [0.9, 0.15],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: delay === 0 ? [0.7, 1.2] : [1.2, 0.7],
  });
  return (
    <Animated.View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

function SpeedLine({ top, width: w, delay }: { top: number; width: number; delay: number }) {
  const delayed = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      const run = () =>
        Animated.timing(delayed, {
          toValue: 1,
          duration: 2800,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            delayed.setValue(0);
            run();
          }
        });
      run();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const tx = delayed.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [-w - 40, -w, 500, 540],
  });
  const op = delayed.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.18, 0.18, 0],
  });

  return (
    <Animated.View
      style={[
        styles.speedLine,
        {
          top,
          width: w,
          opacity: op,
          transform: [{ translateX: tx }, { skewX: "-20deg" }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

function DecoCar({ emoji, top, duration, delay }: { emoji: string; top: number; duration: number; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      const run = () =>
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            anim.setValue(0);
            run();
          }
        });
      run();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 0.05, 0.92, 1],
    outputRange: [420, 420, -60, -60],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.05, 0.92, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left: 0,
        opacity,
        transform: [{ translateX }],
      }}
      pointerEvents="none"
    >
      <Animated.Text style={{ fontSize: 22 }}>{emoji}</Animated.Text>
    </Animated.View>
  );
}

function CheckerStripe({ position }: { position: "top" | "bottom" }) {
  const size = 14;
  const count = 30;
  return (
    <View
      style={[
        styles.checkerStripe,
        position === "top" ? { top: 0 } : { bottom: 0 },
      ]}
      pointerEvents="none"
    >
      <View style={{ flexDirection: "row", height: size }}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={`r0-${i}`} style={{ width: size, height: size / 2, backgroundColor: i % 2 === 0 ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }} />
        ))}
      </View>
      <View style={{ flexDirection: "row", height: size }}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={`r1-${i}`} style={{ width: size, height: size / 2, backgroundColor: i % 2 === 1 ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)" }} />
        ))}
      </View>
    </View>
  );
}

export function RaceBackground({ children }: { children?: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Svg
        style={StyleSheet.absoluteFillObject}
        viewBox={`0 0 ${width} ${height}`}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="110%" rx="70%" ry="80%">
            <Stop offset="0%" stopColor="#0f3460" />
            <Stop offset="100%" stopColor="#1a1a2e" />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#bgGrad)" />
        <Ellipse
          cx={width / 2}
          cy={height * 0.48}
          rx={width * 0.67}
          ry={height * 0.44}
          fill="none"
          stroke="#2d2d3a"
          strokeWidth={28}
          opacity={0.55}
        />
        <Ellipse
          cx={width / 2}
          cy={height * 0.48}
          rx={width * 0.67 - 24}
          ry={height * 0.44 - 24}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={3}
          strokeDasharray="10,8"
          opacity={0.55}
        />
      </Svg>

      <CheckerStripe position="top" />
      <CheckerStripe position="bottom" />

      <SpeedLine top={height * 0.38} width={90} delay={0} />
      <SpeedLine top={height * 0.44} width={140} delay={700} />
      <SpeedLine top={height * 0.50} width={70} delay={1400} />
      <SpeedLine top={height * 0.31} width={110} delay={2000} />

      <DecoCar emoji="🏎️" top={height * 0.56} duration={3500} delay={0} />
      <DecoCar emoji="🚗" top={height * 0.61} duration={4200} delay={1800} />

      {STARS.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: s.top * height,
            left: s.left * width,
          }}
          pointerEvents="none"
        >
          <TwinklingStar color={s.color} delay={s.delay} />
        </View>
      ))}

      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  speedLine: {
    position: "absolute",
    height: 2,
    borderRadius: 2,
    backgroundColor: "#ffd166",
  },
  checkerStripe: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: "hidden",
    height: 14,
  },
  content: {
    flex: 1,
  },
});
