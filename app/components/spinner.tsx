// app/components/spinner.tsx
// Petit cercle qui tourne, à placer dans un bouton pendant un chargement.
// Dessiné en SVG avec sa propre animation : il ne dépend d'aucune classe
// Tailwind (animate-spin, bordures…) et prend la couleur du texte du bouton.
export default function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, display: "inline-block" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
