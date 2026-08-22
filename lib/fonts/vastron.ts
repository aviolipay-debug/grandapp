import localFont from "next/font/local";

// Police sur-mesure "Vastron" (style ACHIKO) utilisée uniquement pour le
// texte du logo "OliPay" (header mobile, header desktop, landing page).
export const vastron = localFont({
  src: "./Vastron.otf",
  variable: "--font-vastron",
  display: "swap",
});
