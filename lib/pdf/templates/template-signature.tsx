// lib/pdf/templates/template-signature.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const SAGE = "#A9B48C";
const PINK = "#F2C9D6";
const INK = "#2B2B22";
const MUTED = "#6B6B5E";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: INK, padding: 16 },
  frame: { flex: 1, borderWidth: 6, borderColor: SAGE, padding: 32 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 90, height: 60, objectFit: "contain" },
  brandScript: { fontSize: 20, fontFamily: "Helvetica-Oblique", color: INK },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: 1, marginTop: 2 },
  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: PINK,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: { fontSize: 8, color: INK },
  contactLine: { fontSize: 8.5, color: MUTED, marginTop: 6 },

  decor: { fontSize: 20, color: PINK, marginHorizontal: 2 },

  clientBlockWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  clientBlock: { width: 230 },
  clientRow: { flexDirection: "row", marginBottom: 3 },
  clientKey: { width: 66, fontSize: 8.5, color: MUTED },
  clientValue: { flex: 1, fontSize: 8.5, color: INK, textAlign: "right" },

  numberBar: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: SAGE,
    paddingVertical: 10,
    marginTop: 24,
    marginBottom: 8,
  },
  numberText: { fontSize: 12, fontWeight: 700 },

  objetLine: { fontSize: 9, color: MUTED, marginTop: 6, marginBottom: 18 },

  tableHeaderRow: { flexDirection: "row", marginTop: 20, marginBottom: 10 },
  headerCell: { fontSize: 9, fontWeight: 700 },
  tableRow: { flexDirection: "row", paddingVertical: 6 },
  cellText: { fontSize: 9, color: INK },

  colDesc: { flex: 2.4 },
  colQty: { flex: 1 },
  colPrice: { flex: 1.3 },
  colTotal: { flex: 1, textAlign: "right" },

  totalsWrap: { marginTop: 32 },
  totalsBox: { width: 230, borderWidth: 1.5, borderColor: SAGE, padding: 14 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5, fontWeight: 700 },
  totalsValue: { fontSize: 9.5, fontWeight: 700 },

  paiementLabel: { fontSize: 10, fontWeight: 700, marginTop: 40, marginBottom: 6 },
  paiementLine: { fontSize: 8.5, color: MUTED, marginBottom: 2 },

  bottomDecor: { textAlign: "center", marginTop: 24 },
});

export default function TemplateSignature({ data }: { data: DocumentData }) {
  const discountRate = data.discountRate ?? 0;
  const discountAmount = discountRate > 0 ? (data.subtotal * discountRate) / 100 : 0;
  const taxableAmount = data.subtotal - discountAmount;
  const taxAmount = data.total - taxableAmount;
  const amountPaid = data.amountPaid ?? 0;
  const remainingDue = data.total - amountPaid;
  const amountWords = `${nombreEnLettres(data.total)} francs CFA`;

  const dueDateLabel = data.kind === "Devis" ? "Validité" : "Échéance";
  const showDueDate = data.kind !== "Facture";

  const documentWord =
    data.kind === "Devis" ? "devis" : data.kind === "Bordereau" ? "bordereau de livraison" : "facture";

  // Sans logo : le nom de l'entreprise est mis en scène comme une signature —
  // premier mot en italique (façon script), reste en gras majuscule.
  const nameParts = data.companyName.trim().split(/\s+/);
  const firstWord = nameParts[0] ?? data.companyName;
  const restWords = nameParts.slice(1).join(" ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.headerRow}>
            <View>
              {data.companyLogoUrl ? (
                <Image src={data.companyLogoUrl} style={styles.logo} />
              ) : (
                <>
                  <Text style={styles.brandScript}>{firstWord}</Text>
                  {restWords && <Text style={styles.brandName}>{restWords.toUpperCase()}</Text>}
                </>
              )}
              {data.objet && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data.objet}</Text>
                </View>
              )}
              {data.companyPhone && <Text style={styles.contactLine}>{data.companyPhone}</Text>}
              {data.companyAddress && <Text style={styles.contactLine}>{data.companyAddress}</Text>}
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={styles.decor}>✳</Text>
              <Text style={styles.decor}>✳</Text>
              <Text style={styles.decor}>✳</Text>
            </View>
          </View>

          <View style={styles.clientBlockWrap}>
            <View style={styles.clientBlock}>
              <View style={styles.clientRow}>
                <Text style={styles.clientKey}>CLIENT</Text>
                <Text style={styles.clientValue}>{data.clientName}</Text>
              </View>
              {data.clientPhone && (
                <View style={styles.clientRow}>
                  <Text style={styles.clientKey}>CONTACT</Text>
                  <Text style={styles.clientValue}>{data.clientPhone}</Text>
                </View>
              )}
              {data.clientAddress && (
                <View style={styles.clientRow}>
                  <Text style={styles.clientKey}>ADRESSE</Text>
                  <Text style={styles.clientValue}>{data.clientAddress}</Text>
                </View>
              )}
              <View style={styles.clientRow}>
                <Text style={styles.clientKey}>ÉMIS LE</Text>
                <Text style={styles.clientValue}>{data.issueDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.numberBar}>
            <Text style={styles.numberText}>
              {data.kind.toUpperCase()} N° {data.number}
            </Text>
          </View>
          {showDueDate && data.dueOrExpiryDate && (
            <Text style={styles.objetLine}>
              {dueDateLabel} : {data.dueOrExpiryDate}
            </Text>
          )}

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerCell]}>Prestation</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Quantité</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>Prix unitaire HT</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>Total HT</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.colDesc, styles.cellText]}>{item.description}</Text>
              <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, styles.cellText]}>{fmt(item.unit_price)} {data.currency}</Text>
              <Text style={[styles.colTotal, styles.cellText]}>{fmt(item.line_total)} {data.currency}</Text>
            </View>
          ))}

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBox}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total HT</Text>
                <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TVA {data.taxRate}%</Text>
                <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Remise</Text>
                  <Text style={styles.totalsValue}>{fmt(discountAmount)} {data.currency}</Text>
                </View>
              )}
              {amountPaid > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Acompte versé</Text>
                  <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Net à payer</Text>
                <Text style={styles.totalsValue}>{fmt(data.total)} {data.currency}</Text>
              </View>
              {amountPaid > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Reste à payer</Text>
                  <Text style={styles.totalsValue}>{fmt(remainingDue)} {data.currency}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.paiementLabel}>Paiement</Text>
          <Text style={styles.paiementLine}>
            Arrêté le présent {documentWord} à la somme de {amountWords}
          </Text>
          <Text style={styles.paiementLine}>Titulaire : {data.companyName}</Text>

          <Text style={styles.bottomDecor}>✳</Text>
        </View>
      </Page>
    </Document>
  );
}
