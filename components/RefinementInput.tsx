"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AdaptationResult, AdaptationType } from "@/types";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const SUGGESTIONS: Record<AdaptationType, string[]> = {
  dyslexia: ["Make sentences even shorter", "Add more key terms", "Simplify vocabulary further"],
  esl: ["Translate to French instead", "Add more vocabulary examples", "Include phonetic pronunciation"],
  visual: ["Add more timeline steps", "Expand the concept descriptions", "Include more visual sections"],
  audio: ["Make it more conversational", "Add more pauses and emphasis markers", "Shorten the script"],
  adhd: ["Add more quiz cards", "Make each card shorter", "Add more 'why it matters' hooks"],
  gifted: ["Add more Socratic questions", "Include recent research references", "Make the challenge harder"],
};

interface RefinementInputProps {
  adaptationType: AdaptationType;
  currentAdaptation: AdaptationResult;
  originalContent: string;
  onRefined: (updated: AdaptationResult) => void;
}

export default function RefinementInput({
  adaptationType,
  currentAdaptation,
  originalContent,
  onRefined,
}: RefinementInputProps) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRefined, setLastRefined] = useState<string | null>(null);

  async function handleRefine() {
    if (!instruction.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adaptationType,
          instruction: instruction.trim(),
          originalContent,
          currentAdaptation,
        }),
      });
      if (!res.ok) throw new Error("Refinement failed");
      const data = await res.json();
      onRefined(data.adaptation);
      setLastRefined(instruction.trim());
      setInstruction("");
    } catch {
      alert("Refinement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 border-t pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">Refine with Nova</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 ml-auto" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 ml-auto" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {lastRefined && (
                <p className="text-xs text-muted-foreground bg-primary/5 rounded-md px-3 py-2">
                  Last refined: &quot;{lastRefined}&quot;
                </p>
              )}

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS[adaptationType].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInstruction(s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                  placeholder="E.g. Make it simpler, translate to French…"
                  disabled={loading}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  size="sm"
                  onClick={handleRefine}
                  disabled={loading || !instruction.trim()}
                  className="gap-1.5 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {loading ? "Refining..." : "Refine"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
