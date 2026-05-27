import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      budgetMax?: number;
      priceGroup?: string;
      propertyTypes?: string[];
      propertyLocations?: string[];
      message?: string;
      agentId?: string;
      agentName?: string;
      source?: string;
    };

    if (!body.firstName || !body.lastName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.email && !body.phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = new Date().toISOString();
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { error } = await supabase.from("clients").insert({
      id,
      first_name:         body.firstName,
      last_name:          body.lastName,
      email:              body.email       ?? null,
      phone:              body.phone       ?? null,
      client_class:       "C",
      stage:              "new_inquiry",
      price_group:        body.priceGroup  ?? null,
      budget_max:         body.budgetMax   ?? null,
      property_types:     body.propertyTypes?.length    ? body.propertyTypes    : null,
      property_locations: body.propertyLocations?.length ? body.propertyLocations : null,
      primary_agent_id:   body.agentId    ?? null,
      primary_agent:      body.agentName  ?? null,
      last_activity_note: body.message    ? `Lead inquiry: ${body.message}` : `New lead via ${body.source ?? "web form"}`,
      last_activity_at:   now,
      stage_entered_at:   now,
      created_at:         now,
      updated_at:         now,
    });

    if (error) {
      console.error("[api/lead] insert error:", error.message);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/lead] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
