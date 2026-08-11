// app/dashboard/clients/[id]/projects/[projectId]/DocumentPreviewRow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, X, Share2, Download, Loader2 } from "lucide-react";

export default function DocumentPreviewRow({
  href,
  filename,
  iconBg,
  iconColor,
  title,
  subtitle,
  amount,
}: {
  href: string;
  filename: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  amount?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch(href, { credentials: "include" });
      const blob = await res.blob();
      blobRef.current = blob;
      setBlobUrl(URL.createObjectURL(blob));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    blobRef.current = null;
  }

  // Nettoyage si le composant est démonté pendant que la popup est ouverte.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function handleShare() {
    if (!blobRef.current) return;
    setSharing(true);
    try {
      const file = new File([blobRef.current], filename, { type: "application/pdf" });
      if (typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: filename });
      } else if (blobUrl) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.click();
      }
    } catch {
      // Partage annulé — rien à faire.
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium text-ink dark:text-white">{title}</p>
            {amount && (
              <p className="shrink-0 font-mono text-sm font-semibold text-ink dark:text-white">
                {amount}
              </p>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-[#6B7280] dark:text-white/50">{subtitle}</p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-[#262626]">
            <p className="truncate text-sm font-semibold text-ink dark:text-white">{filename}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing || loading || !blobUrl}
                className="flex items-center gap-1.5 rounded-lg bg-ledger-deep px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp disabled:opacity-60"
              >
                <Share2 size={14} />
                {sharing ? "..." : "Partager"}
              </button>
              {blobUrl && (
                <a
                  href={blobUrl}
                  download={filename}
                  className="flex items-center gap-1.5 rounded-lg border border-paperline px-3 py-2 text-xs font-semibold text-[#4B5563] dark:border-white/15 dark:text-white/60"
                >
                  <Download size={14} />
                </a>
              )}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4B5563] hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#3C3C3C]">
            {loading || !blobUrl ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 size={28} className="animate-spin text-white/70" />
              </div>
            ) : (
              <embed
                src={blobUrl}
                type="application/pdf"
                className="h-full w-full"
                title={filename}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
