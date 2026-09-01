/** @type {import('next').NextConfig} */
const nextConfig = {
  // Corrige "Cannot find module '.../pdfkit/js/standard-fonts/Helvetica.cjs'"
  // sur Vercel : le traçage automatique des fichiers pour les fonctions
  // serverless ne détecte pas les polices standard de pdfkit (utilisé en
  // interne par @react-pdf/renderer pour les PDF devis/factures/reçus), donc
  // on les inclut explicitement pour toutes les routes /api/*.
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
  },
};

export default nextConfig;
