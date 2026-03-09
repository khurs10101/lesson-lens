"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ADAPTATION_META, ALL_ADAPTATION_TYPES } from "@/types";
import { DEMO_LESSON_ID } from "@/lib/demo-data";
import UploadZone from "@/components/UploadZone";
import { Upload, ArrowRight, Sparkles, Users, Clock, LogOut } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">LessonLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/methodology")}
            >
              Methodology
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Sign out"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Every Student Learns{" "}
              <span className="bg-gradient-to-r from-dyslexia via-audio to-gifted bg-clip-text text-transparent">
                Differently
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload one lesson. Get six differentiated versions instantly.
              Powered by Amazon Nova AI.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => router.push(`/lesson/${DEMO_LESSON_ID}`)}
              className="gap-2 text-base px-8 animate-pulse hover:animate-none"
            >
              Try the Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Upload Your Lesson
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 6 Adaptation Cards */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Six Ways to Learn
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_ADAPTATION_TYPES.map((type, i) => {
              const meta = ADAPTATION_META[type];
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Card
                    className="h-full border-l-4 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: meta.color }}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{meta.emoji}</span>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {meta.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">1 in 5</p>
              <p className="text-xs text-muted-foreground">
                students has a learning difference
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">10+ hrs/week</p>
              <p className="text-xs text-muted-foreground">
                teachers spend differentiating materials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">6 versions</p>
              <p className="text-xs text-muted-foreground">
                generated instantly from one upload
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload",
                desc: "Drop any PDF, image, or slide deck",
              },
              {
                step: "2",
                title: "AI Adapts",
                desc: "Amazon Nova generates 6 versions in parallel",
              },
              {
                step: "3",
                title: "Students Learn",
                desc: "Each student gets their ideal format",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * i }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>LessonLens</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by Amazon Nova | Built for the Amazon Nova Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
