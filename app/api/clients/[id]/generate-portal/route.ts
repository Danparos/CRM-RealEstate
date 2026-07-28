import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    const { error: deactivateError } = await supabase
      .from("client_portals")
      .update({ active: false })
      .eq("client_id", clientId);

    if (deactivateError) {
      console.error("[api/clients/generate-portal] deactivate error:", deactivateError.message);
      return NextResponse.json({ error: deactivateError.message }, { status: 500 });
    }

    const { data: row, error: insertError } = await supabase
      .from("client_portals")
      .insert({ client_id: clientId })
      .select("token")
      .single();

    if (insertError) {
      console.error("[api/clients/generate-portal] insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ token: row.token }, { status: 201 });
  } catch (err) {
    console.error("[api/clients/generate-portal] unexpected:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
