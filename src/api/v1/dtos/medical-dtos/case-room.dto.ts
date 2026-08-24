export interface ApplyCaseRoomRequest {
  room_id: string;
  notes?: string;
}

export interface VoidCaseRoomRequest {
  void_reason: string;
}

export interface CaseRoomResponse {
  id: string;
  case_file_id: string;
  room_id: string;
  room_number: string;
  room_type: string;
  daily_rate: number;
  check_in: Date;
  check_out?: Date;
  nights: number;
  total_price: number;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}
