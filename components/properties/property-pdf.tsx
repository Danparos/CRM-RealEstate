"use client";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Property } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  villa: "Villa", apartment: "Apartment", house: "House", plot: "Plot",
  investment: "Investment", renovation_project: "Renovation Project",
  new_project: "New Project", opportunity: "Opportunity",
  cycladic: "Cycladic", maisonette: "Maisonette", studio: "Studio",
  land: "Land", commercial: "Commercial", hotel: "Hotel",
};

function fmt(n: number) {
  return "€ " + n.toLocaleString("de-DE");
}

const GOLD  = "#B8960C";
const DARK  = "#1C1917";
const MID   = "#78716C";
const LIGHT = "#A8A29E";
const RULE  = "#E7E5E4";
const TINT  = "#FAFAF9";

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },

  // ── White header ─────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  brandWrap: {
    flexDirection: "column",
    gap: 4,
  },
  brandName: {
    fontFamily: "Times-Roman",
    fontSize: 24,
    color: GOLD,
    letterSpacing: 2.5,
  },
  brandSub: {
    fontSize: 8.5,
    color: LIGHT,
    letterSpacing: 2,
  },
  headerRef: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1.5,
  },

  // ── Gold bar ─────────────────────────────────────────
  goldBar: { height: 3, backgroundColor: GOLD },

  // ── Property title strip ─────────────────────────────
  titleStrip: {
    backgroundColor: TINT,
    paddingHorizontal: 36,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propName: {
    fontFamily: "Times-Roman",
    fontSize: 17,
    color: DARK,
    letterSpacing: 0.2,
  },
  propMeta: {
    fontSize: 8,
    color: LIGHT,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // ── Image collage ────────────────────────────────────
  collage: {
    flexDirection: "row",
    height: 152,
  },
  imgLeft: {
    width: "60%",
    height: "100%",
    objectFit: "cover",
    marginRight: 3,
  },
  imgRight: {
    width: "40%",
    height: "100%",
    objectFit: "cover",
  },

  // ── Two-column body ──────────────────────────────────
  body: {
    flexDirection: "row",
    paddingHorizontal: 36,
    paddingTop: 16,
    paddingBottom: 40,
    flex: 1,
  },
  colLeft: {
    width: "53%",
    paddingRight: 18,
  },
  colRight: {
    width: "47%",
    paddingLeft: 18,
    borderLeftWidth: 1,
    borderLeftColor: RULE,
  },

  // ── Section label ─────────────────────────────────────
  secLabel: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: DARK,
    letterSpacing: 0.3,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },

  // ── Price ────────────────────────────────────────────
  price: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: GOLD,
    marginBottom: 2,
  },
  priceSub: {
    fontSize: 8,
    color: LIGHT,
    marginBottom: 10,
  },
  commRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  commText: { fontSize: 8, color: MID },
  commBold: { fontFamily: "Helvetica-Bold", fontSize: 8, color: DARK },

  // ── Stats 2-column grid ──────────────────────────────
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statCell: {
    width: "50%",
    paddingVertical: 4,
    paddingRight: 6,
    borderBottomWidth: 1,
    borderBottomColor: TINT,
  },
  statCellFull: {
    width: "100%",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: TINT,
  },
  statLbl: {
    fontSize: 7,
    color: LIGHT,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  statVal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: DARK,
  },

  // ── Features ─────────────────────────────────────────
  featuresWrap: { marginBottom: 14 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  pillGold: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#D97706",
    marginBottom: 4,
  },
  pillGoldTxt: { fontSize: 7.5, color: "#92400E", fontFamily: "Helvetica-Bold" },
  pillGray: {
    backgroundColor: "#F5F5F4",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  pillGrayTxt: { fontSize: 7.5, color: MID },

  // ── Description ──────────────────────────────────────
  descText: {
    fontSize: 8.5,
    color: "#44403C",
    lineHeight: 1.6,
  },

  // ── Footer ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingHorizontal: 36,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  footerL: { fontSize: 7, color: LIGHT },
  footerR: { fontFamily: "Times-Roman", fontSize: 8, color: GOLD, letterSpacing: 1.2 },
});

interface Props { property: Property; photos: string[] }

export function PropertyPDFDocument({ property, photos }: Props) {
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  const title     = property.title?.en ?? property.title?.[Object.keys(property.title ?? {})[0]] ?? "Property";
  const location  = `${property.area}${property.island ? `, ${property.island}` : ", Paros"}`;
  const pics      = photos.slice(0, 2);

  // Stats split into pairs for 2-col grid
  const stats: [string, string][] = [
    ["Bedrooms",  String(property.bedrooms)],
    ["Bathrooms", String(property.bathrooms)],
    ["Build",     `${property.buildArea.toLocaleString("de-DE")} m²`],
    ...(property.plotArea           ? [["Plot",       `${property.plotArea.toLocaleString("de-DE")} m²`] as [string,string]] : []),
    ...(property.floors             ? [["Floors",     String(property.floors)] as [string,string]] : []),
    ...(property.yearOfConstruction ? [["Year",       String(property.yearOfConstruction)] as [string,string]] : []),
    ...(property.rooms              ? [["Rooms",      String(property.rooms)] as [string,string]] : []),
    ...(property.balconies          ? [["Balconies",  String(property.balconies)] as [string,string]] : []),
    ...(property.terraces           ? [["Terraces",   String(property.terraces)] as [string,string]] : []),
    ...(property.condition          ? [["Condition",  property.condition.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())] as [string,string]] : []),
    ...(property.energyClass        ? [["Energy",     property.energyClass] as [string,string]] : []),
    ["Type",     typeLabel],
    ["Location", location],
  ];

  const primaryFeatures = [
    property.seafront && "Seafront",
    property.seaView  && "Sea View",
    property.pool     && "Swimming Pool",
  ].filter(Boolean) as string[];

  const hasFeatures = primaryFeatures.length > 0 || (property.features?.length ?? 0) > 0;

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <View style={S.brandWrap}>
            <Text style={S.brandName}>ERRIKOS KOHLS</Text>
            <Text style={S.brandSub}>IMMOBILIEN CONSULTING</Text>
          </View>
          <Text style={S.headerRef}>{property.reference}</Text>
        </View>
        <View style={S.goldBar} />

        {/* ── Property title strip ── */}
        <View style={S.titleStrip}>
          <View>
            <Text style={S.propName}>{title}</Text>
            <Text style={S.propMeta}>{typeLabel.toUpperCase()} · {location.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Image collage ── */}
        {pics.length > 0 && (
          <View style={S.collage}>
            <Image src={pics[0]} style={pics.length >= 2 ? S.imgLeft : { width:"100%", height:"100%", objectFit:"cover" }} />
            {pics.length >= 2 && (
              <Image src={pics[1]} style={S.imgRight} />
            )}
          </View>
        )}

        {/* ── Two-column body ── */}
        <View style={S.body}>

          {/* LEFT — Overview */}
          <View style={S.colLeft}>
            <Text style={S.secLabel}>Overview</Text>

            <Text style={S.price}>{fmt(property.askingPrice)}</Text>
            {property.buildArea > 0 && (
              <Text style={S.priceSub}>{fmt(Math.round(property.askingPrice / property.buildArea))} per m²</Text>
            )}
            {(property.buyerCommission !== undefined || property.sellerCommission !== undefined) && (
              <View style={S.commRow}>
                {property.buyerCommission !== undefined && (
                  <Text style={S.commText}>Buyer <Text style={S.commBold}>{property.buyerCommission}%</Text></Text>
                )}
                {property.sellerCommission !== undefined && (
                  <Text style={S.commText}>Seller <Text style={S.commBold}>{property.sellerCommission}%</Text></Text>
                )}
              </View>
            )}

            {/* 2-col stats grid */}
            <View style={S.statsGrid}>
              {stats.map(([lbl, val], i) => {
                const isOdd  = stats.length % 2 === 1;
                const isLast = i === stats.length - 1;
                const full   = isOdd && isLast;
                return (
                  <View key={lbl} style={full ? S.statCellFull : S.statCell}>
                    <Text style={S.statLbl}>{lbl.toUpperCase()}</Text>
                    <Text style={S.statVal}>{val}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* RIGHT — Features + Description */}
          <View style={S.colRight}>
            {hasFeatures && (
              <View style={S.featuresWrap}>
                <Text style={S.secLabel}>Features</Text>
                <View style={S.pills}>
                  {primaryFeatures.map(f => (
                    <View key={f} style={S.pillGold}>
                      <Text style={S.pillGoldTxt}>{f}</Text>
                    </View>
                  ))}
                  {(property.features ?? []).map(f => (
                    <View key={f} style={S.pillGray}>
                      <Text style={S.pillGrayTxt}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {property.description && (
              <View>
                <Text style={S.secLabel}>Description</Text>
                <Text style={S.descText}>{property.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerL}>© Dan Paul Immobilien Consulting · Confidential</Text>
          <Text style={S.footerR}>ERRIKOS KOHLS</Text>
        </View>

      </Page>
    </Document>
  );
}
