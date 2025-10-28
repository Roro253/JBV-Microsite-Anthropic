"use client";

import { AnimatePresence, motion } from "framer-motion";

interface MicrositeModeTransitionProps {
  mode: string;
  labelledById?: string;
  panelId?: string;
  children: React.ReactNode;
}

export function MicrositeModeTransition({
  mode,
  labelledById,
  panelId,
  children
}: MicrositeModeTransitionProps) {
  const resolvedPanelId = panelId ?? `mode-panel-${mode}`;
  const resolvedLabelId = labelledById ?? `mode-tab-${mode}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        id={resolvedPanelId}
        role="tabpanel"
        aria-labelledby={resolvedLabelId}
        tabIndex={0}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
