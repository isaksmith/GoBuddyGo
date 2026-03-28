import React from "react";
import Svg, {
  Circle,
  Path,
  Rect,
  Line,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
} from "react-native-svg";

const SIZE = 80;

export function SpeedDemonBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="sdBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF6B35" />
          <Stop offset="1" stopColor="#C0392B" />
        </LinearGradient>
        <LinearGradient id="sdBolt" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE04B" />
          <Stop offset="1" stopColor="#FFC107" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#sdBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#FF8A65" strokeWidth="1.5" strokeOpacity="0.5" />
      <Path
        d="M45 10 L28 42 L38 42 L35 70 L55 35 L44 35 Z"
        fill="url(#sdBolt)"
        stroke="#FFF9C4"
        strokeWidth="1"
      />
    </Svg>
  );
}

export function FirstVictoryBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="fvBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#9E9E9E" />
          <Stop offset="1" stopColor="#424242" />
        </LinearGradient>
        <LinearGradient id="fvPole" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E0E0E0" />
          <Stop offset="1" stopColor="#BDBDBD" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#fvBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#E0E0E0" strokeWidth="1.5" strokeOpacity="0.4" />
      <Rect x="27" y="16" width="4" height="52" rx="2" fill="url(#fvPole)" />
      <G>
        <Rect x="31" y="16" width="9" height="7" fill="#FFFFFF" />
        <Rect x="40" y="16" width="9" height="7" fill="#212121" />
        <Rect x="31" y="23" width="9" height="7" fill="#212121" />
        <Rect x="40" y="23" width="9" height="7" fill="#FFFFFF" />
        <Rect x="31" y="30" width="9" height="7" fill="#FFFFFF" />
        <Rect x="40" y="30" width="9" height="7" fill="#212121" />
      </G>
    </Svg>
  );
}

export function DriftKingBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="dkBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#9C27B0" />
          <Stop offset="1" stopColor="#E91E63" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#dkBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#CE93D8" strokeWidth="1.5" strokeOpacity="0.5" />
      <Path
        d="M18 55 Q30 30 50 35 Q65 40 62 25"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.9"
      />
      <Path
        d="M20 60 Q32 35 52 40 Q67 45 64 30"
        stroke="#E1BEE7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.5"
      />
      <Ellipse cx="22" cy="58" rx="8" ry="4" fill="#FFFFFF" fillOpacity="0.2" />
      <Ellipse cx="30" cy="62" rx="6" ry="3" fill="#FFFFFF" fillOpacity="0.15" />
    </Svg>
  );
}

export function GearheadBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="ghBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1565C0" />
          <Stop offset="1" stopColor="#00838F" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#ghBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#4FC3F7" strokeWidth="1.5" strokeOpacity="0.5" />
      <G>
        <Circle cx="36" cy="38" r="10" fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
        <Circle cx="36" cy="38" r="4" fill="#FFFFFF" />
        <Rect x="32" y="25" width="8" height="6" rx="2" fill="#FFFFFF" />
        <Rect x="32" y="45" width="8" height="6" rx="2" fill="#FFFFFF" />
        <Rect x="22" y="34" width="6" height="8" rx="2" fill="#FFFFFF" />
        <Rect x="42" y="34" width="6" height="8" rx="2" fill="#FFFFFF" />
        <Rect x="25.5" y="27.5" width="6" height="8" rx="2" fill="#FFFFFF" transform="rotate(45 28.5 31.5)" />
        <Rect x="41.5" y="43.5" width="6" height="8" rx="2" fill="#FFFFFF" transform="rotate(45 44.5 47.5)" />
        <Rect x="41.5" y="27.5" width="6" height="8" rx="2" fill="#FFFFFF" transform="rotate(-45 44.5 31.5)" />
        <Rect x="25.5" y="43.5" width="6" height="8" rx="2" fill="#FFFFFF" transform="rotate(-45 28.5 47.5)" />
      </G>
      <Path
        d="M52 42 L58 56"
        stroke="#E0E0E0"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M50 40 L56 54"
        stroke="#BDBDBD"
        strokeWidth="4"
        strokeLinecap="round"
        transform="rotate(15 53 47)"
      />
      <Circle cx="50" cy="40" r="4" fill="#E0E0E0" />
    </Svg>
  );
}

export function NightRiderBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="nrBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1A237E" />
          <Stop offset="1" stopColor="#283593" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#nrBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#7986CB" strokeWidth="1.5" strokeOpacity="0.5" />
      <Path
        d="M38 20 Q48 20 48 30 Q48 38 40 38 Q46 26 38 20Z"
        fill="#FFFFFF"
      />
      <Circle cx="24" cy="24" r="2" fill="#FFFFFF" fillOpacity="0.8" />
      <Circle cx="58" cy="18" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      <Circle cx="62" cy="30" r="1" fill="#FFFFFF" fillOpacity="0.5" />
      <Circle cx="18" cy="38" r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
      <Circle cx="55" cy="42" r="1" fill="#FFFFFF" fillOpacity="0.4" />
      <Path
        d="M10 60 L32 48 L50 52 L70 44"
        stroke="#90A4AE"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M10 60 L32 48 L50 52 L70 44"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
    </Svg>
  );
}

export function EnduranceBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="enBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2E7D32" />
          <Stop offset="1" stopColor="#1B5E20" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#enBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#81C784" strokeWidth="1.5" strokeOpacity="0.5" />
      <Circle cx="40" cy="44" r="20" fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
      <Rect x="33" y="18" width="14" height="5" rx="2.5" fill="#FFFFFF" />
      <Line x1="40" y1="44" x2="40" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <Line x1="40" y1="44" x2="52" y2="44" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="40" cy="44" r="3" fill="#FFFFFF" />
      <Line x1="52" y1="20" x2="56" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <Line x1="28" y1="20" x2="24" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function PerfectStartBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="psBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#006064" />
          <Stop offset="1" stopColor="#01579B" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#psBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#4FC3F7" strokeWidth="1.5" strokeOpacity="0.5" />
      <Rect x="28" y="24" width="24" height="8" rx="2" fill="#212121" />
      <Circle cx="34" cy="28" r="5" fill="#F44336" />
      <Circle cx="46" cy="28" r="5" fill="#F44336" fillOpacity="0.3" />
      <Rect x="28" y="36" width="24" height="8" rx="2" fill="#212121" />
      <Circle cx="34" cy="40" r="5" fill="#FFEB3B" />
      <Circle cx="46" cy="40" r="5" fill="#FFEB3B" fillOpacity="0.3" />
      <Rect x="28" y="48" width="24" height="8" rx="2" fill="#212121" />
      <Circle cx="34" cy="52" r="5" fill="#4CAF50" />
      <Circle cx="46" cy="52" r="5" fill="#4CAF50" fillOpacity="0.3" />
    </Svg>
  );
}

export function TrackStarBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="tsBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F57F17" />
          <Stop offset="1" stopColor="#E65100" />
        </LinearGradient>
        <LinearGradient id="tsStar" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="1" stopColor="#FFC107" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#tsBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeOpacity="0.5" />
      <Ellipse cx="40" cy="40" rx="30" ry="12" fill="none" stroke="#FFD700" strokeWidth="2" strokeOpacity="0.5" />
      <Polygon
        points="40,16 44,30 58,30 47,39 51,53 40,44 29,53 33,39 22,30 36,30"
        fill="url(#tsStar)"
        stroke="#FFF9C4"
        strokeWidth="1"
      />
    </Svg>
  );
}

export function BurnoutBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="buBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#B71C1C" />
          <Stop offset="1" stopColor="#4A0000" />
        </LinearGradient>
        <LinearGradient id="buFlame" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#F57F17" />
          <Stop offset="0.5" stopColor="#FF5722" />
          <Stop offset="1" stopColor="#FFEB3B" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#buBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#EF9A9A" strokeWidth="1.5" strokeOpacity="0.4" />
      <Ellipse cx="40" cy="62" rx="18" ry="6" fill="#212121" />
      <Path
        d="M28 62 Q30 48 36 40 Q34 50 40 46 Q38 36 44 28 Q42 40 48 36 Q50 44 50 62 Z"
        fill="url(#buFlame)"
      />
      <Path
        d="M34 62 Q35 52 38 46 Q37 54 40 50 Q41 44 44 38 Q43 48 46 44 Q47 52 46 62 Z"
        fill="#FFEB3B"
        fillOpacity="0.5"
      />
    </Svg>
  );
}

export function GrandChampBadge() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="gcBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F57F17" />
          <Stop offset="1" stopColor="#BF8700" />
        </LinearGradient>
        <LinearGradient id="gcTrophy" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="1" stopColor="#FFA000" />
        </LinearGradient>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill="url(#gcBg)" />
      <Circle cx="40" cy="40" r="34" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeOpacity="0.5" />
      <Path
        d="M28 18 L52 18 L52 38 Q52 52 40 56 Q28 52 28 38 Z"
        fill="url(#gcTrophy)"
        stroke="#FFF9C4"
        strokeWidth="1"
      />
      <Path
        d="M28 26 Q18 26 18 34 Q18 42 28 42"
        fill="none"
        stroke="url(#gcTrophy)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M52 26 Q62 26 62 34 Q62 42 52 42"
        fill="none"
        stroke="url(#gcTrophy)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Rect x="35" y="56" width="10" height="6" rx="1" fill="#FFC107" />
      <Rect x="30" y="62" width="20" height="4" rx="2" fill="#FFD700" />
      <Path
        d="M36 28 L38 34 L44 34 L39 38 L41 44 L36 40 L31 44 L33 38 L28 34 L34 34 Z"
        fill="#FFFFFF"
        fillOpacity="0.6"
      />
      <Path
        d="M44 20 L45 22 L43 22 Z"
        fill="#FFFFFF"
        fillOpacity="0.8"
      />
    </Svg>
  );
}
