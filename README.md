# LessonLens

**Upload one lesson. Get six differentiated versions instantly.**

LessonLens uses Amazon Nova AI to transform any lesson document into six research-backed adaptations tailored to different learning needs — dyslexia, ESL, visual learners, auditory learners, ADHD, and gifted students.

Teachers spend 10+ hours per week differentiating materials. LessonLens does it in seconds.

Built for the [Amazon Nova AI Hackathon](https://amazon-nova.devpost.com/) | #AmazonNova

---

## The Problem: A Classroom Built for One Type of Learner

Modern classrooms are more diverse than ever, yet the materials teachers use remain stubbornly one-size-fits-all. A single lesson plan — written once, in one format, at one reading level — is expected to serve students with dyslexia, English language learners, students with ADHD, gifted learners, and everyone in between. The result is a widening achievement gap and an overwhelmed teaching workforce.

### Students Are Falling Behind

- **7.3 million** students in the US receive special education services under IDEA (NCES, 2021-22). Globally, **15% of the population** — 1 in 7 people — has a learning disability.
- Dyslexia alone accounts for **80% of all learning disabilities** and affects roughly **10% of the global population**.
- ADHD impacts **9.57%** of US children ages 3-17 (Scientific Reports, 2018-2021).
- **5.3 million English Language Learners** attend US public schools — over **10% of all students** (NCES, 2021).
- **2 out of 5** learning disabilities remain **undiagnosed** globally (Frontiers in Public Health, 2023).

These aren't edge cases. In a classroom of 30 students, statistically **8-12 have a learning difference** that standard materials don't address.

On the 2024 NAEP, **72% of 4th graders with disabilities scored below basic in reading** and **75% below basic in math**. Over **90% of students with specific learning disabilities are not proficient** in reading or math (NCLD). The gap is **widening** — 8th grade math scores for students with disabilities dropped from 247 (2019) to 242 (2022) to **238 (2024)**.

### Teachers Are Overwhelmed

- US teachers spend **8.2 hours/week** on lesson preparation alone (OECD TALIS 2024) and work **9 hours more per week** than similar professionals (RAND, 2024).
- **84%** say they lack sufficient time for planning, grading, and communication.
- **52% of K-12 teachers** report burnout — the **highest among all occupations**. **7% quit** in 2023-24, and **29% more are considering leaving**.
- **1 in 8 teaching positions** are either unfilled or filled by someone not fully certified (Learning Policy Institute, 2025).
- **Fewer than 1 in 5** general education teachers feel "very well prepared" to teach students with learning disabilities (NCLD/Understood).

### The Differentiation Gap

Research is clear that differentiated instruction works — a meta-analysis of **49 studies** found a large effect size (g = 1.109) on learning outcomes (IJOPR). Students in personalized programs scored **8 points higher in math** and **9 points higher in reading** within one year.

Yet Universal Design for Learning (UDL) remains difficult to implement at scale. **24.4%** of educators cite institutional barriers, and creating multiple means of engagement, representation, and expression for every lesson multiplies preparation time that teachers already don't have.

**LessonLens solves this: bridging the gap between what research says works and what teachers can realistically produce given their time and training constraints.**

---

## How It Works

1. **Upload** — Drop a PDF, image, or slide deck
2. **Extract** — Nova Pro reads the document using multimodal understanding
3. **Adapt** — Nova 2 Lite generates 6 differentiated versions in parallel (SSE streaming)
4. **Refine** — Teachers can provide instructions to refine any adaptation
5. **Listen** — Amazon Polly generates audio narration for auditory learners
6. **Visualize** — Nova Canvas creates educational diagrams

---

## Amazon Nova AI Integration

LessonLens uses a four-stage AI pipeline built entirely on Amazon Bedrock:

### Stage 1: Content Extraction — Nova Pro

| | |
|---|---|
| **Model** | `us.amazon.nova-pro-v1:0` |
| **API** | `ConverseCommand` (multimodal) |
| **Purpose** | Extract complete lesson content from PDFs and images |

Nova Pro processes uploaded documents — scanned worksheets, typed PDFs, textbook photos — and extracts all headings, equations, worked examples, and exercises without summarization. For lengthy documents, the system uses **multi-pass extraction** with up to 3 passes (10,000 tokens each), automatically continuing where the previous pass ended.

**Why Nova Pro:** Its 300K-token context window and multimodal understanding handle the diversity of real classroom materials.

### Stage 2: Intelligent Adaptation — Nova 2 Lite

| | |
|---|---|
| **Model** | `us.amazon.nova-2-lite-v1:0` |
| **API** | `InvokeModelCommand` |
| **Purpose** | Generate 6 research-grounded adaptations |

Each adaptation type has a **2,000+ token prompt** encoding specific pedagogical requirements from peer-reviewed research. The model outputs **structured JSON** (not free-form text), validated against Zod schemas with auto-coercion for missing fields. Teachers can **refine** any adaptation with follow-up instructions.

**Key parameters:** Temperature 0.7, 8,192-12,288 max output tokens, content trimmed to 40,000 characters.

**Why Nova 2 Lite:** Its 256K context window fits full lesson content + detailed prompts + large structured output. Faster than Pro for parallel generation of all six adaptations.

### Stage 3: Visual Diagrams — Nova Canvas

| | |
|---|---|
| **Model** | `amazon.nova-canvas-v1:0` |
| **API** | `InvokeModelCommand` (TEXT_IMAGE) |
| **Purpose** | Generate educational infographics |

Produces 512x512 teacher-friendly infographics with clean styling, labeled sections, and white backgrounds — aligned with Mayer's Coherence Principle.

### Stage 4: Audio Narration — Amazon Polly

| | |
|---|---|
| **Service** | Amazon Polly Neural TTS |
| **Voice** | Ruth (en-US, Neural engine) |
| **Purpose** | Convert audio scripts to spoken MP3 |

Converts `[PAUSE]` and `[EMPHASIZE]` markers into SSML (`<break>`, `<emphasis>`), synthesized at 24,000 Hz. Handles chunking for scripts exceeding Polly's 6,000-character SSML limit.

### Anti-Hallucination by Design

Every prompt includes **Grounding Rules**:
- Only use facts, definitions, equations from the source lesson
- Never invent new facts, statistics, dates, or examples
- Reproduce equations exactly — if unsure, omit rather than guess
- Post-processing strips confusion patterns ("wait, let me correct that...")
- Zod schema validation enforces required output structure

---

## Six Adaptation Types

Each adaptation is grounded in peer-reviewed educational research, not generic AI summarization:

| Type | Who It Helps | Research Foundation | Output |
|------|-------------|-------------------|--------|
| **Dyslexia-Friendly** | ~10% of students globally | BDA Style Guide, Rello & Baeza-Yates (2013), IDA Structured Literacy, Orton-Gillingham | 15-word sentence limits, Grade 4-5 vocabulary, chunked paragraphs, glossary |
| **ESL/Bilingual** | 5.3M+ US students | Krashen i+1, SIOP, Cummins BICS/CALP, CEFR A2-B1, Beck's Tier 2, translanguaging | Bilingual scaffolding, vocabulary spotlights, sentence frames |
| **Visual** | All learners (dual coding) | Paivio Dual Coding (1986), Mayer Multimedia Principles (2009) | Concept maps, timelines, diagram suggestions, Nova Canvas infographics |
| **Audio** | All learners (modality principle) | Mayer Modality/Segmenting/Personalization/Voice Principles | Narration scripts with [PAUSE]/[EMPHASIZE], Polly MP3 |
| **ADHD-Optimized** | ~10% of youth | Barkley Executive Function, CHADD, gamification RCTs | Micro-cards (50 words max), quiz checkpoints, progress tracking |
| **Gifted Enrichment** | Advanced learners | Bloom's Taxonomy, Kaplan D&C, Renzulli Enrichment Triad, Webb DOK 3-4 | Socratic questions, What-If scenarios, research rabbit holes |

> **Note:** Visual and Audio adaptations benefit **all** learners through dual coding and modality principles — they are NOT based on debunked "learning styles" (Pashler et al. 2008).

---

## Why This Matters

### For Teachers
- Saves **hours of weekly preparation time** on manual differentiation
- Research-backed adaptations without specialist training
- Teachers stay in control with refinement — AI assists, not replaces
- Works with any existing lesson material

### For Students
- ESL students get bilingual scaffolding, not just simplified English
- Students with dyslexia get BDA-compliant formatting, not just "easier words"
- Students with ADHD get micro-chunked content with engagement checks
- Gifted students get depth and complexity, not just "more work"

### For Schools
- Genuine inclusive education without proportional increase in teacher workload
- Addresses IEP and 504 plan differentiation requirements
- Reduces dependency on scarce special education specialists

### The Market
The AI in education market is projected to grow from **$5.88B (2024) to $32.27B by 2030** at 31.2% CAGR (Grand View Research).

---

## Architecture

```
Teacher uploads PDF/image
        ↓
[Nova Pro] Multimodal extraction → complete lesson text
        ↓
[Nova 2 Lite] × 6 → Dyslexia + ESL + Visual + Audio + ADHD + Gifted
        ↓                    ↓                    ↓
[Schema Validation]   [Nova Canvas]         [Amazon Polly]
   Zod v4 checks      Visual diagram        MP3 narration
        ↓                    ↓                    ↓
              Unified lesson view for the teacher
```

All infrastructure is optional — the app gracefully degrades to demo mode without any credentials configured.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI**: Amazon Bedrock (Nova Pro, Nova 2 Lite, Nova Canvas)
- **TTS**: Amazon Polly (Neural engine, SSML)
- **UI**: shadcn/ui + Framer Motion
- **Auth**: NextAuth v4 (Google OAuth + credentials)
- **Database**: Prisma v7 + PostgreSQL
- **Storage**: Amazon S3 (file uploads)
- **Validation**: Zod v4 schemas for all AI outputs
- **Deployment**: AWS EC2 + Caddy + PM2

---

## Getting Started

### Prerequisites

- Node.js 20+
- AWS account with Bedrock access (Nova models enabled in us-east-1)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
# Required for AI features
AWS_REGION=us-east-1
AWS_PROFILE=lessonlens          # or set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY

# Optional — app works without these in demo mode
NEXT_PUBLIC_DEMO_MODE=true      # set to false for real AI
DATABASE_URL=postgresql://...    # enables persistent storage
NEXTAUTH_SECRET=...             # enables authentication
AWS_S3_BUCKET=...               # enables file upload to S3
STRIPE_SECRET_KEY=...           # enables payments
```

### Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` to run without AWS credentials. The app uses pre-generated lesson data (Water Cycle) and Web Speech API for audio.

---

## Project Structure

```
app/
  page.tsx                  # Landing page
  lesson/[id]/page.tsx      # Lesson viewer with 6 adaptation tabs
  dashboard/page.tsx        # User lesson management
  methodology/page.tsx      # Research documentation
  api/
    upload/route.ts         # File upload + Nova Pro extraction (SSE)
    adapt/route.ts          # 6x parallel adaptation generation (SSE)
    refine/route.ts         # Teacher-guided refinement
    audio/route.ts          # Amazon Polly TTS
    canvas/route.ts         # Nova Canvas diagram generation
    translate/route.ts      # Language translation

lib/
    nova.ts                 # Bedrock client + extraction/adaptation/refinement
    polly.ts                # Polly TTS with SSML conversion
    prompts.ts              # 6 evidence-based prompt templates
    schemas.ts              # Zod validation for AI outputs
    s3.ts                   # S3 upload/download helpers

components/
    UploadZone.tsx          # File drop + SSE progress streaming
    AdaptationTabs.tsx      # Tabbed viewer for 6 adaptations
    AudioPlayer.tsx         # Polly/Web Speech audio player
    ConceptMap.tsx          # Visual diagram renderer
    BilingualView.tsx       # ESL side-by-side layout
    DyslexiaView.tsx        # Dyslexia-friendly text formatting
    GiftedView.tsx          # Gifted enrichment view
    LessonCard.tsx          # ADHD micro-card system
```

---

## Category

**Multimodal Understanding** — LessonLens uses Nova's multimodal capabilities to understand documents (PDFs, images) and generate differentiated content across text, visual diagrams, and audio.

---

## References

- NCES (2021-22). Students With Disabilities. National Center for Education Statistics.
- Scientific Reports (2023). Prevalence of developmental disabilities among US children, 2018-2021.
- Frontiers in Public Health (2023). Global prevalence of developmental disabilities: systematic umbrella review.
- OECD TALIS (2024). Results from TALIS 2024: The Demands of Teaching.
- RAND Corporation (2024). State of the American Teacher Survey.
- Learning Policy Institute (2025). Overview of Teacher Shortages.
- NCLD / Understood. Survey on teacher preparedness for students with learning disabilities.
- NAEP (2024). National Assessment of Educational Progress results.
- IJOPR. Meta-analysis of differentiated instruction (49 studies, g = 1.109).
- Pashler et al. (2008). Learning Styles: Concepts and Evidence. Psychological Science in the Public Interest.
- Paivio, A. (1986). Mental Representations: A Dual Coding Approach.
- Mayer, R.E. (2009). Multimedia Learning (2nd ed.). Cambridge University Press.
- Barkley, R.A. Executive Function Model of ADHD.
- Krashen, S.D. The Input Hypothesis: Issues and Implications.
- Renzulli, J.S. The Enrichment Triad Model.
- Kaplan, S. Depth and Complexity Framework.
- British Dyslexia Association (2018). BDA Style Guide.
- Grand View Research (2024). AI in Education Market Report.

---

## License

MIT
