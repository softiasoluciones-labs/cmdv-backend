import type { PaymentMethod } from '../../../../database/inventory/purchase_order_payments';

export interface PaymentDetailDto {
  paymentMethod: PaymentMethod;
  amount: number;
  bank?: string;
  referenceNumber?: string;
  authorizationCode?: string;
}

export interface CreatePaymentRequest {
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bank?: string;
  referenceNumber?: string;
  authorizationCode?: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
  isMixed?: boolean;
  paymentDetails?: PaymentDetailDto[];
}

export interface PaymentResponse {
  id: string;
  purchaseOrderId: string;
  paymentNumber: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  bank?: string;
  referenceNumber?: string;
  authorizationCode?: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  paymentDetails?: PaymentDetailResponse[];
}

export interface PaymentDetailResponse {
  id: string;
  paymentMethod: string;
  amount: number;
  bank?: string;
  referenceNumber?: string;
  authorizationCode?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalAmount: number;
  pendingAmount: number;
  paymentCount: number;
  payments: PaymentResponse[];
}

export interface PaymentListFilters {
  page?: number;
  limit?: number;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}