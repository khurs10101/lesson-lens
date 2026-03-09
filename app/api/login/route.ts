import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let username: string, password: string;
  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const validUser = process.env.GATE_USER;
  const validPass = process.env.GATE_PASS;
  const token = process.env.GATE_TOKEN;

  if (!validUser || !validPass || !token) {
    return NextResponse.json({ error: "Gate not configured" }, { status: 503 });
  }

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("gate", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
