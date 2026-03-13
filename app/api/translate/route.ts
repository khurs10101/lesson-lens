import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";

const SUPPORTED_LANGUAGES = [
  "Spanish",
  "French",
  "Mandarin",
  "Hindi",
  "Arabic",
  "Portuguese",
];

export async function POST(request: NextRequest) {
  const session = IS_AUTH_ENABLED ? await getServerSession(authOptions) : null;
  if (IS_AUTH_ENABLED && !session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, targetLanguage } = body;

    if (!content || !targetLanguage) {
      return NextResponse.json(
        { error: "Content and targetLanguage are required" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json(
        {
          error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // In demo mode, return a placeholder translation note
    return NextResponse.json({
      translatedContent: content,
      targetLanguage,
      note: `Translation to ${targetLanguage} would be performed by Amazon Nova in production.`,
    });
  } catch (err) {
    console.error("[translate]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
