"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-2xl w-full space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-red-700">Something went wrong</h2>
        <div className="bg-red-50 rounded-lg p-4 font-mono text-xs text-red-800 break-all whitespace-pre-wrap">
          <p className="font-bold mb-1">{error.name}: {error.message}</p>
          {error.stack && <p className="text-red-600 mt-2">{error.stack}</p>}
        </div>
        <button
          onClick={reset}
          className="px-4 h-9 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
