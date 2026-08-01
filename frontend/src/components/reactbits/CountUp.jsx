"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "motion/react";

export default function CountUp({
  value,
  duration = 1,
  decimals = 0,
  suffix = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
      });
      return controls.stop;
    }
  }, [isInView, value, duration, motionValue]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
