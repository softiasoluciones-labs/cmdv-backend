export type DispatchStatus = 'pending' | 'approved' | 'dispatched' | 'completed' | 'cancelled';

export interface DispatchDetailResponse {
    id: string;
    dispatch_id: string;
    product_id: string;
    product_name?: string | undefined;
    product_code?: string | undefined;
    quantity: number;
    delivered_quantity?: number | undefined;
    notes?: string | undefined;
}

export interface DispatchResponse {
    id: string;
    dispatch_number: string;
    source_warehouse_id: string;
    source_warehouse_name?: string | undefined;
    source_warehouse_code?: string | undefined;
    destination_warehouse_id: string;
    destination_warehouse_name?: string | undefined;
    destination_warehouse_code?: string | undefined;
    requester_name: string;
    requester_user_id?: string | undefined;
    status: DispatchStatus;
    dispatch_date?: string | undefined;
    requested_date?: Date | undefined;
    completed_date?: Date | undefined;
    notes?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    created_by?: string | undefined;
    created_by_name?: string | undefined;
    dispatched_by?: string | undefined;
    dispatched_by_name?: string | undefined;
    details?: DispatchDetailResponse[] | undefined;
}

export interface CreateDispatchRequest {
    source_warehouse_id: string;
    destination_warehouse_id: string;
    requester_name: string;
    requester_user_id?: string;
    notes?: string;
    items: CreateDispatchItemRequest[];
}

export interface CreateDispatchItemRequest {
    product_id: string;
    quantity: number;
    notes?: string;
}

export interface UpdateDispatchStatusRequest {
    status: DispatchStatus;
    notes?: string;
}

export interface DispatchFilters {
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    status?: DispatchStatus | DispatchStatus[];
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}