/**
 * Product DTOs
 */

export interface ProductResponse {
    id: string;
    code: string;
    barcode?: string;
    name: string;
    categoryId: string;
    categoryName?: string;
    description?: string;
    unitOfMeasure: string;
    minimumStock?: number;
    maximumStock?: number;
    reorderPoint?: number;
    unitCost?: number;
    sellingPrice?: number;
    requiresPrescription?: boolean;
    requiresRefrigeration?: boolean;
    expirationAlertDays?: number;
    isActive?: boolean;
    totalStockQuantity?: number;
    totalReservedQuantity?: number;
    totalAvailableQuantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateProductRequest {
    code: string;
    barcode?: string;
    name: string;
    categoryId: string;
    description?: string;
    unitOfMeasure: string;
    minimumStock?: number;
    maximumStock?: number;
    reorderPoint?: number;
    unitCost?: number;
    sellingPrice?: number;
    requiresPrescription?: boolean;
    requiresRefrigeration?: boolean;
    expirationAlertDays?: number;
}

export interface UpdateProductRequest {
    code?: string;
    barcode?: string;
    name?: string;
    categoryId?: string;
    description?: string;
    unitOfMeasure?: string;
    minimumStock?: number;
    maximumStock?: number;
    reorderPoint?: number;
    unitCost?: number;
    sellingPrice?: number;
    requiresPrescription?: boolean;
    requiresRefrigeration?: boolean;
    expirationAlertDays?: number;
    isActive?: boolean;
}

export interface ProductListFilters {
    categoryId?: string;
    isActive?: boolean;
    requiresPrescription?: boolean;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
