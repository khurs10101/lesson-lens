import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import {
  AdaptationType,
  AdaptationResult,
} from "@/types";
import { DEMO_LESSON } from "./demo-data";
import { buildPrompt } from "./prompts";
import { validateAdaptation } from "./schemas";

const REGION = process.env.AWS_REGION ?? "us-east-1";

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/**
 * Bedrock client using the SDK's default credential provider chain.
 * Resolves credentials in this order (no static keys needed):
 *   1. AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars (if set)
 *   2. ~/.aws/credentials + ~/.aws/config (AWS CLI / SSO login)
 *   3. IAM instance role (when deployed on EC2 / ECS / Lambda)
 */
const bedrockClient = !IS_DEMO
  ? new BedrockRuntimeClient({
      region: REGION,
      maxAttempts: 1, // Fail fast — don't retry large PDF extractions 3x
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 15_000,
        socketTimeout: 300_000, // 5 min — large PDFs need time
      }),
    })
  : null;

// ---------------------------------------------------------------------------
// Real Bedrock helpers
// ---------------------------------------------------------------------------

/**
 * Invoke a Bedrock Nova model and return the text response.
 */
async function invokeNova(
  modelId: "us.amazon.nova-pro-v1:0" | "us.amazon.nova-2-lite-v1:0",
  messages: object[],
  maxTokens = 4096,
  temperature = 0.7
): Promise<string> {
  if (!bedrockClient) throw new Error("Bedrock not configured");

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      schemaVersion: "messages-v1",
      messages,
      inferenceConfig: { max_new_tokens: maxTokens, temperature },
    }),
  });

  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return body.output.message.content[0].text as string;
}

/**
 * Extract JSON from a model response that may wrap it in a code fence.
 */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  const raw = fenced ? fenced[1] : text;
  // Find the outermost { ... } or [ ... ] block
  const objMatch = raw.match(/\{[\s\S]*\}/);
  const jsonStr = objMatch ? objMatch[0] : raw.trim();
  // Sanitize control characters and bad escapes that the model sometimes produces
  const sanitized = jsonStr
    // Remove literal control chars (tabs, newlines, etc.) inside JSON string values
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    // Fix invalid escape sequences (e.g. \: \' \`) by removing the backslash
    .replace(/\\([^"\\\/bfnrtu])/g, "$1");
  return JSON.parse(sanitized);
}

// ---------------------------------------------------------------------------
// Post-generation quality sanitization
// ---------------------------------------------------------------------------

/**
 * Patterns indicating the AI got confused or started self-correcting mid-output.
 * These are stripped from text fields to prevent narrated confusion in TTS/display.
 */
const CONFUSION_PATTERNS = [
  /wait,?\s*let'?s?\s*(correct|fix|re-?examine|check)\s*that[.!]?\s*/gi,
  /I\s*think\s*there\s*(may|might)\s*be\s*an?\s*error\b[^.]*\.\s*/gi,
  /let me\s*(re-?examine|reconsider|try again)\b[^.]*\.\s*/gi,
  /actually,?\s*(?:if we|let's|that's)\b[^.]*(?:isn't matching|not the same|doesn't match)\b[^.]*\.\s*/gi,
  /(?:hmm|oops),?\s*/gi,
];

/**
 * Walk all string values in an object and strip confusion patterns.
 * Returns a new object (does not mutate input).
 */
function sanitizeAiOutput(obj: unknown): unknown {
  if (typeof obj === "string") {
    let cleaned = obj;
    for (const pattern of CONFUSION_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
    // Collapse double spaces left behind
    return cleaned.replace(/  +/g, " ").trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeAiOutput);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeAiOutput(value);
    }
    return result;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract text from an uploaded file (PDF/image) using Nova Pro multimodal.
 * Uses multi-pass extraction: if the first call hits the 10K token limit,
 * makes follow-up calls to continue extraction from where it left off.
 * Falls back to demo content in demo mode.
 */
export async function extractContentFromFile(
  fileBase64: string,
  mimeType: string
): Promise<string> {
  if (IS_DEMO) {
    await simulateDelay(800, 1500);
    return DEMO_LESSON.originalContent;
  }
  if (!bedrockClient) throw new Error("Bedrock not configured");

  const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
  const isPdf = mimeType === "application/pdf";
  const format = isPdf ? "pdf" : mimeType.split("/")[1]; // "png", "jpeg", "webp"

  const mediaBlock = isPdf
    ? { document: { format: format as "pdf", name: "lesson", source: { bytes } } }
    : { image: { format: format as "png" | "jpeg" | "webp", source: { bytes } } };

  const extractionPrompt = `Extract ALL text content from this lesson material — every page, every section, every example, every exercise. Return the COMPLETE lesson in plain text.

Rules:
- Preserve all headings, section numbers, and structure (e.g., "3.1 Introduction", "3.3.2 Elimination Method")
- Preserve ALL mathematical equations exactly (fractions like 24/5 must stay as 24/5, not be simplified or dropped)
- Include ALL worked examples with their full step-by-step solutions
- Include ALL exercise problems
- Do NOT summarize, skip, or abbreviate any section
- Do NOT add commentary — return only the lesson text`;

  // Pass 1: initial extraction
  const firstCommand = new ConverseCommand({
    modelId: "us.amazon.nova-pro-v1:0",
    messages: [
      { role: "user", content: [mediaBlock, { text: extractionPrompt }] },
    ],
    inferenceConfig: { maxTokens: 10000, temperature: 0.1 },
  });

  const firstResponse = await bedrockClient.send(firstCommand);
  let extracted =
    (firstResponse.output?.message?.content?.[0] as { text: string })?.text ?? "";

  // Multi-pass: continue if truncated (max 2 continuation passes)
  const MAX_CONTINUATION_PASSES = 2;
  let stopReason = firstResponse.stopReason;

  for (let pass = 0; pass < MAX_CONTINUATION_PASSES && stopReason === "max_tokens"; pass++) {
    const lastChunk = extracted.slice(-500);

    const contCommand = new ConverseCommand({
      modelId: "us.amazon.nova-pro-v1:0",
      messages: [
        { role: "user", content: [mediaBlock, { text: extractionPrompt }] },
        { role: "assistant", content: [{ text: extracted }] },
        {
          role: "user",
          content: [
            {
              text: `Your previous extraction was cut off. The last text you wrote was:
"${lastChunk}"

Continue extracting from EXACTLY where you stopped. Do NOT repeat any content — pick up from the next word after where you left off. Continue until the end of the document.`,
            },
          ],
        },
      ],
      inferenceConfig: { maxTokens: 10000, temperature: 0.1 },
    });

    const contResponse = await bedrockClient.send(contCommand);
    const contText =
      (contResponse.output?.message?.content?.[0] as { text: string })?.text ?? "";

    if (contText) {
      extracted += "\n" + contText;
    }
    stopReason = contResponse.stopReason;
  }

  return extracted;
}

/**
 * Generate one adaptation using Nova Lite.
 * Falls back to demo data in demo mode.
 */
export async function adaptLesson(
  content: string,
  type: AdaptationType,
  targetLanguage?: string
): Promise<AdaptationResult> {
  if (IS_DEMO) {
    await simulateDelay(1000, 3000);
    const adaptation = DEMO_LESSON.adaptations[type];
    if (!adaptation) throw new Error(`No demo data for type: ${type}`);
    return adaptation;
  }

  const prompt = buildPrompt(type, content, targetLanguage ?? "Spanish");
  // ESL generates bilingual content (~2x output) — give it more tokens
  const maxTokens = type === "esl" ? 12288 : 8192;
  const responseText = await invokeNova(
    "us.amazon.nova-2-lite-v1:0",
    [{ role: "user", content: [{ text: prompt }] }],
    maxTokens,
    0.7
  );

  const parsed = extractJson(responseText);
  const sanitized = sanitizeAiOutput(parsed);
  const validated = validateAdaptation(type, sanitized);

  return {
    type,
    content: validated as AdaptationResult["content"],
    generatedAt: new Date().toISOString(),
    status: "ready",
  };
}

/**
 * Generate an educational illustration using Nova Canvas.
 * Returns a base64-encoded PNG string, or null in demo mode / on error.
 */
export async function generateVisualDiagram(
  centralConcept: string,
  keywords: string[]
): Promise<string | null> {
  if (IS_DEMO || !bedrockClient) return null;

  const prompt = `Educational diagram illustration of "${centralConcept}". Key concepts: ${keywords.slice(0, 5).join(", ")}. Clean, colorful, teacher-friendly infographic style, white background, labeled sections, suitable for classroom use.`;

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-canvas-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
        negativeText: "blurry, distorted, watermark, nsfw, low quality, dark background",
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        height: 512,
        width: 512,
        cfgScale: 8.0,
      },
    }),
  });

  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return (body.images?.[0] as string) ?? null;
}

/**
 * Refine an existing adaptation based on a teacher instruction.
 */
export async function refineAdaptation(
  originalContent: string,
  type: AdaptationType,
  instruction: string,
  currentAdaptation: AdaptationResult
): Promise<AdaptationResult> {
  if (IS_DEMO) {
    await simulateDelay(1500, 2500);
    return currentAdaptation;
  }

  const refinementPrompt = `You previously generated a ${type} adaptation of a lesson. Here is the current adaptation JSON:
${JSON.stringify(currentAdaptation.content, null, 2)}

The teacher requests this refinement: "${instruction}"

Original lesson content for context:
${originalContent.slice(0, 8000)}

Return ONLY valid JSON in the exact same schema as the current adaptation. Apply the teacher's instruction while maintaining all required fields.`;

  const responseText = await invokeNova(
    "us.amazon.nova-2-lite-v1:0",
    [{ role: "user", content: [{ text: refinementPrompt }] }],
    8192,
    0.7
  );

  const parsed = extractJson(responseText);
  const sanitized = sanitizeAiOutput(parsed);
  const validated = validateAdaptation(type, sanitized);
  return {
    type,
    content: validated as AdaptationResult["content"],
    generatedAt: new Date().toISOString(),
    status: "ready",
  };
}

function simulateDelay(min: number, max: number): Promise<void> {
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
