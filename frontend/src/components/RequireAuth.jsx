"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }) {
  const { username, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !username) {
      router.replace("/login");
    }
  }, [loading, username, router]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading...</div>;
  }

  if (!username) {
    return null;
  }

  return children;
}
