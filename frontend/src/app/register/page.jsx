"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(username, password);
      router.push("/search");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-sm mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6"
    >
      <h1 className="text-xl font-semibold mb-4">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-60 text-white rounded-md py-2 text-sm font-medium"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </motion.button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
