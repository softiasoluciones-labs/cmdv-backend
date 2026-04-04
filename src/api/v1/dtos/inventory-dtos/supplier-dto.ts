/**
 * Supplier DTOs
 */

export interface SupplierResponse {
    id: string;
    code: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string | "";
    address?: string;
    state?: string;
    city?: string;
    country?: string;
    taxId?: string;
    paymentTerms?: string;
    creditLimit?: number;
    isActive?: boolean;
    createdAt?: Date;
}

export interface CreateSupplierRequest {
    code: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    paymentTerms: "immediate" | "one_payment" | "two_payments" | "three_payments";
    creditLimit?: number;
}

export interface UpdateSupplierRequest {
    code?: string;
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    paymentTerms?: string;
    creditLimit?: number;
    isActive?: boolean;
}
