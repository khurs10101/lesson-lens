"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lesson, ADAPTATION_META, ALL_ADAPTATION_TYPES } from "@/types";
import { getAllLessons } from "@/lib/storage";
import { IS_AUTH_ENABLED } from "@/lib/flags";
import UploadZone from "@/components/UploadZone";
import Navbar from "@/components/Navbar";
import { Plus, FileText, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (IS_AUTH_ENABLED && status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (IS_AUTH_ENABLED && status !== "authenticated") return;
    setLessons(getAllLessons());
  }, [status]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this lesson?")) return;
    setDeleting(id);
    const { deleteLesson } = await import("@/lib/storage");
    deleteLesson(id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  }

  if (IS_AUTH_ENABLED && status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        backHref="/"
        rightSlot={
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                New Lesson
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Upload Your Lesson</DialogTitle>
              </DialogHeader>
              <UploadZone />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Lessons</h1>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No lessons yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your first lesson to get started
            </p>
            <Button onClick={() => setUploadOpen(true)}>Upload a Lesson</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] group"
                  onClick={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{lesson.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {lesson.fileName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => handleDelete(lesson.id, e)}
                          disabled={deleting === lesson.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete lesson"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>

                    {/* Adaptation status dots */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {ALL_ADAPTATION_TYPES.map((type) => {
                        const meta = ADAPTATION_META[type];
                        const adaptation = lesson.adaptations[type];
                        const isReady = adaptation?.status === "ready";
                        return (
                          <div
                            key={type}
                            title={`${meta.label}: ${isReady ? "Ready" : "Pending"}`}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{
                              backgroundColor: isReady
                                ? meta.color
                                : "hsl(var(--muted))",
                              color: isReady
                                ? "white"
                                : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {meta.emoji}
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
