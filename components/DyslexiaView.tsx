"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DyslexiaContent } from "@/types";

interface DyslexiaViewProps {
  content: DyslexiaContent;
}

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl",
};

export default function DyslexiaView({ content }: DyslexiaViewProps) {
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-dyslexia text-dyslexia"
          >
            {content.readingLevel}
          </Badge>
          <Badge variant="outline" className="border-dyslexia text-dyslexia">
            OpenDyslexic Font
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Font size:</span>
          {(["small", "medium", "large"] as FontSize[]).map((size) => (
            <Button
              key={size}
              variant={fontSize === size ? "default" : "outline"}
              size="sm"
              onClick={() => setFontSize(size)}
              className="h-7 px-2 text-xs"
            >
              {size === "small" ? "S" : size === "medium" ? "M" : "L"}
            </Button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {content.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className="border-dyslexia/20 bg-amber-50 dark:bg-amber-950/20"
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-dyslexia"
                  style={{ fontFamily: "OpenDyslexic, sans-serif" }}
                >
                  {section.heading}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`${FONT_SIZES[fontSize]} text-gray-800 dark:text-gray-200 whitespace-pre-line`}
                  style={{
                    fontFamily: "OpenDyslexic, sans-serif",
                    lineHeight: 2,
                    letterSpacing: "0.12em",
                  }}
                >
                  {section.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j} className="text-dyslexia">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
                {section.keyTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {section.keyTerms.map((term) => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="bg-dyslexia/10 text-dyslexia text-xs"
                        style={{ fontFamily: "OpenDyslexic, sans-serif" }}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Glossary */}
      {content.glossary.length > 0 && (
        <Card className="border-dyslexia/20 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle
              className="text-dyslexia"
              style={{ fontFamily: "OpenDyslexic, sans-serif" }}
            >
              Key Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {content.glossary.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-2"
                  style={{
                    fontFamily: "OpenDyslexic, sans-serif",
                    lineHeight: 1.8,
                    letterSpacing: "0.08em",
                  }}
                >
                  <span className="font-bold text-dyslexia min-w-[120px]">
                    {item.term}:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{item.definition}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
