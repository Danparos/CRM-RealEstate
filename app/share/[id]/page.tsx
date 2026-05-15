import { notFound } from "next/navigation";
import { Waves, Droplets, Mountain, BedDouble, Bath, Maximize2, MapPin } from "lucide-react";
import { getProperty } from "@/lib/db/properties";
import { getPhotosForProperty } from "@/lib/db/photos";
import type { Property, PropertyType } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const TYPE_LABELS: Record<PropertyType, string> = {
  villa: "Villa",
  apartment: "Apartment",
  house: "House",
  plot: "Plot",
  investment: "Investment",
  renovation_project: "Renovation Project",
  new_project: "New Project",
  opportunity: "Opportunity",
  cycladic: "Cycladic",
  maisonette: "Maisonette",
  studio: "Studio",
  land: "Land / Plot",
  commercial: "Commercial",
  hotel: "Hotel / B&B",
};

const CONDITION_LABELS: Record<string, string> = {
  planned: "Planned",
  in_good_condition: "In Good Condition",
  needs_renovation: "Needs Renovation",
  under_construction: "Under Construction",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.title.en ?? "Property"} — Dan Paul Real Estate`,
    description: property.description ?? `${TYPE_LABELS[property.type]} in ${property.area}, Paros. ${formatCurrency(property.askingPrice)}.`,
  };
}

export default async function SharePropertyPage({ params }: { params: { id: string } }) {
  const [property, allPhotos] = await Promise.all([
    getProperty(params.id),
    getPhotosForProperty(params.id),
  ]);

  if (!property) notFound();

  // Arrange photos: cover first, then extras
  const photos: string[] = (() => {
    const extras = allPhotos.filter((p) => p !== property.coverImage);
    return property.coverImage ? [property.coverImage, ...extras] : extras;
  })();

  const heroPhoto = photos[0] ?? null;
  const stripPhotos = photos.slice(1);
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  const locationLabel = [property.area, property.island ?? "Paros"].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-stone-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span
            className="font-serif text-xl font-semibold tracking-wide"
            style={{ color: "#B8960C" }}
          >
            Dan Paul Real Estate
          </span>
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-stone-400">
            Ref: {property.reference}
          </span>
        </div>
      </header>

      {/* ── Hero image ── */}
      {heroPhoto ? (
        <div className="w-full bg-stone-200 overflow-hidden" style={{ maxHeight: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto}
            alt={property.title.en ?? "Property"}
            className="w-full object-cover"
            style={{ maxHeight: 420, minHeight: 200 }}
          />
        </div>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{
            maxHeight: 420,
            minHeight: 240,
            background: "linear-gradient(135deg, #f5f0e8 0%, #e8dfc8 50%, #d6c99a 100%)",
          }}
        >
          <span className="font-serif text-4xl font-light" style={{ color: "#B8960C", opacity: 0.4 }}>
            Dan Paul Real Estate
          </span>
        </div>
      )}

      {/* ── Photo strip ── */}
      {stripPhotos.length > 0 && (
        <div className="bg-white border-b border-stone-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {stripPhotos.slice(0, 8).map((url, i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-lg overflow-hidden bg-stone-100"
                  style={{ width: 120, height: 80 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: primary info ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title + price + badges */}
            <div>
              {/* Area + type */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <MapPin size={12} strokeWidth={2} style={{ color: "#B8960C" }} />
                  {locationLabel}
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                  {typeLabel}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight tracking-wide mb-1">
                {property.title.en}
              </h1>
              {property.title.de && (
                <p className="text-base text-stone-400 italic font-serif mb-4">{property.title.de}</p>
              )}

              {/* Price */}
              <p
                className="text-3xl sm:text-4xl font-bold leading-none mt-3"
                style={{ color: "#B8960C" }}
              >
                {formatCurrency(property.askingPrice)}
              </p>
              {property.buildArea > 0 && (
                <p className="text-sm text-stone-400 mt-1">
                  {formatCurrency(Math.round(property.askingPrice / property.buildArea))} / m²
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
                  <BedDouble size={18} strokeWidth={1.5} style={{ color: "#B8960C" }} />
                  <div>
                    <p className="text-lg font-bold text-stone-800 leading-none">{property.bedrooms}</p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mt-0.5">Bedrooms</p>
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
                  <Bath size={18} strokeWidth={1.5} style={{ color: "#B8960C" }} />
                  <div>
                    <p className="text-lg font-bold text-stone-800 leading-none">{property.bathrooms}</p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mt-0.5">Bathrooms</p>
                  </div>
                </div>
              )}
              {property.buildArea > 0 && (
                <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
                  <Maximize2 size={18} strokeWidth={1.5} style={{ color: "#B8960C" }} />
                  <div>
                    <p className="text-lg font-bold text-stone-800 leading-none">
                      {property.buildArea.toLocaleString("en-DE")} m²
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mt-0.5">Build Area</p>
                  </div>
                </div>
              )}
              {property.plotArea && property.plotArea > 0 && (
                <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
                  <Maximize2 size={18} strokeWidth={1.5} className="text-stone-400" />
                  <div>
                    <p className="text-lg font-bold text-stone-800 leading-none">
                      {property.plotArea.toLocaleString("en-DE")} m²
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mt-0.5">Plot Area</p>
                  </div>
                </div>
              )}
            </div>

            {/* Feature badges */}
            {(property.seafront || property.seaView || property.pool || (property.features && property.features.length > 0)) && (
              <div className="flex flex-wrap gap-2">
                {property.seafront && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <Waves size={12} strokeWidth={2} /> Seafront
                  </span>
                )}
                {property.seaView && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                    <Mountain size={12} strokeWidth={2} /> Sea View
                  </span>
                )}
                {property.pool && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Droplets size={12} strokeWidth={2} /> Pool
                  </span>
                )}
                {property.features?.map((f) => (
                  <span key={f} className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-stone-900 mb-3">About this property</h2>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </div>

          {/* ── Right: key facts card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">
              <div
                className="px-6 py-4 border-b border-stone-100"
                style={{ background: "linear-gradient(135deg, #faf8f3 0%, #f5f0e0 100%)" }}
              >
                <h2 className="font-serif text-lg font-bold text-stone-900">Key Details</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-0">
                  {[
                    property.bedrooms > 0          && ["Bedrooms",   property.bedrooms],
                    property.bathrooms > 0         && ["Bathrooms",  property.bathrooms],
                    property.buildArea > 0         && ["Build Area", `${property.buildArea.toLocaleString("en-DE")} m²`],
                    property.plotArea              && ["Plot Area",  `${property.plotArea.toLocaleString("en-DE")} m²`],
                    property.buildableArea         && ["Buildable",  `${property.buildableArea.toLocaleString("en-DE")} m²`],
                    property.floors                && ["Floors",     property.floors],
                    property.yearOfConstruction    && ["Year Built", property.yearOfConstruction],
                    property.condition             && ["Condition",  CONDITION_LABELS[property.condition] ?? property.condition],
                    property.island                && ["Island",     property.island],
                    property.distanceFromSea !== undefined && [
                      "Sea Distance",
                      property.distanceFromSea === 0 ? "Seafront" : `${property.distanceFromSea} m`,
                    ],
                    property.energyClass           && ["Energy",     property.energyClass],
                  ]
                    .filter((x): x is [string, string | number] => Array.isArray(x))
                    .map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="flex items-center justify-between gap-2 py-2.5 border-b border-stone-100 last:border-0"
                      >
                        <dt className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold whitespace-nowrap">
                          {label}
                        </dt>
                        <dd className="text-sm font-semibold text-stone-800 text-right">{value}</dd>
                      </div>
                    ))}
                </dl>

                {/* Feature icons summary */}
                {(property.pool || property.seaView || property.seafront) && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                    {property.seafront && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                        style={{ background: "#e0f2fe", color: "#0369a1" }}
                      >
                        <Waves size={10} strokeWidth={2} /> Seafront
                      </span>
                    )}
                    {property.seaView && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600">
                        <Mountain size={10} strokeWidth={2} /> Sea View
                      </span>
                    )}
                    {property.pool && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-700">
                        <Droplets size={10} strokeWidth={2} /> Pool
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
          <p
            className="font-serif text-2xl font-semibold mb-2"
            style={{ color: "#B8960C" }}
          >
            Dan Paul Real Estate
          </p>
          <p className="text-sm text-stone-500 mb-1">
            Contact us for more information about this property.
          </p>
          <p className="text-xs text-stone-400 tracking-wider uppercase">
            Paros, Greece · Luxury Real Estate
          </p>
        </div>
      </footer>
    </div>
  );
}
