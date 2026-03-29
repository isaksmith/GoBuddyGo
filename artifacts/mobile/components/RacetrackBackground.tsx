import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";

const EDGE_W = 28;       // curb width on each side
const STRIPE_H = 20;     // height of each red/white stripe
const CURB_RED = "#D0021B";
const CURB_WHITE = "#FFFFFF";

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

/** Full asphalt road — placed BEHIND the navigator at the very bottom */
export function RoadBackground() {
  const { width: W, height: H } = useWindowDimensions();
  const dashCount = Math.ceil(H / 48) + 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#141414" stopOpacity="1" />
            <Stop offset="1" stopColor="#1E1E1E" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Dark asphalt surface */}
        <Rect x={0} y={0} width={W} height={H} fill="url(#asphalt)" />

        {/* White edge lines just inside where curbs will be */}
        <Rect x={EDGE_W} y={0} width={3} height={H} fill="#FFFFFF" fillOpacity={0.22} />
        <Rect x={W - EDGE_W - 3} y={0} width={3} height={H} fill="#FFFFFF" fillOpacity={0.22} />

        {/* Inner track lines */}
        <Rect x={EDGE_W + 18} y={0} width={1.5} height={H} fill="#FFFFFF" fillOpacity={0.07} />
        <Rect x={W - EDGE_W - 19.5} y={0} width={1.5} height={H} fill="#FFFFFF" fillOpacity={0.07} />

        {/* Center dashed line */}
        {Array.from({ length: dashCount }).map((_, i) => (
          <Rect
            key={i}
            x={W / 2 - 2}
            y={i * 48 + 8}
            width={4}
            height={24}
            fill="#FFFFFF"
            fillOpacity={0.18}
            rx={2}
          />
        ))}
      </Svg>
    </View>
  );
}

/** Red/white curb stripes — placed ON TOP of the navigator as a framing overlay */
export function CurbEdgeOverlay() {
  const { width: W, height: H } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Subtle inner shadow to blend curb into screen content */}
          <SvgLinearGradient id="shadowL" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="shadowR" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.35" />
          </SvgLinearGradient>
        </Defs>

        {/* Left red/white curb */}
        <CurbStripes x={0} height={H} />

        {/* Right red/white curb */}
        <CurbStripes x={W - EDGE_W} height={H} />

        {/* Inner shadow to blend edges into content */}
        <Rect x={EDGE_W} y={0} width={20} height={H} fill="url(#shadowL)" />
        <Rect x={W - EDGE_W - 20} y={0} width={20} height={H} fill="url(#shadowR)" />
      </Svg>
    </View>
  );
}
