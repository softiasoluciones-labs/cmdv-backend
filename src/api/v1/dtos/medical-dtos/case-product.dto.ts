export interface ApplyCaseProductRequest {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  notes?: string;
}

export interface VoidCaseProductRequest {
  void_reason: string;
}

export interface CaseProductResponse {
  id: string;
  case_file_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  unit_of_measure: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  applied_by?: string;
  applied_at: Date;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}

export interface BillingBreakdownItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface BillingSection {
  items: BillingBreakdownItem[];
  subtotal: number;
}

export interface BillingSummaryResponse {
  case_id: string;
  case_number: string;
  patient_name: string;
  breakdown: {
    packages: BillingSection;
    rooms: BillingSection;
    services: BillingSection;
    products: BillingSection;
  };
  total: number;
}
