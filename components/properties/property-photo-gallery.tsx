"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, X, Star, ZoomIn,
  ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, AlertCircle, Images,
} from "lucide-react";
import {
  getPhotosForProperty,
  uploadPhotoForProperty,
  deletePhotoForProperty,
  reorderPhotosForProperty,
} from "@/lib/db/photos";

interface Props {
  propertyId: string;
  coverImage?: string;
  onCoverChange: (url: string) => void;
}

export function PropertyPhotoGallery({ propertyId, coverImage, onCoverChange }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [expanded, setExpanded]   = useState(false);
  const [lightbox, setLightbox]   = useState<number | null>(null);
  const [busy, setBusy]           = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cover photo always first
  const allPhotos = (() => {
    const extras = photos.filter(p => p !== coverImage);
    return coverImage ? [coverImage, ...extras] : extras;
  })();

  const PREVIEW = 6;
  const shown   = expanded ? allPhotos : allPhotos.slice(0, PREVIEW);
  const hidden  = allPhotos.length - PREVIEW;

  useEffect(() => {
    getPhotosForProperty(propertyId).then(setPhotos);
  }, [propertyId]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setSaveError(null);
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadPhotoForProperty(propertyId, files[i], photos.length + i);
        setPhotos(prev => [...prev, url]);
      } catch (err) {
        setSaveError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
        break;
      }
    }
    setExpanded(true);
    setBusy(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (photo: string) => {
    setBusy(true);
    setSaveError(null);
    try {
      await deletePhotoForProperty(propertyId, photo);
      setPhotos(prev => prev.filter(p => p !== photo));
      if (photo === coverImage) onCoverChange("");
      setLightbox(null);
    } catch (err) {
      setSaveError(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    setBusy(false);
  };

  // ── Move ──────────────────────────────────────────────────────────────────
  const handleMove = async (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= allPhotos.length) return;
    const next = [...allPhotos];
    [next[idx], next[to]] = [next[to], next[idx]];
    setPhotos(next);
    if (next[0] !== coverImage) onCoverChange(next[0]);
    setBusy(true);
    setSaveError(null);
    try {
      await reorderPhotosForProperty(propertyId, next);
    } catch (err) {
      setSaveError(`Reorder failed: ${err instanceof Error ? err.message : String(err)}`);
      setPhotos(allPhotos);
      onCoverChange(allPhotos[0] ?? "");
    }
    setBusy(false);
  };

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const lbPrev = () => setLightbox(i => i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : null);
  const lbNext = () => setLightbox(i => i !== null ? (i + 1) % allPhotos.length : null);

  return (
    <div className="space-y-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-400">
          {busy ? <span className="text-[#B8960C]">Saving…</span>
                : allPhotos.length === 0 ? "No photos yet"
                : `${allPhotos.length} photo${allPhotos.length !== 1 ? "s" : ""}`}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors disabled:opacity-50"
        >
          <Upload size={12} /> {busy ? "Saving…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} />
      </div>

      {/* ── Error ── */}
      {saveError && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ── Empty ── */}
      {allPhotos.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 text-stone-400 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors text-sm"
        >
          <Upload size={16} strokeWidth={1.5} /> Click to upload photos
        </button>
      )}

      {/* ── Grid ── */}
      {allPhotos.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {shown.map((photo, idx) => {
              const isCover = photo === coverImage;
              const isLast  = !expanded && idx === PREVIEW - 1 && hidden > 0;

              return (
                <div key={photo} className="flex flex-col gap-1">

                  {/* Photo tile */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#B8960C] text-white text-[9px] font-bold shadow">
                        <Star size={8} fill="currentColor" /> Cover
                      </span>
                    )}
                    {isLast && (
                      <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-1"
                      >
                        <Images size={18} />
                        <span className="text-xs font-bold">+{hidden} more</span>
                      </button>
                    )}
                  </div>

                  {/* Action bar below each photo */}
                  {!isLast && (
                    <div className="flex items-center justify-between px-0.5">
                      {/* Move left */}
                      <button
                        type="button"
                        disabled={busy || idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:text-[#B8960C] hover:bg-stone-100 disabled:opacity-20 transition-colors"
                        title="Move left"
                      >
                        <ArrowLeft size={13} strokeWidth={2} />
                      </button>

                      {/* Centre: view + cover + delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLightbox(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          title="View"
                        >
                          <ZoomIn size={12} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => isCover ? null : onCoverChange(photo)}
                          disabled={isCover}
                          className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            isCover
                              ? "text-[#B8960C] cursor-default"
                              : "text-stone-400 hover:text-[#B8960C] hover:bg-stone-100"
                          }`}
                          title={isCover ? "Cover photo" : "Set as cover"}
                        >
                          <Star size={12} strokeWidth={2} fill={isCover ? "currentColor" : "none"} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(photo)}
                          disabled={busy}
                          className="flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                          title="Delete"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Move right */}
                      <button
                        type="button"
                        disabled={busy || idx === allPhotos.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:text-[#B8960C] hover:bg-stone-100 disabled:opacity-20 transition-colors"
                        title="Move right"
                      >
                        <ArrowRight size={13} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expand / collapse */}
          {!expanded && hidden > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Show all {allPhotos.length} photos
            </button>
          )}
          {expanded && allPhotos.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Show less
            </button>
          )}
        </>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {allPhotos.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); lbPrev(); }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25">
              <ChevronLeft size={22} />
            </button>
          )}
          <img
            src={allPhotos[lightbox]}
            alt={`Photo ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {allPhotos.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); lbNext(); }}
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25">
              <ChevronRight size={22} />
            </button>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-white/60 text-sm">{lightbox + 1} / {allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
