// lib/pdf/templates/template-blue.tsx
import { Document, Page, Text, View, StyleSheet, Svg, Polygon, Image } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const BLUE = "#1450C4";

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: "#0E1318" },
  header: { backgroundColor: BLUE, paddingHorizontal: 44, paddingVertical: 26, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: { fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginLeft: 8 },
  docType: { fontSize: 20, fontWeight: 700, color: "#FFFFFF", textAlign: "right" },
  docMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "right", marginTop: 2 },
  body: { padding: 44 },
  clientLabel: { fontSize: 10, fontWeight: 700, color: BLUE, marginBottom: 6 },
  clientLine: { fontSize: 9.5, marginBottom: 1, color: "#0E1318" },
  table: { marginTop: 26 },
  tableHeaderRow: { flexDirection: "row", borderBottom: `1px solid ${BLUE}`, paddingBottom: 6 },
  tableRow: { flexDirection: "row", paddingVertical: 10, borderBottom: "0.5px solid #DCE3F2" },
  colDesc: { flex: 3 },
  colPrice: { flex: 1, textAlign: "center" },
  colQty: { flex: 1, textAlign: "center" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 9, fontWeight: 700, color: BLUE },
  totalsBlock: { marginTop: 22, alignSelf: "flex-end", width: 200 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5, fontWeight: 700, color: BLUE },
  grandLabel: { fontSize: 10.5, fontWeight: 700, color: BLUE },
  grandValue: { fontSize: 10.5, fontWeight: 700, color: BLUE },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  paymentLine: { fontSize: 9, marginBottom: 2 },
  signatureLine: { fontSize: 8.5, textAlign: "right", color: "#4B5563", maxWidth: 200 },
  thanks: { fontSize: 15, fontFamily: "Times-Italic", color: BLUE, marginTop: 46, textAlign: "center" },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 26 },
  footerText: { fontSize: 8.5, color: BLUE },
});

export default function TemplateBlue({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            {data.companyLogoUrl ? (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 4, padding: 4, marginRight: 8 }}>
                <Image src={data.companyLogoUrl} style={{ height: 20, maxWidth: 80, objectFit: "contain" }} />
              </View>
            ) : (
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" fill="#FFFFFF" />
              </Svg>
            )}
            <Text style={styles.logoText}>{data.companyName}</Text>
          </View>
          <View>
            <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
            <Text style={styles.docMeta}>N° {data.number}</Text>
            <Text style={styles.docMeta}>Date : {data.issueDate}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.clientLabel}>Client</Text>
          <Text style={styles.clientLine}>{data.clientName}</Text>
          {data.clientEmail && <Text style={styles.clientLine}>{data.clientEmail}</Text>}
          {data.clientAddress && <Text style={styles.clientLine}>{data.clientAddress}</Text>}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
              <Text style={[styles.colPrice, styles.headerCell]}>Prix unitaire</Text>
              <Text style={[styles.colQty, styles.headerCell]}>Quantité</Text>
              <Text style={[styles.colTotal, styles.headerCell]}>Montant</Text>
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
              <Text style={styles.totalsLabel}>Sous total</Text>
              <Text>{data.subtotal.toLocaleString("fr-FR")}{data.currency}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taux TVA</Text>
              <Text>{data.taxRate}%</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.grandLabel}>Total.</Text>
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

          <Text style={styles.thanks}>Merci pour votre confiance !</Text>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{data.companyName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
