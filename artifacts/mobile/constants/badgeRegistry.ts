import {
  SpeedDemonBadge,
  FirstVictoryBadge,
  DriftKingBadge,
  GearheadBadge,
  NightRiderBadge,
  EnduranceBadge,
  PerfectStartBadge,
  TrackStarBadge,
  BurnoutBadge,
  GrandChampBadge,
} from "@/components/BadgeSvgs";
import React from "react";

export interface BadgeMeta {
  id: string;
  title: string;
  description: string;
  gradientColors: [string, string];
  SvgComponent: React.ComponentType;
}

export const BADGE_REGISTRY: Record<string, BadgeMeta> = {
  "speed-demon": {
    id: "speed-demon",
    title: "Speed",
    description: "Lightning-fast reflexes!",
    gradientColors: ["#FF6B35", "#C0392B"],
    SvgComponent: SpeedDemonBadge,
  },
  "first-victory": {
    id: "first-victory",
    title: "First Victory",
    description: "Completed your first mission",
    gradientColors: ["#9E9E9E", "#424242"],
    SvgComponent: FirstVictoryBadge,
  },
  "drift-king": {
    id: "drift-king",
    title: "Drift King",
    description: "Master of the drift",
    gradientColors: ["#9C27B0", "#E91E63"],
    SvgComponent: DriftKingBadge,
  },
  gearhead: {
    id: "gearhead",
    title: "Gearhead",
    description: "Completed 3 missions",
    gradientColors: ["#1565C0", "#00838F"],
    SvgComponent: GearheadBadge,
  },
  "night-rider": {
    id: "night-rider",
    title: "Night Rider",
    description: "Adventurer of the night",
    gradientColors: ["#1A237E", "#283593"],
    SvgComponent: NightRiderBadge,
  },
  endurance: {
    id: "endurance",
    title: "Endurance",
    description: "Stayed for 5+ minutes",
    gradientColors: ["#2E7D32", "#1B5E20"],
    SvgComponent: EnduranceBadge,
  },
  "perfect-start": {
    id: "perfect-start",
    title: "Perfect Start",
    description: "Completed all missions!",
    gradientColors: ["#006064", "#01579B"],
    SvgComponent: PerfectStartBadge,
  },
  "track-star": {
    id: "track-star",
    title: "Track Star",
    description: "A star on the track",
    gradientColors: ["#F57F17", "#E65100"],
    SvgComponent: TrackStarBadge,
  },
  burnout: {
    id: "burnout",
    title: "Burnout",
    description: "Blazing speed and power",
    gradientColors: ["#B71C1C", "#4A0000"],
    SvgComponent: BurnoutBadge,
  },
  "grand-champ": {
    id: "grand-champ",
    title: "Grand Champ",
    description: "The ultimate champion",
    gradientColors: ["#F57F17", "#BF8700"],
    SvgComponent: GrandChampBadge,
  },
};

const LEGACY_ID_MAP: Record<string, string> = {
  "first-mission": "first-victory",
  triple: "gearhead",
  perfect: "perfect-start",
};

export function getBadgeMeta(id: string): BadgeMeta | undefined {
  const resolved = LEGACY_ID_MAP[id] ?? id;
  return BADGE_REGISTRY[resolved];
}

export function resolveId(id: string): string {
  return LEGACY_ID_MAP[id] ?? id;
}

export const BADGE_UNLOCK_ORDER: string[] = [
  "first-victory",
  "speed-demon",
  "drift-king",
  "gearhead",
  "night-rider",
  "endurance",
  "perfect-start",
  "track-star",
  "burnout",
  "grand-champ",
];

export const DEFAULT_UNLOCKED_COUNT = 2;
