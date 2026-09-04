// lib/pdf/templates/template-jovial.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const YELLOW = "#F2C230";
const PINK = "#E9C9F0";
const BLACK = "#171717";
const MUTED = "#4B4B4B";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: BLACK, padding: 44 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },

  kindBadge: { backgroundColor: PINK, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  kindText: { fontSize: 20, fontWeight: 700 },
  dateBadge: {
    backgroundColor: PINK,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 9, fontWeight: 700 },

  logoWrap: { alignItems: "flex-end" },
  logoBadge: {
    backgroundColor: YELLOW,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    transform: "rotate(-2deg)",
  },
  logoImage: { width: 90, height: 40, objectFit: "contain" },
  logoText: { fontSize: 26, fontFamily: "Times-Roman" },
  tagline: {
    fontSize: 8,
    color: "#C24C86",
    marginTop: 6,
    transform: "rotate(-4deg)",
    maxWidth: 160,
    textAlign: "right",
  },

  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  partyBlock: { maxWidth: 230 },
  partyBlockRight: { maxWidth: 230, alignItems: "flex-end" },
  partyLabel: { fontSize: 9, fontWeight: 700, marginBottom: 6 },
  partyName: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
  partyLine: { fontSize: 8.5, color: MUTED, marginBottom: 1 },
  partyLineRight: { fontSize: 8.5, color: MUTED, marginBottom: 1, textAlign: "right" },

  table: { marginTop: 30 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: BLACK, paddingVertical: 9, paddingHorizontal: 10 },
  headerCell: { fontSize: 8.5, fontWeight: 700, color: "#FFFFFF" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottom: "0.75px solid #E5E5E5",
  },
  cellText: { fontSize: 9 },

  colDesc: { flex: 2.2 },
  colPrice: { flex: 1, textAlign: "center" },
  colQty: { flex: 1, textAlign: "center" },
  colTotal: { flex: 1, textAlign: "right" },

  totalsWrap: { alignItems: "flex-end", marginTop: 20 },
  totalsBlock: { width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10, fontWeight: 700 },
  totalsValue: { fontSize: 10, fontWeight: 700 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, marginTop: 4 },
  grandLabel: { fontSize: 11, fontWeight: 700 },
  grandValue: { fontSize: 11, fontWeight: 700 },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 26, color: MUTED },

  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 34 },
  thanksBadge: { backgroundColor: YELLOW, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 16 },
  thanksText: { fontSize: 16, fontFamily: "Times-Roman" },
  phoneTag: {
    backgroundColor: PINK,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    transform: "rotate(-3deg)",
  },
  phoneTagText: { fontSize: 8, fontWeight: 700 },

  footer: { fontSize: 8.5, fontWeight: 700, marginTop: 30 },
});

export default function TemplateJovial({ data }: { data: DocumentData }) {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.kindBadge}>
              <Text style={styles.kindText}>
                {data.kind}{"\n"}n° {data.number}
              </Text>
            </View>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{data.issueDate}</Text>
            </View>
          </View>

          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              {data.companyLogoUrl ? (
                <Image src={data.companyLogoUrl} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoText}>{data.companyName}</Text>
              )}
            </View>
            {data.objet && <Text style={styles.tagline}>{data.objet}</Text>}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>ENTREPRISE</Text>
            {data.companyPhone && <Text style={styles.partyLine}>{data.companyPhone}</Text>}
            {data.companyAddress && <Text style={styles.partyLine}>{data.companyAddress}</Text>}
          </View>
          <View style={styles.partyBlockRight}>
            <Text style={styles.partyLabel}>CLIENT</Text>
            <Text style={styles.partyName}>{data.clientName}</Text>
            {data.clientPhone && <Text style={styles.partyLineRight}>{data.clientPhone}</Text>}
            {data.clientAddress && <Text style={styles.partyLineRight}>{data.clientAddress}</Text>}
          </View>
        </View>

        {showDueDate && data.dueOrExpiryDate && (
          <Text style={[styles.partyLine, { marginTop: 14 }]}>
            {dueDateLabel} : {data.dueOrExpiryDate}
          </Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerCell]}>DESCRIPTION</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>PRIX HT</Text>
            <Text style={[styles.colQty, styles.headerCell]}>QUANTITÉ</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>TOTAL HT</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.colDesc, styles.cellText]}>{item.description}</Text>
              <Text style={[styles.colPrice, styles.cellText]}>{fmt(item.unit_price)} {data.currency}</Text>
              <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
              <Text style={[styles.colTotal, styles.cellText]}>{fmt(item.line_total)} {data.currency}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sous total HT :</Text>
              <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>TVA ({data.taxRate}%) :</Text>
              <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Remise :</Text>
                <Text style={styles.totalsValue}>{fmt(discountAmount)} {data.currency}</Text>
              </View>
            )}
            {amountPaid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Acompte versé :</Text>
                <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
              </View>
            )}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL TTC :</Text>
              <Text style={styles.grandValue}>{fmt(data.total)} {data.currency}</Text>
            </View>
            {amountPaid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Reste à payer :</Text>
                <Text style={styles.totalsValue}>{fmt(remainingDue)} {data.currency}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.amountInWords}>
          Arrêté le présent {documentWord} à la somme de {amountWords}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.thanksBadge}>
            <Text style={styles.thanksText}>Merci !</Text>
          </View>
          {data.companyPhone && (
            <View style={styles.phoneTag}>
              <Text style={styles.phoneTagText}>* {data.companyPhone}</Text>
            </View>
          )}
        </View>

        {data.notes && <Text style={styles.footer}>{data.notes}</Text>}
      </Page>
    </Document>
  );
}
