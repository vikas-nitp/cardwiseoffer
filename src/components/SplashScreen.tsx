import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/constants";

interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center sovereign-ground"
        >
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 sovereign-ground" />

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-3 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/35 bg-accent/8 text-accent text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-gold inline-block" />
              India · Domestic Flights
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[48px] md:text-[72px] text-accent leading-none tracking-tight"
            >
              {APP_NAME}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-[13px] text-foreground/55 tracking-wide"
            >
              Which card saves the most on your flight?
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.65, ease: "easeInOut" }}
            className="absolute bottom-12 w-24 h-[2px] bg-accent/40 rounded-full origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
