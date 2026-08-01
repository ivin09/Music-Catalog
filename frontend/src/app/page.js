"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import Aurora from "@/components/reactbits/Aurora";
import SplitText from "@/components/reactbits/SplitText";
import GradientText from "@/components/reactbits/GradientText";

export default function HomePage() {
  const { username, loading } = useAuth();

  return (
    <div className="relative text-center py-20 max-w-2xl mx-auto">
      <Aurora />

      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        <SplitText text="Build your own" />
        <br />
        <GradientText className="text-4xl font-bold">music catalog</GradientText>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-slate-600"
      >
        Search the iTunes catalog, save songs to your personal library, and get
        analytics and AI-generated insights on your taste.
      </motion.p>

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex justify-center gap-3"
        >
          {username ? (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/search"
                className="px-5 py-2.5 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-medium block shadow-sm shadow-indigo-200"
              >
                Go to search
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-medium block shadow-sm shadow-indigo-200"
                >
                  Get started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium block"
                >
                  Log in
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
