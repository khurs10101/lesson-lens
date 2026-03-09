import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";
import { IS_DEMO } from "@/lib/nova";
import { synthesizeSpeech } from "@/lib/polly";

export async function POST(request: NextRequest) {
  try {
    if (IS_AUTH_ENABLED) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { script } = body;

    if (!script || !Array.isArray(script) || script.length === 0) {
      return NextResponse.json(
        { error: "No script sections provided" },
        { status: 400 }
      );
    }

    if (IS_DEMO) {
      // Demo mode: return empty — client falls back to Web Speech API
      return NextResponse.json({ format: "webspeech" });
    }

    // Real mode: synthesize with Amazon Polly
    const mp3Buffer = await synthesizeSpeech(script);

    return new Response(new Uint8Array(mp3Buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": mp3Buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[audio]", err);
    // Return fallback signal so client uses Web Speech API
    return NextResponse.json({ format: "webspeech", error: "Polly unavailable" });
  }
}
