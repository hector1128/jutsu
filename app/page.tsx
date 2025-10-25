"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  function handleStart() {
    setStarting(true);
    setTimeout(() => router.push("/voice"), 120); // <— go to /voice
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* Background (stylish, no stars) */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 70% 40%, rgba(156,71,255,.22), rgba(0,0,0,0))," +
              "radial-gradient(900px 600px at 25% 25%, rgba(72,203,255,.18), rgba(0,0,0,0))," +
              "linear-gradient(180deg,#06050b 0%,#0a0612 45%,#080612 100%)",
          }}
        />
        <div
          className="absolute -inset-[10%] blur-2xl opacity-70"
          style={{
            background:
              "radial-gradient(60% 80% at 30% 30%, rgba(90,220,255,.18), transparent 60%)," +
              "radial-gradient(55% 75% at 70% 60%, rgba(255,120,230,.22), transparent 60%)," +
              "radial-gradient(40% 60% at 55% 20%, rgba(150,100,255,.20), transparent 60%)",
            mixBlendMode: "screen",
            animation: "auroraDrift 80s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "conic-gradient(from 230deg at 50% 50%, rgba(255,255,255,.12), rgba(0,0,0,0) 30%, rgba(255,255,255,.10) 55%, rgba(0,0,0,0) 80%, rgba(255,255,255,.12))",
            mixBlendMode: "soft-light",
            animation: "sweep 50s linear infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(35% 35% at 20% 80%, rgba(130,30,255,.18), transparent 70%)," +
              "radial-gradient(30% 30% at 85% 25%, rgba(60,200,255,.16), transparent 70%)",
            mixBlendMode: "screen",
            animation: "parallax 65s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,.55) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute top-[35%] w-full text-center px-6">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight select-none glow">
          Jutsu
        </h1>
      </div>

      <div className="absolute top-[50%] w-full text-center">
        <button
          onClick={handleStart}
          disabled={starting}
          aria-label="Start"
          className="glow inline-flex items-center justify-center rounded-2xl border border-white/80 px-8 py-3 text-3xl md:text-4xl font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {starting ? "Starting…" : "Start"}
        </button>
      </div>

      <div className="absolute top-[60%] w-full text-center">
        <h2 className="glow text-2xl md:text-3xl font-extrabold tracking-tight select-none">
          Real Time Speech to ASL
        </h2>
      </div>

      <style jsx>{`
        .glow {
          text-shadow:
            0 0 12px rgba(255,255,255,.35),
            0 0 30px rgba(190,150,255,.25),
            0 0 46px rgba(120,210,255,.18);
          filter: drop-shadow(0 0 10px rgba(255,255,255,.12));
        }
        @keyframes auroraDrift {
          0% { transform: translate3d(-2%,1%,0) scale(1.05) rotate(0.2deg); }
          100% { transform: translate3d(2%,-2%,0) scale(1.1) rotate(-0.2deg); }
        }
        @keyframes sweep { 0% {transform:rotate(0)} 100% {transform:rotate(360deg)} }
        @keyframes parallax { 0% {transform:translate3d(0,0,0) scale(1.02)} 100% {transform:translate3d(1.8%,-1.2%,0) scale(1.07)} }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; transform: none !important; }
        }
      `}</style>
    </main>
  );
}
