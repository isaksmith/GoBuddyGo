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
  SvgXml,
} from "react-native-svg";

const SIZE = 80;

const DRIFT_KING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#23232c"/>

  <g stroke="#30303d" stroke-width="2" opacity="0.7">
    <path d="M 0,100 L 800,100 M 0,200 L 800,200 M 0,300 L 800,300 M 0,400 L 800,400 M 0,500 L 800,500"/>
    <path d="M 100,0 L 100,600 M 200,0 L 200,600 M 300,0 L 300,600 M 400,0 L 400,600 M 500,0 L 500,600 M 600,0 L 600,600 M 700,0 L 700,600"/>
  </g>

  <g stroke="#ffffff" stroke-linecap="round" opacity="0.25">
    <line x1="20" y1="480" x2="160" y2="440" stroke-width="4"/>
    <line x1="80" y1="400" x2="280" y2="350" stroke-width="2"/>
    <line x1="180" y1="320" x2="380" y2="260" stroke-width="3"/>
    <line x1="550" y1="150" x2="780" y2="80" stroke-width="5"/>
    <line x1="620" y1="220" x2="850" y2="150" stroke-width="3"/>
    <line x1="500" y1="50" x2="680" y2="10" stroke-width="4"/>
  </g>

  <path d="M -50,540 Q 300,520 440,290" stroke="#121217" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M -20,620 Q 330,580 480,340" stroke="#121217" stroke-width="20" fill="none" stroke-linecap="round"/>

  <circle cx="150" cy="500" r="60" fill="#cfcfd6" opacity="0.05"/>
  <circle cx="220" cy="460" r="65" fill="#cfcfd6" opacity="0.1"/>
  <circle cx="280" cy="420" r="70" fill="#cfcfd6" opacity="0.15"/>
  <circle cx="340" cy="380" r="75" fill="#cfcfd6" opacity="0.25"/>
  <circle cx="380" cy="340" r="60" fill="#cfcfd6" opacity="0.35"/>

  <g transform="translate(520, 270) rotate(-20)">
    <rect x="-80" y="-55" width="36" height="18" rx="4" fill="#0d0d12"/>
    <rect x="-80" y="37" width="36" height="18" rx="4" fill="#0d0d12"/>

    <rect x="55" y="-55" width="36" height="18" rx="4" fill="#0d0d12" transform="rotate(-30, 73, -46)"/>
    <rect x="55" y="37" width="36" height="18" rx="4" fill="#0d0d12" transform="rotate(-30, 73, 46)"/>

    <rect x="-105" y="-45" width="200" height="90" rx="20" fill="#ff2a55"/>

    <rect x="-105" y="-12" width="200" height="8" fill="#ffd700" opacity="0.9"/>
    <rect x="-105" y="4" width="200" height="8" fill="#ffd700" opacity="0.9"/>

    <rect x="-115" y="-40" width="25" height="80" rx="4" fill="#181822"/>
    <path d="M -90,-30 L -105,-30 L -105,30 L -90,30 Z" fill="#181822"/>
    <rect x="85" y="-40" width="12" height="22" rx="4" fill="#e0ffff"/>
    <rect x="85" y="18" width="12" height="22" rx="4" fill="#e0ffff"/>
    <polygon points="97,-40 350,-120 350, -10 97,-18" fill="#e0ffff" opacity="0.12"/>
    <polygon points="97,18 350,10 350, 120 97,40" fill="#e0ffff" opacity="0.12"/>

    <rect x="-105" y="-38" width="8" height="20" rx="3" fill="#ff0000"/>
    <rect x="-105" y="18" width="8" height="20" rx="3" fill="#ff0000"/>
    <polygon points="-105,-38 -160,-50 -160,-10 -105,-18" fill="#ff0000" opacity="0.25"/>
    <polygon points="-105,18 -160,10 -160,50 -105,38" fill="#ff0000" opacity="0.25"/>

    <rect x="-35" y="-35" width="85" height="70" rx="15" fill="#111116"/>

    <polygon points="40,-30 55,-25 55,25 40,30" fill="#3b3b52"/>
    <polygon points="-25,-30 -40,-25 -40,25 -25,30" fill="#3b3b52"/>
    <polygon points="30,-32 45,-28 -20,-28 -15,-32" fill="#2d2d3e"/>
    <polygon points="30,32 45,28 -20,28 -15,32" fill="#2d2d3e"/>
  </g>

  <g>
    <circle cx="430" cy="220" r="45" fill="#ffffff" opacity="0.6"/>
    <circle cx="390" cy="250" r="55" fill="#e8e8ed" opacity="0.7"/>

    <circle cx="410" cy="290" r="50" fill="#f0f0f5" opacity="0.8"/>
    <circle cx="450" cy="270" r="55" fill="#ffffff" opacity="0.85"/>
    <circle cx="370" cy="290" r="60" fill="#d5d5db" opacity="0.5"/>

    <circle cx="470" cy="330" r="60" fill="#ffffff" opacity="0.75"/>
    <circle cx="430" cy="350" r="50" fill="#dfdfdf" opacity="0.6"/>
    <circle cx="390" cy="340" r="65" fill="#e8e8ed" opacity="0.6"/>

    <circle cx="460" cy="210" r="4" fill="#ffcc00"/>
    <circle cx="480" cy="220" r="3" fill="#ff9900"/>
    <circle cx="450" cy="200" r="2" fill="#ffffff"/>
    <circle cx="440" cy="190" r="3" fill="#ffcc00"/>

    <circle cx="490" cy="360" r="5" fill="#ffcc00"/>
    <circle cx="510" cy="370" r="3" fill="#ff9900"/>
    <circle cx="480" cy="380" r="2" fill="#ffffff"/>
    <circle cx="460" cy="390" r="4" fill="#ffcc00"/>
  </g>
</svg>`;

const GEARHEAD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <g id="tooth">
      <path d="M 92 12 L 108 12 L 114 35 L 86 35 Z" fill="#c07c4b" stroke="#6b2a0f" stroke-width="2" />
    </g>

    <mask id="centerHole">
      <rect width="200" height="200" fill="white" />
      <circle cx="100" cy="100" r="22" fill="black" />
    </mask>
  </defs>

  <rect width="100%" height="100%" fill="#0a192f" />

  <g>
    <use href="#tooth" transform="rotate(0 100 100)" />
    <use href="#tooth" transform="rotate(30 100 100)" />
    <use href="#tooth" transform="rotate(60 100 100)" />
    <use href="#tooth" transform="rotate(90 100 100)" />
    <use href="#tooth" transform="rotate(120 100 100)" />
    <use href="#tooth" transform="rotate(150 100 100)" />
    <use href="#tooth" transform="rotate(180 100 100)" />
    <use href="#tooth" transform="rotate(210 100 100)" />
    <use href="#tooth" transform="rotate(240 100 100)" />
    <use href="#tooth" transform="rotate(270 100 100)" />
    <use href="#tooth" transform="rotate(300 100 100)" />
    <use href="#tooth" transform="rotate(330 100 100)" />

    <circle cx="100" cy="100" r="75" fill="#c07c4b" stroke="#6b2a0f" stroke-width="2" mask="url(#centerHole)" />

    <circle cx="100" cy="100" r="22" fill="none" stroke="#6b2a0f" stroke-width="3" />

    <circle cx="100" cy="100" r="48" fill="none" stroke="#823c1b" stroke-width="4" />

    <circle cx="100" cy="52" r="4" fill="#3b1404" />
    <circle cx="100" cy="148" r="4" fill="#3b1404" />
    <circle cx="52" cy="100" r="4" fill="#3b1404" />
    <circle cx="148" cy="100" r="4" fill="#3b1404" />
  </g>
</svg>`;

const NIGHT_RIDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <g id="star">
      <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#f5d0b5" />
    </g>
  </defs>

  <rect width="100%" height="100%" fill="#0a192f" />

  <use href="#star" x="40" y="50" transform="scale(0.8)" />
  <use href="#star" x="140" y="30" transform="scale(1.2)" />
  <use href="#star" x="220" y="80" transform="scale(0.6)" />
  <use href="#star" x="80" y="130" transform="scale(0.9)" />
  <use href="#star" x="360" y="110" transform="scale(1)" />
  <circle cx="90" cy="70" r="1.5" fill="#f5d0b5" />
  <circle cx="180" cy="50" r="1.5" fill="#f5d0b5" />
  <circle cx="280" cy="30" r="1.5" fill="#f5d0b5" />
  <circle cx="340" cy="60" r="1.5" fill="#f5d0b5" />
  <circle cx="120" cy="100" r="1.5" fill="#f5d0b5" />

  <g id="moon">
    <circle cx="320" cy="80" r="35" fill="#f5d0b5" stroke="#6b2a0f" stroke-width="2" />
    <circle cx="305" cy="70" r="8" fill="#d48a58" stroke="#6b2a0f" stroke-width="1.5" />
    <circle cx="335" cy="90" r="12" fill="#d48a58" stroke="#6b2a0f" stroke-width="1.5" />
    <circle cx="315" cy="100" r="5" fill="#d48a58" stroke="#6b2a0f" stroke-width="1.5" />
  </g>

  <ellipse cx="80" cy="240" rx="140" ry="70" fill="#081528" stroke="#050c17" stroke-width="2" />
  <ellipse cx="320" cy="240" rx="180" ry="90" fill="#0d213f" stroke="#050c17" stroke-width="2" />

  <rect x="0" y="210" width="400" height="90" fill="#060f1c" />
  <line x1="0" y1="210" x2="400" y2="210" stroke="#6b2a0f" stroke-width="4" />
  <line x1="0" y1="255" x2="400" y2="255" stroke="#c07c4b" stroke-width="3" stroke-dasharray="25 25" />

  <polygon points="275,195 400,165 400,230" fill="#f5d0b5" opacity="0.1" />

  <g id="car">
    <path d="M 70 210 L 70 185 C 70 180, 75 180, 85 180 L 95 180 L 120 150 C 125 145, 135 145, 145 145 L 185 145 C 195 145, 205 150, 210 160 L 230 185 L 265 185 C 275 185, 280 190, 280 200 L 280 210 Z"
          fill="#c07c4b" stroke="#6b2a0f" stroke-width="3" stroke-linejoin="round" />

    <path d="M 100 180 L 122 152 L 150 152 L 150 180 Z" fill="#0a192f" stroke="#6b2a0f" stroke-width="2" stroke-linejoin="round" />
    <path d="M 156 180 L 156 152 L 182 152 L 204 180 Z" fill="#0a192f" stroke="#6b2a0f" stroke-width="2" stroke-linejoin="round" />

    <path d="M 276 188 L 282 188 L 282 200 L 276 200 Z" fill="#f5d0b5" stroke="#6b2a0f" stroke-width="1.5" />
    <path d="M 68 185 L 72 185 L 72 195 L 68 195 Z" fill="#d45858" stroke="#6b2a0f" stroke-width="1.5" />

    <circle cx="115" cy="210" r="20" fill="#111827" stroke="#6b2a0f" stroke-width="3" />
    <circle cx="230" cy="210" r="20" fill="#111827" stroke="#6b2a0f" stroke-width="3" />

    <circle cx="115" cy="210" r="8" fill="#c07c4b" stroke="#6b2a0f" stroke-width="2" />
    <circle cx="230" cy="210" r="8" fill="#c07c4b" stroke="#6b2a0f" stroke-width="2" />

    <circle cx="115" cy="210" r="3" fill="#3b1404" />
    <circle cx="230" cy="210" r="3" fill="#3b1404" />
  </g>
</svg>`;

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
  return <SvgXml xml={DRIFT_KING_SVG} width={SIZE} height={SIZE} />;
}

export function GearheadBadge() {
  return <SvgXml xml={GEARHEAD_SVG} width={SIZE} height={SIZE} />;
}

export function NightRiderBadge() {
  return <SvgXml xml={NIGHT_RIDER_SVG} width={SIZE} height={SIZE} />;
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
