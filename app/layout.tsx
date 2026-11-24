// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPrompt from "./components/install-prompt";
import ExternalPdfLinks from "./components/external-pdf-links";

export const metadata: Metadata = {
  title: "Devisfinance",
  description:
    "Créez des devis, transformez-les en factures, et suivez vos paiements sans ouvrir un tableur.",
  applicationName: "Devisfinance",
  // iPhone / iPad : ouverture en plein écran une fois ajouté à l'écran d'accueil.
  appleWebApp: {
    capable: true,
    title: "Devisfinance",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

// Couleur de la barre d'état (Android) et affichage bord à bord.
export const viewport: Viewport = {
  themeColor: "#7D2AE7",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('devisfinance-theme');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body bg-paper text-ink transition-colors dark:bg-[#2F2F2F] dark:text-white">
        {children}
        <InstallPrompt />
        <ExternalPdfLinks />
      </body>
    </html>
  );
}
