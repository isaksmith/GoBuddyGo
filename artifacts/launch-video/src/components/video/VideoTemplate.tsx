// Video Template
import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene0Intro } from './scenes/Scene0Intro';
import { Scene1Garage } from './scenes/Scene1Garage';
import { Scene2Games } from './scenes/Scene2Games';
import { Scene3Sounds } from './scenes/Scene3Sounds';
import { Scene4Badges } from './scenes/Scene4Badges';
import { Scene5Outro } from './scenes/Scene5Outro';

const SCENE_DURATIONS = {
  intro: 4500,
  garage: 4000,
  games: 4000,
  sounds: 3500,
  badges: 4000,
  outro: 5000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene0Intro key="intro" />}
        {currentScene === 1 && <Scene1Garage key="garage" />}
        {currentScene === 2 && <Scene2Games key="games" />}
        {currentScene === 3 && <Scene3Sounds key="sounds" />}
        {currentScene === 4 && <Scene4Badges key="badges" />}
        {currentScene === 5 && <Scene5Outro key="outro" />}
      </AnimatePresence>
    </div>
  );
}
