import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene0Intro() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-gradient-arcade"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Clouds/Stars Image */}
      <motion.img 
        src="/assets/arcade-clouds.png" 
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        initial={{ scale: 1.2, rotate: -2 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 4, ease: "easeOut" }}
      />

      {/* Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-orange)',
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3
            }}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              rotate: [0, 360]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Badge/Logo backing */}
        <motion.div
          className="relative w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
        >
          <div className="absolute inset-0 rounded-full bg-[var(--color-orange)] opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-orange)] flex items-center justify-center shadow-[0_0_50px_rgba(244,99,58,0.5)]">
            <motion.img 
              src="/assets/buddy-car.png" 
              alt="Buddy Car"
              className="w-[120%] object-contain drop-shadow-2xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        >
          <motion.h1 
            className="font-display text-[8vw] leading-none font-black text-white text-glow mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            GO BUDDY GO
          </motion.h1>
          
          <motion.div 
            className="inline-block px-8 py-3 rounded-full bg-[var(--color-bg-dark)] border-4 border-[var(--color-accent)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring", bounce: 0.6 }}
          >
            <h2 className="font-display text-[2.5vw] font-bold text-[var(--color-accent)] tracking-widest m-0 leading-none text-glow">
              CO-PILOT MODE
            </h2>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
