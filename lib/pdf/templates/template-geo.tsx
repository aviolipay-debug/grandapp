// lib/pdf/templates/template-geo.tsx
import { Document, Page, Text, View, StyleSheet, Svg, Polygon, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const DARK = "#26282B";
const BEIGE = "#E5D9C3";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: "#0E0E0E" },
  hero: { height: 130, position: "relative" },
  body: { padding: 40, paddingTop: 4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: DARK },
  logoText: { fontSize: 16, fontWeight: 700, marginLeft: 6 },
  metaBox: { alignItems: "flex-end" },
  metaLine: { fontSize: 8.5, fontWeight: 700, color: "#3F3F3F" },
  docTypeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, marginBottom: 6 },
  docType: { fontSize: 28, fontWeight: 700, letterSpacing: 1 },
  docNumber: { fontSize: 11, fontWeight: 700 },
  divider: { height: 1, backgroundColor: "#CBCBCB", marginVertical: 14 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  partyBlock: { maxWidth: 230 },
  partyLabel: { fontSize: 8, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5, color: "#6B6B6B" },
  partyValue: { fontSize: 9.5, fontWeight: 700, marginBottom: 1 },
  table: { marginTop: 6 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 6, borderBottom: "1px solid #0E0E0E" },
  tableRow: { flexDirection: "row", paddingVertical: 9, borderBottom: "0.5px solid #D4D4D4" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "right" },
  colQty: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8, fontWeight: 700, color: "#6B6B6B" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  reglementLabel: { fontSize: 10, fontWeight: 700, marginBottom: 8 },
  reglementLine: { fontSize: 8.5, marginBottom: 2, color: "#3F3F3F" },
  totalsBlock: { width: 200 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, marginTop: 3, backgroundColor: BEIGE, paddingHorizontal: 10, borderRadius: 3 },
  grandLabel: { fontSize: 11, fontWeight: 700 },
  grandValue: { fontSize: 11, fontWeight: 700 },
  legal: { fontSize: 7.5, color: "#6B6B6B", marginTop: 26, lineHeight: 1.4, maxWidth: 340 },
});

export default function TemplateGeo({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Svg width="100%" height="130" viewBox="0 0 595 130" style={{ position: "absolute", top: 0, left: 0 }}>
            <Polygon points="0,0 260,0 40,130 0,130" fill={DARK} />
            <Polygon points="180,0 400,0 260,130 100,130" fill={BEIGE} />
          </Svg>
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              {data.companyLogoUrl ? (
                <Image src={data.companyLogoUrl} style={{ height: 20, maxWidth: 90, objectFit: "contain" }} />
              ) : (
                <>
                  <View style={styles.logoDot} />
                  <Text style={styles.logoText}>{data.companyName}</Text>
                </>
              )}
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaLine}>DATE : {data.issueDate}</Text>
              {data.dueOrExpiryDate && (
                <Text style={styles.metaLine}>
                  {data.kind === "Devis" ? "VALIDITÉ" : "ÉCHÉANCE"} : {data.dueOrExpiryDate}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.docTypeRow}>
            <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
            <Text style={styles.docNumber}>{data.kind.toUpperCase()} N° : {data.number}</Text>
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
                <Text>TOTAL HT :</Text>
                <Text>{data.subtotal.toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>TVA {data.taxRate}% :</Text>
                <Text>{(data.total - data.subtotal).toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>TOTAL TTC :</Text>
                <Text style={styles.grandValue}>{data.total.toLocaleString("fr-FR")} {data.currency}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.legal}>
            En cas de retard de paiement, une indemnité ainsi que des frais de recouvrement seront exigibles.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
