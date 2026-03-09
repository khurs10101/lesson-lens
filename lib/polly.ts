import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const REGION = process.env.AWS_REGION ?? "us-east-1";

/** Lazy-initialized Polly client — only created when actually needed. */
let _polly: PollyClient | null = null;
function getPollyClient(): PollyClient {
  if (!_polly) {
    _polly = new PollyClient({ region: REGION });
  }
  return _polly;
}

/**
 * Convert [PAUSE] and [EMPHASIZE] markers in our audio scripts to SSML.
 */
function textToSsml(text: string): string {
  // First escape XML-special chars BEFORE inserting SSML tags
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  // Now convert our markers to SSML tags
  const ssml = escaped
    // [PAUSE] → 1.5s break
    .replace(/\[PAUSE\]/g, '<break time="1500ms"/>')
    // [EMPHASIZE]word[EMPHASIZE] → <emphasis>word</emphasis>
    .replace(
      /\[EMPHASIZE\](.*?)\[EMPHASIZE\]/g,
      '<emphasis level="strong">$1</emphasis>'
    );

  return `<speak>${ssml}</speak>`;
}

/**
 * Synthesize speech from a script using Amazon Polly Neural engine.
 * Returns an MP3 buffer.
 *
 * Polly SynthesizeSpeech has a 6000-char limit per call, so we split
 * long scripts into chunks and concatenate the MP3 buffers.
 */
export async function synthesizeSpeech(
  scriptSections: { text: string }[]
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for (const section of scriptSections) {
    const ssml = textToSsml(section.text);

    // Polly SSML limit is 6000 chars — if a single section exceeds this,
    // fall back to plain text (strip markers)
    const usesSsml = ssml.length <= 6000;

    const command = new SynthesizeSpeechCommand({
      Engine: "neural",
      LanguageCode: "en-US",
      OutputFormat: "mp3",
      SampleRate: "24000",
      VoiceId: "Ruth", // Neural female voice — clear and warm
      TextType: usesSsml ? "ssml" : "text",
      Text: usesSsml
        ? ssml
        : section.text
            .replace(/\[PAUSE\]/g, ". ")
            .replace(/\[EMPHASIZE\]/g, ""),
    });

    const response = await getPollyClient().send(command);

    if (response.AudioStream) {
      // AudioStream is a Readable in Node.js — collect into Buffer
      const streamBytes = await response.AudioStream.transformToByteArray();
      chunks.push(Buffer.from(streamBytes));
    }
  }

  return Buffer.concat(chunks);
}
