// lib/pdf/templates/template-recu.tsx
// Reçu de paiement, style "ticket" : ticket blanc centré sur fond gris clair.
// Le logo est toujours imprimé en niveaux de gris sur ce document.
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ReceiptData } from "../types";
import { fmt, nombreEnLettres } from "../format-helpers";
import { formatDateShort } from "../../format-short";
import { grayscaleLogo } from "../grayscale-logo";

const INK = "#0E0E0E";
const MUTED = "#5B6070";
const VIOLET = "#7D2AE7";
const VIOLET_SOFT = "#EFE5FC";
const DASH = "#C9CBD3";
const PAGE_BG = "#F0F0F3";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
    backgroundColor: PAGE_BG,
    paddingTop: 64,
    alignItems: "center",
  },
  ticket: {
    width: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 36,
  },

  head: { alignItems: "center" },
  logo: { width: 60, height: 60, borderRadius: 30, objectFit: "cover" },
  logoFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: VIOLET_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { fontFamily: "Helvetica-Bold", fontSize: 19, color: VIOLET },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 16, marginTop: 12, textAlign: "center" },
  companyLine: { fontSize: 10.5, color: MUTED, marginTop: 2, textAlign: "center" },

  title: { fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 2, textAlign: "center", marginTop: 26 },
  meta: { fontFamily: "Courier", fontSize: 11.5, color: MUTED, textAlign: "center", marginTop: 4 },

  dash: { borderTopWidth: 1.5, borderTopStyle: "dashed", borderTopColor: DASH, marginVertical: 24 },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  rowLast: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontFamily: "Courier", fontSize: 11.5, color: MUTED },
  rowValue: { fontFamily: "Courier-Bold", fontSize: 11.5, textAlign: "right", maxWidth: 230 },

  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 1 },
  totalValue: { fontFamily: "Courier-Bold", fontSize: 25, color: INK },

  words: { fontSize: 11.5, color: MUTED, textAlign: "center", marginTop: 20, lineHeight: 1.5 },
  wordsBold: { fontFamily: "Helvetica-Bold", color: INK },

  thanks: { fontFamily: "Helvetica-Bold", fontSize: 11.5, textAlign: "center", marginTop: 18 },
});

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join("") || "?";
}

// "REC-FAC-0042-1" devient "0042-1"
function shortReceiptNumber(value: string): string {
  return value.replace(/^REC-/i, "").replace(/^[A-Za-z]+-/, "");
}

// "FAC-0042" devient "N° 0042"
function shortInvoiceNumber(value: string): string {
  const digits = value.replace(/^[A-Za-z]+[-_ ]?/, "");
  return `N° ${digits || value}`;
}

export default function TemplateRecu({ data }: { data: ReceiptData }) {
  const amountWords = `${nombreEnLettres(data.amount)} francs CFA`;
  const contactLine = [data.companyPhone, data.companyAddress].filter(Boolean).join(" · ");

  const rows: { label: string; value: string }[] = [
    { label: "Reçu de", value: data.clientName },
  ];
  if (data.clientPhone) rows.push({ label: "Numéro", value: data.clientPhone });
  rows.push({ label: "Paiement", value: data.methodLabel });
  rows.push({ label: "Facture", value: shortInvoiceNumber(data.invoiceNumber) });
  if (data.objet) rows.push({ label: "Objet", value: data.objet });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.ticket}>
          <View style={styles.head}>
            {data.companyLogoUrl ? (
              <Image src={() => grayscaleLogo(data.companyLogoUrl as string)} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>{initials(data.companyName)}</Text>
              </View>
            )}
            <Text style={styles.companyName}>{data.companyName}</Text>
            {contactLine ? <Text style={styles.companyLine}>{contactLine}</Text> : null}
          </View>

          <Text style={styles.title}>REÇU DE PAIEMENT</Text>
          <Text style={styles.meta}>
            N° {shortReceiptNumber(data.receiptNumber)} · {formatDateShort(data.paymentDate)}
          </Text>

          <View style={styles.dash} />

          <View>
            {rows.map((r, i) => (
              <View style={i === rows.length - 1 ? styles.rowLast : styles.row} key={r.label}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dash} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL REÇU</Text>
            <Text style={styles.totalValue}>
              {fmt(data.amount)} {data.currency}
            </Text>
          </View>

          <Text style={styles.words}>
            Reçu la somme de <Text style={styles.wordsBold}>{amountWords}</Text>
          </Text>

          <View style={[styles.dash, { marginBottom: 0 }]} />

          <Text style={styles.thanks}>Merci pour votre confiance</Text>
        </View>
      </Page>
    </Document>
  );
}
