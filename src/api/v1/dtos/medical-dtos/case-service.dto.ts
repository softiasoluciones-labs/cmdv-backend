export interface ApplyCaseServiceRequest {
  service_id: string;
  quantity?: number;
  doctor_id?: string;
  notes?: string;
}

export interface VoidCaseServiceRequest {
  void_reason: string;
}

export interface CaseServiceResponse {
  id: string;
  case_file_id: string;
  service_id: string;
  service_name: string;
  service_code: string;
  is_consultation: boolean;
  doctor_id?: string;
  doctor_name?: string;
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
