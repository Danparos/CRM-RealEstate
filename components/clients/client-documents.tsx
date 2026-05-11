"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Upload, FileText, FileImage, File, Trash2, Download, Plus, X, ExternalLink } from "lucide-react";
import { saveClientFile, getClientFiles, deleteClientFile, formatFileSize } from "@/lib/client-files";
import type { ClientFile } from "@/lib/client-files";

const CATEGORIES = [
  { value: "mandate",       label: "Mandate",           color: "bg-[#B8960C]/15 text-[#7a6008] border-[#B8960C]/30" },
  { value: "passport",      label: "Passport / ID",     color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "proof_funds",   label: "Proof of Funds",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "contract",      label: "Contract",          color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "property_docs", label: "Property Docs",     color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "correspondence",label: "Correspondence",    color: "bg-stone-50 text-stone-600 border-stone-200" },
  { value: "other",         label: "Other",             color: "bg-stone-50 text-stone-500 border-stone-200" },
];

function categoryStyle(value: string) {
  return CATEGORIES.find(c => c.value === value)?.color ?? "bg-stone-50 text-stone-500 border-stone-200";
}
function categoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-400" />;
  if (mime === "application/pdf") return <FileText className="h-5 w-5 text-red-400" />;
  return <File className="h-5 w-5 text-stone-400" />;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

function FilePreviewModal({ file, onClose, onDownload }: { file: ClientFile; onClose: () => void; onDownload: (f: ClientFile) => void }) {
  const url = useMemo(() => URL.createObjectURL(file.blob), [file.blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const isImage = file.mimeType.startsWith("image/");
  const isPdf   = file.mimeType === "application/pdf";
  const canPreview = isImage || isPdf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
              {fileIcon(file.mimeType)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${categoryStyle(file.category)}`}>
                  {categoryLabel(file.category)}
                </span>
                <span className="text-[11px] text-stone-400">{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 min-h-0 bg-stone-100">
          {isPdf && (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-full min-h-[600px]"
              style={{ border: "none" }}
            />
          )}
          {isImage && (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center p-6">
              <img
                src={url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
          {!canPreview && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                <File className="h-8 w-8 text-stone-400" />
              </div>
              <div>
                <p className="text-stone-600 font-medium text-sm">Preview not available</p>
                <p className="text-stone-400 text-xs mt-1">This file type cannot be previewed in the browser.</p>
              </div>
              <button
                onClick={() => onDownload(file)}
                className="inline-flex items-center gap-2 px-5 h-9 rounded-lg bg-[#B8960C] text-white text-sm font-medium hover:bg-[#9e7f0a] transition-colors"
              >
                <Download className="h-4 w-4" />
                Download to open
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadModalProps {
  clientId: string;
  onClose: () => void;
  onUploaded: (file: ClientFile) => void;
}

function UploadModal({ clientId, onClose, onUploaded }: UploadModalProps) {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState<File | null>(null);
  const [fileName,  setFileName]  = useState("");
  const [category,  setCategory]  = useState("mandate");
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 50 * 1024 * 1024) { setError("File must be under 50 MB."); return; }
    setFile(f);
    setFileName(f.name.replace(/\.[^.]+$/, "")); // strip extension for editing
    setError("");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const finalName = (fileName.trim() || file.name.replace(/\.[^.]+$/, "")) + ext;
      const doc: ClientFile = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        clientId,
        name: finalName,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        category,
        uploadedAt: new Date().toISOString(),
        blob: file,
      };
      await saveClientFile(doc);
      onUploaded(doc);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Upload Document</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-all ${
              dragging ? "border-[#B8960C] bg-[#fdf9ec]" : file ? "border-emerald-400 bg-emerald-50" : "border-stone-200 bg-stone-50 hover:border-[#B8960C] hover:bg-[#fdf9ec]"
            }`}
          >
            <input ref={inputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  {fileIcon(file.type)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-800 truncate max-w-[260px]">{file.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                  Change file
                </button>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-stone-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-700">Drop file here or <span className="text-[#B8960C]">browse</span></p>
                  <p className="text-xs text-stone-400 mt-1">PDF, Word, Excel, images — up to 50 MB</p>
                </div>
              </>
            )}
          </div>

          {/* File name */}
          {file && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">File Name</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="Enter file name…"
                  className="flex-1 h-9 px-3 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 outline-none transition-all focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20"
                />
                <span className="text-xs text-stone-400 shrink-0">
                  {file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ""}
                </span>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 block">Document Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    category === cat.value ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm" : "bg-white border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 h-9 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-stone-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="inline-flex items-center gap-2 px-5 h-9 rounded-lg bg-[#B8960C] text-white text-sm font-medium hover:bg-[#9e7f0a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading…" : <><Upload className="h-3.5 w-3.5" /> Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props { clientId: string }

export function ClientDocuments({ clientId }: Props) {
  const [files,       setFiles]       = useState<ClientFile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showUpload,  setShowUpload]  = useState(false);
  const [previewFile, setPreviewFile] = useState<ClientFile | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await getClientFiles(clientId);
      docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setFiles(docs);
    } catch {}
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleUploaded = (file: ClientFile) => {
    setFiles(p => [file, ...p]);
    setShowUpload(false);
  };

  const handleDownload = (file: ClientFile) => {
    const url = URL.createObjectURL(file.blob);
    const a   = document.createElement("a");
    a.href    = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteClientFile(id);
      setFiles(p => p.filter(f => f.id !== id));
    } catch {}
    setDeleting(null);
  };

  const handlePreview = (file: ClientFile) => {
    setPreviewFile(file);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">Documents</h2>
            {files.length > 0 && (
              <p className="text-xs text-stone-400 mt-0.5">{files.length} file{files.length !== 1 ? "s" : ""}</p>
            )}
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium bg-[#B8960C] text-white hover:bg-[#9e7f0a] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : files.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-stone-300" />
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-400">No documents yet</p>
              <p className="text-xs text-stone-300 mt-0.5">Upload mandates, contracts, IDs and more</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg border border-dashed border-stone-300 text-xs font-medium text-stone-500 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors mt-1"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload first document
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {files.map(file => (
              <li key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                  {fileIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handlePreview(file)}
                    className="text-sm font-medium text-stone-800 hover:text-[#B8960C] transition-colors truncate block text-left w-full"
                  >
                    {file.name}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryStyle(file.category)}`}>
                      {categoryLabel(file.category)}
                    </span>
                    <span className="text-[11px] text-stone-400">{formatFileSize(file.size)}</span>
                    <span className="text-stone-200">·</span>
                    <span className="text-[11px] text-stone-400">{formatDate(file.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file)}
                    title="Download"
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#B8960C] hover:bg-stone-100 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deleting === file.id}
                    title="Delete"
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownload}
        />
      )}

      {showUpload && (
        <UploadModal
          clientId={clientId}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </>
  );
}
