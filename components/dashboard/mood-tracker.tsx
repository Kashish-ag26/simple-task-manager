"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { value: "GREAT", emoji: "😄", label: "Great", color: "bg-emerald-100 border-emerald-400 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-300" },
  { value: "GOOD", emoji: "😊", label: "Good", color: "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300" },
  { value: "NEUTRAL", emoji: "😐", label: "Neutral", color: "bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-300" },
  { value: "BAD", emoji: "😞", label: "Bad", color: "bg-amber-100 border-amber-400 text-amber-700 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-300" },
  { value: "TERRIBLE", emoji: "😫", label: "Terrible", color: "bg-red-100 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300" },
];

interface MoodEntry {
  id: string;
  mood: string;
  note: string | null;
  date: string;
}

interface MoodProductivity {
  mood: string;
  days: number;
  avgTasksPerDay: number;
}

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [moodProductivity, setMoodProductivity] = useState<MoodProductivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const load = () => {
    fetch("/api/mood")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const today = new Date().toDateString();
          const moods: MoodEntry[] = d.data.moods;
          const todayEntry = moods.find((m) => new Date(m.date).toDateString() === today) || null;
          setTodayMood(todayEntry);
          setRecentMoods(moods.slice(0, 7));
          setMoodProductivity(d.data.moodProductivity);
          if (todayEntry) setSelectedMood(todayEntry.mood);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, note: note || null }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTodayMood(data.data);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const bestMood = moodProductivity.reduce(
    (a, b) => (b.avgTasksPerDay > a.avgTasksPerDay ? b : a),
    moodProductivity[0] || { mood: "NEUTRAL", avgTasksPerDay: 0, days: 0 }
  );
  const bestMoodConfig = MOODS.find((m) => m.value === bestMood?.mood);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />;
  }

  return (
    <div className="space-y-4">
      {/* Today's mood */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {todayMood ? "Today's mood ✓" : "How are you feeling today?"}
        </p>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(m.value)}
              title={m.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl transition-all ${
                selectedMood === m.value
                  ? m.color + " shadow-md"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              {m.emoji}
              {selectedMood === m.value && (
                <motion.div
                  layoutId="moodSelected"
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Note */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveMood}
              disabled={saving}
              className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Log Mood"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight */}
      {bestMood && bestMood.days > 0 && bestMood.avgTasksPerDay > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-800/40 dark:bg-violet-900/20"
        >
          <p className="text-xs font-medium text-violet-800 dark:text-violet-300">
            💡 Productivity Insight
          </p>
          <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-400">
            You complete <span className="font-bold">{bestMood.avgTasksPerDay}</span> tasks/day on average when feeling{" "}
            <span className="font-bold">{bestMoodConfig?.emoji} {bestMood.mood.toLowerCase()}</span>
          </p>
        </motion.div>
      )}

      {/* Recent mood history */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {showHistory ? "Hide" : "Show"} recent history
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 flex gap-1.5 overflow-hidden"
            >
              {recentMoods.slice(0, 7).map((entry) => {
                const cfg = MOODS.find((m) => m.value === entry.mood);
                return (
                  <div key={entry.id} title={`${new Date(entry.date).toLocaleDateString()} — ${entry.mood}`} className="flex flex-col items-center gap-0.5">
                    <span className="text-base">{cfg?.emoji || "❓"}</span>
                    <span className="text-[9px] text-slate-400">{new Date(entry.date).toLocaleDateString("en", { weekday: "short" })}</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
