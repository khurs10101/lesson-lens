import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";
import { generateVisualDiagram } from "@/lib/nova";

export async function POST(req: NextRequest) {
  const session = IS_AUTH_ENABLED ? await getServerSession(authOptions) : null;
  if (IS_AUTH_ENABLED && !session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { centralConcept, keywords } = body;

    if (!centralConcept) {
      return NextResponse.json({ error: "centralConcept required" }, { status: 400 });
    }

    const imageBase64 = await generateVisualDiagram(
      centralConcept,
      Array.isArray(keywords) ? keywords : []
    );

    return NextResponse.json({ imageBase64 });
  } catch (err) {
    console.error("[canvas]", err);
    return NextResponse.json({ error: "Image generation failed." }, { status: 500 });
  }
}
