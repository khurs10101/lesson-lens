"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileText, ImageIcon, Loader2, CheckCircle2, Clock } from "lucide-react";
import { ADAPTATION_META, ALL_ADAPTATION_TYPES, AdaptationType } from "@/types";
import { saveLesson } from "@/lib/storage";
import { DEMO_LESSON_ID } from "@/lib/demo-data";
import { IS_DEMO_MODE } from "@/lib/flags";

interface UploadZoneProps {
  compact?: boolean;
}

type UploadPhase =
  | "idle"
  | "uploading"      // file sent to server
  | "received"       // server accepted the file
  | "saving"         // saving to S3
  | "extracting"     // AI reading the document
  | "adapting"       // generating 6 adaptations
  | "done";

function useElapsedTimer(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return elapsed;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function UploadZone({ compact = false }: UploadZoneProps) {
  const router = useRouter();
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [adaptationProgress, setAdaptationProgress] = useState<
    Record<AdaptationType, "pending" | "generating" | "done">
  >({
    dyslexia: "pending",
    esl: "pending",
    visual: "pending",
    audio: "pending",
    adhd: "pending",
    gifted: "pending",
  });

  const isWorking = phase !== "idle" && phase !== "done";
  const elapsed = useElapsedTimer(isWorking);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** Parse SSE events from a ReadableStream */
  async function consumeSSE(
    response: Response,
    onEvent: (data: Record<string, unknown>) => void
  ) {
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        if (!part.startsWith("data: ")) continue;
        const payload = part.slice(6).trim();
        if (payload === "[DONE]") return;
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(payload);
        } catch (err) {
          console.warn("[sse] Malformed event:", err instanceof Error ? err.message : err);
          continue;
        }
        // Call outside try/catch so callback errors propagate to caller
        onEvent(parsed);
      }
    }
    reader.cancel().catch(() => {});
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setPhase("uploading");
      setStatusMessage(`Sending ${file.name} to server...`);

      let lessonId: string;

      if (IS_DEMO_MODE) {
        // Demo mode: simulate upload + adaptation with fake delays
        setPhase("extracting");
        setStatusMessage("Extracting text (demo mode)...");
        await new Promise((r) => setTimeout(r, 1000));

        lessonId = `lesson-${Date.now()}`;
        setPhase("adapting");
        setStatusMessage("Generating 6 lesson versions...");

        const delays: Record<AdaptationType, number> = {
          dyslexia: 800,
          esl: 1200,
          visual: 1800,
          audio: 2200,
          adhd: 1500,
          gifted: 2500,
        };

        await Promise.all(
          ALL_ADAPTATION_TYPES.map(async (type) => {
            if (!mountedRef.current) return;
            setAdaptationProgress((prev) => ({ ...prev, [type]: "generating" }));
            await new Promise((r) => setTimeout(r, delays[type]));
            if (!mountedRef.current) return;
            setAdaptationProgress((prev) => ({ ...prev, [type]: "done" }));
          })
        );

        const { DEMO_LESSON } = await import("@/lib/demo-data");
        saveLesson({
          ...DEMO_LESSON,
          id: lessonId,
          fileName: file.name,
          createdAt: new Date().toISOString(),
        });
      } else {
        // ---- Phase 1: Upload + Extraction via SSE ----
        const formData = new FormData();
        formData.append("file", file);

        let uploadData: {
          lessonId: string;
          rawContent: string;
          fileName: string;
          fileType: string;
        } | null = null;

        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(err.error ?? "Upload failed");
          }

          // Check if response is SSE or JSON (backwards compat)
          const contentType = uploadRes.headers.get("content-type") ?? "";
          if (contentType.includes("text/event-stream")) {
            await consumeSSE(uploadRes, (event) => {
              if (!mountedRef.current) return;
              switch (event.phase) {
                case "received":
                  setPhase("received");
                  setStatusMessage(`File received (${event.sizeMB} MB). Preparing...`);
                  break;
                case "saving":
                  setPhase("saving");
                  setStatusMessage(event.message as string);
                  break;
                case "extracting":
                  setPhase("extracting");
                  setStatusMessage(event.message as string);
                  break;
                case "done":
                  uploadData = {
                    lessonId: event.lessonId as string,
                    rawContent: event.rawContent as string,
                    fileName: event.fileName as string,
                    fileType: event.fileType as string,
                  };
                  setStatusMessage(
                    `Extracted ${((event.charCount as number) / 1000).toFixed(1)}K characters. Starting adaptations...`
                  );
                  break;
                case "error":
                  throw new Error(event.error as string);
              }
            });
          } else {
            // Fallback: JSON response
            uploadData = await uploadRes.json();
          }

          if (!uploadData) throw new Error("No data received from upload.");
        } catch (err) {
          if (mountedRef.current) {
            setPhase("idle");
            alert(err instanceof Error ? err.message : "Upload failed. Please try again.");
          }
          return;
        }

        lessonId = uploadData.lessonId;

        // ---- Phase 2: Adaptation via SSE ----
        if (mountedRef.current) {
          setPhase("adapting");
          setStatusMessage("Generating 6 lesson versions...");
          ALL_ADAPTATION_TYPES.forEach((type) => {
            setAdaptationProgress((prev) => ({ ...prev, [type]: "generating" }));
          });
        }

        const adaptations: Record<string, unknown> = {};
        try {
          const adaptRes = await fetch("/api/adapt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lessonId: uploadData.lessonId,
              rawContent: uploadData.rawContent,
              fileName: uploadData.fileName,
              fileType: uploadData.fileType,
            }),
          });
          if (!adaptRes.ok) {
            const err = await adaptRes.json().catch(() => ({}));
            throw new Error(err.error ?? "Adaptation failed");
          }

          await consumeSSE(adaptRes, (event) => {
            if (!mountedRef.current) return;
            if (event.type && event.adaptation) {
              adaptations[event.type as string] = event.adaptation;
              if ((event.adaptation as { status: string }).status === "error") {
                console.warn(`[adapt] ${event.type} adaptation failed on server`);
              }
              setAdaptationProgress((prev) => ({
                ...prev,
                [event.type as string]: "done",
              }));
            }
          });
        } catch (err) {
          if (mountedRef.current) {
            setPhase("idle");
            alert(err instanceof Error ? err.message : "Adaptation failed. Please try again.");
          }
          return;
        }

        // Save to localStorage
        const title = uploadData.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        saveLesson({
          id: lessonId,
          title,
          fileName: uploadData.fileName,
          fileType: uploadData.fileType as "pdf" | "image" | "text",
          originalContent: uploadData.rawContent,
          adaptations: adaptations as never,
          status: "ready",
          createdAt: new Date().toISOString(),
        });
      }

      await new Promise((r) => setTimeout(r, 500));
      if (mountedRef.current) {
        setPhase("done");
        router.push(`/lesson/${lessonId}`);
      }
    },
    [router]
  );

  const handleTryDemo = () => {
    router.push(`/lesson/${DEMO_LESSON_ID}`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        alert("File too large. Maximum size is 25MB.");
      } else if (error?.code === "file-invalid-type") {
        alert("Invalid file type. Accepted: PDF, PNG, JPG, WEBP.");
      } else {
        alert(error?.message ?? "File rejected.");
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    disabled: isWorking,
  });

  // --- Upload / Extraction progress view ---
  if (phase === "uploading" || phase === "received" || phase === "saving" || phase === "extracting") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-6"
      >
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-1">
              {phase === "extracting"
                ? "Reading your document with AI..."
                : "Preparing your lesson..."}
            </h3>
            <p className="text-sm text-muted-foreground">
              {statusMessage}
            </p>
          </div>

          {/* Elapsed timer */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Elapsed: {formatElapsed(elapsed)}</span>
          </div>

          {/* Step indicators */}
          <div className="w-full max-w-xs space-y-2">
            {([
              { activePhases: ["uploading", "received", "saving"] as const, label: "Upload file", order: 0 },
              { activePhases: ["extracting"] as const, label: "Extract text with Nova AI", order: 1 },
              { activePhases: [] as const, label: "Generate 6 adaptations", order: 2 },
            ]).map((step) => {
              const phaseOrder: Record<string, number> = {
                uploading: 0, received: 0, saving: 0,
                extracting: 1,
                adapting: 2,
              };
              const currentOrder = phaseOrder[phase] ?? -1;
              const isDone = currentOrder > step.order;
              const isActive = step.activePhases.some((p) => p === phase);

              return (
                <div key={step.label} className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      isDone
                        ? "text-muted-foreground line-through"
                        : isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // --- Adaptation progress view ---
  if (phase === "adapting") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-6"
      >
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-1">
            Generating 6 lesson versions...
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Elapsed: {formatElapsed(elapsed)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_ADAPTATION_TYPES.map((type) => {
            const meta = ADAPTATION_META[type];
            const status = adaptationProgress[type];
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border p-3"
                style={{
                  borderColor:
                    status === "done"
                      ? meta.color
                      : "hsl(var(--border))",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="text-sm font-medium">{meta.label}</span>
                </div>
                {status === "pending" && (
                  <div className="text-xs text-muted-foreground">Waiting...</div>
                )}
                {status === "generating" && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" style={{ color: meta.color }} />
                    <span className="text-xs" style={{ color: meta.color }}>
                      Generating...
                    </span>
                  </div>
                )}
                {status === "done" && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" style={{ color: meta.color }} />
                    <span className="text-xs" style={{ color: meta.color }}>
                      Ready!
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // --- Default: Dropzone ---
  return (
    <div className={`w-full ${compact ? "max-w-md" : "max-w-2xl"} mx-auto`}>
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
          ${isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50"
          }
          ${compact ? "p-6" : "p-10"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          {isDragActive ? (
            <p className="text-lg font-medium">Drop your lesson here!</p>
          ) : (
            <>
              <div>
                <p className={`font-medium ${compact ? "text-base" : "text-lg"}`}>
                  Drag & drop your lesson file
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, PNG, JPG, or WEBP (max 25MB)
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>PDF</span>
                <span className="text-muted-foreground/50">|</span>
                <ImageIcon className="h-3 w-3" />
                <span>Images</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleTryDemo}
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
        >
          Or try with demo content (Water Cycle lesson)
        </button>
      </div>
    </div>
  );
}
