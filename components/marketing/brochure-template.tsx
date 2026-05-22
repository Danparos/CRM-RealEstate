import type { Property } from "@/types";
import type { BrochureLang } from "@/lib/brochure-translations";
import { T } from "@/lib/brochure-translations";

interface BrochureTemplateProps {
  property: Property;
  lang: BrochureLang;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
}

export function BrochureTemplate({ property, lang, agentName, agentPhone, agentEmail }: BrochureTemplateProps) {
  const t        = T[lang];
  const title    = property.title?.[lang] ?? property.title?.["en"] ?? "Property";
  const isSale   = property.marketingMethod !== "rent";
  const label    = isSale ? t.forSale : t.forRent;

  function formatPrice(n: number): string {
    return "€" + n.toLocaleString("de-DE");
  }

  const features: string[] = [];
  if (property.pool)      features.push(t.pool);
  if (property.seafront)  features.push(t.seafront);
  if (property.seaView)   features.push(t.seaView);
  if (property.features)  features.push(...property.features.slice(0, 6));

  return (
    <div
      id="brochure-print-root"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#fff",
        fontFamily: "'Georgia', serif",
        color: "#1c1710",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold top bar */}
      <div style={{ background: "linear-gradient(90deg,#B8960C,#e6c84a,#B8960C)", height: 6 }} />

      {/* Header */}
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid #e7e3db", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, color: "#B8960C" }}>{t.agencyName}</div>
          <div style={{ fontSize: 10, color: "#8a7a5a", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>{t.tagline}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#8a7a5a", textTransform: "uppercase", letterSpacing: 1 }}>{t.reference}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1710" }}>{property.reference}</div>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ width: "100%", height: 220, background: "#e7e3db", position: "relative", overflow: "hidden" }}>
        {property.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.coverImage}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f5f0e8,#e7e3db)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}
        {/* For Sale badge */}
        <div style={{ position: "absolute", top: 16, left: 16, background: "#B8960C", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "5px 14px" }}>
          {label}
        </div>
        {property.contractType === "exclusive" && (
          <div style={{ position: "absolute", top: 16, right: 16, background: "#1c1710", color: "#B8960C", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "5px 12px" }}>
            {t.exclusiveListing}
          </div>
        )}
      </div>

      {/* Title + price row */}
      <div style={{ padding: "20px 32px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, paddingRight: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: "#1c1710" }}>{title}</div>
          <div style={{ fontSize: 13, color: "#8a7a5a", marginTop: 6 }}>{property.area}{property.island ? `, ${property.island}` : ""}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "#8a7a5a", textTransform: "uppercase", letterSpacing: 1 }}>{t.askingPrice}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#B8960C", letterSpacing: -0.5 }}>{formatPrice(property.askingPrice)}</div>
          {property.buyerCommission && (
            <div style={{ fontSize: 10, color: "#8a7a5a", marginTop: 2 }}>{t.commission}: {property.buyerCommission}%</div>
          )}
        </div>
      </div>

      {/* Key stats strip */}
      <div style={{ margin: "0 32px 16px", background: "#f9f6f0", border: "1px solid #e7e3db", borderRadius: 4, display: "flex" }}>
        {[
          { label: t.bedrooms,  value: String(property.bedrooms) },
          { label: t.bathrooms, value: String(property.bathrooms) },
          { label: t.buildArea, value: `${property.buildArea} m²` },
          ...(property.plotArea ? [{ label: t.plotArea, value: `${property.plotArea} m²` }] : []),
          ...(property.yearOfConstruction ? [{ label: t.yearBuilt, value: String(property.yearOfConstruction) }] : []),
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 12px", textAlign: "center", borderRight: i < 4 ? "1px solid #e7e3db" : "none" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1710" }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: "#8a7a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {property.description && (
        <div style={{ padding: "0 32px 16px" }}>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: "#3d3520", margin: 0 }}>
            {typeof property.description === "string"
              ? property.description
              : (property.description as Record<string, string>)[lang] ?? (property.description as Record<string, string>)["en"] ?? ""}
          </p>
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div style={{ padding: "0 32px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#B8960C", marginBottom: 8 }}>{t.features}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {features.map((f, i) => (
              <span key={i} style={{ fontSize: 10, border: "1px solid #e7e3db", padding: "3px 10px", borderRadius: 20, color: "#3d3520" }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid #e7e3db", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <div>
          <div style={{ fontSize: 10, color: "#8a7a5a", marginBottom: 2 }}>{t.contactAgent}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1710" }}>{agentName ?? t.agencyName}</div>
          {agentPhone && <div style={{ fontSize: 11, color: "#8a7a5a" }}>{agentPhone}</div>}
          {agentEmail && <div style={{ fontSize: 11, color: "#8a7a5a" }}>{agentEmail}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#8a7a5a", fontStyle: "italic" }}>{t.viewingBy}</div>
          <div style={{ marginTop: 6, height: 3, background: "linear-gradient(90deg,#B8960C,#e6c84a,#B8960C)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
