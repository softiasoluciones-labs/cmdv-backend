/**
 * Warehouse DTOs
 */

export interface WarehouseResponse {
    id: string;
    code: string;
    name: string;
    location?: string | undefined;
    managerId?: string;
    managerName?: string;
    capacityM3?: number | undefined;
    temperatureControlled?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    productCount?: number;
}


export interface CreateWarehouseRequest {
    code: string;
    name: string;
    location?: string;
    managerId?: string;
    capacityM3?: number;
    temperatureControlled?: boolean;
}

export interface UpdateWarehouseRequest {
    code?: string;
    name?: string;
    location?: string;
    managerId?: string;
    capacityM3?: number;
    temperatureControlled?: boolean;
    isActive?: boolean;
}

export interface StockStatusResponse {
    warehouseName: string;
    warehouseCode: string;
    productCode: string;
    productName: string;
    category: string;
    currentStock: number;
    reservedQuantity: number;
    availableQuantity: number;
    minimumStock: number;
    reorderPoint: number;
    stockLevel: string;
    unitCost: number;
    totalValue: number;
}
