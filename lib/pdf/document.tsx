import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type DocumentData = {
  kind: "Devis" | "Facture";
  number: string;
  issueDate: string;
  dueOrExpiryDate: string | null;
  companyName: string;
  companyAddress: string | null;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  total: number;
  currency: string;
  notes: string | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#17140D",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  brand: { fontSize: 20, fontWeight: 700, color: "#0A2E22" },
  docType: { fontSize: 14, fontWeight: 700, textAlign: "right", color: "#B23A2E" },
  docNumber: { fontSize: 10, textAlign: "right", marginTop: 4, color: "#4a4534" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { maxWidth: 220 },
  metaLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#8a8368",
    marginBottom: 4,
  },
  metaValue: { fontSize: 10, color: "#17140D", marginBottom: 2 },
  table: { marginTop: 12, borderTop: "1px solid #D8CBAA" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1px solid #D8CBAA",
    paddingVertical: 8,
    backgroundColor: "#F3ECDC",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #EDE6D6",
    paddingVertical: 8,
  },
  colDesc: { flex: 3, paddingHorizontal: 6 },
  colQty: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colPrice: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  colTotal: { flex: 1, paddingHorizontal: 6, textAlign: "right" },
  headerCell: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#8a8368",
  },
  totalsBlock: { marginTop: 20, alignItems: "flex-end" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingTop: 8,
    marginTop: 4,
    borderTop: "1px solid #17140D",
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 11, fontWeight: 700 },
  notes: { marginTop: 32, fontSize: 9, color: "#4a4534" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#8a8368",
    textAlign: "center",
    borderTop: "1px solid #EDE6D6",
    paddingTop: 10,
  },
});

export default function DocumentPDF({ data }: { data: DocumentData }) {
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
            <Text>
              {data.subtotal.toLocaleString("fr-FR")} {data.currency}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>TVA ({data.taxRate}%)</Text>
            <Text>
              {(data.total - data.subtotal).toLocaleString("fr-FR")} {data.currency}
            </Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {data.total.toLocaleString("fr-FR")} {data.currency}
            </Text>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.metaLabel}>Notes</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {data.companyName} — {data.kind} généré{data.kind === "Facture" ? "e" : ""} avec Grand
        </Text>
      </Page>
    </Document>
  );
}
