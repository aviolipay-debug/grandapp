/** @type {import('next').NextConfig} */
const nextConfig = {
  // Corrige "Cannot find module '.../pdfkit/js/standard-fonts/Helvetica.cjs'"
  // sur Vercel : le traçage automatique des fichiers pour les fonctions
  // serverless ne détecte pas les polices standard de pdfkit (utilisé en
  // interne par @react-pdf/renderer pour les PDF devis/factures/reçus).
  // Sur Next.js 14, cette option doit être sous `experimental` (elle n'est
  // devenue une option de premier niveau qu'à partir de Next 15).
  experimental: {
    outputFileTracingIncludes: {
      "/api/quotes/[id]/pdf": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
      "/api/invoices/[id]/pdf": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
      "/api/payments/[id]/pdf": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
    },
  },
};

export default nextConfig;
