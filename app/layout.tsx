import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand — Devis, factures et comptes, tenus au propre",
  description:
    "Créez des devis, transformez-les en factures, et suivez vos paiements sans ouvrir un tableur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-body">{children}</body>
    </html>
  );
}
