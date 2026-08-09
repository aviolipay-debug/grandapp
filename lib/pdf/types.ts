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
  objet: string | null;
  issueDate: string;
  dueOrExpiryDate: string | null;
  companyName: string;
  companyAddress: string | null;
  companyLogoUrl: string | null;
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
