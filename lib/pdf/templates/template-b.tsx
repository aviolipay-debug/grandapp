// lib/pdf/templates/template-b.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentData } from "../types";

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", color: "#0E1318" },
  band: {
    backgroundColor: "#7D2AE7",
    paddingHorizontal: 48,
    paddingVertical: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: { fontSize: 22, fontWeight: 700, color: "#FFFFFF" },
  badge: {
    backgroundColor: "#FFFFFF",
    color: "#7D2AE7",
    fontSize: 11,
    fontWeight: 700,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  docNumber: { fontSize: 9, color: "#FFFFFF", opacity: 0.85, marginTop: 6, textAlign: "right" },
  body: { padding: 48, paddingTop: 28 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { maxWidth: 220 },
  metaLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#00A6AC", marginBottom: 4, fontWeight: 700 },
  metaValue: { fontSize: 10, color: "#0E1318", marginBottom: 2 },
  table: { marginTop: 4, borderRadius: 6, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#00C4CC", paddingVertical: 9 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #E5E7EB", paddingVertical: 8 },
  colDesc: { flex: 3, paddingHorizontal: 10 },
  colQty: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colPrice: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colTotal: { flex: 1, paddingHorizontal: 10, textAlign: "right" },
  headerCell: { fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5, color: "#FFFFFF", fontWeight: 700 },
  totalsBlock: { marginTop: 20, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 3 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 8,
    marginTop: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F3EEFC",
    borderRadius: 6,
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, color: "#7D2AE7" },
  grandTotalValue: { fontSize: 11, fontWeight: 700, color: "#7D2AE7" },
  notes: { marginTop: 32, fontSize: 9, color: "#4B5563" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 8, color: "#6B7280", textAlign: "center" },
});

export default function TemplateB({ data }: { data: DocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.band}>
          <Text style={styles.brand}>{data.companyName}</Text>
          <View>
            <Text style={styles.badge}>{data.kind.toUpperCase()}</Text>
            <Text style={styles.docNumber}>N° {data.number}</Text>
          </View>
        </View>

        <View style={styles.body}>
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
        </View>

        <Text style={styles.footer}>
          {data.companyName} — {data.kind} généré{data.kind === "Facture" ? "e" : ""} avec OliPay
        </Text>
      </Page>
    </Document>
  );
}
