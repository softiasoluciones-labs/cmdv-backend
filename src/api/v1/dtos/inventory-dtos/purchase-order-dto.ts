/**
 * Purchase Order DTOs
 */

export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';

export interface PurchaseOrderItemResponse {
    id: string;
    productId: string;
    productCode?: string;
    productName?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    receivedQuantity?: number;
    expirationDate?: string;
    batchNumber?: string;
    notes?: string;
}

export interface PurchaseOrderResponse {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplierName?: string;
    warehouseId: string;
    warehouseName?: string;
    orderDate?: string;
    expectedDate?: string;
    receivedDate?: string;
    status?: PurchaseOrderStatus;
    totalAmount?: number;
    notes?: string;
    createdBy?: string;
    items?: PurchaseOrderItemResponse[];
    createdAt?: Date;
}

export interface PurchaseOrderItemRequest {
    productId: string;
    quantity: number;
    unitCost: number;
    expirationDate?: string;
    batchNumber?: string;
    notes?: string;
}

export interface CreatePurchaseOrderRequest {
    supplierId: string;
    warehouseId: string;
    expectedDate?: string;
    notes?: string;
    items: PurchaseOrderItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
    supplierId?: string;
    warehouseId?: string;
    expectedDate?: string;
    status?: PurchaseOrderStatus;
    notes?: string;
    items?: PurchaseOrderItemRequest[];
}

export interface ReceivePurchaseOrderRequest {
    receivedItems: {
        productId: string;
        quantity: number;
        batchNumber?: string;
        expirationDate?: string;
    }[];
    notes?: string;
}
