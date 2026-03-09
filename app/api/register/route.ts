import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, IS_DB_ENABLED } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  if (!IS_DB_ENABLED) {
    return NextResponse.json(
      { error: "Registration is not available in demo mode." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password } = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
