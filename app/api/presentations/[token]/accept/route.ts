import { NextRequest, NextResponse } from "next/server";
import { acceptPresentation, getPresentationByToken } from "@/lib/db/presentations";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await req.json() as { name?: string };
    const name = (body.name ?? "").trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const existing = await getPresentationByToken(params.token);
    if (!existing) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }
    if (existing.acceptedAt) {
      // Already accepted — return success so client can proceed
      return NextResponse.json({ ok: true, alreadyAccepted: true });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    const ok = await acceptPresentation(params.token, name, ip);
    if (!ok) {
      return NextResponse.json({ error: "Failed to record acceptance" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
