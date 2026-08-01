"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import RequireAuth from "@/components/RequireAuth";
import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/reactbits/CountUp";
import { api } from "@/lib/api";

const COLORS = ["#6366f1", "#d946ef", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e", "#8b5cf6", "#84cc16"];

function ChartCard({ title, children, empty, delay = 0 }) {
  return (
    <ScrollReveal delay={delay}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 h-full">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">{title}</h2>
        {empty ? (
          <p className="text-sm text-slate-400 py-10 text-center">Not enough data yet.</p>
        ) : (
          children
        )}
      </div>
    </ScrollReveal>
  );
}

function AnalyticsPageInner() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message));

    api
      .getAiInsights()
      .then(setInsights)
      .catch(() => setInsights({ summary: "Could not load AI insights right now.", recommendations: [] }))
      .finally(() => setInsightsLoading(false));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-400">Loading analytics...</p>;

  if (data.totalItems === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
        <p className="text-sm text-slate-400">
          Save some songs to your library to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-2xl font-semibold mb-1"
      >
        Analytics
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-sm text-slate-500 mb-6"
      >
        Based on <CountUp value={data.totalItems} /> saved track{data.totalItems === 1 ? "" : "s"}
        {data.averageRating != null && (
          <>
            {" "}- average rating <CountUp value={data.averageRating} decimals={1} suffix="/5" />
          </>
        )}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-rose-50 border border-indigo-100 rounded-lg p-4 mb-6"
      >
        <h2 className="text-sm font-semibold text-indigo-800 mb-1">AI insights</h2>
        <AnimatePresence mode="wait">
          {insightsLoading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-indigo-700"
            >
              Generating insights...
            </motion.p>
          ) : (
            <motion.p
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-indigo-900"
            >
              {insights?.summary}
            </motion.p>
          )}
        </AnimatePresence>

        {insights?.recommendations?.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.recommendations.map((rec, i) => (
              <motion.div
                key={rec.appleCatalogId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-md p-2 flex gap-2 items-center"
              >
                {rec.artworkUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rec.artworkUrl} alt={rec.title} width={40} height={40} className="rounded" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{rec.title}</p>
                  <p className="text-xs text-slate-500 truncate">{rec.artistName}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Genre distribution" empty={!data.genreDistribution?.length} delay={0}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.genreDistribution}
                dataKey="count"
                nameKey="genre"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                animationDuration={700}
              >
                {data.genreDistribution.map((entry, index) => (
                  <Cell key={entry.genre} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Releases by year" empty={!data.releasesByYear?.length} delay={0.05}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.releasesByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Track duration histogram" empty={!data.durationHistogram?.length} delay={0.1}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.durationHistogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bucket" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top artists" empty={!data.topArtists?.length} delay={0.15}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topArtists} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="artist" width={110} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Your ratings" empty={!data.ratingDistribution?.length} delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="rating" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <AnalyticsPageInner />
    </RequireAuth>
  );
}
