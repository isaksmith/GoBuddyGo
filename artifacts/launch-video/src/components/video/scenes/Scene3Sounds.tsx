import { motion } from 'framer-motion';

export function Scene3Sounds() {
  const sounds = ['VROOM', 'BEEP', 'SIREN', 'ZOOM', 'HONK', 'CRASH'];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.8, ease: "anticipate" }}
      style={{ perspective: 1000 }}
    >
      {/* Radiating sound waves background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-4 border-[var(--color-accent)]"
            style={{ width: '10vw', height: '10vw' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 5],
              opacity: [0.5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <motion.h2 
          className="font-display text-[8vw] font-black text-[var(--color-accent)] mb-12 text-center drop-shadow-[0_0_30px_rgba(255,217,61,0.6)]"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
        >
          SOUNDBOARD
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-6 max-w-[80vw]">
          {sounds.map((sound, i) => (
            <motion.div
              key={sound}
              className="pill-btn px-10 py-6 text-[2.5vw] bg-white text-[var(--color-bg-dark)]"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileInView={{ scale: 1.1 }}
              transition={{ delay: 0.6 + (i * 0.1), type: "spring" }}
            >
              🔊 {sound}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
