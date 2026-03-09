"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2, Loader2 } from "lucide-react";
import { AudioContent } from "@/types";

interface AudioPlayerProps {
  content: AudioContent;
}

type AudioMode = "loading" | "polly" | "webspeech";

export default function AudioPlayer({ content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [audioMode, setAudioMode] = useState<AudioMode>("loading");
  const mountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollyUrlRef = useRef<string | null>(null);
  const totalSections = content.script.length;

  // Memoize random values so waveform doesn't jump on re-render
  const waveformHeights = useMemo(
    () => Array.from({ length: 20 }, () => 8 + Math.random() * 24),
    []
  );
  const waveformDurations = useMemo(
    () => Array.from({ length: 20 }, () => 0.5 + Math.random() * 0.5),
    []
  );

  const cleanText = (text: string) =>
    text
      .replace(/\[PAUSE\]/g, ", ")
      .replace(/\[EMPHASIZE\]/g, "");

  // --- Try to fetch Polly audio on mount ---
  useEffect(() => {
    let cancelled = false;

    async function fetchPollyAudio() {
      try {
        const res = await fetch("/api/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: content.script }),
        });

        if (cancelled) return;

        // If response is JSON, Polly is unavailable — use Web Speech
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          setAudioMode("webspeech");
          return;
        }

        // Got MP3 back from Polly
        const blob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        pollyUrlRef.current = url;
        setAudioMode("polly");
      } catch (err) {
        console.warn("[audio] Polly unavailable, falling back to browser TTS:", err instanceof Error ? err.message : err);
        if (!cancelled) setAudioMode("webspeech");
      }
    }

    fetchPollyAudio();
    return () => {
      cancelled = true;
      if (pollyUrlRef.current) {
        URL.revokeObjectURL(pollyUrlRef.current);
        pollyUrlRef.current = null;
      }
    };
  }, [content.script]);

  // --- Polly playback ---
  const handlePollyPlay = useCallback(() => {
    if (!pollyUrlRef.current) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(pollyUrlRef.current);
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current || !mountedRef.current) return;
        const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(pct);

        // Estimate which section we're in based on progress
        const sectionIdx = Math.min(
          Math.floor((pct / 100) * totalSections),
          totalSections - 1
        );
        setCurrentSectionIndex(sectionIdx);
      };
      audioRef.current.onended = () => {
        if (!mountedRef.current) return;
        setIsPlaying(false);
        setProgress(100);
        setCurrentSectionIndex(totalSections);
      };
    }

    audioRef.current.playbackRate = speed;
    audioRef.current.play();
    setIsPlaying(true);
  }, [speed, totalSections]);

  const handlePollyPause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const handlePollyRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSectionIndex(0);
    setProgress(0);
  }, []);

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // --- Web Speech API fallback ---
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (mountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  const speakSection = useCallback(
    (index: number) => {
      if (!mountedRef.current) return;
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (index >= totalSections) {
        setIsPlaying(false);
        setProgress(100);
        return;
      }

      const section = content.script[index];
      if (!section) return;
      const text = cleanText(section.text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.lang = "en-US";

      utterance.onend = () => {
        if (!mountedRef.current) return;
        const nextIndex = index + 1;
        setCurrentSectionIndex(nextIndex);
        setProgress((nextIndex / totalSections) * 100);
        if (nextIndex < totalSections) {
          speakSection(nextIndex);
        } else {
          setIsPlaying(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [content.script, speed, totalSections]
  );

  // --- Unified controls ---
  const handlePlayPause = () => {
    if (audioMode === "polly") {
      if (isPlaying) handlePollyPause();
      else handlePollyPlay();
    } else {
      if (isPlaying) {
        stopSpeaking();
      } else {
        setIsPlaying(true);
        speakSection(currentSectionIndex);
      }
    }
  };

  const handleRestart = () => {
    if (audioMode === "polly") {
      handlePollyRestart();
    } else {
      stopSpeaking();
      setCurrentSectionIndex(0);
      setProgress(0);
    }
  };

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop Web Speech when speed changes mid-play
  useEffect(() => {
    if (audioMode === "webspeech" && isPlaying) {
      stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  return (
    <div className="space-y-6">
      {/* Player Controls */}
      <Card className="border-audio/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            {/* Waveform visualization */}
            <div className="flex items-center gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-audio"
                  animate={{
                    height: isPlaying
                      ? [4, waveformHeights[i], 4]
                      : 4,
                  }}
                  transition={{
                    duration: waveformDurations[i],
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.05,
                  }}
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRestart}
                className="h-9 w-9"
                aria-label="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handlePlayPause}
                disabled={audioMode === "loading"}
                className="h-12 w-12 rounded-full bg-audio hover:bg-audio/90"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {audioMode === "loading" ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-0.5" />
                )}
              </Button>
              <div className="flex items-center gap-1">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className="h-full rounded-full bg-audio"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Speed controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Speed:</span>
              {[0.75, 1, 1.25, 1.5].map((s) => (
                <Button
                  key={s}
                  variant={speed === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSpeed(s)}
                  className="h-6 px-2 text-xs"
                >
                  {s}x
                </Button>
              ))}
            </div>

            {/* Info badges */}
            <div className="flex gap-2">
              <Badge variant="outline" className="border-audio text-audio text-xs">
                {content.estimatedDuration}
              </Badge>
              <Badge variant="outline" className="border-audio text-audio text-xs">
                {content.wordCount} words
              </Badge>
              <Badge variant="outline" className="border-audio text-audio text-xs">
                {audioMode === "loading"
                  ? "Loading..."
                  : audioMode === "polly"
                  ? "Amazon Polly"
                  : "Browser TTS"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script */}
      <div className="space-y-3">
        {content.script.map((section, i) => (
          <motion.div
            key={`${section.type}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`border transition-all duration-300 ${
                currentSectionIndex === i && isPlaying
                  ? "border-audio bg-audio/5 shadow-md shadow-audio/10"
                  : i < currentSectionIndex
                  ? "border-audio/30 opacity-60"
                  : "border-border"
              }`}
            >
              <CardContent className="py-3 px-4">
                {section.sectionTitle && (
                  <p className="text-xs font-semibold text-audio mb-1">
                    {section.type === "intro"
                      ? "Introduction"
                      : section.type === "recap"
                      ? "Recap"
                      : section.sectionTitle}
                  </p>
                )}
                {!section.sectionTitle && (
                  <p className="text-xs font-semibold text-audio mb-1 capitalize">
                    {section.type}
                  </p>
                )}
                <p className="text-sm leading-relaxed">
                  {section.text
                    .replace(/\[PAUSE\]/g, " ... ")
                    .replace(
                      /\[EMPHASIZE\](.*?)\[EMPHASIZE\]/g,
                      "**$1**"
                    )
                    .split("**")
                    .map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-audio">
                          {part}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
