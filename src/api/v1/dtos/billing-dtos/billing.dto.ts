import type { PaymentMethod } from '../../../../database/billing/payments';
import type { DiscountType } from '../../../../database/billing/discount_catalog';
import type { InvoiceStatus } from '../../../../database/billing/invoices';
import type { InvoiceItemType } from '../../../../database/billing/invoice_items';

// ─── Invoice ────────────────────────────────────────────────────────────────

export interface GenerateInvoiceRequest {
  case_file_id: string;
  requires_tax_invoice?: boolean;
  due_date?: string;
  notes?: string;
}

export interface ConfirmInvoiceRequest {
  notes?: string;
}

export interface VoidInvoiceRequest {
  reason: string;
}

export interface InvoiceItemResponse {
  id: string;
  item_type: InvoiceItemType;
  reference_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  is_iva_exempt: boolean;
}

export interface InvoiceDiscountResponse {
  id: string;
  discount_id?: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  calculated_amount: number;
  applied_by: string;
  approved_by?: string;
  approved_at?: Date;
  requires_approval: boolean;
  reason?: string;
  created_at: Date;
}

export interface PaymentResponse {
  id: string;
  payment_number: string;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  payment_date: Date;
  status: 'confirmed' | 'voided';
  received_by?: string;
  notes?: string;
}

export interface TaxInvoiceResponse {
  id: string;
  nit: string;
  tax_name: string;
  document_type: string;
  fel_status: 'pending' | 'issued' | 'cancelled';
  fel_uuid?: string;
  fel_series?: string;
  fel_number?: string;
  fel_issued_at?: Date;
}

export interface InvoiceResponse {
  id: string;
  invoice_number: string;
  case_file_id: string;
  case_number?: string;
  patient_id: string;
  patient_name?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  iva_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  requires_tax_invoice: boolean;
  confirmed_at?: Date;
  paid_at?: Date;
  due_date?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  items?: InvoiceItemResponse[];
  discounts?: InvoiceDiscountResponse[];
  payments?: PaymentResponse[];
  tax_invoice?: TaxInvoiceResponse;
}

// ─── Discounts ───────────────────────────────────────────────────────────────

export interface ApplyDiscountRequest {
  discount_id?: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  reason?: string;
}

export interface ApproveDiscountRequest {
  notes?: string;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface RecordPaymentRequest {
  payment_method: PaymentMethod;
  amount: number;
  cash_session_id?: string;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  notes?: string;
}

export interface VoidPaymentRequest {
  void_reason: string;
}

// ─── Cash Sessions ───────────────────────────────────────────────────────────

export interface OpenCashSessionRequest {
  initial_cash: number;
  notes?: string;
}

export interface CloseCashSessionRequest {
  actual_cash: number;
  notes?: string;
}

export interface CashSessionResponse {
  id: string;
  session_number: string;
  cashier_id: string;
  cashier_name?: string;
  status: 'open' | 'closed';
  opened_at: Date;
  closed_at?: Date;
  initial_cash: number;
  expected_cash?: number;
  actual_cash?: number;
  cash_difference?: number;
  total_collected: number;
  notes?: string;
}

// ─── Tax Invoice (FEL) ────────────────────────────────────────────────────────

export interface CreateTaxInvoiceRequest {
  nit: string;
  tax_name: string;
  tax_address?: string;
  document_type?: string;
}

// ─── Discount Catalog ─────────────────────────────────────────────────────────

export interface CreateDiscountCatalogRequest {
  code: string;
  name: string;
  category: 'manual' | 'employee' | 'insurance' | 'promotional' | 'courtesy';
  discount_type: DiscountType;
  value: number;
  max_amount?: number;
  requires_approval?: boolean;
  valid_from?: string;
  valid_until?: string;
}
