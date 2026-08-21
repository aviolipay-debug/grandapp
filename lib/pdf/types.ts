// lib/pdf/types.ts
export type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type DocumentData = {
  kind: "Devis" | "Facture" | "Bordereau";
  number: string;
  objet?: string | null;
  issueDate: string;
  dueOrExpiryDate: string | null;
  companyName: string;
  companyAddress: string | null; // Siège social — affiché sous le nom de l'ÉMETTEUR
  companyLogoUrl: string | null;
  companyPhone?: string | null; // Contact primaire (indicatif + numéro) — affiché sous l'ÉMETTEUR
  clientName: string;
  clientPhone?: string | null; // NOUVEAU — remplace l'email sous le nom du CLIENT
  clientEmail: string | null; // Conservé dans le type mais plus affiché sur le PDF
  clientAddress: string | null;
  items: LineItem[];
  subtotal: number;
  discountRate?: number | null; // Remise en %, appliquée avant la TVA
  taxRate: number;
  total: number;
  amountPaid?: number | null; // Acompte(s) déjà enregistré(s), affiché sous la Remise
  currency: string;
  notes: string | null;
};

// Reçu de paiement — document distinct de Devis/Facture/Bordereau, rendu avec
// un template minimaliste dédié (voir templates/template-recu.tsx), sans
// passer par le dispatch DocumentPDF/getTemplateComponent.
export type ReceiptData = {
  receiptNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  methodLabel: string; // libellé déjà traduit (ex. "Mobile Money")
  companyName: string;
  companyLogoUrl: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  clientName: string;
  clientPhone: string | null;
  invoiceNumber: string; // référence de la Facture concernée
  objet?: string | null;
};
