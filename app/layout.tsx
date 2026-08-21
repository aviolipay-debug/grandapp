import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OliPay — Devis, factures et comptes, tenus au propre",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('olipay-theme');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body bg-paper text-ink transition-colors dark:bg-[#2F2F2F] dark:text-white">
        {children}
      </body>
    </html>
  );
}
