"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUsername(storedUser);
    }
    setLoading(false);
  }, []);

  async function login(user, password) {
    const res = await api.login(user, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", res.username);
    setUsername(res.username);
  }

  async function register(user, password) {
    const res = await api.register(user, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", res.username);
    setUsername(res.username);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ username, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
