"use client";

import { motion } from "motion/react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const word = {
  hidden: { opacity: 0, y: "0.6em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SplitText({ text, className = "" }) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="show"
      className={`inline-block ${className}`}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block whitespace-pre mr-[0.25em]">
          {w}
        </motion.span>
      ))}
    </motion.span>
  );
}
