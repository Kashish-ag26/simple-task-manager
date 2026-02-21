"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskWithRelations } from "@/types";
import toast from "react-hot-toast";

interface FocusModeProps {
  task: TaskWithRelations;
  onClose: () => void;
}

const FOCUS_MINUTES = 25;

export default function FocusMode({ task, onClose }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsComplete(true);
      logSession();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const logSession = async () => {
    try {
      await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, duration: FOCUS_MINUTES }),
      });
      toast.success("Focus session logged! +3 points 🎧");
    } catch {}
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const progress = 1 - timeLeft / (FOCUS_MINUTES * 60);
  const circumference = 2 * Math.PI * 90;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 99999, background: "linear-gradient(135deg,#0f172a,#1e1b4b)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-8 px-6 text-center"
        >
          <div>
            <div className="mb-2 text-sm font-medium uppercase tracking-widest text-white/50">Focus Mode</div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl line-clamp-2 max-w-md">{task.title}</h1>
          </div>

          {/* Circle timer */}
          <div className="relative flex h-56 w-56 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke={isComplete ? "#22c55e" : "#818cf8"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="text-center">
              <div className="text-5xl font-mono font-bold text-white">{mins}:{secs}</div>
              <div className="mt-1 text-sm text-white/50">{isComplete ? "Complete! 🎉" : isRunning ? "Focusing..." : "Ready"}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isComplete ? (
              <>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-indigo-400 active:scale-95"
                >
                  {isRunning ? "⏸ Pause" : "▶ Start"}
                </button>
                <button
                  onClick={() => { setTimeLeft(FOCUS_MINUTES * 60); setIsRunning(false); }}
                  className="rounded-2xl border border-white/20 px-4 py-4 text-white/70 hover:bg-white/10"
                >
                  ↺
                </button>
              </>
            ) : (
              <button onClick={onClose}
                className="rounded-2xl bg-green-500 px-8 py-4 text-lg font-semibold text-white hover:bg-green-400 active:scale-95">
                ✅ Done — Close
              </button>
            )}
          </div>

          <p className="text-sm text-white/40">Press Esc or click ✕ to exit without saving</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
