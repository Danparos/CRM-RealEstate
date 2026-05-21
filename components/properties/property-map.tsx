"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";
import type { Property, PropertyStatus } from "@/types";

const STATUS_COLORS: Record<PropertyStatus, string> = {
  available:      "#10b981",
  under_offer:    "#f59e0b",
  under_contract: "#f97316",
  sold:           "#78716c",
  off_market:     "#64748b",
  draft:          "#9ca3af",
  rented:         "#0ea5e9",
  withdrawn:      "#ef4444",
  archived:       "#a3a3a3",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  available:      "Available",
  under_offer:    "Under Offer",
  under_contract: "Under Contract",
  sold:           "Sold",
  off_market:     "Off Market",
  draft:          "Draft",
  rented:         "Rented",
  withdrawn:      "Withdrawn",
  archived:       "Archived",
};

function makeIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <circle cx="16" cy="15" r="13" fill="${color}" stroke="white" stroke-width="2.5"/>
    <path d="M9 19v-6h3v6h4v-5h1l-7-6-7 6h1v5z" fill="white"/>
    <polygon points="10,27 16,38 22,27" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

function popupHtml(property: Property): string {
  const title = property.title?.en ?? Object.values(property.title ?? {})[0] ?? property.reference;
  const color = STATUS_COLORS[property.status] ?? "#B8960C";
  const label = STATUS_LABELS[property.status] ?? property.status;
  const price = formatCurrency(property.askingPrice);
  const img = property.coverImage
    ? `<div style="height:100px;overflow:hidden;border-radius:10px 10px 0 0;">
        <img src="${property.coverImage}" alt="${title}" style="width:100%;height:100%;object-fit:cover;" />
       </div>`
    : "";

  const stats = [
    property.bedrooms > 0 ? `${property.bedrooms} bed` : "",
    property.bathrooms > 0 ? `${property.bathrooms} bath` : "",
    property.buildArea > 0 ? `${property.buildArea}m²` : "",
  ].filter(Boolean).join(" · ");

  return `
    <div style="width:230px;font-family:Inter,sans-serif;border-radius:10px;overflow:hidden;">
      ${img}
      <div style="padding:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:11px;color:#a8a29e;font-weight:500;letter-spacing:.05em;">${property.reference}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:${color};color:white;font-weight:600;">${label}</span>
        </div>
        <div style="font-weight:600;font-size:13px;color:#1c1917;line-height:1.3;margin-bottom:4px;">${title}</div>
        <div style="font-size:11px;color:#a8a29e;margin-bottom:8px;">📍 ${property.area}${property.island ? `, ${property.island}` : ""}</div>
        <div style="font-size:16px;font-weight:700;color:#B8960C;margin-bottom:8px;">${price}</div>
        ${stats ? `<div style="font-size:11px;color:#78716c;margin-bottom:10px;">${stats}</div>` : ""}
        <a href="/properties/${property.id}"
           style="display:block;text-align:center;padding:7px;background:#B8960C;color:white;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:.04em;">
          View Property →
        </a>
      </div>
    </div>
  `;
}

interface PropertyMapProps {
  properties: Property[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const mappable = useMemo(
    () => properties.filter(p => p.lat != null && p.lng != null),
    [properties]
  );

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.08, 25.18],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers whenever mappable changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(mappable.map(p => p.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    mappable.forEach(property => {
      if (markersRef.current.has(property.id)) return;

      const color = STATUS_COLORS[property.status] ?? "#B8960C";
      const marker = L.marker([property.lat!, property.lng!], { icon: makeIcon(color) });

      marker.bindPopup(popupHtml(property), {
        closeButton: true,
        maxWidth: 250,
        className: "paros-popup",
      });

      marker.addTo(map);
      markersRef.current.set(property.id, marker);
    });
  }, [mappable]);

  return (
    <>
      <style>{`
        .paros-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          border: none;
        }
        .paros-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1;
        }
        .paros-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          font-family: Inter, sans-serif;
        }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
