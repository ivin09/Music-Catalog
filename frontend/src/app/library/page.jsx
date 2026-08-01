"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import RequireAuth from "@/components/RequireAuth";
import StaggerGrid, { staggerItem } from "@/components/StaggerGrid";
import { api } from "@/lib/api";

function formatDuration(ms) {
  if (!ms) return "--:--";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function LibraryItemCard({ item, onUpdate, onDelete }) {
  const [rating, setRating] = useState(item.userRating || 0);
  const [notes, setNotes] = useState(item.userNotes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate(item.id, { userRating: rating || null, userNotes: notes || null });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      variants={staggerItem}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      layout
      whileHover={{ y: -3, boxShadow: "0 8px 20px -6px rgba(15,23,42,0.15)" }}
      className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4"
    >
      {item.artworkUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.artworkUrl} alt={item.title} width={72} height={72} className="rounded-md flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-sm text-slate-500 truncate">{item.artistName}</p>
            <p className="text-xs text-slate-400">
              {item.genre || "Unknown genre"} - {formatDuration(item.durationMillis)}
              {item.releaseDate ? ` - ${item.releaseDate.substring(0, 4)}` : ""}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-rose-600 hover:text-rose-800 flex-shrink-0"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setRating(star === rating ? 0 : star);
                setDirty(true);
              }}
              className={`text-lg leading-none ${
                star <= rating ? "text-amber-400" : "text-slate-200"
              }`}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </motion.button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setDirty(true);
          }}
          placeholder="Add a note..."
          rows={2}
          className="mt-2 w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <AnimatePresence>
          {dirty && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LibraryPageInner() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await api.getLibrary();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(id, updates) {
    const updated = await api.updateLibraryItem(id, updates);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  async function handleDelete(id) {
    await api.deleteLibraryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-2xl font-semibold mb-4"
      >
        Your library
      </motion.h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items === null && !error && <p className="text-sm text-slate-400">Loading your library...</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-slate-400">
          Your library is empty. Head to Search to save some songs.
        </p>
      )}

      <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <AnimatePresence>
          {items?.map((item) => (
            <LibraryItemCard key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </StaggerGrid>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <RequireAuth>
      <LibraryPageInner />
    </RequireAuth>
  );
}
