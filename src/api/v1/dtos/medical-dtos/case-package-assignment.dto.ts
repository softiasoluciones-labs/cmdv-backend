export interface ApplyCasePackageAssignmentRequest {
  package_id: string;
  doctor_id: string;
  doctor_type_used: 'internal' | 'external';
  notes?: string;
}

export interface VoidCasePackageAssignmentRequest {
  void_reason: string;
}

export interface CasePackageAssignmentResponse {
  id: string;
  case_file_id: string;
  package_id: string;
  package_name: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_type_used: 'internal' | 'external';
  price_applied: number;
  assigned_date: Date;
  assigned_by?: string;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}
