"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, Star, ZoomIn, ChevronLeft, ChevronRight, Images } from "lucide-react";

const STORAGE_KEY = "crm-property-photos";

function loadPhotos(propertyId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map: Record<string, string[]> = JSON.parse(raw);
    return map[propertyId] ?? [];
  } catch { return []; }
}

function savePhotos(propertyId: string, photos: string[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    map[propertyId] = photos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

interface Props {
  propertyId: string;
  coverImage?: string;
  onCoverChange: (url: string) => void;
}

export function PropertyPhotoGallery({ propertyId, coverImage, onCoverChange }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allPhotos = (() => {
    const extras = photos.filter(p => p !== coverImage);
    return coverImage ? [coverImage, ...extras] : extras;
  })();

  const PREVIEW_COUNT = 3;
  const visiblePhotos = expanded ? allPhotos : allPhotos.slice(0, PREVIEW_COUNT);
  const hiddenCount = allPhotos.length - PREVIEW_COUNT;

  useEffect(() => {
    setPhotos(loadPhotos(propertyId));
  }, [propertyId]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    let loaded = 0;
    const newPhotos: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        if (result) newPhotos.push(result);
        loaded++;
        if (loaded === files.length) {
          setPhotos(prev => {
            const updated = [...prev, ...newPhotos];
            savePhotos(propertyId, updated);
            return updated;
          });
          setUploading(false);
          setExpanded(true);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleDelete = (photo: string) => {
    const updated = photos.filter(p => p !== photo);
    savePhotos(propertyId, updated);
    setPhotos(updated);
    if (photo === coverImage) onCoverChange("");
    setLightbox(null);
  };

  const handleSetCover = (photo: string) => {
    onCoverChange(photo);
    if (!photos.includes(photo)) {
      const updated = [photo, ...photos];
      savePhotos(propertyId, updated);
      setPhotos(updated);
    }
  };

  const prev = () => setLightbox(i => i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % allPhotos.length : null);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-stone-400">
          {allPhotos.length === 0 ? "No photos yet" : `${allPhotos.length} photo${allPhotos.length !== 1 ? "s" : ""}`}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm disabled:opacity-50"
        >
          <Upload size={12} strokeWidth={2} />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} />
      </div>

      {/* Empty state — no grid, no tiles */}
      {allPhotos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 text-stone-400 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors text-sm font-medium"
        >
          <Upload size={16} strokeWidth={1.5} /> Click to upload photos
        </button>
      ) : (
        <>
          {/* Photo row — max 3, or all when expanded */}
          <div className="grid grid-cols-3 gap-2">
            {visiblePhotos.map((photo, idx) => {
              const isCover = photo === coverImage;
              const isLastVisible = !expanded && idx === PREVIEW_COUNT - 1 && hiddenCount > 0;
              return (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />

                  {/* "+N more" overlay on the 3rd tile when collapsed */}
                  {isLastVisible && (
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white gap-1"
                    >
                      <Images size={20} strokeWidth={1.5} />
                      <span className="text-sm font-bold">+{hiddenCount} more</span>
                    </button>
                  )}

                  {!isLastVisible && (
                    <>
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B8960C] text-white text-[10px] font-bold shadow-sm">
                          <Star size={9} fill="currentColor" /> Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={() => setLightbox(idx)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-700 hover:bg-white transition-colors" title="View">
                          <ZoomIn size={13} strokeWidth={2} />
                        </button>
                        {!isCover && (
                          <button type="button" onClick={() => handleSetCover(photo)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-700 hover:bg-[#B8960C] hover:text-white transition-colors" title="Set as cover">
                            <Star size={13} strokeWidth={2} />
                          </button>
                        )}
                        <button type="button" onClick={() => handleDelete(photo)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-700 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                          <X size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Collapse link when expanded and there's more than 3 */}
          {expanded && allPhotos.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Show less
            </button>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          {allPhotos.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors">
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          )}
          <img src={allPhotos[lightbox]} alt={`Photo ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()} />
          {allPhotos.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors">
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-white/60 text-sm">{lightbox + 1} / {allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          {allPhotos[lightbox] === coverImage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B8960C] text-white text-xs font-bold shadow">
              <Star size={11} fill="currentColor" /> Cover Photo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
