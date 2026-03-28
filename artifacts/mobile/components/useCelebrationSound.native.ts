import { useAudioPlayer } from "expo-audio";

export function useCelebrationSound() {
  const player = useAudioPlayer(require("../assets/chime.wav"));

  return function playChime() {
    try {
      player.seekTo(0);
      player.play();
    } catch (_e) {}
  };
}
