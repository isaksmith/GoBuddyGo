import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";

export const EDGE_W = 10;
const STRIPE_H = 14;
const CURB_RED = "#D0021B";
const CURB_WHITE = "#FFFFFF";

export const ROAD_BG = "#1A1A1A";

function CurbStripes({ x, height }: { x: number; height: number }) {
  const count = Math.ceil(height / STRIPE_H) + 1;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Rect
          key={i}
          x={x}
          y={i * STRIPE_H}
          width={EDGE_W}
          height={STRIPE_H}
          fill={i % 2 === 0 ? CURB_RED : CURB_WHITE}
        />
      ))}
    </>
  );
}

export function RacetrackOverlay() {
  const { width: W, height: H } = useWindowDimensions();
  const dashCount = Math.ceil(H / 48) + 1;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="shadowL" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.25" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="shadowR" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.25" />
          </SvgLinearGradient>
        </Defs>

        <CurbStripes x={0} height={H} />
        <CurbStripes x={W - EDGE_W} height={H} />

        <Rect x={EDGE_W} y={0} width={12} height={H} fill="url(#shadowL)" />
        <Rect x={W - EDGE_W - 12} y={0} width={12} height={H} fill="url(#shadowR)" />

        <Rect x={EDGE_W + 1} y={0} width={2} height={H} fill="#FFFFFF" fillOpacity={0.15} />
        <Rect x={W - EDGE_W - 3} y={0} width={2} height={H} fill="#FFFFFF" fillOpacity={0.15} />

        {Array.from({ length: dashCount }).map((_, i) => (
          <Rect
            key={i}
            x={W / 2 - 2}
            y={i * 48 + 8}
            width={4}
            height={24}
            fill="#FFFFFF"
            fillOpacity={0.10}
            rx={2}
          />
        ))}
      </Svg>
    </View>
  );
}
