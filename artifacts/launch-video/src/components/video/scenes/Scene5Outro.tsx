import { motion } from 'framer-motion';

export function Scene5Outro() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, var(--color-primary) 0%, var(--color-bg-dark) 100%)'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <img src="/assets/buddy-car.png" alt="Buddy Car" className="w-[30vw] max-w-[400px] mb-8 drop-shadow-[0_0_50px_rgba(244,99,58,0.8)]" />
        </motion.div>

        <motion.h1 
          className="font-display text-[8vw] leading-none font-black text-white text-glow mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
        >
          GO BUDDY GO
        </motion.h1>

        <motion.h2 
          className="font-display text-[3vw] font-bold text-[var(--color-accent)] tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Join the WSU GoBabyGo Adventure!
        </motion.h2>

        <motion.div
          className="mt-12 pill-btn px-12 py-4 text-[2vw] bg-[var(--color-orange)] text-white shadow-[0_0_30px_rgba(244,99,58,0.6)]"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          BE THE CO-PILOT
        </motion.div>
      </div>
    </motion.div>
  );
}
