"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ADAPTATION_META,
  AdaptationType,
  AdaptationResult,
  Lesson,
  ALL_ADAPTATION_TYPES,
  DyslexiaContent,
  ESLContent,
  VisualContent,
  AudioContent,
  ADHDContent,
  GiftedContent,
} from "@/types";
import DyslexiaView from "./DyslexiaView";
import BilingualView from "./BilingualView";
import ConceptMap from "./ConceptMap";
import AudioPlayer from "./AudioPlayer";
import LessonCard from "./LessonCard";
import GiftedView from "./GiftedView";
import RefinementInput from "./RefinementInput";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";

interface AdaptationTabsProps {
  lesson: Lesson;
  onAdaptationUpdate?: (type: AdaptationType, adaptation: AdaptationResult) => void;
}

export default function AdaptationTabs({ lesson, onAdaptationUpdate }: AdaptationTabsProps) {
  const [activeTab, setActiveTab] = useState<AdaptationType>("dyslexia");
  const [retrying, setRetrying] = useState<Set<AdaptationType>>(new Set());

  async function handleRetry(type: AdaptationType) {
    setRetrying((prev) => new Set(prev).add(type));
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent: lesson.originalContent,
          types: [type],
        }),
      });
      if (!res.ok) throw new Error("Retry failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            const payload = part.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const event = JSON.parse(payload);
              if (event.type === type && event.adaptation?.status === "ready") {
                onAdaptationUpdate?.(type, event.adaptation);
              }
            } catch { /* skip malformed */ }
          }
        }
        reader.cancel().catch(() => {});
      }
    } catch (err) {
      console.error(`[retry] ${type} failed:`, err instanceof Error ? err.message : err);
      alert(`Retry failed for ${ADAPTATION_META[type].label}. Please try again.`);
    } finally {
      setRetrying((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }
  }

  const renderContent = (type: AdaptationType) => {
    const adaptation = lesson.adaptations[type];
    if (!adaptation || adaptation.status !== "ready") {
      const isRetrying = retrying.has(type);
      const isError = adaptation?.status === "error";
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isError
              ? "This adaptation failed to generate."
              : "This adaptation is not yet available."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRetry(type)}
            disabled={isRetrying}
            className="gap-2"
          >
            {isRetrying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isRetrying ? "Regenerating..." : "Retry with Nova"}
          </Button>
        </div>
      );
    }

    const view = (() => {
      switch (type) {
        case "dyslexia":
          return <DyslexiaView content={adaptation.content as DyslexiaContent} />;
        case "esl":
          return <BilingualView content={adaptation.content as ESLContent} />;
        case "visual":
          return <ConceptMap content={adaptation.content as VisualContent} />;
        case "audio":
          return <AudioPlayer content={adaptation.content as AudioContent} />;
        case "adhd":
          return <LessonCard content={adaptation.content as ADHDContent} />;
        case "gifted":
          return <GiftedView content={adaptation.content as GiftedContent} />;
      }
    })();

    return (
      <div>
        {view}
        <RefinementInput
          adaptationType={type}
          currentAdaptation={adaptation}
          originalContent={lesson.originalContent}
          onRefined={(updated) => onAdaptationUpdate?.(type, updated)}
        />
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as AdaptationType)}
      className="w-full"
    >
      <TabsList className="w-full flex overflow-x-auto no-scrollbar h-auto p-1 bg-muted/50 rounded-lg gap-1">
        {ALL_ADAPTATION_TYPES.map((type) => {
          const meta = ADAPTATION_META[type];
          const isActive = activeTab === type;
          return (
            <TabsTrigger
              key={type}
              value={type}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-md transition-all data-[state=active]:shadow-sm"
              style={{
                borderBottom: isActive ? `2px solid ${meta.color}` : undefined,
                color: isActive ? meta.color : undefined,
              }}
            >
              <span>{meta.emoji}</span>
              <span className="hidden sm:inline">{meta.label}</span>
              <span className="sm:hidden">
                {meta.label.split("/")[0].split("-")[0].trim()}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <AnimatePresence mode="wait">
        {ALL_ADAPTATION_TYPES.map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent(type)}
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  );
}
