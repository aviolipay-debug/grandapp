// app/components/logo.tsx
// Logo Devisfinance : icône + mot-symbole. Utilisé partout dans l'application.
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["800"], display: "swap" });

export function LogoIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 264 264"
      className={className}
      aria-hidden="true"
    >
      <rect width="264" height="264" rx="64" fill="#7D2AE7" />
      <path
        d="M82 48h70l42 42v113a22 22 0 0 1-22 22H92a22 22 0 0 1-22-22V70a22 22 0 0 1 12-22Z"
        fill="#fff"
      />
      <path d="M152 48v34a10 10 0 0 0 10 10h32" fill="#E8DDF5" />
      <path
        d="M152 48v34a10 10 0 0 0 10 10h32"
        fill="none"
        stroke="#CBB2E5"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M101 122h43M101 148h37"
        fill="none"
        stroke="#BCA3D8"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="m105 184 21 21 43-47"
        fill="none"
        stroke="#19B7A5"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="207" cy="202" r="27" fill="#FF6B69" />
      <path
        d="m195 202 8 8 16-18"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * variant "auto"  : texte sombre en mode clair, clair en mode sombre.
 * variant "light" : toujours clair (fond sombre, ex. menu latéral).
 * size : hauteur de l'icône en px, le texte s'adapte.
 */
export default function Logo({
  size = 32,
  variant = "auto",
  showText = true,
  className = "",
}: {
  size?: number;
  variant?: "auto" | "light";
  showText?: boolean;
  className?: string;
}) {
  const devis =
    variant === "light" ? "text-white" : "text-[#17151D] dark:text-white";
  const finance = "text-[#7D2AE7]";

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap: Math.round(size * 0.3) }}
    >
      <LogoIcon size={size} />
      {showText && (
        <span
          className={`${inter.className} leading-none tracking-tight`}
          style={{ fontSize: Math.round(size * 0.72) }}
        >
          <span className={devis}>Devis</span>
          <span className={finance}>finance</span>
          <span className="text-[#FF6B69]">.</span>
        </span>
      )}
    </span>
  );
}
