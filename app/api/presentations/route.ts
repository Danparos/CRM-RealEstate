import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      propertyId, propertyRef, propertyTitle,
      clientId, clientName, clientEmail,
      agentName, agentEmail, agentPhone, message,
      photos,
    } = body;

    const { data: row, error } = await supabase
      .from("property_presentations")
      .insert({
        property_id:    propertyId,
        property_ref:   propertyRef,
        property_title: propertyTitle,
        client_id:      clientId ?? null,
        client_name:    clientName,
        client_email:   clientEmail,
        agent_name:     agentName,
        agent_email:    agentEmail ?? null,
        agent_phone:    agentPhone ?? null,
        sent_at:        new Date().toISOString(),
        message:        message ?? null,
        photos:         Array.isArray(photos) && photos.length > 0 ? photos : null,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/presentations] insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("[api/presentations] unexpected:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
