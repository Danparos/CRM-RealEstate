"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllProperties } from "@/lib/db/properties";
import { formatCurrency } from "@/lib/utils";
import type { Client, Property } from "@/types";

const EXCLUDED_STATUSES: Property["status"][] = ["sold", "archived", "withdrawn", "draft", "on_hold"];

function isNewListing(property: Property): boolean {
  if (property.status !== "available" || !property.availableSince) return false;
  return (Date.now() - new Date(property.availableSince).getTime()) / 86_400_000 <= 30;
}
const MAX_VISIBLE = 6;

function matchesClient(property: Property, client: Client): boolean {
  if (EXCLUDED_STATUSES.includes(property.status)) return false;
  if (client.budgetMax != null && property.askingPrice > client.budgetMax) return false;
  if (client.budgetMin != null && property.askingPrice < client.budgetMin) return false;

  if (client.propertyLocations && client.propertyLocations.length > 0) {
    const areaLower = property.area.toLowerCase();
    const match = client.propertyLocations.some(
      loc => areaLower.includes(loc.toLowerCase()) || loc.toLowerCase().includes(areaLower)
    );
    if (!match) return false;
  }

  if (client.propertyTypes && client.propertyTypes.length > 0) {
    if (!client.propertyTypes.includes(property.type)) return false;
  }

  if (client.propertyBedroomsMin) {
    const min = parseInt(client.propertyBedroomsMin, 10);
    if (!isNaN(min) && property.bedrooms < min) return false;
  }

  if (client.propertyBedroomsMax) {
    const max = parseInt(client.propertyBedroomsMax, 10);
    if (!isNaN(max) && property.bedrooms > max) return false;
  }

  if (client.propertyPool === "yes" && !property.pool) return false;

  return true;
}

interface Props {
  client: Client;
}

export function PropertyMatches({ client }: Props) {
  const [matches, setMatches] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProperties().then(all => {
      const matched = all.filter(p => matchesClient(p, client));
      setMatches(matched);
      setLoading(false);
    });
  }, [client]);

  const visible = matches.slice(0, MAX_VISIBLE);
  const hasMore = matches.length > MAX_VISIBLE;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
        <h2 className="font-serif text-xl font-bold text-stone-900">Matching Properties</h2>
        {!loading && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold bg-[#B8960C]/10 text-[#B8960C]">
            {matches.length}
          </span>
        )}
      </div>

      <div className="px-6 py-4">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-20 bg-stone-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-3.5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-500">No properties currently match</p>
            <p className="text-xs text-stone-400 mt-1">this client&apos;s search criteria</p>
          </div>
        ) : (
          /* Property grid */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {visible.map(property => {
                const isNew = isNewListing(property);
                return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group rounded-xl border border-stone-100 overflow-hidden hover:border-[#B8960C]/40 hover:shadow-sm transition-all"
                >
                  {/* Cover image */}
                  <div className="h-20 bg-stone-100 overflow-hidden relative">
                    {property.coverImage ? (
                      <img
                        src={property.coverImage}
                        alt={property.title?.en ?? property.reference}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                      </div>
                    )}
                    {/* Reference badge */}
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center h-4 px-1.5 rounded bg-black/50 text-[10px] font-mono font-semibold text-white backdrop-blur-sm">
                      {property.reference}
                    </span>
                    {isNew && (
                      <span className="absolute top-1.5 right-1.5 inline-flex items-center h-4 px-1.5 rounded bg-emerald-500 text-[9px] font-bold tracking-widest text-white">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-stone-800 leading-tight line-clamp-1 group-hover:text-[#B8960C] transition-colors">
                      {property.title?.en ?? property.reference}
                    </p>
                    <p className="text-xs font-bold text-[#B8960C]">
                      {formatCurrency(property.askingPrice)}
                    </p>
                    <p className="text-[11px] text-stone-400 leading-tight">
                      {property.area}
                      {property.bedrooms > 0 && ` · ${property.bedrooms} bd`}
                      {` · ${property.type.replace(/_/g, " ")}`}
                    </p>
                  </div>
                </Link>
              );
              })}
            </div>

            {/* View all link */}
            {hasMore && (
              <div className="pt-1 border-t border-stone-100">
                <Link
                  href={`/properties`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium text-[#B8960C] hover:bg-[#B8960C]/5 transition-colors"
                >
                  View all {matches.length} matches
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
