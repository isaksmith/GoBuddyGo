import React from "react";
import { RaceBackground } from "./RaceBackground";

export function AppBackground({ children }: { children?: React.ReactNode }) {
  return <RaceBackground>{children}</RaceBackground>;
}
