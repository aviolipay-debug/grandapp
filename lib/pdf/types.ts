// lib/pdf/types.ts
export type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type DocumentData = {
  kind: "Devis" | "Facture";
  number: string;
  objet?: string | null;
  issueDate: string;
  dueOrExpiryDate: string | null;
  companyName: string;
  companyAddress: string | null;
  companyLogoUrl: string | null;
  companyPhone?: string | null; // NOUVEAU — affiché sous l'ÉMETTEUR sur le modèle AKO
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  items: LineItem[];
  subtotal: number;
  discountRate?: number | null; // NOUVEAU — remise en %, appliquée avant la TVA
  taxRate: number;
  total: number;
  currency: string;
  notes: string | null;
};
