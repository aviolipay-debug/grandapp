export type Client = {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type Quote = {
  id: string;
  owner_id: string;
  client_id: string;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  expiry_date: string | null;
  subtotal: number;
  tax_rate: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
};

export type QuoteItem = {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
};

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export type Invoice = {
  id: string;
  owner_id: string;
  client_id: string;
  quote_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  total: number;
  amount_paid: number;
  currency: string;
  notes: string | null;
  created_at: string;
};
