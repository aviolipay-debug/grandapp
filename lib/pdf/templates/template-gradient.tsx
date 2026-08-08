// lib/pdf/templates/template-gradient.tsx
import { Document, Page, Text, View, StyleSheet, Svg, Circle, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: "#0E0E0E" },
  bgLayer: { position: "absolute", top: 0, left: 0, right: 0, height: 260 },
  body: { padding: 44, paddingTop: 40 },
  scriptTag: { fontSize: 15, fontFamily: "Times-Italic", textAlign: "center", marginBottom: -6 },
  docType: { fontSize: 30, fontWeight: 700, textAlign: "center", letterSpacing: 1 },
  docNumber: { fontSize: 9.5, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 24 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  partyBlock: { maxWidth: 230 },
  partyName: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  partyLine: { fontSize: 9, marginBottom: 1, color: "#3F3F3F" },
  table: { marginTop: 6, borderRadius: 3, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#161616", paddingVertical: 9, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 8, borderBottom: "0.5px solid #E5E5E5" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "center" },
  colQty: { flex: 1, textAlign: "center" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8.5, fontWeight: 700, color: "#FFFFFF" },
  totalsBlock: { marginTop: 16, alignSelf: "flex-end", width: 190 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#161616", paddingVertical: 7, paddingHorizontal: 8, marginTop: 4 },
  grandLabel: { fontSize: 10, fontWeight: 700, color: "#FFFFFF" },
  grandValue: { fontSize: 10, fontWeight: 700, color: "#FFFFFF" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  paymentLine: { fontSize: 8.5, marginBottom: 2, color: "#3F3F3F" },
  signatureLine: { fontSize: 8, textAlign: "right", color: "#4B5563", maxWidth: 200 },
  footerScript: { fontSize: 13, fontFamily: "Times-Italic", textAlign: "center", marginTop: 40, marginBottom: -4 },
  footerBig: { fontSize: 18, fontWeight: 700, textAlign: "center", letterSpacing: 0.5 },
});

export default function TemplateGradient({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.bgLayer}>
          <Svg width="100%" height="260" viewBox="0 0 595 260">
            <Circle cx="30" cy="20" r="140" fill="#F6C89A" opacity={0.55} />
            <Circle cx="560" cy="10" r="120" fill="#E8748B" opacity={0.45} />
            <Circle cx="20" cy="230" r="90" fill="#EAB6D6" opacity={0.4} />
            <Circle cx="580" cy="220" r="110" fill="#F3A16A" opacity={0.4} />
          </Svg>
        </View>

        <View style={styles.body}>
          <Text style={styles.scriptTag}>La</Text>
          <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
          <Text style={styles.docNumber}>N° {data.number} — {data.issueDate}</Text>

          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              {data.companyLogoUrl && (
                <Image src={data.companyLogoUrl} style={{ height: 24, maxWidth: 100, objectFit: "contain", marginBottom: 6 }} />
              )}
              <Text style={styles.partyName}>{data.companyName}</Text>
              {data.companyAddress && <Text style={styles.partyLine}>{data.companyAddress}</Text>}
            </View>
            <View style={[styles.partyBlock, { alignItems: "flex-end" }]}>
              <Text style={styles.partyName}>Client</Text>
              <Text style={styles.partyLine}>{data.clientName}</Text>
              {data.clientEmail && <Text style={styles.partyLine}>{data.clientEmail}</Text>}
              {data.clientAddress && <Text style={styles.partyLine}>{data.clientAddress}</Text>}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>DESCRIPTION</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>PRIX HT</Text>
              <Text style={[styles.colQty, styles.headerCell]}>QUANTITÉ</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>TOTAL</Text>
            </View>
            {data.items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colPrice}>{item.unit_price.toLocaleString("fr-FR")}{data.currency}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colTotal}>{item.line_total.toLocaleString("fr-FR")}{data.currency}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text>SOUS TOTAL</Text>
              <Text>{data.subtotal.toLocaleString("fr-FR")}{data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>TVA {data.taxRate}%</Text>
              <Text>{(data.total - data.subtotal).toLocaleString("fr-FR")}{data.currency}</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL.</Text>
              <Text style={styles.grandValue}>{data.total.toLocaleString("fr-FR")}{data.currency}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View>
              {data.dueOrExpiryDate && (
                <Text style={styles.paymentLine}>
                  Date {data.kind === "Devis" ? "de validité" : "d'échéance"} : {data.dueOrExpiryDate}
                </Text>
              )}
              {data.notes && <Text style={styles.paymentLine}>{data.notes}</Text>}
            </View>
            <Text style={styles.signatureLine}>
              Signature suivie de la mention{"\n"}&quot;Lu et approuvé, bon pour accord&quot; :
            </Text>
          </View>

          <Text style={styles.footerScript}>Merci</Text>
          <Text style={styles.footerBig}>POUR VOTRE CONFIANCE</Text>
        </View>
      </Page>
    </Document>
  );
}
