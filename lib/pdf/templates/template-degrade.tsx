// lib/pdf/templates/template-degrade.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const BLACK = "#111111";
const CORAL = "#F2A488";
const PINK = "#E8748B";
const PEACH = "#F3C9A0";
const LILAC = "#C9A2D9";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: BLACK },
  body: { padding: 42 },

  blobTopLeft: { position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: PEACH, opacity: 0.5 },
  blobTopRight: { position: "absolute", top: -40, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: CORAL, opacity: 0.35 },
  blobBottomLeft: { position: "absolute", bottom: -50, left: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: LILAC, opacity: 0.3 },
  blobBottomRight: { position: "absolute", bottom: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: PINK, opacity: 0.3 },

  headingWrap: { alignItems: "center", marginTop: 8 },
  kicker: { fontSize: 13, fontFamily: "Helvetica-BoldOblique", marginBottom: -6 },
  docType: { fontSize: 34, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  metaCenter: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 4 },

  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  partyBlock: { maxWidth: 230 },
  partyName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  partyNameRight: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 6, textAlign: "right" },
  partyLine: { fontSize: 9, marginBottom: 2 },
  partyLineRight: { fontSize: 9, marginBottom: 2, textAlign: "right" },

  objet: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 18 },

  table: { marginTop: 18, borderRadius: 4, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: BLACK, paddingVertical: 8, paddingHorizontal: 10 },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10, borderBottom: "0.75px solid #E5E5E5", backgroundColor: "#FFFFFF" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "center" },
  colQty: { flex: 1, textAlign: "center" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },

  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalsBlock: { width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  totalsValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", textAlign: "right" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: BLACK, paddingVertical: 7, paddingHorizontal: 10, marginTop: 6 },
  grandLabel: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  grandValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  remainingRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingHorizontal: 10 },

  amountInWords: { fontSize: 8.5, textAlign: "center", marginTop: 20, color: "#4B4B4B" },

  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  bottomLabel: { fontSize: 9, marginBottom: 4 },
  signaturePrompt: { fontSize: 8.5, textAlign: "right", maxWidth: 200, lineHeight: 1.4 },

  footerWrap: { alignItems: "center", marginTop: 40 },
  footerKicker: { fontSize: 11, fontFamily: "Helvetica-BoldOblique", marginBottom: -4 },
  footerMain: { fontSize: 16, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
});

export default function TemplateDegrade({ data }: { data: DocumentData }) {
  const discountRate = data.discountRate ?? 0;
  const discountAmount = discountRate > 0 ? (data.subtotal * discountRate) / 100 : 0;
  const taxableAmount = data.subtotal - discountAmount;
  const taxAmount = data.total - taxableAmount;
  const amountPaid = data.amountPaid ?? 0;
  const remainingDue = data.total - amountPaid;
  const amountWords = `${nombreEnLettres(data.total)} francs CFA`;

  const dueDateLabel = data.kind === "Devis" ? "Date de validité" : "Date d'échéance";
  const showDueDate = data.kind !== "Facture";

  const documentWord =
    data.kind === "Devis" ? "devis" : data.kind === "Bordereau" ? "bordereau de livraison" : "facture";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.blobTopLeft} fixed />
        <View style={styles.blobTopRight} fixed />
        <View style={styles.blobBottomLeft} fixed />
        <View style={styles.blobBottomRight} fixed />

        <View style={styles.body}>
          <View style={styles.headingWrap}>
            <Text style={styles.kicker}>La</Text>
            <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
            <Text style={styles.metaCenter}>
              N° {data.number} — {data.issueDate}
            </Text>
          </View>

          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              <Text style={styles.partyName}>{data.companyName}</Text>
              {data.companyPhone && <Text style={styles.partyLine}>{data.companyPhone}</Text>}
              {data.companyAddress && <Text style={styles.partyLine}>{data.companyAddress}</Text>}
            </View>
            <View style={[styles.partyBlock, { alignItems: "flex-end" }]}>
              <Text style={styles.partyNameRight}>Client</Text>
              <Text style={styles.partyLineRight}>{data.clientName}</Text>
              {data.clientEmail && <Text style={styles.partyLineRight}>{data.clientEmail}</Text>}
              {data.clientAddress && <Text style={styles.partyLineRight}>{data.clientAddress}</Text>}
            </View>
          </View>

          {data.objet && <Text style={styles.objet}>Objet : {data.objet}</Text>}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>DESCRIPTION</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>PRIX U.</Text>
              <Text style={[styles.colQty, styles.headerCell]}>QUANTITÉ</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>TOTAL</Text>
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
                  <Text style={styles.totalsValue}>- {fmt(discountAmount)} {data.currency}</Text>
                </View>
              )}
              {amountPaid > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>ACOMPTE VERSÉ</Text>
                  <Text style={styles.totalsValue}>- {fmt(amountPaid)} {data.currency}</Text>
                </View>
              )}
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>TOTAL</Text>
                <Text style={styles.grandValue}>{fmt(data.total)} {data.currency}</Text>
              </View>
              {amountPaid > 0 && (
                <View style={styles.remainingRow}>
                  <Text style={styles.totalsLabel}>RESTE À PAYER</Text>
                  <Text style={styles.totalsValue}>{fmt(remainingDue)} {data.currency}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.amountInWords}>
            Arrêté le présent {documentWord} à la somme de {amountWords}
          </Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.bottomLabel}>
                Mode de paiement : {data.notes ? data.notes : "à préciser"}
              </Text>
              {showDueDate && data.dueOrExpiryDate && (
                <Text style={styles.bottomLabel}>
                  {dueDateLabel} : {data.dueOrExpiryDate}
                </Text>
              )}
            </View>
            <Text style={styles.signaturePrompt}>
              Signature suivie de la mention{"\n"}
              "Lu et approuvé, bon pour accord" :
            </Text>
          </View>

          <View style={styles.footerWrap}>
            <Text style={styles.footerKicker}>Merci</Text>
            <Text style={styles.footerMain}>POUR VOTRE CONFIANCE</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
