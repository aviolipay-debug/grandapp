// app/components/spinner.tsx
// Petit cercle qui tourne, à placer dans un bouton pendant un chargement.
export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
      style={{ width: size, height: size }}
    />
  );
}
