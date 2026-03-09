"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Search, Lightbulb, HelpCircle, FlaskConical } from "lucide-react";
import { GiftedContent } from "@/types";

interface GiftedViewProps {
  content: GiftedContent;
}

export default function GiftedView({ content }: GiftedViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Prerequisite */}
      <div className="p-3 rounded-lg bg-gifted/5 border border-gifted/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-gifted">Prerequisite:</span>{" "}
          {content.prerequisiteCheck}
        </p>
      </div>

      {/* Deeper Context */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-gifted" />
          Go Deeper
        </h3>
        {content.deeperContext.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-gifted/20">
              <button
                onClick={() => toggleSection(i)}
                className="w-full text-left"
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-gifted text-gifted text-xs"
                      >
                        {item.angle}
                      </Badge>
                    </div>
                    {expandedSections[i] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </button>
              <AnimatePresence>
                {expandedSections[i] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="pt-0 pb-4 px-4">
                      <p className="text-sm leading-relaxed">{item.content}</p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Real-World Applications */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gifted" />
          Real-World Applications
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {content.realWorldApplications.map((app, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-gifted/20 h-full">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold text-gifted">
                    {app.application}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {app.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What If Scenarios */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-gifted" />
          What If...?
        </h3>
        {content.whatIfScenarios.map((scenario, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-l-4 border-l-gifted border-gifted/20">
              <CardContent className="py-3 px-4">
                <p className="text-sm font-medium">{scenario.scenario}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {scenario.thinkingPrompt}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Socratic Questions */}
      <Card className="border-gifted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gifted">
            Socratic Discussion Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {content.socraticQuestions.map((question, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-bold text-gifted flex-shrink-0">
                  {i + 1}.
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Research Rabbit Hole */}
      <Card className="border-gifted/20 bg-gifted/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-gifted" />
            <span className="text-gifted">Research Rabbit Hole</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium mb-2">{content.rabbitHole.topic}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {content.rabbitHole.searchTerms.map((term) => (
              <Badge
                key={term}
                variant="outline"
                className="border-gifted text-gifted text-xs"
              >
                {term}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Suggested resources: {content.rabbitHole.suggestedResources.join(", ")}
          </p>
        </CardContent>
      </Card>

      {/* Challenge Activity */}
      <Card className="border-2 border-gifted/30 bg-gifted/5">
        <CardContent className="pt-6">
          <Badge className="bg-gifted text-white mb-3">Challenge Activity</Badge>
          <h4 className="text-base font-bold">{content.challengeActivity.title}</h4>
          <p className="text-sm text-muted-foreground mt-2">
            {content.challengeActivity.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Estimated time: {content.challengeActivity.estimatedTime}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
