import { motion } from 'framer-motion';

export function Scene4Badges() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-gradient-arcade"
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
         {/* Confetti effect */}
         {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-8"
            style={{
              backgroundColor: ['#FFD93D', '#F4633A', '#FFFFFF', '#0A5FA0'][Math.floor(Math.random() * 4)],
              left: `${Math.random() * 100}%`,
              top: '-10%',
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
            animate={{
              y: ['0vh', '120vh'],
              rotate: [0, Math.random() * 360 + 360],
              x: `+=${Math.random() * 100 - 50}px`
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex items-center justify-center gap-16 px-[10vw]">
        <motion.div 
          className="w-1/2 flex flex-col justify-center gap-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-[7vw] font-black text-white leading-none text-glow">
            EARN<br/>
            <span className="text-[var(--color-accent)]">BADGES!</span>
          </h2>
          <p className="text-[2.5vw] font-bold text-white opacity-90">
            Play games to unlock 10 awesome rewards!
          </p>
        </motion.div>

        <motion.div 
          className="w-1/2 relative aspect-square flex items-center justify-center"
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
        >
          {/* Main Huge Badge */}
          <div className="relative w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-orange)] p-4 shadow-[0_0_80px_rgba(255,217,61,0.6)]">
            <div className="w-full h-full rounded-full border-[1vw] border-white border-dashed flex items-center justify-center bg-[var(--color-bg-dark)]">
              <motion.span 
                className="text-[12vw]"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆
              </motion.span>
            </div>
          </div>

          {/* Smaller floating badges */}
          {['🌟', '🚀', '🎯'].map((icon, i) => (
            <motion.div
              key={icon}
              className="absolute w-[10vw] h-[10vw] rounded-full bg-white flex items-center justify-center text-[5vw] shadow-2xl"
              style={{
                top: i === 0 ? '0%' : i === 1 ? '70%' : '20%',
                left: i === 0 ? '70%' : i === 1 ? '10%' : '-10%'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1, y: [-10, 10, -10] }}
              transition={{ delay: 1 + i * 0.2, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            >
              {icon}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
