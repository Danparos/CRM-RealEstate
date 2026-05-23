import { NextRequest, NextResponse } from "next/server";
import { getPresentationByToken, markOpened } from "@/lib/db/presentations";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const presentation = await getPresentationByToken(params.token);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Log first open (fire and forget)
  if (!presentation.openedAt) {
    markOpened(params.token);
  }
  // Return metadata only — never property data here
  return NextResponse.json({
    token:         presentation.token,
    clientName:    presentation.clientName,
    agentName:     presentation.agentName,
    agentEmail:    presentation.agentEmail,
    agentPhone:    presentation.agentPhone,
    propertyRef:   presentation.propertyRef,
    propertyTitle: presentation.propertyTitle,
    acceptedAt:    presentation.acceptedAt ?? null,
    acceptedName:  presentation.acceptedName ?? null,
    message:       presentation.message ?? null,
  });
}
