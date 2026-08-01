"use client";

import { motion } from "motion/react";

// A soft, slowly-drifting blurred gradient backdrop, absolutely positioned behind content.
// Pass a wrapping element with `position: relative` and `overflow: hidden`.
export default function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <motion.div
        className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-400/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 right-0 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
