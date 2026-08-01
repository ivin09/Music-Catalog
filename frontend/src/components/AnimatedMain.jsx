"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

export default function AnimatedMain({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        className="flex-1 w-full max-w-6xl mx-auto px-4 py-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
