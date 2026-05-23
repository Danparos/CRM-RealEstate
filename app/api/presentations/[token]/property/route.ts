import { NextRequest, NextResponse } from "next/server";
import { getPresentationByToken } from "@/lib/db/presentations";
import { getProperty, getPropertyByReference } from "@/lib/db/properties";
import { mockProperties } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const presentation = await getPresentationByToken(params.token);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve property (Supabase by reference → by ID → mock fallback)
  let property = await getPropertyByReference(presentation.propertyRef);
  if (!property) property = await getProperty(presentation.propertyId);
  if (!property) property = mockProperties.find(p => p.reference === presentation.propertyRef) ?? null;
  if (!property) property = mockProperties.find(p => p.id === presentation.propertyId) ?? null;

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Use photos saved at presentation creation time (fetched while authenticated)
  // Fall back to coverImage only if nothing was stored
  let photos: string[] = presentation.photos ?? [];
  if (photos.length === 0 && property.coverImage) {
    photos = [property.coverImage];
  }

  return NextResponse.json({ property, photos });
}
