import React from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgGrad,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
  bodyColor?: string;
  accentColor?: string;
}

export default function DefaultCarSvg({
  width = 240,
  height = 140,
  bodyColor = "#4F8EF7",
  accentColor = "#FFD93D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 140">
      <Defs>
        <SvgGrad id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={bodyColor} />
          <Stop offset="1" stopColor={darken(bodyColor, 30)} />
        </SvgGrad>
        <SvgGrad id="windowGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#87CEEB" />
          <Stop offset="1" stopColor="#5BA3D9" />
        </SvgGrad>
        <SvgGrad id="wheelGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#444" />
          <Stop offset="1" stopColor="#222" />
        </SvgGrad>
      </Defs>

      <G transform="translate(0, 5)">
        {/* Shadow */}
        <Ellipse cx="120" cy="125" rx="100" ry="8" fill="rgba(0,0,0,0.15)" />

        {/* Car body bottom */}
        <Path
          d="M30,80 L30,100 Q30,110 40,110 L200,110 Q210,110 210,100 L210,80 Z"
          fill="url(#bodyGrad)"
        />

        {/* Car body top (cabin) */}
        <Path
          d="M55,80 L70,45 Q73,40 80,40 L160,40 Q167,40 170,45 L185,80 Z"
          fill="url(#bodyGrad)"
        />

        {/* Roof highlight */}
        <Path
          d="M72,47 L82,42 L158,42 L168,47 Z"
          fill="rgba(255,255,255,0.25)"
        />

        {/* Side panel accent stripe */}
        <Rect x="35" y="85" width="170" height="8" rx="4" fill={accentColor} opacity={0.9} />

        {/* Windshield */}
        <Path
          d="M74,78 L85,50 Q87,47 90,47 L118,47 L118,78 Z"
          fill="url(#windowGrad)"
          opacity={0.85}
        />

        {/* Rear window */}
        <Path
          d="M124,47 L150,47 Q153,47 155,50 L166,78 L124,78 Z"
          fill="url(#windowGrad)"
          opacity={0.85}
        />

        {/* Window divider */}
        <Rect x="119" y="47" width="4" height="31" rx="2" fill={bodyColor} />

        {/* Headlight */}
        <Rect x="20" y="85" width="14" height="10" rx="5" fill="#FFE066" />
        <Circle cx="27" cy="90" r="3" fill="#FFFFFF" opacity={0.7} />

        {/* Tail light */}
        <Rect x="206" y="85" width="12" height="10" rx="5" fill="#FF4444" />

        {/* Front bumper */}
        <Path d="M25,100 Q25,112 35,112 L45,112 L45,100 Z" fill={darken(bodyColor, 15)} />

        {/* Rear bumper */}
        <Path d="M195,100 L195,112 L205,112 Q215,112 215,100 Z" fill={darken(bodyColor, 15)} />

        {/* Grille lines */}
        <Rect x="26" y="98" width="16" height="2" rx="1" fill={darken(bodyColor, 40)} />
        <Rect x="26" y="102" width="16" height="2" rx="1" fill={darken(bodyColor, 40)} />

        {/* Door handle */}
        <Rect x="108" y="82" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />

        {/* Front wheel */}
        <Circle cx="70" cy="112" r="18" fill="url(#wheelGrad)" />
        <Circle cx="70" cy="112" r="13" fill="#666" />
        <Circle cx="70" cy="112" r="9" fill="#888" />
        <Circle cx="70" cy="112" r="4" fill="#AAA" />
        {/* Wheel spokes */}
        <Rect x="69" y="100" width="2" height="24" rx="1" fill="#777" />
        <Rect x="58" y="111" width="24" height="2" rx="1" fill="#777" />

        {/* Rear wheel */}
        <Circle cx="175" cy="112" r="18" fill="url(#wheelGrad)" />
        <Circle cx="175" cy="112" r="13" fill="#666" />
        <Circle cx="175" cy="112" r="9" fill="#888" />
        <Circle cx="175" cy="112" r="4" fill="#AAA" />
        {/* Wheel spokes */}
        <Rect x="174" y="100" width="2" height="24" rx="1" fill="#777" />
        <Rect x="163" y="111" width="24" height="2" rx="1" fill="#777" />

        {/* Wheel fenders */}
        <Path
          d="M48,105 Q48,92 70,92 Q92,92 92,105"
          fill="none"
          stroke={darken(bodyColor, 20)}
          strokeWidth="3"
        />
        <Path
          d="M153,105 Q153,92 175,92 Q197,92 197,105"
          fill="none"
          stroke={darken(bodyColor, 20)}
          strokeWidth="3"
        />

        {/* Antenna */}
        <Path d="M160,40 L165,18" stroke={bodyColor} strokeWidth="2" strokeLinecap="round" />
        <Circle cx="165" cy="16" r="3" fill={accentColor} />

        {/* Side mirror */}
        <Ellipse cx="55" cy="72" rx="6" ry="4" fill={bodyColor} stroke={darken(bodyColor, 20)} strokeWidth="1" />

        {/* Star decoration */}
        <G transform="translate(120, 96)">
          <Path
            d="M0,-6 L1.5,-2 L6,-2 L2.5,1 L4,5 L0,2.5 L-4,5 L-2.5,1 L-6,-2 L-1.5,-2 Z"
            fill={accentColor}
          />
        </G>
      </G>
    </Svg>
  );
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
