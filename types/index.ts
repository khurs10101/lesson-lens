export type AdaptationType =
  | "dyslexia"
  | "esl"
  | "visual"
  | "audio"
  | "adhd"
  | "gifted";

export const ALL_ADAPTATION_TYPES: AdaptationType[] = [
  "dyslexia",
  "esl",
  "visual",
  "audio",
  "adhd",
  "gifted",
];

export interface Lesson {
  id: string;
  title: string;
  fileName: string;
  fileType: "pdf" | "image" | "text";
  originalContent: string;
  adaptations: Partial<Record<AdaptationType, AdaptationResult>>;
  createdAt: string;
  status: "uploading" | "processing" | "ready" | "error";
}

export interface AdaptationResult {
  type: AdaptationType;
  content:
    | DyslexiaContent
    | ESLContent
    | VisualContent
    | AudioContent
    | ADHDContent
    | GiftedContent;
  generatedAt: string;
  status: "pending" | "generating" | "ready" | "error";
}

// --- Dyslexia ---
export interface DyslexiaContent {
  title: string;
  sections: {
    heading: string;
    content: string;
    keyTerms: string[];
  }[];
  glossary: { term: string; definition: string }[];
  readingLevel: string;
}

// --- ESL ---
export interface ESLContent {
  title: string;
  targetLanguage: string;
  sections: {
    heading: string;
    englishContent: string;
    translatedContent: string;
    vocabularySpotlight: {
      word: string;
      definition: string;
      translation: string;
      exampleSentence: string;
    }[];
  }[];
  translationNote: string;
}

// --- Visual ---
export interface VisualContent {
  title: string;
  conceptMap: {
    centralConcept: string;
    nodes: {
      id: string;
      concept: string;
      emoji: string;
      description: string;
      connections: string[];
    }[];
  };
  timeline: {
    step: number;
    event: string;
    description: string;
    emoji: string;
  }[];
  visualSections: {
    heading: string;
    caption: string;
    diagramSuggestion: string;
  }[];
}

// --- Audio ---
export interface AudioContent {
  title: string;
  estimatedDuration: string;
  wordCount: number;
  script: {
    type: "intro" | "section" | "recap";
    sectionTitle?: string;
    text: string;
  }[];
}

// --- ADHD ---
export interface ADHDCard {
  cardNumber: number;
  heading?: string;
  content?: string;
  whyItMatters?: string;
  estimatedMinutes?: number;
  isQuizCard: boolean;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface ADHDContent {
  title: string;
  bigPicture: string;
  totalCards: number;
  estimatedMinutes: number;
  cards: ADHDCard[];
}

// --- Gifted ---
export interface GiftedContent {
  title: string;
  prerequisiteCheck: string;
  deeperContext: {
    angle: string;
    content: string;
  }[];
  realWorldApplications: {
    application: string;
    description: string;
  }[];
  whatIfScenarios: {
    scenario: string;
    thinkingPrompt: string;
  }[];
  socraticQuestions: string[];
  rabbitHole: {
    topic: string;
    searchTerms: string[];
    suggestedResources: string[];
  };
  challengeActivity: {
    title: string;
    description: string;
    estimatedTime: string;
  };
}

// --- Adaptation metadata ---
export const ADAPTATION_META: Record<
  AdaptationType,
  {
    label: string;
    color: string;
    emoji: string;
    description: string;
  }
> = {
  dyslexia: {
    label: "Dyslexia-Friendly",
    color: "#6366f1",
    emoji: "📖",
    description: "Simplified sentences, short paragraphs, key terms highlighted",
  },
  esl: {
    label: "ESL/ELL Bilingual",
    color: "#10b981",
    emoji: "🌍",
    description: "Side-by-side English + translated version",
  },
  visual: {
    label: "Visual Learner",
    color: "#f59e0b",
    emoji: "🎨",
    description: "Concept maps, timelines, illustrated narrative",
  },
  audio: {
    label: "Audio Learner",
    color: "#ec4899",
    emoji: "🎧",
    description: "Audio narration script optimized for listening",
  },
  adhd: {
    label: "ADHD-Friendly",
    color: "#ef4444",
    emoji: "⚡",
    description: "Micro-chunked cards, progress steps, mini-quizzes",
  },
  gifted: {
    label: "Gifted/Advanced",
    color: "#8b5cf6",
    emoji: "🚀",
    description: "Deeper context, Socratic questions, challenge activities",
  },
};
