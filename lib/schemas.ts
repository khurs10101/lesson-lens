import { z } from "zod";
import type { AdaptationType } from "@/types";

// ---------------------------------------------------------------------------
// Zod schemas for AI-generated adaptation content
// Uses .default() for optional fields so partial AI output still validates
// ---------------------------------------------------------------------------

export const DyslexiaSchema = z.object({
  title: z.string().default("Untitled"),
  sections: z
    .array(
      z.object({
        heading: z.string().default(""),
        content: z.string().default(""),
        keyTerms: z.array(z.string()).default([]),
      })
    )
    .default([]),
  glossary: z
    .array(z.object({ term: z.string(), definition: z.string() }))
    .default([]),
  readingLevel: z.string().default(""),
});

export const ESLSchema = z.object({
  title: z.string().default("Untitled"),
  targetLanguage: z.string().default("Spanish"),
  sections: z
    .array(
      z.object({
        heading: z.string().default(""),
        englishContent: z.string().default(""),
        translatedContent: z.string().default(""),
        vocabularySpotlight: z
          .array(
            z.object({
              word: z.string(),
              definition: z.string(),
              translation: z.string().default(""),
              exampleSentence: z.string().default(""),
            })
          )
          .default([]),
      })
    )
    .default([]),
  translationNote: z.string().default(""),
});

export const VisualSchema = z.object({
  title: z.string().default("Untitled"),
  conceptMap: z
    .object({
      centralConcept: z.string().default("Main Concept"),
      nodes: z
        .array(
          z.object({
            id: z.string(),
            concept: z.string(),
            emoji: z.string().default(""),
            description: z.string().default(""),
            connections: z.array(z.string()).default([]),
          })
        )
        .default([]),
    })
    .default({ centralConcept: "Main Concept", nodes: [] }),
  timeline: z
    .array(
      z.object({
        step: z.number(),
        event: z.string(),
        description: z.string().default(""),
        emoji: z.string().default(""),
      })
    )
    .default([]),
  visualSections: z
    .array(
      z.object({
        heading: z.string().default(""),
        caption: z.string().default(""),
        diagramSuggestion: z.string().default(""),
      })
    )
    .default([]),
});

export const AudioSchema = z.object({
  title: z.string().default("Untitled"),
  estimatedDuration: z.string().default("5 minutes"),
  wordCount: z.number().default(0),
  script: z
    .array(
      z.object({
        type: z.enum(["intro", "section", "recap"]).default("section"),
        sectionTitle: z.string().optional(),
        text: z.string().default(""),
      })
    )
    .default([]),
});

export const ADHDSchema = z.object({
  title: z.string().default("Untitled"),
  bigPicture: z.string().default(""),
  totalCards: z.number().default(0),
  estimatedMinutes: z.number().default(0),
  cards: z
    .array(
      z.object({
        cardNumber: z.number(),
        heading: z.string().optional(),
        content: z.string().optional(),
        whyItMatters: z.string().optional(),
        estimatedMinutes: z.number().optional(),
        isQuizCard: z.boolean().default(false),
        question: z.string().optional(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
      })
    )
    .default([]),
});

export const GiftedSchema = z.object({
  title: z.string().default("Untitled"),
  prerequisiteCheck: z.string().default(""),
  deeperContext: z
    .array(z.object({ angle: z.string(), content: z.string() }))
    .default([]),
  realWorldApplications: z
    .array(z.object({ application: z.string(), description: z.string() }))
    .default([]),
  whatIfScenarios: z
    .array(z.object({ scenario: z.string(), thinkingPrompt: z.string() }))
    .default([]),
  socraticQuestions: z.array(z.string()).default([]),
  rabbitHole: z
    .object({
      topic: z.string().default(""),
      searchTerms: z.array(z.string()).default([]),
      suggestedResources: z.array(z.string()).default([]),
    })
    .default({ topic: "", searchTerms: [], suggestedResources: [] }),
  challengeActivity: z
    .object({
      title: z.string().default(""),
      description: z.string().default(""),
      estimatedTime: z.string().default(""),
    })
    .default({ title: "", description: "", estimatedTime: "" }),
});

// ---------------------------------------------------------------------------
// Schema lookup by adaptation type
// ---------------------------------------------------------------------------

const SCHEMAS: Record<AdaptationType, z.ZodType> = {
  dyslexia: DyslexiaSchema,
  esl: ESLSchema,
  visual: VisualSchema,
  audio: AudioSchema,
  adhd: ADHDSchema,
  gifted: GiftedSchema,
};

/**
 * Validate and coerce AI-generated content against the expected schema.
 * Returns the validated (and default-filled) content, or throws with details.
 */
export function validateAdaptation(
  type: AdaptationType,
  data: unknown
): unknown {
  const schema = SCHEMAS[type];
  return schema.parse(data);
}
