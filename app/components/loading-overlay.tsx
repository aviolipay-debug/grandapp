"use client";

import { Receipt } from "lucide-react";

export default function LoadingOverlay({
  show,
  message = "Chargement…",
}: {
  show: boolean;
  message?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-invoice-float flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5533F] text-white shadow-[0_20px_50px_-15px_rgba(229,83,63,0.6)]">
          <Receipt size={30} strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-white">{message}</p>
      </div>

      <style>{`
        @keyframes invoice-float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-8px) rotate(6deg); }
        }
        .animate-invoice-float {
          animation: invoice-float 1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-invoice-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
