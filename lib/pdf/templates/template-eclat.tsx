// lib/pdf/templates/template-eclat.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const ORANGE = "#D97A2E";
const BLACK = "#111111";
const CREAM = "#FBF3DD";
const MUTED = "#6B6B6B";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: BLACK, padding: 48 },

  logo: { width: 60, height: 60, objectFit: "contain", marginBottom: 14 },
  eyebrow: { fontSize: 8.5, fontWeight: 700, color: ORANGE, letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 46, letterSpacing: 2, marginBottom: 28 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  metaBlock: { maxWidth: 230 },
  metaLabel: { fontSize: 9, fontWeight: 700, color: ORANGE },
  metaValueBold: { fontSize: 9, fontWeight: 700 },
  metaLine: { fontSize: 9, marginTop: 2 },

  banner: { backgroundColor: ORANGE, borderRadius: 3, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 18 },
  bannerText: { fontSize: 8.5, fontWeight: 700, color: "#FFFFFF" },

  table: { marginBottom: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: ORANGE, paddingVertical: 8, paddingHorizontal: 10 },
  headerCell: { fontSize: 8.5, fontWeight: 700, color: "#FFFFFF" },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10 },
  cellText: { fontSize: 9 },

  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.3, textAlign: "right" },
  colTotal: { flex: 1.3, textAlign: "right" },

  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalsBlock: { width: 220 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: ORANGE,
  },
  totalsLabel: { fontSize: 9.5, fontWeight: 700 },
  totalsValue: { fontSize: 9.5, fontWeight: 700, textAlign: "right" },
  totalsLabelFinal: { fontSize: 9.5, fontWeight: 700, color: "#FFFFFF" },
  totalsValueFinal: { fontSize: 9.5, fontWeight: 700, color: "#FFFFFF", textAlign: "right" },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 28, color: MUTED },

  footerDivider: { height: 1, backgroundColor: "#E5E5E5", marginTop: 34, marginBottom: 14 },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerLabel: { fontSize: 8.5, fontWeight: 700, color: ORANGE, marginBottom: 4 },
  footerLine: { fontSize: 8.5, marginTop: 1 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ORANGE,
    paddingVertical: 8,
  },
  bottomBarText: { fontSize: 8, color: "#FFFFFF", textAlign: "center" },
});

export default function TemplateEclat({ data }: { data: DocumentData }) {
  const discountRate = data.discountRate ?? 0;
  const discountAmount = discountRate > 0 ? (data.subtotal * discountRate) / 100 : 0;
  const taxableAmount = data.subtotal - discountAmount;
  const taxAmount = data.total - taxableAmount;
  const amountPaid = data.amountPaid ?? 0;
  const remainingDue = data.total - amountPaid;
  const amountWords = `${nombreEnLettres(data.total)} francs CFA`;

  const dueDateLabel = data.kind === "Devis" ? "Date de validité" : "Date de paiement";
  const showDueDate = data.kind !== "Facture";

  const documentWord =
    data.kind === "Devis" ? "devis" : data.kind === "Bordereau" ? "bordereau de livraison" : "facture";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.companyLogoUrl && <Image src={data.companyLogoUrl} style={styles.logo} />}

        {data.objet && <Text style={styles.eyebrow}>{data.objet.toUpperCase()}</Text>}
        <Text style={styles.title}>{data.kind.toUpperCase()}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>POUR :</Text>
            <Text style={[styles.metaValueBold, { marginTop: 3 }]}>{data.clientName}</Text>
            {data.clientPhone && <Text style={styles.metaLine}>{data.clientPhone}</Text>}
            {data.clientAddress && <Text style={styles.metaLine}>{data.clientAddress}</Text>}
          </View>
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>
              {data.kind.toUpperCase()} N° : <Text style={styles.metaValueBold}>{data.number}</Text>
            </Text>
            <Text style={[styles.metaLine, { fontWeight: 700 }]}>Date d&apos;émission : {data.issueDate}</Text>
            {showDueDate && data.dueOrExpiryDate && (
              <Text style={[styles.metaLine, { fontWeight: 700 }]}>
                {dueDateLabel} : {data.dueOrExpiryDate}
              </Text>
            )}
          </View>
        </View>

        {data.notes && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{data.notes.toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerCell]}>DÉSIGNATION</Text>
            <Text style={[styles.colQty, styles.headerCell]}>QUANTITÉ</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>PRIX HT</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>TOTAL</Text>
          </View>
          {data.items.map((item, i) => (
            <View
              style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? "#FFFFFF" : CREAM }]}
              key={i}
            >
              <Text style={[styles.colDesc, styles.cellText]}>{item.description}</Text>
              <Text style={[styles.colQty, styles.cellText]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, styles.cellText]}>{fmt(item.unit_price)} {data.currency}</Text>
              <Text style={[styles.colTotal, styles.cellText]}>{fmt(item.line_total)} {data.currency}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>SOUS TOTAL</Text>
              <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>TVA {data.taxRate}%</Text>
              <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>REMISE</Text>
                <Text style={styles.totalsValue}>{fmt(discountAmount)} {data.currency}</Text>
              </View>
            )}
            {amountPaid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>ACOMPTE VERSÉ</Text>
                <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
              </View>
            )}
            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsLabelFinal}>TOTAL TTC</Text>
              <Text style={styles.totalsValueFinal}>{fmt(data.total)} {data.currency}</Text>
            </View>
            {amountPaid > 0 && (
              <View style={[styles.totalsRow, { marginTop: 2 }]}>
                <Text style={styles.totalsLabel}>RESTE À PAYER</Text>
                <Text style={styles.totalsValue}>{fmt(remainingDue)} {data.currency}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.amountInWords}>
          Arrêté le présent {documentWord} à la somme de {amountWords}
        </Text>

        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>{data.companyName.toUpperCase()}</Text>
            {data.companyAddress && <Text style={styles.footerLine}>{data.companyAddress}</Text>}
            {data.companyPhone && <Text style={styles.footerLine}>Tél : {data.companyPhone}</Text>}
          </View>
        </View>

        {(data.companyPhone || data.companyAddress) && (
          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>
              {[data.companyPhone, data.companyAddress].filter(Boolean).join("  ·  ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
