// app/dashboard/clients/[id]/projects/[projectId]/DocumentPreviewRow.tsx
"use client";

import { useState } from "react";
import { FileText, X, Share2, Download } from "lucide-react";

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
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(href);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/pdf" });

      if (typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: filename });
      } else {
        // Pas d'API de partage disponible (desktop, navigateur non compatible) : on télécharge à la place.
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);
      }
    } catch {
      // Partage annulé ou impossible — on ne fait rien de plus.
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
                disabled={sharing}
                className="flex items-center gap-1.5 rounded-lg bg-ledger-deep px-3 py-2 text-xs font-semibold text-paper hover:bg-stamp disabled:opacity-60"
              >
                <Share2 size={14} />
                {sharing ? "..." : "Partager"}
              </button>
              <a
                href={href}
                download={filename}
                className="flex items-center gap-1.5 rounded-lg border border-paperline px-3 py-2 text-xs font-semibold text-[#4B5563] dark:border-white/15 dark:text-white/60"
              >
                <Download size={14} />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4B5563] hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <iframe src={href} title={filename} className="w-full flex-1 bg-white" />
        </div>
      )}
    </>
  );
}
