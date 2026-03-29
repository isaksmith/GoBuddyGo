import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useWindowDimensions } from "react-native";

const CHECK = 16;
const EDGE_W = 32;

function CheckerColumn({ x, height, mirror }: { x: number; height: number; mirror?: boolean }) {
  const rows = Math.ceil(height / CHECK) + 1;
  const cols = EDGE_W / CHECK;
  const squares: React.ReactElement[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colIndex = mirror ? cols - 1 - c : c;
      const isWhite = (r + colIndex) % 2 === 0;
      squares.push(
        <Rect
          key={`${r}-${c}`}
          x={x + c * CHECK}
          y={r * CHECK}
          width={CHECK}
          height={CHECK}
          fill={isWhite ? "#FFFFFF" : "#000000"}
          fillOpacity={isWhite ? 0.88 : 0.92}
        />
      );
    }
  }
  return <>{squares}</>;
}

export function RacetrackBackground() {
  const { width: W, height: H } = useWindowDimensions();
  const dashCount = Math.ceil(H / 44) + 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="fadeR" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.55" />
          </LinearGradient>
        </Defs>

        {/* Left checkered edge */}
        <CheckerColumn x={0} height={H} />

        {/* Right checkered edge */}
        <CheckerColumn x={W - EDGE_W} height={H} mirror />

        {/* Fade blend from checkered into screen content */}
        <Rect x={EDGE_W} y={0} width={24} height={H} fill="url(#fadeL)" />
        <Rect x={W - EDGE_W - 24} y={0} width={24} height={H} fill="url(#fadeR)" />

        {/* Thin yellow border lines just inside checkered area */}
        <Rect x={EDGE_W + 1} y={0} width={2.5} height={H} fill="#FFD93D" fillOpacity={0.55} />
        <Rect x={W - EDGE_W - 3.5} y={0} width={2.5} height={H} fill="#FFD93D" fillOpacity={0.55} />

        {/* Center lane dashes — very subtle */}
        {Array.from({ length: dashCount }).map((_, i) => (
          <Rect
            key={i}
            x={W / 2 - 2}
            y={i * 44 + 6}
            width={4}
            height={22}
            fill="#FFFFFF"
            fillOpacity={0.07}
            rx={2}
          />
        ))}
      </Svg>
    </View>
  );
}
