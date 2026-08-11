// app/dashboard/clients/[id]/projects/[projectId]/DocumentPreviewRow.tsx
import { FileText } from "lucide-react";

export default function DocumentPreviewRow({
  href,
  iconBg,
  iconColor,
  title,
  subtitle,
  amount,
}: {
  href: string;
  filename: string; // conservé pour compatibilité d'appel, plus utilisé ici
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  amount?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F7FB] active:bg-[#F0F0F5] dark:hover:bg-white/5 sm:px-6"
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
    </a>
  );
}
