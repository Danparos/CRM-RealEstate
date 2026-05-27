"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Lock,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  FileText,
  File,
  Loader2,
  ImageIcon,
} from "lucide-react";
import {
  type Document,
  getDocuments,
  uploadDocument,
  getSignedUrl,
  deleteDocument,
  formatFileSize,
} from "@/lib/db/documents";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className="h-5 w-5 text-blue-400" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-5 w-5 text-red-400" />;
  return <File className="h-5 w-5 text-stone-400" />;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ─── Category card config ─────────────────────────────────────────────────────

type Category = "private" | "general";

const CARD_CONFIG: Record<
  Category,
  {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    iconBg: string;
  }
> = {
  private: {
    icon: <Lock className="h-4 w-4 text-[#B8960C]" />,
    title: "Private Documents",
    subtitle: "Mandate, IDs, private information",
    iconBg: "bg-[#B8960C]/10",
  },
  general: {
    icon: <FolderOpen className="h-4 w-4 text-stone-500" />,
    title: "General Files",
    subtitle: "Plans, topography, surveys",
    iconBg: "bg-stone-100",
  },
};

// ─── File row ─────────────────────────────────────────────────────────────────

interface FileRowProps {
  doc: Document;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  deleting: boolean;
}

function FileRow({ doc, onDownload, onDelete, deleting }: FileRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors group">
      {/* Icon */}
      <div className="h-9 w-9 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
        {fileIcon(doc.mimeType ?? "")}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{doc.fileName}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {formatFileSize(doc.fileSize)}&nbsp;·&nbsp;{formatDate(doc.uploadedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDownload(doc)}
          title="Download"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#B8960C] hover:bg-stone-100 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(doc)}
          disabled={deleting}
          title="Delete"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </li>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: Category;
  docs: Document[];
  uploading: boolean;
  onUpload: (category: Category, file: File) => void;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  deletingId: string | null;
}

function CategoryCard({
  category,
  docs,
  uploading,
  onUpload,
  onDownload,
  onDelete,
  deletingId,
}: CategoryCardProps) {
  const cfg = CARD_CONFIG[category];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(category, file);
      // Reset so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}
        >
          {cfg.icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 leading-tight">
            {cfg.title}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 truncate">{cfg.subtitle}</p>
        </div>
        {docs.length > 0 && (
          <span className="ml-auto shrink-0 text-[11px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {docs.length}
          </span>
        )}
      </div>

      {/* File list */}
      <div className="flex-1">
        {docs.length === 0 ? (
          <div className="mx-4 my-4 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 py-8 text-center">
            <File className="h-7 w-7 text-stone-300" />
            <p className="text-xs text-stone-400">No files yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {docs.map((doc) => (
              <FileRow
                key={doc.id}
                doc={doc}
                onDownload={onDownload}
                onDelete={onDelete}
                deleting={deletingId === doc.id}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Upload area */}
      <div className="px-4 pb-4 pt-3 border-t border-stone-100 mt-auto">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
        <label
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex items-center justify-center gap-2 w-full h-9 rounded-xl border border-dashed text-xs font-medium transition-all cursor-pointer select-none ${
            uploading
              ? "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
              : "border-stone-300 text-stone-500 hover:border-[#B8960C] hover:text-[#B8960C] hover:bg-[#fdf9ec]"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload file
            </>
          )}
        </label>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface DocumentsSectionProps {
  entityType: "client" | "property";
  entityId: string;
  onActivity?: (note: string) => void;
}

export function DocumentsSection({ entityType, entityId, onActivity }: DocumentsSectionProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ private: boolean; general: boolean }>({
    private: false,
    general: false,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDocuments(entityType, entityId);
      result.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setDocs(result);
    } catch (err) {
      console.error("[DocumentsSection] load:", err);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async (category: Category, file: File) => {
    setUploading((prev) => ({ ...prev, [category]: true }));
    try {
      const newDoc = await uploadDocument(entityType, entityId, category, file);
      if (newDoc) {
        setDocs((prev) => [newDoc, ...prev]);
        onActivity?.(`Document uploaded: ${newDoc.fileName}`);
      } else {
        await load();
      }
    } catch (err) {
      console.error("[DocumentsSection] upload:", err);
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = async (doc: Document) => {
    try {
      const url = await getSignedUrl(doc.storagePath);
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error("[DocumentsSection] download:", err);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (doc: Document) => {
    const confirmed = window.confirm(
      `Delete "${doc.fileName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id, doc.storagePath);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      onActivity?.(`Document deleted: ${doc.fileName}`);
    } catch (err) {
      console.error("[DocumentsSection] delete:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(["private", "general"] as Category[]).map((cat) => (
          <div
            key={cat}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm h-48 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const privateDocs = docs.filter((d) => d.category === "private");
  const generalDocs = docs.filter((d) => d.category === "general");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <CategoryCard
        category="private"
        docs={privateDocs}
        uploading={uploading.private}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      <CategoryCard
        category="general"
        docs={generalDocs}
        uploading={uploading.general}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}
