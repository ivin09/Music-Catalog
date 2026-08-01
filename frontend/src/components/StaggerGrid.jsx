"use client";

import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export default function StaggerGrid({ children, className = "" }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
