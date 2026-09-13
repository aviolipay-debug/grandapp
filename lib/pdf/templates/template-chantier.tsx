// lib/pdf/templates/template-chantier.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const BLUE = "#2A89DA";
const BLUE_LIGHT = "#EAF3FC";
const INK = "#0E0E0E";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: INK },
  topBar: { height: 6, backgroundColor: BLUE },
  body: { padding: 40, paddingTop: 28 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BLUE_LIGHT,
  },
  logoText: { fontSize: 13, fontWeight: 700, color: BLUE, textAlign: "center" },
  companyNameHeader: { fontSize: 11, fontWeight: 700, marginTop: 8, maxWidth: 180 },

  docTypeBlock: { alignItems: "flex-end" },
  docType: { fontSize: 22, fontWeight: 700, color: BLUE, letterSpacing: 1 },
  docNumber: { fontSize: 10, fontWeight: 700, marginTop: 4 },
  docDate: { fontSize: 8.5, color: "#4B4B4B", marginTop: 2 },

  headerDivider: { height: 2, backgroundColor: BLUE, marginTop: 18, marginBottom: 20 },

  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  partyBlock: { maxWidth: 230 },
  partyLabel: { fontSize: 8.5, fontWeight: 700, color: BLUE, marginBottom: 6, letterSpacing: 0.5 },
  partyValue: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
  partyValueRight: { fontSize: 9.5, fontWeight: 700, marginBottom: 2, textAlign: "right" },

  objetBlock: { marginBottom: 16 },
  objetLabel: { fontSize: 8.5, fontWeight: 700, color: BLUE, marginBottom: 3, letterSpacing: 0.5 },
  objetValue: { fontSize: 9.5, fontWeight: 700 },

  table: { marginTop: 4, borderRadius: 4, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 8, paddingHorizontal: 8 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottom: "0.75px solid #D9E6F5",
  },
  tableRowAlt: { backgroundColor: BLUE_LIGHT },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  headerCell: { fontSize: 8.5, fontWeight: 700, color: "#FFFFFF" },

  totalsWrap: { alignItems: "flex-end", marginTop: 20 },
  totalsBlock: { width: 240 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10, fontWeight: 700 },
  totalsValue: { fontSize: 10, fontWeight: 700, textAlign: "right" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 6,
    paddingHorizontal: 10,
    backgroundColor: BLUE,
    borderRadius: 4,
  },
  grandLabel: { fontSize: 11.5, fontWeight: 700, color: "#FFFFFF" },
  grandValue: { fontSize: 11.5, fontWeight: 700, color: "#FFFFFF" },
  remainingRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, marginTop: 4 },
  remainingLabel: { fontSize: 10.5, fontWeight: 700, color: BLUE },
  remainingValue: { fontSize: 10.5, fontWeight: 700, color: BLUE },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 26, color: "#2B2B2B" },

  legal: { fontSize: 7.5, color: "#4B4B4B", marginTop: 20, lineHeight: 1.4 },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: { fontSize: 7.5, color: "#FFFFFF", fontWeight: 700 },
});

export default function TemplateChantier({ data }: { data: DocumentData }) {
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
        <View style={styles.topBar} />
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.logoBox}>
                {data.companyLogoUrl ? (
                  <Image
                    src={data.companyLogoUrl}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Text style={styles.logoText}>{data.companyName}</Text>
                )}
              </View>
              <Text style={styles.companyNameHeader}>{data.companyName}</Text>
            </View>

            <View style={styles.docTypeBlock}>
              <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
              <Text style={styles.docNumber}>N° {data.number}</Text>
              <Text style={styles.docDate}>Le {data.issueDate}</Text>
              {showDueDate && data.dueOrExpiryDate && (
                <Text style={styles.docDate}>
                  {dueDateLabel} : {data.dueOrExpiryDate}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerDivider} />

          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>ÉMETTEUR</Text>
              {data.companyPhone && <Text style={styles.partyValue}>{data.companyPhone}</Text>}
              {data.companyAddress && <Text style={styles.partyValue}>{data.companyAddress}</Text>}
            </View>
            <View style={[styles.partyBlock, { alignItems: "flex-end" }]}>
              <Text style={[styles.partyLabel, { textAlign: "right" }]}>CLIENT</Text>
              <Text style={styles.partyValueRight}>{data.clientName}</Text>
              {data.clientPhone && <Text style={styles.partyValueRight}>{data.clientPhone}</Text>}
              {data.clientAddress && <Text style={styles.partyValueRight}>{data.clientAddress}</Text>}
            </View>
          </View>

          {data.objet && (
            <View style={styles.objetBlock}>
              <Text style={styles.objetLabel}>OBJET</Text>
              <Text style={styles.objetValue}>{data.objet}</Text>
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>DÉSIGNATION</Text>
              <Text style={[styles.colQty, styles.headerCell]}>QTÉ</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>P. UNITAIRE</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>MONTANT</Text>
            </View>
            {data.items.map((item, i) => (
              <View
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                key={i}
              >
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{fmt(item.unit_price)} {data.currency}</Text>
                <Text style={styles.colTotal}>{fmt(item.line_total)} {data.currency}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBlock}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total HT</Text>
                <Text style={styles.totalsValue}>{fmt(data.subtotal)} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TVA {data.taxRate}%</Text>
                <Text style={styles.totalsValue}>{fmt(taxAmount)} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Remise</Text>
                <Text style={styles.totalsValue}>
                  {discountAmount > 0 ? `${fmt(discountAmount)} ${data.currency}` : "-"}
                </Text>
              </View>
              {amountPaid > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Acompte versé</Text>
                  <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
                </View>
              )}
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>TOTAL GÉNÉRAL</Text>
                <Text style={styles.grandValue}>{fmt(data.total)} {data.currency}</Text>
              </View>
              {amountPaid > 0 && (
                <View style={styles.remainingRow}>
                  <Text style={styles.remainingLabel}>Reste à payer</Text>
                  <Text style={styles.remainingValue}>{fmt(remainingDue)} {data.currency}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.amountInWords}>
            Arrêté le présent {documentWord} à la somme de {amountWords}
          </Text>

          <Text style={styles.legal}>
            En cas de retard de paiement, et conformément au code de commerce, une indemnité de
            retard ainsi que des frais de recouvrement peuvent être exigibles.
          </Text>
        </View>

        <View style={styles.footerBar}>
          <Text style={styles.footerText}>{data.companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
