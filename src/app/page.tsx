"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─── */
interface Task {
  id: string;
  text: string;
  createdAt: number;
  completedAt: number | null;
}

type PlantStage = "seed" | "sprout" | "bloom" | "wilt" | "rot";

/* ─── Time thresholds (ms) ─── */
const SPROUT_TIME = 2 * 60 * 60 * 1000;   // 2h
const WILT_TIME = 12 * 60 * 60 * 1000;    // 12h
const ROT_TIME = 24 * 60 * 60 * 1000;     // 24h

function getStage(task: Task, now: number): PlantStage {
  if (task.completedAt) return "bloom";
  const age = now - task.createdAt;
  if (age >= ROT_TIME) return "rot";
  if (age >= WILT_TIME) return "wilt";
  if (age >= SPROUT_TIME) return "sprout";
  return "seed";
}

/* ─── Demo content ─── */
function createDemoTasks(): Task[] {
  const now = Date.now();
  return [
    { id: crypto.randomUUID(), text: "Book dentist appointment", createdAt: now - 30 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Review Q2 budget proposal", createdAt: now - 90 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Plan weekend camping trip", createdAt: now - 3 * 60 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Prep slides for Monday standup", createdAt: now - 5 * 60 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Submit expense report", createdAt: now - 4 * 60 * 60 * 1000, completedAt: now - 2 * 60 * 60 * 1000 },
    { id: crypto.randomUUID(), text: "Fix the garage door sensor", createdAt: now - 6 * 60 * 60 * 1000, completedAt: now - 1 * 60 * 60 * 1000 },
    { id: crypto.randomUUID(), text: "Renew car insurance", createdAt: now - 14 * 60 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Reply to Mom's email", createdAt: now - 18 * 60 * 60 * 1000, completedAt: null },
    { id: crypto.randomUUID(), text: "Clean out the garage", createdAt: now - 30 * 60 * 60 * 1000, completedAt: null },
  ];
}

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "decompose-tasks";
const TIME_OFFSET_KEY = "decompose-time-offset";

function loadTasks(): Task[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTimeOffset(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(TIME_OFFSET_KEY)) || 0;
  } catch { return 0; }
}

function saveTimeOffset(offset: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIME_OFFSET_KEY, String(offset));
}

/* ─── Plant SVG Components ─── */
function SeedPlant() {
  return (
    <div className="plant-seed flex items-end justify-center h-28">
      <div className="relative">
        {/* Soil mound */}
        <div className="w-14 h-3 rounded-full" style={{ background: "var(--soil-lighter)" }} />
        {/* Seed */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-4 rounded-full"
          style={{ background: "var(--seed)", boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.3)" }}
        />
      </div>
    </div>
  );
}

function SproutPlant() {
  return (
    <div className="plant-sprout flex items-end justify-center h-28">
      <div className="relative flex flex-col items-center">
        {/* Leaves */}
        <div className="relative mb-0">
          <div
            className="absolute -left-4 -top-1 w-5 h-3 rounded-full -rotate-30"
            style={{ background: "var(--sprout)" }}
          />
          <div
            className="absolute -right-4 -top-1 w-5 h-3 rounded-full rotate-30"
            style={{ background: "var(--sprout)" }}
          />
        </div>
        {/* Stem */}
        <div className="w-1 h-12 rounded-full" style={{ background: "var(--sprout-dark)" }} />
        {/* Soil */}
        <div className="w-10 h-2 rounded-full" style={{ background: "var(--soil-lighter)" }} />
      </div>
    </div>
  );
}

function BloomPlant() {
  return (
    <div className="plant-bloom flex items-end justify-center h-28">
      <div className="relative flex flex-col items-center">
        {/* Flower head */}
        <div className="relative w-12 h-12 mb-0">
          {/* Petals */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute w-4 h-4 rounded-full left-1/2 top-1/2"
              style={{
                background: deg % 120 === 0 ? "var(--bloom-orange)" : "var(--bloom-pink)",
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-8px)`,
                opacity: 0.9,
              }}
            />
          ))}
          {/* Center */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{ background: "var(--bloom-glow)" }}
          />
        </div>
        {/* Stem */}
        <div className="w-1 h-8 rounded-full" style={{ background: "var(--sprout-dark)" }} />
        {/* Leaves on stem */}
        <div className="relative -mt-6">
          <div
            className="absolute -left-3 w-4 h-2 rounded-full -rotate-20"
            style={{ background: "var(--sprout)" }}
          />
          <div
            className="absolute -right-3 w-4 h-2 rounded-full rotate-20 top-2"
            style={{ background: "var(--sprout)" }}
          />
        </div>
        <div className="mt-6" />
        {/* Soil */}
        <div className="w-10 h-2 rounded-full" style={{ background: "var(--soil-lighter)" }} />
      </div>
    </div>
  );
}

function WiltPlant() {
  return (
    <div className="plant-wilt flex items-end justify-center h-28">
      <div className="relative flex flex-col items-center">
        {/* Drooping leaves */}
        <div className="relative mb-0">
          <div
            className="absolute -left-4 top-1 w-5 h-2 rounded-full rotate-20"
            style={{ background: "var(--wilt)", opacity: 0.7 }}
          />
          <div
            className="absolute -right-4 top-1 w-5 h-2 rounded-full -rotate-20"
            style={{ background: "var(--wilt)", opacity: 0.7 }}
          />
        </div>
        {/* Bent stem */}
        <div className="w-1 h-12 rounded-full" style={{ background: "var(--wilt-dark)", transform: "rotate(5deg)" }} />
        {/* Soil */}
        <div className="w-10 h-2 rounded-full" style={{ background: "var(--soil-lighter)" }} />
      </div>
    </div>
  );
}

function RotPlant() {
  return (
    <div className="plant-rot flex items-end justify-center h-28 relative">
      <div className="relative flex flex-col items-center">
        {/* Withered remains */}
        <div className="relative mb-0">
          <div
            className="absolute -left-3 top-2 w-4 h-1.5 rounded-full rotate-40"
            style={{ background: "var(--rot)", opacity: 0.5 }}
          />
          <div
            className="absolute -right-2 top-3 w-3 h-1 rounded-full -rotate-30"
            style={{ background: "var(--rot)", opacity: 0.4 }}
          />
        </div>
        {/* Cracked stem */}
        <div className="w-1 h-8 rounded-full" style={{ background: "var(--rot)", opacity: 0.6 }} />
        {/* Cracked soil */}
        <div className="relative">
          <div className="w-12 h-2 rounded-full" style={{ background: "var(--rot-dark)" }} />
          <div className="absolute top-0 left-2 w-px h-2" style={{ background: "var(--soil-dark)" }} />
          <div className="absolute top-0 left-6 w-px h-2" style={{ background: "var(--soil-dark)" }} />
        </div>
        {/* Bugs */}
        <div className="bug absolute top-10 left-2 w-1.5 h-1.5 rounded-full" style={{ background: "var(--rot-bug)" }} />
        <div className="bug absolute top-14 right-3 w-1 h-1 rounded-full" style={{ background: "var(--rot-bug)", animationDelay: "0.7s" }} />
        <div className="bug absolute top-8 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--rot-bug)", animationDelay: "1.3s" }} />
      </div>
    </div>
  );
}

function PlantVisual({ stage }: { stage: PlantStage }) {
  switch (stage) {
    case "seed": return <SeedPlant />;
    case "sprout": return <SproutPlant />;
    case "bloom": return <BloomPlant />;
    case "wilt": return <WiltPlant />;
    case "rot": return <RotPlant />;
  }
}

const STAGE_LABELS: Record<PlantStage, string> = {
  seed: "Seed",
  sprout: "Growing",
  bloom: "Blooming",
  wilt: "Wilting",
  rot: "Rotting",
};

const STAGE_COLORS: Record<PlantStage, string> = {
  seed: "var(--seed)",
  sprout: "var(--sprout)",
  bloom: "var(--bloom-orange)",
  wilt: "var(--wilt)",
  rot: "var(--rot-bug)",
};

/* ─── Main App ─── */
export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [now, setNow] = useState(Date.now());
  const [timeOffset, setTimeOffset] = useState(0);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadTasks();
    const offset = loadTimeOffset();
    setTimeOffset(offset);
    if (saved && saved.length > 0) {
      setTasks(saved);
    } else {
      const demo = createDemoTasks();
      setTasks(demo);
      saveTasks(demo);
    }
    setLoaded(true);
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (loaded) saveTasks(tasks);
  }, [tasks, loaded]);

  // Tick every 10s to update plant states
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() + timeOffset), 10000);
    setNow(Date.now() + timeOffset);
    return () => clearInterval(interval);
  }, [timeOffset]);

  // Shift+T: fast-forward 3 hours for demo
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "T") {
        const newOffset = timeOffset + 3 * 60 * 60 * 1000;
        setTimeOffset(newOffset);
        setNow(Date.now() + newOffset);
        saveTimeOffset(newOffset);
      }
      // Shift+R: reset time offset
      if (e.shiftKey && e.key === "R") {
        setTimeOffset(0);
        setNow(Date.now());
        saveTimeOffset(0);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [timeOffset]);

  const addTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text, createdAt: Date.now() + timeOffset, completedAt: null },
      ...prev,
    ]);
    setInput("");
  }, [input, timeOffset]);

  function completeTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id && !t.completedAt ? { ...t, completedAt: Date.now() + timeOffset } : t))
    );
  }

  function deleteTask(id: string) {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 500);
  }

  // Stats
  const stages = tasks.map((t) => getStage(t, now));
  const counts: Record<PlantStage, number> = { seed: 0, sprout: 0, bloom: 0, wilt: 0, rot: 0 };
  stages.forEach((s) => counts[s]++);

  if (!loaded) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "var(--cream)", fontFamily: "var(--font-caveat), cursive" }}>
          Your Garden
        </h1>
        <p className="text-sm" style={{ color: "var(--cream-dim)" }}>
          Tend your tasks or watch them decompose
        </p>
      </div>

      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2 mb-10 max-w-md mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Plant a new task..."
          className="flex-1 px-4 py-3 rounded-xl text-sm border-2 focus:outline-none transition-colors"
          style={{
            background: "var(--soil-light)",
            borderColor: "var(--soil-lighter)",
            color: "var(--cream)",
          }}
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "var(--sprout)",
            color: "var(--soil-dark)",
          }}
        >
          Plant
        </button>
      </form>

      {/* Garden Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--cream-dim)" }}>
          <p className="text-lg mb-1">Your garden is empty</p>
          <p className="text-sm">Plant a task above to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {tasks.map((task) => {
              const stage = getStage(task, now);
              const isRemoving = removing.has(task.id);
              return (
                <div
                  key={task.id}
                  className={`group relative rounded-2xl p-4 transition-all cursor-pointer hover:scale-[1.02] ${isRemoving ? "plant-uproot" : ""}`}
                  style={{
                    background: "var(--soil-light)",
                    border: `1px solid ${stage === "rot" ? "var(--rot)" : stage === "wilt" ? "var(--wilt-dark)" : "var(--soil-lighter)"}`,
                  }}
                  onClick={() => !task.completedAt && completeTask(task.id)}
                >
                  {/* Plant visual */}
                  <PlantVisual stage={stage} />

                  {/* Stage label */}
                  <div className="text-center mt-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: STAGE_COLORS[stage] }}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>

                  {/* Task text */}
                  <p
                    className={`text-center text-xs mt-1 leading-snug ${task.completedAt ? "line-through" : ""}`}
                    style={{ color: task.completedAt ? "var(--sprout)" : "var(--cream-dim)" }}
                  >
                    {task.text}
                  </p>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-opacity"
                    style={{ background: "var(--rot)", color: "var(--cream-dim)" }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{ background: "var(--soil-light)" }}
          >
            <span className="font-bold" style={{ color: "var(--cream)" }}>
              {tasks.length} plant{tasks.length !== 1 ? "s" : ""}
            </span>
            <span style={{ color: "var(--cream-dim)" }}> — </span>
            {counts.bloom > 0 && (
              <span style={{ color: "var(--bloom-orange)" }}>{counts.bloom} blooming </span>
            )}
            {counts.sprout > 0 && (
              <span style={{ color: "var(--sprout)" }}>{counts.sprout} growing </span>
            )}
            {counts.seed > 0 && (
              <span style={{ color: "var(--seed)" }}>{counts.seed} seeds </span>
            )}
            {counts.wilt > 0 && (
              <span style={{ color: "var(--wilt)" }}>{counts.wilt} wilting </span>
            )}
            {counts.rot > 0 && (
              <span style={{ color: "var(--rot-bug)" }}>{counts.rot} rotting </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
