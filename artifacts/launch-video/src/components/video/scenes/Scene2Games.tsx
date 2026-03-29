import { motion } from 'framer-motion';

export function Scene2Games() {
  const games = ['Coin Dash', 'Race', 'Cheer', 'High Five', 'Dance', 'Count'];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange)] to-transparent opacity-30" />

      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-12">
        <motion.h2 
          className="font-display text-[7vw] font-black text-white text-glow-orange text-center uppercase"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          Play Mini Games!
        </motion.h2>

        <div className="grid grid-cols-3 gap-8 max-w-[80vw]">
          {games.map((game, i) => (
            <motion.div
              key={game}
              className="glass-panel p-8 flex flex-col items-center justify-center gap-4 bg-[var(--color-bg-light)]/40 hover:bg-[var(--color-accent)]/20 transition-colors border-[var(--color-accent)]"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6 + (i * 0.1), type: "spring", bounce: 0.5 }}
            >
              <div className="w-[6vw] h-[6vw] rounded-full bg-gradient-to-tr from-[var(--color-orange)] to-[var(--color-accent)] flex items-center justify-center text-[3vw] shadow-lg">
                {['🪙', '🏁', '🙌', '✋', '💃', '🔢'][i]}
              </div>
              <h3 className="font-display font-bold text-[2vw] text-white m-0 text-center leading-none">
                {game}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
