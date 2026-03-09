# LessonLens

**Upload one lesson. Get six differentiated versions instantly.**

LessonLens uses Amazon Nova AI to transform any lesson document into six research-backed adaptations tailored to different learning needs — dyslexia, ESL, visual learners, auditory learners, ADHD, and gifted students.

Teachers spend 10+ hours per week differentiating materials. LessonLens does it in seconds.

## Amazon Nova Integration

| Model | Purpose |
|-------|---------|
| **Nova Pro** (`us.amazon.nova-pro-v1:0`) | Multimodal content extraction from PDFs and images |
| **Nova 2 Lite** (`us.amazon.nova-2-lite-v1:0`) | Generating all 6 lesson adaptations |
| **Nova Canvas** (`amazon.nova-canvas-v1:0`) | Creating educational diagrams for visual learners |
| **Amazon Polly** (Neural, voice: Ruth) | Text-to-speech for auditory adaptations with SSML |

## Six Adaptation Types

| Type | Research Basis | What It Does |
|------|---------------|-------------|
| **Dyslexia-Friendly** | BDA Style Guide, Orton-Gillingham, IDA Structured Literacy | Short sentences, glossary, chunked paragraphs, key terms highlighted |
| **ESL Support** | Krashen i+1, SIOP, Cummins BICS/CALP, CEFR A2-B1 | Bilingual side-by-side, tiered vocabulary, simplified grammar |
| **Visual Learning** | Paivio Dual Coding, Mayer Multimedia Principles | Concept maps, diagrams, color-coded sections, spatial layouts |
| **Audio Learning** | Mayer Modality/Segmenting/Personalization Principles | AI narration via Polly, segmented sections, conversational tone |
| **ADHD Support** | Barkley Executive Function, CHADD, gamification RCTs | Micro-cards, progress tracking, quiz checkpoints, estimated times |
| **Gifted Enrichment** | Kaplan D&C, Bloom's Taxonomy, Renzulli Enrichment Triad | Socratic questions, real-world applications, extension challenges |

## How It Works

1. **Upload** — Drop a PDF, image, or slide deck
2. **Extract** — Nova Pro reads the document using multimodal understanding
3. **Adapt** — Nova 2 Lite generates 6 differentiated versions in parallel (SSE streaming)
4. **Refine** — Teachers can provide instructions to refine any adaptation
5. **Listen** — Amazon Polly generates audio narration for auditory learners

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI**: Amazon Bedrock (Nova Pro, Nova 2 Lite, Nova Canvas)
- **TTS**: Amazon Polly (Neural engine, SSML)
- **UI**: shadcn/ui + Framer Motion
- **Auth**: NextAuth v4 (Google OAuth + credentials)
- **Database**: Prisma v7 + PostgreSQL
- **Storage**: Amazon S3 (file uploads)
- **Validation**: Zod schemas for all AI outputs

## Architecture

```
Upload → S3 Storage → Nova Pro (extraction) → Nova 2 Lite (6x parallel adaptation)
                                              → Nova Canvas (visual diagrams)
                                              → Amazon Polly (audio narration)
```

All infrastructure is optional — the app gracefully degrades to demo mode without any credentials configured.

## Getting Started

### Prerequisites

- Node.js 18+
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

Set `NEXT_PUBLIC_DEMO_MODE=true` to run without AWS credentials. The app uses pre-generated lesson data and Web Speech API for audio.

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

lib/
    nova.ts                 # Bedrock client + extraction/adaptation/refinement
    polly.ts                # Polly TTS with SSML conversion
    prompts.ts              # 6 evidence-based prompt templates
    schemas.ts              # Zod validation for AI outputs

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

## Category

**Multimodal Understanding** — LessonLens uses Nova's multimodal capabilities to understand documents (PDFs, images) and generate differentiated content across text, visual diagrams, and audio.

## License

MIT

---

Built for the [Amazon Nova AI Hackathon](https://amazon-nova.devpost.com/) | #AmazonNova
