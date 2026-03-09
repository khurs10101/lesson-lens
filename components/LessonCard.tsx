"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ADHDContent } from "@/types";

interface LessonCardProps {
  content: ADHDContent;
}

export default function LessonCard({ content }: LessonCardProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [direction, setDirection] = useState(1);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    };
  }, []);

  const totalCards = content.cards.length;
  const card = content.cards[currentCard];
  if (!card) return null;
  const progressPercent = ((currentCard + 1) / totalCards) * 100;

  const goNext = () => {
    if (currentCard < totalCards - 1) {
      setDirection(1);
      setCurrentCard(currentCard + 1);
      setSelectedAnswer(null);
    }
  };

  const goPrev = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(currentCard - 1);
      setSelectedAnswer(null);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === card.correctAnswer) {
      setShowConfetti(true);
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Big Picture */}
      {currentCard === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-lg bg-adhd/10 border border-adhd/20"
        >
          <p className="text-xs font-semibold text-adhd mb-1">The Big Picture</p>
          <p className="text-sm">{content.bigPicture}</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Card {currentCard + 1} of {totalCards}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>~{content.estimatedMinutes} min total</span>
        </div>
      </div>
      <Progress value={progressPercent} className="h-2" />

      {/* Card */}
      <div className="relative min-h-[280px]">
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#ec4899"][i % 5],
                  left: `${10 + Math.random() * 80}%`,
                }}
                initial={{ top: "0%", rotate: 0, opacity: 1 }}
                animate={{
                  top: "100%",
                  rotate: 720,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.3,
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCard}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-adhd/30 shadow-lg">
              <CardContent className="pt-6">
                {card.isQuizCard ? (
                  /* Quiz Card */
                  <div className="space-y-4">
                    <Badge className="bg-adhd text-white">Quick Quiz!</Badge>
                    <p className="text-base font-medium">{card.question}</p>
                    <div className="space-y-2">
                      {card.options?.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === card.correctAnswer;
                        const showResult = selectedAnswer !== null;
                        return (
                          <button
                            key={option}
                            onClick={() => !selectedAnswer && handleAnswer(option)}
                            disabled={selectedAnswer !== null}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                              showResult && isCorrect
                                ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                                : showResult && isSelected && !isCorrect
                                ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                                : "border-border hover:border-adhd/50 hover:bg-adhd/5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {showResult && isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedAnswer && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground bg-muted p-2 rounded"
                      >
                        {card.explanation}
                      </motion.p>
                    )}
                  </div>
                ) : (
                  /* Content Card */
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-adhd">
                      {card.heading}
                    </h3>
                    <p className="text-sm leading-relaxed">{card.content}</p>
                    {card.whyItMatters && (
                      <div className="p-3 rounded-lg bg-adhd/5 border border-adhd/10">
                        <p className="text-xs font-semibold text-adhd mb-0.5">
                          Why does this matter?
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {card.whyItMatters}
                        </p>
                      </div>
                    )}
                    {card.estimatedMinutes && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>~{card.estimatedMinutes} min</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentCard === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-1">
          {content.cards.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentCard
                  ? "bg-adhd"
                  : i < currentCard
                  ? "bg-adhd/40"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          onClick={goNext}
          disabled={currentCard === totalCards - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
