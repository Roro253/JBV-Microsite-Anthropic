"use client";

import { AnimatePresence, motion } from "framer-motion";

interface MicrositeModeTransitionProps {
  mode: string;
  children: React.ReactNode;
}

export function MicrositeModeTransition({ mode, children }: MicrositeModeTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
