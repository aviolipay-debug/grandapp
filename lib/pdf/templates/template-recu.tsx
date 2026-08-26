// lib/pdf/templates/template-recu.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ReceiptData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";

const INK = "#0E0E0E";
const MUTED = "#6B7280";
const ACCENT = "#00A6AC";
const LINE = "#E5E7EB";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
    padding: 48,
  },
  logo: { width: 70, height: 70, borderRadius: 35, objectFit: "cover", marginBottom: 24 },
  companyName: { fontSize: 13, fontWeight: 700, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 9.5, color: MUTED, marginBottom: 28 },
  amountBlock: {
    alignItems: "center",
    borderTop: `1px solid ${LINE}`,
    borderBottom: `1px solid ${LINE}`,
    paddingVertical: 24,
    marginBottom: 24,
  },
  amountLabel: { fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  amountValue: { fontSize: 30, fontWeight: 700, color: ACCENT },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  rowLabel: { fontSize: 9.5, color: MUTED },
  rowValue: { fontSize: 9.5, fontWeight: 700, textAlign: "right" },
  amountWords: { fontSize: 8.5, color: MUTED, textAlign: "center", marginTop: 26 },
  footer: { fontSize: 7.5, color: MUTED, textAlign: "center", marginTop: 40 },
});

export default function TemplateRecu({ data }: { data: ReceiptData }) {
  const amountWords = `${nombreEnLettres(data.amount)} francs CFA`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.companyLogoUrl ? (
          <Image src={data.companyLogoUrl} style={styles.logo} />
        ) : (
          <Text style={styles.companyName}>{data.companyName}</Text>
        )}
        <Text style={styles.title}>Reçu de paiement</Text>
        <Text style={styles.subtitle}>
          {data.receiptNumber} · {data.paymentDate}
        </Text>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Montant reçu</Text>
          <Text style={styles.amountValue}>
            {fmt(data.amount)} {data.currency}
          </Text>
        </View>
        <View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Reçu de</Text>
            <Text style={styles.rowValue}>{data.clientName}</Text>
          </View>
          {data.clientPhone && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Numéro</Text>
              <Text style={styles.rowValue}>{data.clientPhone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mode de paiement</Text>
            <Text style={styles.rowValue}>{data.methodLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Facture concernée</Text>
            <Text style={styles.rowValue}>{data.invoiceNumber}</Text>
          </View>
          {data.objet && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Objet</Text>
              <Text style={styles.rowValue}>{data.objet}</Text>
            </View>
          )}
        </View>
        <Text style={styles.amountWords}>
          Reçu la somme de {amountWords}
        </Text>
        <Text style={styles.footer}>
          {data.companyName}
          {data.companyPhone ? ` · ${data.companyPhone}` : ""}
          {data.companyAddress ? ` · ${data.companyAddress}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
