"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Minimal local typings to keep TS happy across browsers
type AnyRecognition = {
  start: () => void;
  stop: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export default function StartTranscribePage() {
  const router = useRouter();
  const recognitionRef = useRef<AnyRecognition | null>(null);
  const userStoppedRef = useRef(false);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [lang, setLang] = useState("en-US");
  const [error, setError] = useState<string | null>(null);

  // Optional mic meter
  const [level, setLevel] = useState(0);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioRAF = useRef<number | null>(null);

  useEffect(() => {
    const hasSR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    setSupported(Boolean(hasSR));
    if (!hasSR) return;

    const SRImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const sr: AnyRecognition = new SRImpl() as AnyRecognition;

    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = lang;

    sr.onresult = (e: any) => {
      let interim = "";
      const finals: string[] = [];
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finals.push(txt.trim());
        else interim += txt;
      }
      if (interim) setInterimText(interim);
      if (finals.length) {
        setFinalSegments((prev) => [...prev, ...finals]);
        setInterimText("");
      }
    };

    sr.onerror = (ev: any) => {
      setError(ev?.error ? `Speech error: ${ev.error}` : "Speech recognition error");
      setIsListening(false);
    };

    sr.onend = () => {
      setIsListening(false);
      if (!userStoppedRef.current) {
        try {
          sr.start();
          setIsListening(true);
        } catch {}
      }
    };

    recognitionRef.current = sr;

    return () => {
      try {
        sr.onresult = null;
        sr.onerror = null;
        sr.onend = null;
        sr.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [lang]);

  // Mic level (optional visual only)
  const startMicLevel = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      audioAnalyserRef.current = analyser;
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (!audioAnalyserRef.current) return;
        audioAnalyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.sqrt(sum / buf.length));
        audioRAF.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // ignore: visual only
    }
  };
  const stopMicLevel = () => {
    if (audioRAF.current) cancelAnimationFrame(audioRAF.current);
    audioRAF.current = null;
    audioAnalyserRef.current = null;
  };

  const handleStart = async () => {
    setError(null);
    userStoppedRef.current = false;
    setInterimText("");
    try {
      recognitionRef.current?.stop(); // reset
    } catch {}
    try {
      if (recognitionRef.current) recognitionRef.current.lang = lang;
      recognitionRef.current?.start();
      setIsListening(true);
      startMicLevel();
    } catch (e: any) {
      setError(e?.message || "Failed to start recognition");
      setIsListening(false);
    }
  };

  const handleStop = () => {
    userStoppedRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    stopMicLevel();
  };

  const handleClear = () => {
    setFinalSegments([]);
    setInterimText("");
    setError(null);
  };

  const fullTranscript = useMemo(
    () => [...finalSegments, interimText].filter(Boolean).join(" "),
    [finalSegments, interimText]
  );

  if (supported === false) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-4xl font-bold">Live Transcription</h1>
        <p className="text-white/70 max-w-xl">
          Your browser doesn’t support the Web Speech API. Try the latest Chrome/Edge,
          or we can switch this page to a cloud speech-to-text API.
        </p>
        <button onClick={() => router.push("/")} className="mt-2 rounded-xl border border-white/60 px-5 py-3">
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* Background matches your home’s style */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 70% 40%, rgba(156, 71, 255, 0.20), rgba(0,0,0,0))," +
              "radial-gradient(900px 600px at 25% 25%, rgba(72, 203, 255, 0.14), rgba(0,0,0,0))," +
              "linear-gradient(180deg, #06050b 0%, #0a0612 45%, #080612 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      <header className="flex items-center justify-between p-5">
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-white/30 px-4 py-2 text-sm hover:border-white/60 transition"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent border border-white/30 rounded-lg px-3 py-2 text-sm"
            title="Recognition language"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Español (ES)</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
            <option value="it-IT">Italiano</option>
          </select>

          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm ${
              isListening ? "bg-emerald-500/20" : "bg-white/10"
            }`}
            title={isListening ? "Listening" : "Idle"}
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isListening ? "bg-emerald-400 animate-pulse" : "bg-white/50"
              }`}
            />
            {isListening ? "Listening" : "Idle"}
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-32">
        <h1
          className="mt-6 mb-4 text-4xl md:text-5xl font-extrabold tracking-tight select-none"
          style={{ textShadow: "0 0 14px rgba(255,255,255,.35), 0 0 28px rgba(180,140,255,.22)" }}
        >
          Live Transcription
        </h1>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {!isListening ? (
            <button
              onClick={handleStart}
              className="rounded-xl border border-white/70 px-5 py-3 font-semibold hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Start Listening
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="rounded-xl border border-white/70 px-5 py-3 font-semibold hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Stop
            </button>
          )}

          <button
            onClick={handleClear}
            className="rounded-xl border border-white/30 px-4 py-3 text-sm hover:border-white/60 transition"
            title="Clear transcript"
          >
            Clear
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(fullTranscript)}
            className="rounded-xl border border-white/30 px-4 py-3 text-sm hover:border-white/60 transition"
            title="Copy transcript"
          >
            Copy
          </button>
        </div>

        {/* Mic level meter (optional) */}
        <div className="mb-5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-[width] duration-100"
            style={{ width: `${Math.min(100, Math.round(level * 200))}%` }}
            title="Mic level"
          />
        </div>

        {/* Transcript */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
          <div className="space-y-3">
            {finalSegments.length === 0 && !interimText && (
              <p className="text-white/60">
                Press <span className="text-white">Start Listening</span> and speak. Words will appear here.
              </p>
            )}

            {finalSegments.map((seg, i) => (
              <p key={i} className="leading-7">
                {seg}
              </p>
            ))}

            {interimText && (
              <p className="leading-7 text-white/80">
                <em className="opacity-80">{interimText}</em>
                <span className="animate-pulse">▌</span>
              </p>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300/90">{error}</p>}
      </section>

      <footer className="fixed bottom-0 inset-x-0 p-4 text-center text-xs text-white/50">
        Tip: If nothing happens, check Mic permission and try Chrome. Some browsers block continuous speech.
      </footer>
    </main>
  );
}
