import { NextRequest, NextResponse } from "next/server";
import { generateVisualDiagram } from "@/lib/nova";

export async function POST(req: NextRequest) {
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
