// lib/pdf/format-helpers.ts

// Convertisseur nombre -> lettres (français), suffisant pour des montants courants
const UNITES = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const DIZAINES = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

function centaineEnLettres(n: number): string {
  let s = "";
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c > 0) s += (c > 1 ? UNITES[c] + " cent" : "cent") + (c > 1 && r === 0 ? "s" : "") + (r > 0 ? " " : "");
  if (r > 0) {
    if (r < 20) s += UNITES[r];
    else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      if (d === 7 || d === 9) s += DIZAINES[d - 1] + "-" + UNITES[10 + u];
      else s += DIZAINES[d] + (u > 0 ? (u === 1 && d !== 8 ? " et un" : "-" + UNITES[u]) : "") + (d === 8 && u === 0 ? "s" : "");
    }
  }
  return s.trim();
}

export function nombreEnLettres(n: number): string {
  n = Math.round(n);
  if (n === 0) return "zéro";
  const tranches = [
    { valeur: 1_000_000_000, mot: "milliard" },
    { valeur: 1_000_000, mot: "million" },
    { valeur: 1_000, mot: "mille" },
  ];
  let reste = n;
  let mots: string[] = [];
  for (const { valeur, mot } of tranches) {
    const q = Math.floor(reste / valeur);
    if (q > 0) {
      if (valeur === 1000 && q === 1) mots.push("mille");
      else mots.push(centaineEnLettres(q) + " " + mot + (q > 1 && valeur !== 1000 ? "s" : ""));
      reste %= valeur;
    }
  }
  if (reste > 0) mots.push(centaineEnLettres(reste));
  return mots.join(" ").replace(/\s+/g, " ").trim();
}

// Formate un montant avec espace normal comme séparateur de milliers.
// (toLocaleString("fr-FR") insère une espace fine insécable que la police
// Helvetica du PDF n'affiche pas correctement — elle apparaît comme "/".)
export function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart === "00" ? withSpaces : `${withSpaces},${decPart}`;
}
