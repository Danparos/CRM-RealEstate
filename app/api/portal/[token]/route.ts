import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();

  const { data: portal, error: portalError } = await supabase
    .from("client_portals")
    .select("id, client_id, active")
    .eq("token", params.token)
    .eq("active", true)
    .single();

  if (portalError || !portal) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  await supabase
    .from("client_portals")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", portal.id);

  const { data: client } = await supabase
    .from("clients")
    .select("id, first_name, last_name, client_class, stage, primary_agent, email, phone, language")
    .eq("id", portal.client_id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  const { data: presentations } = await supabase
    .from("property_presentations")
    .select("id, property_ref, property_title, sent_at, photos, token")
    .eq("client_id", client.id)
    .order("sent_at", { ascending: false });

  const { data: documents } = await supabase
    .from("documents")
    .select("id, file_name, file_size, storage_path, created_at, category")
    .eq("entity_type", "client")
    .eq("entity_id", client.id)
    .eq("category", "general")
    .order("created_at", { ascending: false });

  const mappedProperties = (presentations ?? []).map((p) => ({
    id: p.id,
    property_ref: p.property_ref,
    property_title: p.property_title,
    sent_at: p.sent_at,
    thumbnail: Array.isArray(p.photos) && p.photos.length > 0 ? p.photos[0] : null,
    token: p.token,
  }));

  return NextResponse.json({
    client,
    properties: mappedProperties,
    documents: documents ?? [],
  });
}
