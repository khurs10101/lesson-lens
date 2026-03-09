"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lesson, AdaptationType, AdaptationResult, ADAPTATION_META, ALL_ADAPTATION_TYPES } from "@/types";
import { getLesson } from "@/lib/storage";
import AdaptationTabs from "@/components/AdaptationTabs";
import Navbar from "@/components/Navbar";
import { IS_DEMO_MODE } from "@/lib/flags";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processedTypes, setProcessedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = params.id as string;
    const found = getLesson(id);
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (found) {
      const allReady = ALL_ADAPTATION_TYPES.every(
        (type) => found.adaptations[type]?.status === "ready"
      );

      if (allReady) {
        setShowProcessing(true);
        let processed = 0;
        intervalId = setInterval(() => {
          if (processed < ALL_ADAPTATION_TYPES.length) {
            setProcessedTypes((prev) => {
              const next = new Set(prev);
              next.add(ALL_ADAPTATION_TYPES[processed]);
              return next;
            });
            processed++;
          } else {
            clearInterval(intervalId);
            timeoutId = setTimeout(() => {
              setShowProcessing(false);
              setLesson(found);
              setLoading(false);
            }, 500);
          }
        }, 300);
      } else {
        setLesson(found);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [params.id]);

  if (loading || showProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar backHref="/dashboard" />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <h2 className="text-xl font-semibold mb-2">
              Generating 6 Lesson Versions
            </h2>
            <p className="text-sm text-muted-foreground">
              Amazon Nova is adapting your lesson for different learning needs...
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_ADAPTATION_TYPES.map((type, i) => {
              const meta = ADAPTATION_META[type];
              const isDone = processedTypes.has(type);
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border p-4 text-center transition-all"
                  style={{
                    borderColor: isDone ? meta.color : "hsl(var(--border))",
                    backgroundColor: isDone ? `${meta.color}08` : undefined,
                  }}
                >
                  <span className="text-2xl block mb-2">{meta.emoji}</span>
                  <p className="text-xs font-medium mb-2">{meta.label}</p>
                  {isDone ? (
                    <CheckCircle2
                      className="h-4 w-4 mx-auto"
                      style={{ color: meta.color }}
                    />
                  ) : (
                    <Loader2
                      className="h-4 w-4 mx-auto animate-spin"
                      style={{ color: meta.color }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This lesson doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        backHref="/dashboard"
        rightSlot={
          IS_DEMO_MODE ? (
            <Badge variant="outline" className="text-xs">
              Demo Mode
            </Badge>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Lesson header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {lesson.fileName} | Uploaded{" "}
            {new Date(lesson.createdAt).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Adaptation tabs */}
        <AdaptationTabs
          lesson={lesson}
          onAdaptationUpdate={(type: AdaptationType, updated: AdaptationResult) => {
            setLesson((prev) => {
              if (!prev) return prev;
              const next = {
                ...prev,
                adaptations: { ...prev.adaptations, [type]: updated },
              };
              // Persist to localStorage
              import("@/lib/storage").then(({ saveLesson }) => saveLesson(next));
              return next;
            });
          }}
        />
      </div>
    </div>
  );
}
