"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ESLContent } from "@/types";

interface BilingualViewProps {
  content: ESLContent;
}

export default function BilingualView({ content }: BilingualViewProps) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [expandedVocab, setExpandedVocab] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-esl text-esl">
            CEFR A2-B1
          </Badge>
          <Badge variant="outline" className="border-esl text-esl">
            English + {content.targetLanguage}
          </Badge>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm text-esl hover:underline"
        >
          {showTranslation ? "Hide" : "Show"} {content.targetLanguage}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {content.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-esl/20 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-esl text-lg">
                  {section.heading}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-4 ${showTranslation ? "md:grid-cols-2" : "grid-cols-1"}`}>
                  {/* English */}
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      English
                    </div>
                    <p className="text-sm leading-relaxed">
                      {section.englishContent}
                    </p>
                  </div>
                  {/* Translation */}
                  {showTranslation && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="md:border-l md:pl-4 border-esl/20"
                    >
                      <div className="text-xs font-semibold text-esl mb-2 uppercase tracking-wider">
                        {content.targetLanguage}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {section.translatedContent}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Vocabulary Spotlight */}
                {section.vocabularySpotlight.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-esl/10">
                    <div className="text-xs font-semibold text-esl mb-2">
                      Vocabulary Spotlight
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.vocabularySpotlight.map((vocab) => (
                        <div key={vocab.word} className="relative">
                          <button
                            onClick={() =>
                              setExpandedVocab(
                                expandedVocab === vocab.word ? null : vocab.word
                              )
                            }
                            className="px-2 py-1 rounded-md text-xs font-medium bg-esl/10 text-esl hover:bg-esl/20 transition-colors"
                          >
                            {vocab.word}
                          </button>
                          {expandedVocab === vocab.word && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-10 top-full left-0 mt-1 p-3 rounded-lg bg-card border shadow-lg min-w-[250px]"
                            >
                              <p className="text-xs font-semibold text-esl">
                                {vocab.word}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {vocab.definition}
                              </p>
                              <p className="text-xs mt-1">
                                <span className="font-medium">{content.targetLanguage}:</span>{" "}
                                {vocab.translation}
                              </p>
                              <p className="text-xs mt-1 italic text-muted-foreground">
                                &quot;{vocab.exampleSentence}&quot;
                              </p>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Translation Note */}
      {content.translationNote && (
        <p className="text-xs text-muted-foreground italic text-center">
          {content.translationNote}
        </p>
      )}
    </div>
  );
}
