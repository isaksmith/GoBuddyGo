import { motion } from 'framer-motion';

export function Scene1Garage() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] to-transparent opacity-50" />
      
      {/* Garage Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)'
        }}
      />

      <div className="relative z-10 w-full max-w-[90vw] flex flex-row items-center justify-between">
        <motion.div 
          className="w-[40%] flex flex-col gap-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <h2 className="font-display text-[6vw] font-black text-white leading-[1.1] text-glow">
            VIRTUAL<br/><span className="text-[var(--color-accent)]">GARAGE</span>
          </h2>
          <p className="text-[2vw] text-[var(--color-text-secondary)] font-bold">
            Customize your ride!
          </p>
          
          <div className="flex gap-4 mt-4">
            {['Jeep', 'Cruiser', 'Mini Coop'].map((car, i) => (
              <motion.div
                key={car}
                className="glass-panel px-6 py-3 font-display font-bold text-[1.5vw] text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
              >
                {car}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="w-[50%] relative aspect-square flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
        >
          <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] blur-[100px] opacity-60" />
          <motion.img 
            src="/assets/buddy-car.png" 
            alt="3D Car"
            className="relative z-10 w-[120%] object-contain"
            animate={{ 
              y: [-10, 10, -10],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Stickers */}
          {['⭐', '🔥', '⚡', '💖'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-[4vw] z-20 drop-shadow-lg bg-white rounded-full w-[6vw] h-[6vw] flex items-center justify-center shadow-xl"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2 + (i * 0.2), type: "spring" }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
