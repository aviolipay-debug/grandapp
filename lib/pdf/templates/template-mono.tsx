// lib/pdf/templates/template-mono.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const YELLOW = "#E9F23A";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: "#0E0E0E" },
  topBar: { height: 14, backgroundColor: "#0E0E0E" },
  body: { padding: 40, paddingTop: 28 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoBox: { backgroundColor: YELLOW, paddingHorizontal: 14, paddingVertical: 10 },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: 0.5 },
  docType: { fontSize: 30, fontWeight: 700, letterSpacing: 1 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 22, marginBottom: 8 },
  metaLeft: { fontSize: 9, fontWeight: 700 },
  metaRight: { fontSize: 11, fontWeight: 700 },
  divider: { height: 1.5, backgroundColor: "#0E0E0E", marginVertical: 10 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  partyBlock: { maxWidth: 230 },
  partyLabel: { fontSize: 8.5, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 },
  partyValue: { fontSize: 9.5, fontWeight: 700, marginBottom: 1 },
  table: { marginTop: 6 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 6, borderBottom: "1.5px solid #0E0E0E" },
  tableRow: { flexDirection: "row", paddingVertical: 9, borderBottom: "0.75px solid #D4D4D4" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "right" },
  colQty: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8.5, fontWeight: 700 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  reglementLabel: { fontSize: 10, fontWeight: 700, marginBottom: 8 },
  reglementLine: { fontSize: 8.5, marginBottom: 2 },
  totalsBlock: { width: 210 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10, fontWeight: 700 },
  totalsValue: { fontSize: 10, fontWeight: 700, textAlign: "right" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, marginTop: 2, borderTop: "1.5px solid #0E0E0E", paddingTop: 8 },
  grandLabel: { fontSize: 11, fontWeight: 700 },
  grandValue: { fontSize: 11, fontWeight: 700 },
  legal: { fontSize: 7.5, color: "#4B4B4B", marginTop: 20, maxWidth: 320, lineHeight: 1.4 },
  bottomBar: { height: 30, backgroundColor: "#0E0E0E", marginTop: 30, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingRight: 40 },
  bottomBarChip: { width: 90, height: 10, backgroundColor: YELLOW },
});

export default function TemplateMono({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.logoBox}>
              {data.companyLogoUrl ? (
                <Image src={data.companyLogoUrl} style={{ height: 24, maxWidth: 90, objectFit: "contain" }} />
              ) : (
                <Text style={styles.logoText}>{data.companyName}</Text>
              )}
            </View>
            <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLeft}>DATE : {data.issueDate}</Text>
              {data.dueOrExpiryDate && (
                <Text style={styles.metaLeft}>
                  {data.kind === "Devis" ? "VALIDITÉ" : "ÉCHÉANCE"} : {data.dueOrExpiryDate}
                </Text>
              )}
            </View>
            <Text style={styles.metaRight}>{data.kind.toUpperCase()} N° : {data.number}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>ÉMETTEUR :</Text>
              <Text style={styles.partyValue}>{data.companyName}</Text>
              {data.companyAddress && <Text style={styles.partyValue}>{data.companyAddress}</Text>}
            </View>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>DESTINATAIRE :</Text>
              <Text style={styles.partyValue}>{data.clientName}</Text>
              {data.clientEmail && <Text style={styles.partyValue}>{data.clientEmail}</Text>}
              {data.clientAddress && <Text style={styles.partyValue}>{data.clientAddress}</Text>}
            </View>
          </View>

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
                <Text style={styles.colPrice}>{item.unit_price.toLocaleString("fr-FR")} {data.currency}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colTotal}>{item.line_total.toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.reglementLabel}>RÈGLEMENT :</Text>
              {data.notes ? (
                <Text style={[styles.reglementLine, { maxWidth: 260 }]}>{data.notes}</Text>
              ) : (
                <Text style={styles.reglementLine}>Modalités de paiement à préciser.</Text>
              )}
            </View>
            <View style={styles.totalsBlock}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TOTAL HT :</Text>
                <Text style={styles.totalsValue}>{data.subtotal.toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TVA {data.taxRate}% :</Text>
                <Text style={styles.totalsValue}>{(data.total - data.subtotal).toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>TOTAL TTC :</Text>
                <Text style={styles.grandValue}>{data.total.toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.legal}>
            En cas de retard de paiement, et conformément au code de commerce, une indemnité de retard ainsi que des frais de recouvrement peuvent être exigibles.
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.bottomBarChip} />
        </View>
      </Page>
    </Document>
  );
}
