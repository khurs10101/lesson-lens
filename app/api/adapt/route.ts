import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";
import { adaptLesson } from "@/lib/nova";
import { saveServerLesson } from "@/lib/storage-server";
import { IS_DB_ENABLED } from "@/lib/db";
import { AdaptationResult, AdaptationType, ALL_ADAPTATION_TYPES } from "@/types";

export async function POST(req: Request) {
  const session = IS_AUTH_ENABLED ? await getServerSession(authOptions) : null;
  if (IS_AUTH_ENABLED && !session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session?.user?.id ?? null;

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { lessonId, rawContent, targetLanguage, fileName, fileType, types } = body;

  if (!rawContent || typeof rawContent !== "string") {
    return new Response(JSON.stringify({ error: "No lesson content provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Allow callers to request specific types (e.g. retry a single failed one)
  const requestedTypes: AdaptationType[] =
    Array.isArray(types) && types.every((t: string) => ALL_ADAPTATION_TYPES.includes(t as AdaptationType))
      ? types
      : ALL_ADAPTATION_TYPES;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const adaptations: Record<string, AdaptationResult> = {};

      // Run requested types in parallel, stream each result as it completes
      await Promise.allSettled(
        requestedTypes.map(async (type: AdaptationType) => {
          try {
            const adaptation = await adaptLesson(rawContent, type, targetLanguage);
            adaptations[type] = adaptation;
            send({ type, adaptation });
          } catch (err) {
            console.error(`[adapt] ${type} failed:`, err instanceof Error ? err.message : err);
            const errorResult: AdaptationResult = {
              type,
              content: { title: "Error", sections: [], glossary: [], readingLevel: "" } as never,
              generatedAt: new Date().toISOString(),
              status: "error",
            };
            adaptations[type] = errorResult;
            send({ type, adaptation: errorResult });
          }
        })
      );

      // Persist to DB after all adaptations complete
      if (lessonId && IS_DB_ENABLED) {
        try {
          await saveServerLesson(
            {
              id: lessonId,
              title: fileName
                ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                : "Untitled Lesson",
              fileName: fileName ?? "unknown",
              fileType: fileType ?? "text",
              originalContent: rawContent,
              adaptations,
              status: "ready",
              createdAt: new Date().toISOString(),
            },
            userId ?? undefined
          );
        } catch (err) {
          console.error("[adapt] DB save failed", err);
        }
      }

      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
