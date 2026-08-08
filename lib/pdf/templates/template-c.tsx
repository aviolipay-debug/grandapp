// lib/pdf/templates/template-c.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 9.5, fontFamily: "Helvetica", color: "#111111" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  brand: { fontSize: 16, fontWeight: 400, letterSpacing: 1 },
  docType: { fontSize: 10, textAlign: "right", letterSpacing: 2, color: "#111111" },
  docNumber: { fontSize: 9, textAlign: "right", marginTop: 3, color: "#9CA3AF" },
  hairline: { height: 1, backgroundColor: "#111111", marginTop: 14, marginBottom: 30 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 36 },
  metaBlock: { maxWidth: 220 },
  metaLabel: { fontSize: 7.5, textTransform: "uppercase", letterSpacing: 1.5, color: "#9CA3AF", marginBottom: 5 },
  metaValue: { fontSize: 9.5, color: "#111111", marginBottom: 2 },
  table: { marginTop: 4 },
  tableHeaderRow: { flexDirection: "row", borderBottom: "1px solid #111111", paddingBottom: 6, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 7, borderBottom: "0.5px solid #E5E7EB" },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 7.5, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF" },
  totalsBlock: { marginTop: 24, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 180, paddingVertical: 3, fontSize: 9 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 180, paddingTop: 10, marginTop: 6, borderTop: "1px solid #111111" },
  grandTotalLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
  grandTotalValue: { fontSize: 10, fontWeight: 700 },
  notes: { marginTop: 40, fontSize: 8.5, color: "#6B7280" },
  footer: { position: "absolute", bottom: 40, left: 56, right: 56, fontSize: 7.5, color: "#9CA3AF", textAlign: "center", letterSpacing: 0.5 },
});

export default function TemplateC({ data }: { data: DocumentData }) {
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
        <View style={styles.hairline} />

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
                <Text style={[styles.metaLabel, { marginTop: 10 }]}>
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
          {data.companyName} · {data.kind} généré{data.kind === "Facture" ? "e" : ""} avec OliPay
        </Text>
      </Page>
    </Document>
  );
}
