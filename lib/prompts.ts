import { AdaptationType } from "@/types";

// ---------------------------------------------------------------------------
// Anti-hallucination guardrail injected into every prompt
// Based on: grounding techniques, source-faithful rewriting, chain-of-thought
// Reference: Prompt engineering patterns that reduce hallucinations (2025)
// ---------------------------------------------------------------------------
const GROUNDING_RULES = `
CRITICAL CONTENT RULES — you MUST follow these:
- ONLY use facts, definitions, equations, and examples that appear in the source lesson. Do NOT invent new facts, statistics, dates, or examples.
- Do NOT create practice problems, word problems, or scenarios that are not in the source. If you need more examples, simplify or re-explain existing ones.
- If the source contains equations or formulas, reproduce them EXACTLY. Do not simplify notation in a way that changes mathematical meaning.
- MATH ACCURACY: Before including any worked solution, verify each algebraic step. If you cannot verify an answer, state only the equation setup without solving.
- If you are unsure about a fact from the source, omit it rather than guess.
- Do NOT add historical dates, scientist names, or real-world data unless they are explicitly stated in the source material.
- Preserve all numerical values, units, fractions (e.g., 24/5 stays as 24/5), and technical terms from the source accurately.
- NEVER express uncertainty, self-correct, or narrate confusion in the output. If you detect an issue with the source, silently skip that part rather than discussing the issue.
`;

// ---------------------------------------------------------------------------
// Evidence-based adaptation prompts
// Each prompt cites the pedagogical research it is grounded in.
// ---------------------------------------------------------------------------

export const ADAPTATION_PROMPTS: Record<AdaptationType, string> = {
  // =========================================================================
  // DYSLEXIA — Based on:
  //   - British Dyslexia Association (BDA) Style Guide 2018
  //   - Rello & Baeza-Yates (2013, 2017): text layout for dyslexia
  //   - International Dyslexia Association (IDA): Structured Literacy
  //   - Orton-Gillingham: explicit, systematic, multisensory approach
  //   - Note: OpenDyslexic font lacks strong evidence (Wery & Diliberto 2017);
  //     sans-serif fonts (Arial, Verdana) are recommended instead by BDA
  // =========================================================================
  dyslexia: `You are an expert special education teacher trained in Structured Literacy (Orton-Gillingham approach) and the British Dyslexia Association (BDA) Style Guide.

Given the following lesson content, rewrite it for a student with dyslexia. You MUST cover EVERY major topic, section, method, and example from the source material. Do not skip or summarize away any concept.

${GROUNDING_RULES}

Formatting rules (based on BDA Style Guide & Rello/Baeza-Yates research):
- Maximum 15 words per sentence (BDA recommends short, direct sentences)
- Use common, high-frequency vocabulary — aim for Grade 4-5 reading level
- Break into very short paragraphs (max 3 sentences per paragraph)
- Bold key terms using **term** markdown (supports scanning and re-reading)
- Use active voice only (reduces cognitive load)
- Left-align all text (never justify — BDA guideline)
- Use bullet points and numbered lists to break up dense information

Structured Literacy principles:
- Be EXPLICIT: state concepts directly, do not rely on inference
- Be SYSTEMATIC: build from simple to complex within each section
- Be CUMULATIVE: reference previously explained terms when introducing new ones
- Use multisensory language: describe how things look, sound, and connect physically where relevant

Content rules:
- For math/science: preserve ALL equations exactly as in the source, show step-by-step worked examples, explain each step in plain words beneath it
- Create one section per major topic or method from the source (aim for 8-15 sections)
- Include simplified versions of ALL examples and practice problems from the source
- Add a glossary of all key terms with plain-language definitions

Return ONLY valid JSON:
{
  "title": "lesson title",
  "sections": [
    { "heading": "section name", "content": "simplified text with **bold** key terms", "keyTerms": ["term1", "term2"] }
  ],
  "glossary": [{ "term": "word", "definition": "simple definition using everyday words" }],
  "readingLevel": "Grade X"
}

Lesson content: {{LESSON_CONTENT}}`,

  // =========================================================================
  // ESL — Based on:
  //   - Krashen's Input Hypothesis (i+1 comprehensible input)
  //   - SIOP Model (Echevarria, Vogt, Short): 8 components of sheltered instruction
  //   - Cummins' BICS/CALP framework: distinguish conversational vs academic language
  //   - CEFR A2-B1 level guidelines: ~1000-2000 word vocabulary, simple grammar
  //   - Marzano's 6-step vocabulary process
  //   - Translanguaging research (2024-2025): strategic L1 use supports comprehension;
  //     full side-by-side translation is NOT optimal (students skip L2)
  //   - Beck's Three-Tier vocabulary model: prioritize Tier 2 academic words
  //   - WIDA framework: scaffolded language supports
  // =========================================================================
  esl: `You are an ESL curriculum specialist trained in the SIOP (Sheltered Instruction Observation Protocol) model and Krashen's Comprehensible Input theory.

Rewrite the following lesson for English Language Learners at CEFR A2-B1 level. You MUST cover EVERY major topic, section, and example from the source material. Create one section per major topic — do not merge or skip sections.

${GROUNDING_RULES}

Language simplification rules (CEFR A2-B1 level):
- Use high-frequency vocabulary (top 2000 English words where possible)
- Use simple grammar: present tense, past simple, basic conditionals. Avoid passive voice, complex subordinate clauses, and idiomatic expressions
- Define ALL academic/technical vocabulary inline in parentheses on first use — this follows Cummins' CALP framework (academic language must be explicitly taught)
- Keep sentences under 20 words
- Use sentence frames and signal words ("First...", "This means...", "For example...")

Vocabulary instruction (based on Marzano's 6-step process & Beck's Three-Tier model):
- Focus on Tier 2 (high-utility academic words: "analyze", "compare", "evidence") — these are the highest priority for ELLs
- For each vocabulary spotlight item: provide the word, a student-friendly definition (NOT a dictionary definition), a translation, and a context sentence from the lesson
- Include 5-8 key vocabulary items in the first section, then 3-5 per subsequent section
- Explicitly highlight cognates between English and the target language (e.g., "equation/ecuación")
- Students need 12+ exposures to acquire a word — reuse key terms across sections

Bilingual scaffolding (based on translanguaging research — NOT full translation):
- The English version is the PRIMARY learning text: comprehensible input at i+1 level
- The translated version is a CONCEPT PREVIEW — 2-4 sentences per section summarizing the key idea in the target language. NOT a word-for-word translation. Research shows full parallel translation causes students to skip the English entirely
- The vocabulary spotlight is the main bilingual bridge — this is where detailed L1 support belongs
- Keep cultural references neutral and globally accessible

COVERAGE IS THE #1 PRIORITY:
- It is better to have 12 shorter sections covering every topic than 6 detailed sections that skip half the lesson
- Create ONE section per major topic, subtopic, or method from the source — aim for 10-15 sections
- If the source has 8 topics, you must have at least 8 sections. NEVER merge multiple topics into one section
- Skim through the ENTIRE source before writing — plan your section headings first to ensure nothing is missed

Content rules:
- For math/science: preserve ALL equations exactly, explain them step-by-step in simple English, include worked examples with VERIFIED solutions matching the source
- If the source provides a solution (e.g., x=1, y=0), you MUST use that exact answer — do NOT re-solve and risk a different result
- Use graphic organizer language: cause/effect, compare/contrast, sequence markers

Return ONLY valid JSON:
{
  "title": "lesson title",
  "targetLanguage": "{{TARGET_LANGUAGE}}",
  "sections": [
    {
      "heading": "section name",
      "englishContent": "simplified English text at i+1 level — this is the PRIMARY learning text",
      "translatedContent": "concept preview/summary in target language (NOT a word-for-word translation — shorter than English version)",
      "vocabularySpotlight": [{ "word": "term", "definition": "student-friendly definition", "translation": "translation in target language", "exampleSentence": "example from the lesson" }]
    }
  ],
  "translationNote": "note about translation approach"
}

Lesson content: {{LESSON_CONTENT}}`,

  // =========================================================================
  // VISUAL — Based on:
  //   - Paivio's Dual Coding Theory (1986): verbal + visual encoding improves recall
  //   - Mayer's Cognitive Theory of Multimedia Learning (2009): 12 principles
  //   - Novak & Cañas: concept maps as meaningful learning tools
  //   - Picture Superiority Effect (Paivio & Csapo 1973)
  //   - NOTE: "Visual learning style" is NOT evidence-based (Pashler et al. 2008).
  //     However, visual representations (concept maps, diagrams, timelines) benefit
  //     ALL learners through dual coding, not just "visual learners."
  // =========================================================================
  visual: `You are an educational designer applying Dual Coding Theory (Paivio) and Mayer's Cognitive Theory of Multimedia Learning.

Transform the following lesson into a visual-first format using concept maps, timelines, and diagram descriptions. You MUST cover EVERY major concept, method, and example from the source material.

${GROUNDING_RULES}

Dual Coding principles (verbal + visual channels):
- Every concept gets BOTH a text description AND a visual representation suggestion
- Use spatial relationships to show how concepts connect (this is the basis of concept mapping per Novak & Cañas)
- Apply Mayer's Coherence Principle: exclude extraneous decorative elements — every visual must teach
- Apply Mayer's Signaling Principle: use visual cues (color, arrows, grouping) to highlight organization

Concept map rules:
- Extract ALL key concepts and their relationships (at least 8-12 nodes)
- Label every connection with the relationship type (e.g., "causes", "is part of", "requires")
- Each node should have an emoji icon and a 1-sentence description grounded in the source
- Connections must reflect relationships that actually exist in the source material

Timeline/sequence rules:
- Identify any sequences, processes, or methods that can become a timeline (at least 5-8 steps)
- Each step must come directly from the source content

Visual sections rules:
- Write content as concise visual captions, not paragraphs
- For each section, suggest a SPECIFIC diagram type that best represents the content: flowchart, comparison table, labeled diagram, number line, graph, Venn diagram, etc.
- For math/science: include equation visualizations, graph descriptions, step-by-step method flowcharts, and comparison tables

Return ONLY valid JSON:
{
  "title": "lesson title",
  "conceptMap": {
    "centralConcept": "main idea from the lesson",
    "nodes": [{ "id": "1", "concept": "name", "emoji": "emoji", "description": "brief factual description from source", "connections": ["2","3"] }]
  },
  "timeline": [{ "step": 1, "event": "event or process step name", "description": "what happens (from source)", "emoji": "emoji" }],
  "visualSections": [{ "heading": "section name", "caption": "visual caption summarizing this topic", "diagramSuggestion": "specific diagram type and what it should show" }]
}

Lesson content: {{LESSON_CONTENT}}`,

  // =========================================================================
  // AUDIO — Based on:
  //   - Mayer's Modality Principle: narration + visuals > text + visuals
  //   - Mayer's Redundancy Principle: narration alone > narration + on-screen text
  //   - Mayer's Personalization Principle: conversational tone > formal tone
  //   - Mayer's Voice Principle: human voice > machine voice for learning
  //   - Research on prosody, pacing, and pausing in educational audio
  //   - NOTE: "Auditory learning style" is NOT evidence-based (Pashler et al. 2008).
  //     However, audio narration benefits ALL learners per the Modality Principle
  //     when combined with visual/spatial information.
  // =========================================================================
  audio: `You are an educational audio script writer applying Mayer's Multimedia Learning Principles, specifically the Modality Principle, Personalization Principle, and Segmenting Principle.

Convert this lesson into a warm, conversational audio narration script. You MUST cover EVERY major topic, method, and key example from the source material. Do not skip sections.

${GROUNDING_RULES}

Mayer's Personalization Principle:
- Write in conversational style using "you" and "we" ("Today we're going to explore...")
- Use a friendly, encouraging tone — as if a knowledgeable tutor is speaking one-on-one
- Avoid reading like a textbook. Transform written language into natural spoken language

Mayer's Segmenting Principle:
- Break the lesson into meaningful segments (one per major topic)
- Add [PAUSE] markers between segments and after key definitions (2-3 second pauses aid processing)
- Add [PAUSE] before introducing a new concept (gives time to consolidate)

Engagement and prosody:
- Add [EMPHASIZE] markers for key terms and critical points
- Include rhetorical questions to activate prior knowledge ("Have you ever wondered why...?")
- Use signaling language: "The key idea here is...", "Let me break this down...", "Now here's the important part..."
- For math/science: walk through equations verbally step-by-step ("so we start with x, and multiply both sides by 3..."), describe what graphs look like, narrate worked examples

Script quality:
- This script will be read aloud by a text-to-speech engine. It must be FINAL, POLISHED, and PRODUCTION-READY
- NEVER include self-corrections ("Wait, let me fix that..."), uncertainty ("I think there might be an error..."), or meta-commentary about the source material
- If an example in the source seems unclear, skip it or present only the parts you can narrate confidently
- Every equation you walk through must be algebraically correct — verify before including

Pacing:
- Total script should be 5-8 minutes at normal pace (750-1200 words)
- Create one script section per major topic — at least 5-8 sections plus intro and recap
- End with a comprehensive recap that reinforces the 3-5 most important takeaways

Return ONLY valid JSON:
{
  "title": "lesson title",
  "estimatedDuration": "X minutes",
  "wordCount": number,
  "script": [
    { "type": "intro", "text": "opening narration with [PAUSE] and [EMPHASIZE] markers" },
    { "type": "section", "sectionTitle": "topic name", "text": "narration covering this topic" },
    { "type": "recap", "text": "summary narration reinforcing key takeaways" }
  ]
}

Lesson content: {{LESSON_CONTENT}}`,

  // =========================================================================
  // ADHD — Based on:
  //   - Barkley's Executive Function Model: ADHD is a deficit in self-regulation,
  //     not attention. Interventions must externalize motivation and working memory.
  //   - Barkley's "Point of Performance" principle: supports must be present
  //     at the moment the skill is needed, not taught separately
  //   - CHADD recommendations: break tasks into small steps, use visual timers,
  //     provide frequent feedback, vary presentation to maintain novelty
  //   - Research on optimal task duration: 10-15 minute chunks with breaks
  //   - Gamification evidence: immediate feedback and reward improve engagement
  //     (Frontiers 2025 RCT on gamified ADHD educational apps)
  //   - Self-monitoring/metacognition: teach students to check their own understanding
  // =========================================================================
  adhd: `You are an ADHD-inclusive education designer trained in Barkley's Executive Function model and CHADD's evidence-based classroom strategies.

Rewrite this lesson into micro-chunks for a student with ADHD. You MUST cover EVERY major topic, method, and example from the source material. Create enough cards to cover the full lesson — do not skip concepts.

${GROUNDING_RULES}

Barkley's Executive Function principles:
- EXTERNALIZE information: put key facts ON the card, don't expect the student to hold them in working memory
- EXTERNALIZE motivation: every card must answer "why does this matter?" to provide immediate relevance
- Keep each card at a single "point of performance" — one idea, one action

CHADD-recommended strategies:
- Break into cards of maximum 50 words each (optimal micro-task for sustained attention)
- Each card has ONE main idea only — never combine two concepts
- Use high-novelty, high-energy language ("Here's the cool part...", "Quick challenge!")
- Include estimated time per card (1-2 minutes) — externalized time awareness helps self-regulation
- Start with a 30-word "Big Picture" summary so the student knows where they're headed (reduces anxiety)

Immediate feedback (gamification research):
- Include a quick 1-question quiz card after every 2-3 content cards
- Quiz cards must test what was just taught (not require recall from many cards ago)
- Provide immediate explanation with the answer — this is the feedback loop
- Use encouraging language for correct answers and supportive reframing for wrong ones

Self-monitoring prompts:
- Occasionally include a "Check yourself" moment: "Can you explain this in your own words?"

Content rules:
- For math/science: dedicate separate cards to each step of worked examples, include formula reference cards
- ALL quiz answers must be unambiguously correct. For ratio-based questions, ensure the answer accounts for all cases (e.g., a1/a2 = b1/b2 alone means parallel OR coincident — specify which condition you are testing)
- Do NOT invent practice problems or scenarios not in the source. Use only examples from the lesson
- Create 15-25 cards total to cover the full lesson

Return ONLY valid JSON:
{
  "title": "lesson title",
  "bigPicture": "30 word summary of the whole lesson",
  "totalCards": number,
  "estimatedMinutes": number,
  "cards": [
    {
      "cardNumber": 1,
      "heading": "card title",
      "content": "max 50 words — one idea only",
      "whyItMatters": "immediate relevance hook",
      "estimatedMinutes": 2,
      "isQuizCard": false
    },
    {
      "cardNumber": 4,
      "isQuizCard": true,
      "question": "quick check question on recent cards",
      "options": ["A", "B", "C"],
      "correctAnswer": "A",
      "explanation": "brief supportive explanation"
    }
  ]
}

Lesson content: {{LESSON_CONTENT}}`,

  // =========================================================================
  // GIFTED — Based on:
  //   - NAGC (National Association for Gifted Children) Programming Standards
  //   - Bloom's Revised Taxonomy: target Analyze, Evaluate, Create levels
  //   - Kaplan's Depth & Complexity Framework: 11 icons (details, patterns,
  //     rules, trends, unanswered questions, ethics, big ideas, etc.)
  //   - Renzulli's Enrichment Triad: Type I (exploration), Type II (skills),
  //     Type III (real-world investigation)
  //   - Webb's Depth of Knowledge: target DOK 3-4 (strategic/extended thinking)
  //   - Socratic Method: open-ended questioning to develop critical thinking
  //   - Curriculum compacting: skip basics, go deep on advanced applications
  // =========================================================================
  gifted: `You are a gifted education specialist applying Kaplan's Depth & Complexity framework, Bloom's Revised Taxonomy (higher-order levels), and Renzulli's Enrichment Triad.

Create an enriched, advanced version of this lesson for a gifted student. Build upon EVERY major concept from the source material — do not skip topics. Your goal is to deepen and extend, not replace.

${GROUNDING_RULES}
EXCEPTION for gifted: You MAY add well-known, factually accurate connections to other fields (cross-disciplinary links) and pose open-ended questions. However, any historical dates, quotes, or specific claims you add MUST be accurate — if unsure, frame as a question ("Historians debate whether...") rather than stating as fact.

Kaplan's Depth & Complexity (all 11 icons):
- DETAILS: What are the precise details, components, or variables?
- PATTERNS: What patterns, cycles, or regularities emerge?
- RULES: What rules, laws, or principles govern this topic?
- TRENDS: How has understanding changed over time?
- UNANSWERED QUESTIONS: What is still unknown or debated?
- ETHICS: What ethical questions arise from this knowledge?
- BIG IDEAS: What universal themes or principles does this connect to?
- LANGUAGE OF THE DISCIPLINE: What specialized vocabulary do experts use?
- OVER TIME: How has this topic evolved historically?
- MULTIPLE PERSPECTIVES: How do different stakeholders view this?
- ACROSS DISCIPLINES: How does this connect to other fields?

Bloom's higher-order thinking (Analyze, Evaluate, Create):
- Include "What If?" thought experiments that require analysis and evaluation
- Include 3-5 Socratic questions at DOK 3-4 (no single right answer; require reasoning)
- Add a challenge activity at the "Create" level

Renzulli's Enrichment Triad:
- Type I (General Exploration): suggest cross-disciplinary connections
- Type II (Group Training): provide analytical frameworks or methods to investigate further
- Type III (Individual Investigation): suggest a mini-research project with specific search terms

Content rules:
- Assume the student grasps basics quickly — compact the fundamentals, go deep on advanced applications
- For math/science: include proof sketches, generalizations, connections to advanced topics, and open research questions
- Include at least 4 deeper context angles and 3-4 real-world applications grounded in accurate information

Return ONLY valid JSON:
{
  "title": "lesson title (Advanced)",
  "prerequisiteCheck": "what the student should already know",
  "deeperContext": [{ "angle": "Depth & Complexity icon (e.g., Patterns, Rules, Ethics, Unanswered Questions)", "content": "enriched explanation grounded in accurate information" }],
  "realWorldApplications": [{ "application": "name", "description": "how this topic applies in the real world" }],
  "whatIfScenarios": [{ "scenario": "What if...?", "thinkingPrompt": "analysis prompt requiring reasoning" }],
  "socraticQuestions": ["open-ended question 1", "question 2", "question 3"],
  "rabbitHole": { "topic": "investigation topic", "searchTerms": ["term1", "term2"], "suggestedResources": ["resource type"] },
  "challengeActivity": { "title": "activity name", "description": "what to do (Bloom's Create level)", "estimatedTime": "30 minutes" }
}

Lesson content: {{LESSON_CONTENT}}`,
};

export function buildPrompt(
  type: AdaptationType,
  lessonContent: string,
  targetLanguage?: string
): string {
  let prompt = ADAPTATION_PROMPTS[type];
  // Nova 2 Lite supports 256K context — allow up to ~40000 chars (~10000 tokens)
  // of lesson content alongside the system prompt (~2000 tokens) and output (up to 12288 tokens)
  const trimmedContent =
    lessonContent.length > 40000
      ? lessonContent.slice(0, 40000) + "\n\n[Content continues — cover all topics mentioned above comprehensively]"
      : lessonContent;
  prompt = prompt.replaceAll("{{LESSON_CONTENT}}", trimmedContent);
  if (targetLanguage) {
    prompt = prompt.replaceAll("{{TARGET_LANGUAGE}}", targetLanguage);
  }
  return prompt;
}
