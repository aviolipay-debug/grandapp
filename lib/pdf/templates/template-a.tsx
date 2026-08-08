// lib/pdf/templates/template-a.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#0E1318" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 36 },
  brand: { fontSize: 20, fontWeight: 700, color: "#7D2AE7" },
  docType: { fontSize: 14, fontWeight: 700, textAlign: "right", color: "#FE6F61" },
  docNumber: { fontSize: 10, textAlign: "right", marginTop: 4, color: "#4B5563" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { maxWidth: 220 },
  metaLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#6B7280", marginBottom: 4 },
  metaValue: { fontSize: 10, color: "#0E1318", marginBottom: 2 },
  table: { marginTop: 12, borderTop: "1px solid #E5E7EB" },
  tableHeaderRow: { flexDirection: "row", borderBottom: "1px solid #E5E7EB", paddingVertical: 8, backgroundColor: "#F7F7FB" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #E5E7EB", paddingVertical: 8 },
  colDesc: { flex: 3, paddingHorizontal: 6 },
  colQty: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colPrice: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colTotal: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  headerCell: { fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B7280" },
  totalsBlock: { marginTop: 20, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 3 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingTop: 8, marginTop: 4, borderTop: "1px solid #0E1318" },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 11, fontWeight: 700 },
  notes: { marginTop: 32, fontSize: 9, color: "#4B5563" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 8, color: "#6B7280", textAlign: "center", borderTop: "1px solid #E5E7EB", paddingTop: 10 },
});

export default function TemplateA({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{data.companyName}</Text>
          <View>
            <Text style={styles.docType}>{data.kind.toUpperCase()}</Text>
            <Text style={styles.docNumber}>N° {data.number}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Facturé à</Text>
            <Text style={styles.metaValue}>{data.clientName}</Text>
            {data.clientEmail && <Text style={styles.metaValue}>{data.clientEmail}</Text>}
            {data.clientAddress && <Text style={styles.metaValue}>{data.clientAddress}</Text>}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date d&apos;émission</Text>
            <Text style={styles.metaValue}>{data.issueDate}</Text>
            {data.dueOrExpiryDate && (
              <>
                <Text style={[styles.metaLabel, { marginTop: 8 }]}>
                  {data.kind === "Devis" ? "Valable jusqu'au" : "Échéance"}
                </Text>
                <Text style={styles.metaValue}>{data.dueOrExpiryDate}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Qté</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>Prix unit.</Text>
            <Text style={[styles.colTotal, styles.headerCell]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unit_price.toLocaleString("fr-FR")}</Text>
              <Text style={styles.colTotal}>{item.line_total.toLocaleString("fr-FR")}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Sous-total</Text>
            <Text>{data.subtotal.toLocaleString("fr-FR")} {data.currency}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>TVA ({data.taxRate}%)</Text>
            <Text>{(data.total - data.subtotal).toLocaleString("fr-FR")} {data.currency}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{data.total.toLocaleString("fr-FR")} {data.currency}</Text>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.metaLabel}>Notes</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {data.companyName} — {data.kind} généré{data.kind === "Facture" ? "e" : ""} avec OliPay
        </Text>
      </Page>
    </Document>
  );
}
