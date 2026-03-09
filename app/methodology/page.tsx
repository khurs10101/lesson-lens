import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Globe,
  Eye,
  Headphones,
  Zap,
  Rocket,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Methodology - LessonLens",
  description:
    "Evidence-based research behind LessonLens adaptations. Learn how we ground every adaptation in peer-reviewed science.",
};

const sections = [
  {
    id: "grounding",
    icon: ShieldCheck,
    color: "#22c55e",
    title: "Anti-Hallucination Guardrails",
    subtitle: "How we keep AI-generated content faithful to your lesson",
    content: [
      {
        heading: "Source-Faithful Content Generation",
        text: "Every adaptation prompt includes strict grounding rules that instruct the AI to ONLY use facts, definitions, equations, and examples from your uploaded lesson. The AI is explicitly told not to invent dates, statistics, or examples. If the source contains equations, they must be reproduced exactly. This reduces hallucination rates by up to 36% based on prompt engineering research.",
      },
      {
        heading: "Zod Schema Validation",
        text: "After the AI generates content, every response passes through runtime validation using Zod schemas. This catches malformed output, missing required fields, and incorrect data types before content reaches your screen. Partially valid output is auto-corrected (missing arrays default to empty, missing strings to blank), while truly broken responses are flagged as errors.",
      },
    ],
    sources: [
      {
        label: "Prompt Engineering Patterns that Reduce Hallucinations (2025)",
        url: "https://www.researchgate.net/publication/394431721",
      },
      {
        label: "7 Prompt Engineering Tricks to Mitigate Hallucinations",
        url: "https://machinelearningmastery.com/7-prompt-engineering-tricks-to-mitigate-hallucinations-in-llms/",
      },
    ],
  },
  {
    id: "dyslexia",
    icon: BookOpen,
    color: "#6366f1",
    title: "Dyslexia-Friendly Adaptation",
    subtitle:
      "Based on BDA Style Guide, Rello & Baeza-Yates research, IDA Structured Literacy, and Orton-Gillingham",
    content: [
      {
        heading: "What the Research Says",
        text: "Dyslexia is a phonological processing deficit, not a visual or intelligence issue (IDA, 2025). The International Dyslexia Association recommends Structured Literacy — explicit, systematic, cumulative instruction. The British Dyslexia Association (BDA) Style Guide provides specific formatting parameters backed by eye-tracking research from Rello & Baeza-Yates (2013, 2017).",
      },
      {
        heading: "How We Apply It",
        text: "Our adaptation uses maximum 15-word sentences, high-frequency vocabulary at Grade 4-5 level, and bold key terms (never italic — BDA guideline). Content is chunked into short paragraphs (max 3 sentences) with bullet points and numbered lists. We follow Structured Literacy principles: EXPLICIT (state concepts directly), SYSTEMATIC (simple to complex), and CUMULATIVE (build on prior terms).",
      },
      {
        heading: "Formatting Guidelines",
        text: "Sans-serif fonts (Arial, Verdana — not OpenDyslexic, which lacks strong evidence per Wery & Diliberto 2017), 18px+ font size, 1.5-2.0 line height, increased letter spacing (+35% per Rello), left-aligned only (never justified), cream/pastel backgrounds (never pure white), and dark text for contrast.",
      },
      {
        heading: "What to Verify",
        text: "Check that: sentences are short and direct, key terms are bolded, content builds from simple to complex, all equations from the original are preserved exactly, and a glossary with plain-language definitions is included.",
      },
    ],
    sources: [
      {
        label: "BDA Dyslexia Style Guide 2023",
        url: "https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide",
      },
      {
        label:
          "Rello & Baeza-Yates (2017): How to Present More Readable Text for People with Dyslexia",
        url: "https://www.semanticscholar.org/paper/1fc82a287f510fe54ac8b4f20407b569c23e4852",
      },
      {
        label: "IDA: Structured Literacy — Effective Instruction",
        url: "https://dyslexiaida.org/structured-literacy-effective-instruction-for-students-with-dyslexia-and-related-reading-difficulties/",
      },
      {
        label:
          "Wery & Diliberto (2017): Effect of OpenDyslexic Font (PMC)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/",
      },
    ],
  },
  {
    id: "esl",
    icon: Globe,
    color: "#10b981",
    title: "ESL/ELL Bilingual Adaptation",
    subtitle:
      "Based on Krashen's i+1, SIOP Model, Cummins' BICS/CALP, CEFR A2-B1, Marzano, and translanguaging research",
    content: [
      {
        heading: "What the Research Says",
        text: "Krashen's Input Hypothesis states language is acquired through comprehensible input slightly above the learner's level (i+1). The SIOP Model provides 8 components for sheltered instruction. Cummins' BICS/CALP framework warns that conversational fluency (2-3 years) does NOT equal academic language proficiency (5-7 years). Translanguaging research (2024-2025) shows strategic L1 use supports comprehension, but full side-by-side translation causes students to skip the target language entirely.",
      },
      {
        heading: "How We Apply It",
        text: "English is the PRIMARY learning text at i+1 level with high-frequency vocabulary (top 2000 words), simple grammar (present/past tense, basic conditionals), and sentences under 20 words. The translated version is a concept preview/summary — NOT a word-for-word translation. The vocabulary spotlight is the main bilingual bridge, following Marzano's 6-step process and Beck's Three-Tier model (prioritizing Tier 2 academic words). Cognates are explicitly highlighted.",
      },
      {
        heading: "CEFR A2-B1 Level Parameters",
        text: "A2: ~1,000-2,500 word families, simple present/past, basic connectors (and, but, because). B1: ~2,000-3,250 word families, present perfect, second conditional, relative clauses. We target this range with controlled vocabulary and grammar structures.",
      },
      {
        heading: "What to Verify",
        text: "Check that: English content is comprehensible without the translation, academic vocabulary is defined inline in parentheses, vocabulary spotlight includes student-friendly definitions (not dictionary definitions), cognates are highlighted, and the translated content is a summary rather than a mirror of the English.",
      },
    ],
    sources: [
      {
        label:
          "Krashen: Principles and Practice in Second Language Acquisition (full text)",
        url: "https://www.sdkrashen.com/content/books/principles_and_practice.pdf",
      },
      {
        label: "SIOP Model — Center for Applied Linguistics",
        url: "https://www.cal.org/siop/",
      },
      {
        label:
          "Cummins' BICS/CALP Framework — Colorin Colorado",
        url: "https://www.colorincolorado.org/faq/what-are-bics-and-calp",
      },
      {
        label: "Translanguaging in ESL Classrooms (2025)",
        url: "https://www.tandfonline.com/doi/full/10.1080/19313152.2025.2585817",
      },
      {
        label: "Marzano: Six Steps to Better Vocabulary — ASCD",
        url: "https://www.ascd.org/el/articles/six-steps-to-better-vocabulary-instruction",
      },
    ],
  },
  {
    id: "visual",
    icon: Eye,
    color: "#f59e0b",
    title: "Visual/Dual Coding Adaptation",
    subtitle:
      'Based on Paivio\'s Dual Coding Theory, Mayer\'s Multimedia Principles, and Novak\'s concept maps — NOT "learning styles"',
    content: [
      {
        heading: "What the Research Says",
        text: 'Paivio\'s Dual Coding Theory (1986) demonstrates that information encoded in both verbal AND visual channels is remembered significantly better than information in only one channel. Mayer\'s Cognitive Theory of Multimedia Learning (200+ experiments) shows "people learn more deeply from words and pictures together than from words alone." Concept maps (Novak & Cañas) show effect sizes of g = 0.776 for science learning in meta-analysis.',
      },
      {
        heading: "Important: Learning Styles Are a Myth",
        text: 'The idea that "visual learners" learn better from visual instruction is thoroughly debunked. Pashler, McDaniel, Rohrer & Bjork (2008) found NO adequate evidence for the "meshing hypothesis." 93-96% of teachers still believe this myth. Our visual adaptation benefits ALL learners through dual coding, not just supposed "visual learners."',
      },
      {
        heading: "How We Apply It",
        text: "Every concept gets both a text description AND a visual representation suggestion. We apply Mayer's Coherence Principle (no extraneous decorative elements) and Signaling Principle (visual cues highlight organization). Concept maps extract all key relationships from the source, with labeled connections. Specific diagram types are suggested per section (flowcharts, comparison tables, Venn diagrams, etc.).",
      },
      {
        heading: "What to Verify",
        text: "Check that: concept map nodes and connections reflect actual relationships from the source material, timeline steps match the lesson sequence, diagram suggestions are specific and pedagogically appropriate (not generic), and no decorative visuals are suggested that don't teach.",
      },
    ],
    sources: [
      {
        label:
          "Clark & Paivio (1991): Dual Coding Theory and Education",
        url: "https://link.springer.com/article/10.1007/BF01320076",
      },
      {
        label:
          "Mayer: Past, Present, and Future of CTML (2024)",
        url: "https://link.springer.com/article/10.1007/s10648-023-09842-1",
      },
      {
        label:
          "Meta-analysis: Effectiveness of Concept Maps in Science (2024)",
        url: "https://link.springer.com/article/10.1007/s10648-024-09877-y",
      },
      {
        label:
          "Pashler et al. (2008): Learning Styles — Concepts and Evidence",
        url: "https://journals.sagepub.com/doi/full/10.1111/j.1539-6053.2009.01038.x",
      },
    ],
  },
  {
    id: "audio",
    icon: Headphones,
    color: "#ec4899",
    title: "Audio Narration Adaptation",
    subtitle:
      "Based on Mayer's Modality, Personalization, and Segmenting Principles",
    content: [
      {
        heading: "What the Research Says",
        text: "Mayer's Modality Principle: graphics with spoken narration outperform graphics with on-screen text (meta-analysis: d = 0.72). The Personalization Principle shows conversational tone improves learning over formal tone. The Segmenting Principle shows breaking content into learner-paced chunks aids processing. Research on prosody (2024) demonstrates that slower pacing for key information leads to higher learning outcomes.",
      },
      {
        heading: "How We Apply It",
        text: "Scripts use conversational \"you\" and \"we\" language (Personalization Principle). Content is broken into segments with [PAUSE] markers between topics and after key definitions (2-3 second pauses aid processing). [EMPHASIZE] markers flag key terms for prosodic emphasis. Rhetorical questions activate prior knowledge. Math equations are walked through verbally step-by-step.",
      },
      {
        heading: "What to Verify",
        text: "Check that: the script sounds natural when read aloud (not like a textbook), [PAUSE] markers appear at natural break points, all major topics from the source are covered in separate sections, the recap reinforces the 3-5 most important takeaways, and equations/examples from the source are narrated accurately.",
      },
    ],
    sources: [
      {
        label: "Meta-analysis of the Modality Effect",
        url: "https://www.semanticscholar.org/paper/aca7a5fc4b65d2d1ca326e583eeb1433439b931f",
      },
      {
        label:
          "Prosodic Signals in Podcasts Support Learning (2024)",
        url: "https://www.sciencedirect.com/science/article/pii/S0360131524000654",
      },
      {
        label:
          "Mayer's 12 Principles — Digital Learning Institute",
        url: "https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning",
      },
    ],
  },
  {
    id: "adhd",
    icon: Zap,
    color: "#ef4444",
    title: "ADHD-Friendly Adaptation",
    subtitle:
      "Based on Barkley's Executive Function model, CHADD strategies, gamification RCTs, and self-monitoring research",
    content: [
      {
        heading: "What the Research Says",
        text: "Barkley's model establishes that ADHD is fundamentally a deficit in executive function and self-regulation, not attention. His \"Point of Performance\" principle states interventions must be present at the exact time and place of need. CHADD recommends breaking tasks into small steps, providing frequent feedback, and using reward systems. A 2025 randomized controlled trial (Frontiers in Education) demonstrated that gamified learning significantly improved attention AND academic performance in children with ADHD.",
      },
      {
        heading: "How We Apply It",
        text: "Cards externalize information (key facts ON the card), motivation (\"why does this matter?\" hook), and time awareness (estimated minutes per card). Each card has ONE main idea at a single \"point of performance.\" Quiz cards after every 2-3 content cards provide immediate feedback with encouraging, non-punitive language. Self-monitoring prompts (\"Can you explain this in your own words?\") build metacognitive awareness.",
      },
      {
        heading: "Design Principles",
        text: "Barkley's \"10 and 3\" rule suggests 10 minutes of focused work followed by 3-minute breaks. Our 1-2 minute cards fit well within this window. High-novelty language triggers dopamine release, addressing the ADHD dopamine deficit. Progress indicators externalize motivation. Immediate feedback on quiz cards closes the reward loop.",
      },
      {
        heading: "What to Verify",
        text: "Check that: each card covers only ONE concept (never two), quiz cards test recently taught material (not distant recall), the \"why it matters\" hooks provide genuine relevance (not generic), estimated times are realistic, and the Big Picture summary gives a clear overview of the whole lesson.",
      },
    ],
    sources: [
      {
        label:
          "Barkley: Executive Functioning and Self-Regulation in ADHD (PDF)",
        url: "https://www.russellbarkley.org/factsheets/ADHD_EF_and_SR.pdf",
      },
      {
        label: "CHADD: Classroom Accommodations",
        url: "https://chadd.org/for-educators/classroom-accommodations/",
      },
      {
        label:
          "Gamified Educational Application for ADHD: 8-Week RCT (Frontiers 2025)",
        url: "https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1668260/full",
      },
      {
        label:
          "Metacognitive Training for ADHD (PMC 2024)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11529823/",
      },
    ],
  },
  {
    id: "gifted",
    icon: Rocket,
    color: "#8b5cf6",
    title: "Gifted/Advanced Enrichment",
    subtitle:
      "Based on Kaplan's 11 Depth & Complexity icons, Bloom's Revised Taxonomy, Renzulli's Enrichment Triad, and Webb's DOK",
    content: [
      {
        heading: "What the Research Says",
        text: "NAGC identifies acceleration as the single most research-supported intervention in gifted education. Kaplan's Depth & Complexity framework (used in 80,000+ classrooms) provides 11 thinking prompts that push students toward expert-level analysis. Bloom's Revised Taxonomy targets Analyze, Evaluate, and Create levels. Renzulli's Enrichment Triad moves students from exploration (Type I) through skills training (Type II) to authentic investigation (Type III). Webb's Depth of Knowledge targets DOK 3-4 (strategic and extended thinking).",
      },
      {
        heading: "How We Apply It",
        text: "Content applies all 11 Kaplan icons: Details, Patterns, Rules, Trends, Unanswered Questions, Ethics, Big Ideas, Language of the Discipline, Over Time, Multiple Perspectives, and Across Disciplines. Socratic questions require reasoning with no single right answer (DOK 3-4). \"What If?\" scenarios demand analysis and evaluation. The challenge activity targets Bloom's Create level. The research rabbit hole follows Renzulli's Type III (authentic investigation).",
      },
      {
        heading: "Anti-Hallucination Exception",
        text: "Unlike other adaptations, the gifted version MAY add accurate cross-disciplinary connections and pose open-ended questions. However, any historical dates, quotes, or specific claims must be accurate. Uncertain claims are framed as questions (\"Historians debate whether...\") rather than stated as fact.",
      },
      {
        heading: "What to Verify",
        text: "Check that: deeper context angles use actual Depth & Complexity icons, Socratic questions are genuinely open-ended (no single right answer), real-world applications are accurate and not fabricated, the challenge activity requires creation (not just more practice), and cross-disciplinary connections are factually sound.",
      },
    ],
    sources: [
      {
        label:
          "Kaplan: Depth & Complexity Framework — USC",
        url: "https://sites.usc.edu/gifteded/prompts-of-depth-and-complexity/",
      },
      {
        label: "NAGC: Gifted Education Resources",
        url: "https://www.nagc.org/resources",
      },
      {
        label:
          "Renzulli: Three-Ring Conception — UConn",
        url: "https://gifted.uconn.edu/schoolwide-enrichment-model/three-ring_conception_of_giftedness/",
      },
      {
        label:
          "Curriculum Compacting Research — UConn (PDF)",
        url: "https://gifted.uconn.edu/wp-content/uploads/sites/961/2022/04/Curriculum_Compacting-Summary_of_Compacting_Book.pdf",
      },
      {
        label: "Webb's Depth of Knowledge — Edutopia",
        url: "https://www.edutopia.org/article/how-use-norman-webb-depth-of-knowledge/",
      },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar backHref="/" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Our Methodology
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every LessonLens adaptation is grounded in peer-reviewed educational
            research — not guesswork. Below you will find the specific studies,
            frameworks, and guidelines behind each adaptation type, so you can
            verify the generated content meets evidence-based standards.
          </p>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border hover:bg-accent transition-colors"
              style={{ borderColor: s.color + "40", color: s.color }}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.title.split(" ").slice(0, 2).join(" ")}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              {/* Section header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: section.color + "15" }}
                >
                  <section.icon
                    className="h-6 w-6"
                    style={{ color: section.color }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              {/* Content cards */}
              <div className="space-y-4 ml-16">
                {section.content.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-5"
                    style={{
                      borderLeftWidth: "3px",
                      borderLeftColor:
                        item.heading === "What to Verify"
                          ? "#22c55e"
                          : section.color + "60",
                    }}
                  >
                    <h3 className="font-semibold text-base mb-2">
                      {item.heading === "What to Verify" && (
                        <span className="inline-flex items-center gap-1 text-green-500 mr-1">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                      )}
                      {item.heading}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sources */}
              <div className="ml-16 mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Sources
                </h4>
                <ul className="space-y-1">
                  {section.sources.map((src, i) => (
                    <li key={i}>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="underline underline-offset-2">
                          {src.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-20 text-center border-t pt-10">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            LessonLens uses Amazon Nova AI to generate adaptations. While our
            prompts are grounded in evidence-based research and outputs are
            validated against schemas, AI-generated content should always be
            reviewed by a qualified educator before classroom use. The &ldquo;What
            to Verify&rdquo; checklists above will help you evaluate each
            adaptation.
          </p>
        </div>
      </main>
    </div>
  );
}
