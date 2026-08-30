// lib/pdf/templates/template-nuit.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const YELLOW = "#E9D547";
const BG = "#1E1E1E";
const CARD = "#4A4A4A";
const ROW_DARK = "#2A2A2A";
const ROW_LIGHT = "#3A3A3A";
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  page: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: WHITE,
    backgroundColor: BG,
    padding: 40,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 },
  logoImage: { maxWidth: 170, maxHeight: 64, objectFit: "contain" },
  logoText: { fontSize: 34, fontWeight: 700, color: YELLOW, letterSpacing: 0.5 },
  metaBlock: { alignItems: "flex-end" },
  metaText: { fontSize: 9.5, color: WHITE, marginBottom: 2 },

  partiesRow: { flexDirection: "row", gap: 14, marginBottom: 24 },
  partyCard: { flex: 1, backgroundColor: CARD, borderRadius: 6, padding: 16 },
  partyLabel: { fontSize: 10, color: WHITE, marginBottom: 6 },
  partyName: { fontSize: 13, fontWeight: 700, color: YELLOW, marginBottom: 8 },
  partyLine: { fontSize: 9, color: WHITE, marginBottom: 2 },

  objetRow: { marginBottom: 18, marginLeft: 30 },
  objetLabel: { fontSize: 9.5, fontWeight: 700, textDecoration: "underline" },
  objetText: { fontSize: 9.5 },

  table: { marginBottom: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: YELLOW, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 12 },
  headerCell: { fontSize: 9, fontWeight: 700, color: "#1A1A1A" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 4, marginTop: 2 },
  cellText: { fontSize: 9.5, color: WHITE },

  colNo: { width: 26 },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.3, textAlign: "center" },
  colTotal: { flex: 1.3, textAlign: "right" },

  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalsBlock: { width: 220, backgroundColor: YELLOW, borderRadius: 4, padding: 12 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5, fontWeight: 700, color: "#1A1A1A" },
  totalsValue: { fontSize: 9.5, fontWeight: 700, color: "#1A1A1A", textAlign: "right" },

  amountInWords: { fontSize: 9, textAlign: "center", marginTop: 40, color: WHITE },
});

export default function TemplateNuit({ data }: { data: DocumentData }) {
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
          {data.companyLogoUrl ? (
            <Image src={data.companyLogoUrl} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>{data.companyName}</Text>
          )}
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Date : {data.issueDate}</Text>
            <Text style={styles.metaText}>{data.kind.toUpperCase()} N° : {data.number}</Text>
            {showDueDate && data.dueOrExpiryDate && (
              <Text style={styles.metaText}>{dueDateLabel} : {data.dueOrExpiryDate}</Text>
            )}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Emetteur :</Text>
            <Text style={styles.partyName}>{data.companyName}</Text>
            {data.companyPhone && <Text style={styles.partyLine}>{data.companyPhone}</Text>}
            {data.companyAddress && <Text style={styles.partyLine}>{data.companyAddress}</Text>}
          </View>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Client :</Text>
            <Text style={styles.partyName}>{data.clientName}</Text>
            {data.clientPhone && <Text style={styles.partyLine}>{data.clientPhone}</Text>}
            {data.clientAddress && <Text style={styles.partyLine}>{data.clientAddress}</Text>}
          </View>
        </View>

        {data.objet && (
          <View style={styles.objetRow}>
            <Text>
              <Text style={styles.objetLabel}>OBJET : </Text>
              <Text style={styles.objetText}>{data.objet}</Text>
            </Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colNo, styles.headerCell]}>No</Text>
            <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Quantité</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>Prix Unitaire</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View
              style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? ROW_DARK : ROW_LIGHT }]}
              key={i}
            >
              <Text style={[styles.colNo, styles.cellText]}>{i + 1}</Text>
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
              <Text style={styles.totalsLabel}>Total HT :</Text>
              <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>TVA {data.taxRate}% :</Text>
              <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Remise :</Text>
              <Text style={styles.totalsValue}>
                {discountAmount > 0 ? `${fmt(discountAmount)} ${data.currency}` : "-"}
              </Text>
            </View>
            {amountPaid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Acompte versé :</Text>
                <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total TTC :</Text>
              <Text style={styles.totalsValue}>{fmt(data.total)} {data.currency}</Text>
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
      </Page>
    </Document>
  );
}
