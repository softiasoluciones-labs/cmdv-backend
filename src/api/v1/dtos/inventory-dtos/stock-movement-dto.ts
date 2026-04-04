/**
 * Stock Movement DTOs
 */

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'dispatch' | 'reception';

export interface StockMovementResponse {
    id: string;
    movementNumber: string;
    movementType: MovementType;
    warehouseId: string;
    warehouseName?: string;
    productId: string;
    productName?: string;
    productCode?: string;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    batchNumber?: string;
    expirationDate?: string;
    notes?: string;
    movementDate?: Date;
    createdBy?: string;
    createdByName?: string;
}

export interface CreateStockMovementRequest {
    movementType: MovementType;
    warehouseId: string;
    productId: string;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    batchNumber?: string;
    expirationDate?: string;
    notes?: string;
}

export interface StockMovementFilters {
    warehouseId?: string;
    productId?: string;
    movementType?: MovementType;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
