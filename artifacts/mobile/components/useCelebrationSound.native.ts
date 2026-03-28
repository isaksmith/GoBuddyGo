import { useAudioPlayer } from "expo-audio";
import { useApp } from "@/context/AppContext";

export function useCelebrationSound() {
  const { settings } = useApp();
  const player = useAudioPlayer(require("../assets/chime.wav"));

  return function playChime() {
    if (!(settings.soundsEnabled ?? true)) return;
    try {
      player.seekTo(0);
      player.play();
    } catch (e) {
      console.warn("[CelebrationSound] Audio playback failed:", e);
    }
  };
}
