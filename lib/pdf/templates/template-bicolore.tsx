// lib/pdf/templates/template-bicolore.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const PURPLE = "#B9A6F0";
const YELLOW = "#F2CA52";
const PINK = "#F7C9D4";
const INK = "#1A1A1A";
const MUTED = "#5B5B5B";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: INK },

  headerRow: { flexDirection: "row", height: 90 },
  headerLeft: { flex: 2, backgroundColor: PURPLE, justifyContent: "center", paddingLeft: 40 },
  headerRight: { flex: 1, backgroundColor: YELLOW, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 24 },
  headerLogo: { width: 80, height: 40, objectFit: "contain" },
  headerLogoText: { fontSize: 22, fontFamily: "Times-Roman" },

  meta: { flexDirection: "row", alignItems: "center", paddingHorizontal: 40, paddingVertical: 18 },
  metaText: { fontSize: 9.5, marginLeft: 14 },
  metaLine: { marginBottom: 2 },

  partiesBand: { backgroundColor: PINK, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 40, paddingVertical: 22 },
  partyBlock: { maxWidth: 230 },
  partyBlockRight: { maxWidth: 230, alignItems: "flex-end" },
  partyLabel: { fontSize: 10, fontWeight: 700, marginBottom: 6 },
  partyLine: { fontSize: 9, marginBottom: 1 },
  partyLineRight: { fontSize: 9, marginBottom: 1, textAlign: "right" },

  body: { paddingHorizontal: 40, paddingTop: 26 },

  table: { borderWidth: 1, borderColor: PURPLE },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: PURPLE },
  headerCell: { fontSize: 8.5, fontWeight: 700, letterSpacing: 1, padding: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: PURPLE },
  cell: { fontSize: 9, padding: 10, textAlign: "center" },

  colDesc: { flex: 2.4, borderRight: `1px solid ${PURPLE}` },
  colPrice: { flex: 1, borderRight: `1px solid ${PURPLE}` },
  colQty: { flex: 1, borderRight: `1px solid ${PURPLE}` },
  colTotal: { flex: 1 },

  totalsWrap: { alignItems: "flex-end", marginTop: 18 },
  totalsRow: { flexDirection: "row", gap: 30, paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5 },
  totalsValue: { fontSize: 9.5 },

  grandBand: {
    backgroundColor: PURPLE,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 18,
  },
  grandLabel: { fontSize: 14 },
  grandValue: { fontSize: 14 },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 22, color: MUTED, paddingHorizontal: 40 },

  footerRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 40, marginTop: 26 },
  footerLabel: { fontSize: 9.5, fontWeight: 700, marginBottom: 6 },
  footerLine: { fontSize: 8.5, color: MUTED, marginBottom: 2 },

  bottomBar: { backgroundColor: YELLOW, height: 26, marginTop: 30 },
});

export default function TemplateBicolore({ data }: { data: DocumentData }) {
  const discountRate = data.discountRate ?? 0;
  const discountAmount = discountRate > 0 ? (data.subtotal * discountRate) / 100 : 0;
  const taxableAmount = data.subtotal - discountAmount;
  const taxAmount = data.total - taxableAmount;
  const amountPaid = data.amountPaid ?? 0;
  const remainingDue = data.total - amountPaid;
  const amountWords = `${nombreEnLettres(data.total)} francs CFA`;

  const dueDateLabel = data.kind === "Devis" ? "Validité du devis" : "Échéance";
  const showDueDate = data.kind !== "Facture";

  const documentWord =
    data.kind === "Devis" ? "devis" : data.kind === "Bordereau" ? "bordereau de livraison" : "facture";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {data.kind} n°{data.number}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {data.companyLogoUrl ? (
              <Image src={data.companyLogoUrl} style={styles.headerLogo} />
            ) : (
              <Text style={styles.headerLogoText}>{data.companyName}</Text>
            )}
          </View>
        </View>

        <View style={styles.meta}>
          <View>
            <Text style={[styles.metaText, styles.metaLine]}>
              Date d&apos;émission : {data.issueDate}
            </Text>
            {showDueDate && data.dueOrExpiryDate && (
              <Text style={[styles.metaText, styles.metaLine]}>
                {dueDateLabel} : {data.dueOrExpiryDate}
              </Text>
            )}
            {data.objet && <Text style={[styles.metaText, styles.metaLine]}>Objet : {data.objet}</Text>}
          </View>
        </View>

        <View style={styles.partiesBand}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>{data.companyName}</Text>
            {data.companyPhone && <Text style={styles.partyLine}>{data.companyPhone}</Text>}
            {data.companyAddress && <Text style={styles.partyLine}>{data.companyAddress}</Text>}
          </View>
          <View style={styles.partyBlockRight}>
            <Text style={styles.partyLabel}>À l&apos;attention de</Text>
            <Text style={styles.partyLineRight}>{data.clientName}</Text>
            {data.clientPhone && <Text style={styles.partyLineRight}>{data.clientPhone}</Text>}
            {data.clientAddress && <Text style={styles.partyLineRight}>{data.clientAddress}</Text>}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>DESCRIPTION</Text>
              <Text style={[styles.colPrice, styles.headerCell, { textAlign: "center" }]}>PRIX</Text>
              <Text style={[styles.colQty, styles.headerCell, { textAlign: "center" }]}>QUANTITÉ</Text>
              <Text style={[styles.colTotal, styles.headerCell, { textAlign: "center" }]}>TOTAL</Text>
            </View>
            {data.items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={[styles.colDesc, styles.cell, { textAlign: "left" }]}>{item.description}</Text>
                <Text style={[styles.colPrice, styles.cell]}>{fmt(item.unit_price)} {data.currency}</Text>
                <Text style={[styles.colQty, styles.cell]}>{item.quantity}</Text>
                <Text style={[styles.colTotal, styles.cell]}>{fmt(item.line_total)} {data.currency}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sous total :</Text>
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
          </View>
        </View>

        <View style={styles.grandBand}>
          <Text style={styles.grandLabel}>TOTAL :</Text>
          <Text style={styles.grandValue}>{fmt(data.total)} {data.currency}</Text>
        </View>
        {amountPaid > 0 && (
          <View style={[styles.grandBand, { backgroundColor: "transparent", marginTop: 4 }]}>
            <Text style={[styles.totalsLabel, { fontWeight: 700 }]}>Reste à payer :</Text>
            <Text style={[styles.totalsValue, { fontWeight: 700 }]}>{fmt(remainingDue)} {data.currency}</Text>
          </View>
        )}

        <Text style={styles.amountInWords}>
          Arrêté le présent {documentWord} à la somme de {amountWords}
        </Text>

        {data.notes && (
          <View style={styles.footerRow}>
            <View style={{ maxWidth: 260 }}>
              <Text style={styles.footerLabel}>Termes et conditions</Text>
              <Text style={styles.footerLine}>{data.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomBar} />
      </Page>
    </Document>
  );
}
