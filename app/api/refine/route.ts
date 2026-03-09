import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";
import { refineAdaptation } from "@/lib/nova";
import { AdaptationType, AdaptationResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (IS_AUTH_ENABLED) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    }

    const { adaptationType, instruction, originalContent, currentAdaptation } =
      await req.json();

    if (!adaptationType || !instruction || !originalContent || !currentAdaptation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const refined = await refineAdaptation(
      originalContent as string,
      adaptationType as AdaptationType,
      instruction as string,
      currentAdaptation as AdaptationResult
    );

    return NextResponse.json({ adaptation: refined });
  } catch (err) {
    console.error("[refine]", err);
    return NextResponse.json({ error: "Refinement failed. Please try again." }, { status: 500 });
  }
}
