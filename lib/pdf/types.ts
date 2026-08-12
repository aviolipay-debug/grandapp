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
  amountPaid?: number | null; // NOUVEAU — acompte(s) déjà enregistré(s), affiché sous la Remise
  currency: string;
  notes: string | null;
};
