// lib/pdf/templates/template-ako.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const YELLOW = "#E9F23A";
const BLACK = "#0E0E0E";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: BLACK },
  topBar: { height: 14, backgroundColor: BLACK },
  body: { padding: 40, paddingTop: 30, paddingLeft: 46 },
  sideBar: { position: "absolute", left: 0, top: 90, width: 10, height: 130, backgroundColor: YELLOW },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoBox: { backgroundColor: YELLOW, paddingHorizontal: 16, paddingVertical: 14, maxWidth: 200 },
  logoText: { fontSize: 16, fontWeight: 700, letterSpacing: 0.5 },
  docTypeRow: { flexDirection: "row", alignItems: "flex-end" },
  docType: { fontSize: 40, fontWeight: 700, letterSpacing: 1 },
  docTypeChip: { width: 14, height: 46, backgroundColor: YELLOW, marginLeft: 6 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 26, marginBottom: 8 },
  metaLeft: { fontSize: 9, fontWeight: 700 },
  metaRight: { fontSize: 12, fontWeight: 700 },
  divider: { height: 1.5, backgroundColor: BLACK, marginVertical: 12 },

  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 26 },
  partyBlock: { maxWidth: 230 },
  partyLabel: { fontSize: 9, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 },
  partyValue: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
  partyValueRight: { fontSize: 9.5, fontWeight: 700, marginBottom: 2, textAlign: "right" },

  table: { marginTop: 6 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 8, borderBottom: "1.5px solid " + BLACK },
  tableRow: { flexDirection: "row", paddingVertical: 11, borderBottom: "0.75px solid #D4D4D4" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "right" },
  colQty: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8.5, fontWeight: 700 },

  totalsWrap: { alignItems: "flex-end", marginTop: 20 },
  totalsBlock: { width: 240 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10.5, fontWeight: 700 },
  totalsValue: { fontSize: 10.5, fontWeight: 700, textAlign: "right" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, marginTop: 4, borderTop: "1.5px solid " + BLACK, paddingTop: 8 },
  grandLabel: { fontSize: 11.5, fontWeight: 700 },
  grandValue: { fontSize: 11.5, fontWeight: 700 },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 24, color: "#2B2B2B" },

  legal: { fontSize: 7.5, color: "#4B4B4B", marginTop: 24, maxWidth: 340, lineHeight: 1.4 },
  bottomBar: { height: 12, backgroundColor: YELLOW, marginTop: 30, marginLeft: 220 },
});

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

function nombreEnLettres(n: number): string {
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
function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart === "00" ? withSpaces : `${withSpaces},${decPart}`;
}

export default function TemplateAko({ data }: { data: DocumentData }) {
  const discountRate = data.discountRate ?? 0;
  const discountAmount = discountRate > 0 ? (data.subtotal * discountRate) / 100 : 0;
  const taxableAmount = data.subtotal - discountAmount;
  const taxAmount = data.total - taxableAmount;
  const amountPaid = data.amountPaid ?? 0;
  const remainingDue = data.total - amountPaid;
  const amountWords = `${nombreEnLettres(data.total)} francs CFA`;

  const dueDateLabel = data.kind === "Devis" ? "VALIDITÉ" : "ÉCHÉANCE";
  const showDueDate = data.kind !== "Facture"; // Échéance supprimée sur la Facture, gardée (renommée) sur le Bordereau

  const documentWord =
    data.kind === "Devis" ? "devis" : data.kind === "Bordereau" ? "bordereau de livraison" : "facture";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <View style={styles.sideBar} />
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.logoBox}>
              {data.companyLogoUrl ? (
                <Image src={data.companyLogoUrl} style={{ height: 26, maxWidth: 130, objectFit: "contain" }} />
              ) : (
                <Text style={styles.logoText}>{data.companyName}</Text>
              )}
            </View>
            <View style={styles.docTypeRow}>
              <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
              <View style={styles.docTypeChip} />
            </View>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLeft}>DATE : {data.issueDate}</Text>
              {showDueDate && data.dueOrExpiryDate && (
                <Text style={[styles.metaLeft, { marginTop: 3 }]}>
                  {dueDateLabel} : {data.dueOrExpiryDate}
                </Text>
              )}
            </View>
            <Text style={styles.metaRight}>{data.kind.toUpperCase()} N° : {data.number}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>ÉMETTEUR :</Text>
              {data.companyPhone && <Text style={styles.partyValue}>{data.companyPhone}</Text>}
              <Text style={styles.partyValue}>{data.companyName}</Text>
              {data.companyAddress && <Text style={styles.partyValue}>{data.companyAddress}</Text>}
            </View>
            <View style={[styles.partyBlock, { alignItems: "flex-end" }]}>
              <Text style={[styles.partyLabel, { textAlign: "right" }]}>CLIENT :</Text>
              <Text style={styles.partyValueRight}>{data.clientName}</Text>
              {data.clientEmail && <Text style={styles.partyValueRight}>{data.clientEmail}</Text>}
              {data.clientAddress && <Text style={styles.partyValueRight}>{data.clientAddress}</Text>}
            </View>
          </View>

          {data.objet && (
            <Text style={{ fontSize: 9.5, fontWeight: 700, marginBottom: 14 }}>OBJET : {data.objet}</Text>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>DESCRIPTION :</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>PRIX UNITAIRE :</Text>
              <Text style={[styles.colQty, styles.headerCell]}>QUANTITÉ :</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>TOTAL :</Text>
            </View>
            {data.items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colPrice}>{fmt(item.unit_price)} {data.currency}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colTotal}>{fmt(item.line_total)} {data.currency}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBlock}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TOTAL HT :</Text>
                <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TVA {data.taxRate}% :</Text>
                <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>REMISE :</Text>
                <Text style={styles.totalsValue}>
                  {discountAmount > 0 ? `${fmt(discountAmount)} ${data.currency}` : "-"}
                </Text>
              </View>
              {amountPaid > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>ACOMPTE VERSÉ :</Text>
                  <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
                </View>
              )}
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>TOTAL TTC :</Text>
                <Text style={styles.grandValue}>{fmt(data.total)} {data.currency}</Text>
              </View>
              {amountPaid > 0 && (
                <View style={[styles.totalsRow, { marginTop: 2 }]}>
                  <Text style={styles.grandLabel}>RESTE À PAYER :</Text>
                  <Text style={styles.grandValue}>{fmt(remainingDue)} {data.currency}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.amountInWords}>
            Arrêté le présent {documentWord} à la somme de {amountWords}
          </Text>

          <Text style={styles.legal}>
            En cas de retard de paiement, et conformément au code de commerce, une indemnité de retard ainsi que des frais de recouvrement peuvent être exigibles.
          </Text>
        </View>

        <View style={styles.bottomBar} />
      </Page>
    </Document>
  );
}
