"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import RequireAuth from "@/components/RequireAuth";
import StaggerGrid, { staggerItem } from "@/components/StaggerGrid";
import { api } from "@/lib/api";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function SearchPageInner() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    api
      .getLibrary()
      .then((items) => setSavedIds(new Set(items.map((i) => i.appleCatalogId))))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.search(term, "song", 25);
      if (thisRequest === requestId.current) {
        setResults(res.results || []);
      }
    } catch (err) {
      if (thisRequest === requestId.current) setError(err.message);
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  async function handleSave(track) {
    setSavingId(track.trackId);
    try {
      await api.addToLibrary({
        appleCatalogId: track.trackId,
        title: track.trackName,
        artistName: track.artistName,
        genre: track.primaryGenreName,
        releaseDate: track.releaseDate ? track.releaseDate.substring(0, 10) : null,
        durationMillis: track.trackTimeMillis,
        artworkUrl: track.artworkUrl100,
      });
      setSavedIds((prev) => new Set(prev).add(track.trackId));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-2xl font-semibold mb-4"
      >
        Search songs
      </motion.h1>
      <motion.input
        type="text"
        placeholder="Search for a song, e.g. 'Shape of You'"
        className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      />

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {loading && <p className="text-sm text-slate-400 mt-6">Searching...</p>}

      {!loading && debouncedQuery && results.length === 0 && !error && (
        <p className="text-sm text-slate-400 mt-6">No results for &quot;{debouncedQuery}&quot;.</p>
      )}

      {!loading && !debouncedQuery && (
        <p className="text-sm text-slate-400 mt-6">Start typing to search the iTunes catalog.</p>
      )}

      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence>
          {results.map((track) => {
            const isSaved = savedIds.has(track.trackId);
            return (
              <motion.div
                key={track.trackId}
                variants={staggerItem}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3, boxShadow: "0 8px 20px -6px rgba(15,23,42,0.15)" }}
                className="bg-white border border-slate-200 rounded-lg p-3 flex gap-3"
              >
                {track.artworkUrl100 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.artworkUrl100}
                    alt={track.trackName}
                    width={64}
                    height={64}
                    className="rounded-md flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{track.trackName}</p>
                  <p className="text-xs text-slate-500 truncate">{track.artistName}</p>
                  <p className="text-xs text-slate-400 truncate">{track.primaryGenreName}</p>
                  <motion.button
                    whileHover={{ scale: isSaved ? 1 : 1.05 }}
                    whileTap={{ scale: isSaved ? 1 : 0.95 }}
                    onClick={() => handleSave(track)}
                    disabled={isSaved || savingId === track.trackId}
                    className={`mt-2 text-xs px-2.5 py-1 rounded-md font-medium ${
                      isSaved
                        ? "bg-emerald-50 text-emerald-700 cursor-default"
                        : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white disabled:opacity-60"
                    }`}
                  >
                    {isSaved ? "Saved" : savingId === track.trackId ? "Saving..." : "Save to library"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </StaggerGrid>
    </div>
  );
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchPageInner />
    </RequireAuth>
  );
}
