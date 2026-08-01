"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import GradientText from "@/components/reactbits/GradientText";

const links = [
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const { username, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          <GradientText animate={false}>Music Catalog Insights</GradientText>
        </Link>

        {!loading && username && (
          <nav className="flex items-center gap-4 text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative px-2 py-1">
                  <span
                    className={`relative z-10 transition-colors ${
                      active ? "text-indigo-700 font-medium" : "text-slate-600 hover:text-indigo-700"
                    }`}
                  >
                    {link.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-md bg-gradient-to-r from-indigo-50 to-fuchsia-50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{username}</span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={logout}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm"
            >
              Log out
            </motion.button>
          </nav>
        )}

        {!loading && !username && (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-indigo-700">
              Log in
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white block"
              >
                Sign up
              </Link>
            </motion.div>
          </nav>
        )}
      </div>
    </motion.header>
  );
}
