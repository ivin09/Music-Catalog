"use client";

import { motion } from "motion/react";

export default function GradientText({
  children,
  className = "",
  colors = "from-indigo-600 via-fuchsia-500 to-rose-500",
  animate = true,
}) {
  return (
    <motion.span
      className={`bg-gradient-to-r ${colors} bg-clip-text text-transparent bg-[length:200%_auto] inline-block ${className}`}
      animate={animate ? { backgroundPosition: ["0% center", "200% center"] } : undefined}
      transition={animate ? { duration: 6, repeat: Infinity, ease: "linear" } : undefined}
    >
      {children}
    </motion.span>
  );
}
