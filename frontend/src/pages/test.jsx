import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw, Timer, Loader2 } from "lucide-react";
import { formatTime } from "../utils/format_time";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const durationOptions = [
  { id: 1, time: 60 },
  { id: 2, time: 180 },
  { id: 3, time: 300 },
];

// How many lines of text stay visible in the viewport, and how many lines
// of "look-ahead" context are kept above the caret before the text scrolls.
const VISIBLE_LINES = 10;
const BUFFER_LINES = 1;



export default function Test() {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [input, setInput] = useState("");
  const [text, setText] = useState(null);
  const [loadingText, setLoadingText] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const textInnerRef = useRef(null);
  const viewportRef = useRef(null);

  const content = text?.content ?? "";
  const fetchText = useCallback(async () => {
    setLoadingText(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/typing/texts/random`);
      if (!res.ok) throw new Error("Failed to fetch text");
      const data = await res.json();
      setText(data);
    } catch (err) {
      console.error(err);
      setText({ id: null, title: "Offline", category: "fallback", content: "Unable to load text. Check your connection to the server and try again." });
    } finally {
      setLoadingText(false);
    }
  }, []);

  useEffect(() => {
    fetchText();
  }, [fetchText]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const updateScroll = useCallback(() => {
    const container = textInnerRef.current;
    const viewport = viewportRef.current;
    if (!container || !viewport || loadingText) return;

    const children = container.children;
    if (!children.length) return;

    const idx = Math.min(input.length, children.length - 1);
    const target = children[idx];
    if (!target) return;

    const lineHeight = parseFloat(getComputedStyle(container).lineHeight);
    if (!lineHeight) return;

    setViewportHeight(lineHeight * VISIBLE_LINES);

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const relativeTop = targetRect.top - containerRect.top;
    const currentLine = Math.round(relativeTop / lineHeight);

    const scrollLines = Math.max(0, currentLine - BUFFER_LINES);
    viewport.scrollTop = scrollLines * lineHeight;
  }, [input, loadingText]);

  useEffect(() => {
    const raf = requestAnimationFrame(updateScroll);
    return () => cancelAnimationFrame(raf);
  }, [updateScroll, content]);

  useEffect(() => {
    window.addEventListener("resize", updateScroll);
    return () => window.removeEventListener("resize", updateScroll);
  }, [updateScroll]);

  async function submitForAnalysis(typedText, elapsedSeconds) {
    if (!text?.id) {
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/typing/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          text_id: text.id,
          typed_text: typedText,
          time_taken: elapsedSeconds,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to analyze/submit result:", err);
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function finishTest() {
    setIsRunning(false);
    setIsFinished(true);

    const elapsed = startTime ? (Date.now() - startTime) / 1000 : duration;
    submitForAnalysis(input, elapsed);
  }

  function handleInput(e) {
    const value = e.target.value;
    if (isFinished || !content) return;

    if (!isRunning && value.length > 0) {
      setIsRunning(true);
      setStartTime(Date.now());
    }

    setInput(value);

    if (value.length >= content.length) {
      clearInterval(timerRef.current);
      finishTest();
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsFinished(false);
    setIsAnalyzing(false);
    setInput("");
    setTimeLeft(duration);
    setStartTime(null);
    setResult(null);
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
    fetchText();
    inputRef.current?.focus();
  }

  function handleDurationChange(newDuration) {
    if (isRunning) return;
    setDuration(newDuration);
  }

  function renderText() {
    if (loadingText) {
      return <span className="text-muted-foreground">Loading text…</span>;
    }
    return content.split("").map((char, i) => {
      let className = "text-muted-foreground";
      if (i < input.length) {
        className = input[i] === char ? "text-primary" : "text-destructive bg-destructive/20";
      } else if (i === input.length) {
        className = "text-foreground border-b-2 border-primary animate-pulse";
      }
      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  }

  const wpm = result?.metrics?.wpm ?? null;
  const accuracy = result?.metrics?.accuracy ?? null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="mb-6 flex flex-col items-stretch gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Duration picker */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-primary/25 bg-card/60 p-1.5 backdrop-blur sm:gap-2">
          <span className="px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary sm:px-3 sm:text-[10px]">
            Time
          </span>
          <div className="flex flex-1 gap-1 sm:flex-none">
            {durationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDurationChange(opt.time)}
                disabled={isRunning}
                className={cn(
                  "flex-1 rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors sm:flex-none sm:px-3 sm:py-1.5 sm:text-sm",
                  duration === opt.time
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  isRunning && "cursor-not-allowed opacity-50",
                )}
              >
                {opt.time}s
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-4 sm:justify-end">
          <div
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center rounded-full border border-primary/40 bg-card/70 backdrop-blur sm:h-20 sm:w-20",
              isRunning && "animate-neon-pulse",
            )}
          >
            <Timer className="mb-0.5 h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" />
            <span className="font-mono text-sm font-bold tabular-nums text-foreground sm:text-base">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Typing area - THIS IS THE ONLY SCROLLABLE CONTAINER */}
      <div
        className={cn(
          "neon-panel relative flex flex-1 cursor-text overflow-hidden rounded-2xl p-4 transition-all duration-300 sm:p-8",
          isRunning && "glow-primary",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/10 to-transparent animate-scan sm:h-16" />

        {/* Fixed-height, overflow-hidden viewport — this is the ONLY element that scrolls */}
        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden scroll-smooth"
          style={viewportHeight ? { height: `${viewportHeight}px` } : { height: "180px" }}
        >
          <div
            ref={textInnerRef}
            className="pointer-events-none select-none whitespace-pre-wrap break-words font-mono text-base leading-relaxed tracking-wide sm:text-2xl md:text-3xl"
          >
            {renderText()}
          </div>
        </div>


        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          className="absolute inset-0 h-full w-full cursor-text resize-none border-0 bg-transparent p-4 font-mono text-base leading-relaxed tracking-wide text-transparent caret-transparent opacity-0 focus:outline-none sm:p-8 sm:text-2xl md:text-3xl"
          autoFocus
          disabled={isFinished || loadingText}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Typing test input"
        />

        {isFinished && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-background/85 px-4 py-6 text-center backdrop-blur-md sm:px-8">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-primary sm:h-8 sm:w-8" />
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  Analyzing your run…
                </p>
              </>
            ) : result ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.35em]">
                  Run Complete
                </p>
                <div className="mt-3 flex flex-wrap items-baseline justify-center gap-2 sm:mt-4 sm:gap-3">
                  <span className="text-neon text-5xl font-black tabular-nums sm:text-6xl md:text-7xl">
                    {wpm}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground sm:text-lg">
                    WPM
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                  {accuracy}% accuracy · {result.performance_level}
                </p>
                {result.feedback && (
                  <p className="mt-4 max-w-xs break-words font-mono text-[11px] leading-relaxed text-muted-foreground sm:max-w-md sm:text-xs">
                    {result.feedback}
                  </p>
                )}
                <Button
                  onClick={reset}
                  className="mt-5 gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-widest glow-primary sm:mt-6 sm:px-7 sm:text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-destructive sm:text-sm">
                  Couldn't reach the server to score this run.
                </p>
                <Button
                  onClick={reset}
                  className="mt-5 gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-widest glow-primary sm:mt-6 sm:px-7 sm:text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            )}
          </div>
        )}
      </div>

     
    </div>
  );
}