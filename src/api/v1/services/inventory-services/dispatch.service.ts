import { DispatchRepository } from '../../repositories/inventory-repositories/dispatch.repository';
import { WarehouseRepository } from '../../repositories/inventory-repositories/warehouse.repository';
import { ProductRepository } from '../../repositories/inventory-repositories/product.repository';
import { StockMovementRepository } from '../../repositories/inventory-repositories/stock-movement.repository';
import {
    DispatchResponse,
    CreateDispatchRequest,
    DispatchFilters,
    DispatchDetailResponse
} from '../../dtos/inventory-dtos/dispatch-dto';
import { warehouse_dispatches } from '../../../../database/inventory/warehouse_dispatches';
import { warehouse_dispatch_details } from '../../../../database/inventory/warehouse_dispatch_details';
import { models, sequelize } from '../../../../database';
import { QueryTypes, Transaction } from 'sequelize';
import { stock_movementsCreationAttributes } from '../../../../database/inventory/stock_movements';

export class DispatchService {
    private static toDispatchResponse(dispatch: warehouse_dispatches): DispatchResponse {
        return {
            id: dispatch.id,
            dispatch_number: dispatch.dispatch_number ?? "",
            source_warehouse_id: dispatch.source_warehouse_id,
            source_warehouse_name: (dispatch as any).source_warehouse?.name,
            source_warehouse_code: (dispatch as any).source_warehouse?.code,
            destination_warehouse_id: dispatch.destination_warehouse_id,
            destination_warehouse_name: (dispatch as any).destination_warehouse?.name,
            destination_warehouse_code: (dispatch as any).destination_warehouse?.code,
            requester_name: dispatch.requester_name,
            requester_user_id: dispatch.requester_user_id,
            status: dispatch.status,
            dispatch_date: dispatch.dispatch_date,
            requested_date: dispatch.requested_date,
            completed_date: dispatch.completed_date,
            notes: dispatch.notes,
            created_at: dispatch.created_at,
            updated_at: dispatch.updated_at,
            created_by: dispatch.created_by,
            created_by_name: (dispatch as any).created_by_user?.full_name,
            dispatched_by: dispatch.dispatched_by,
            dispatched_by_name: (dispatch as any).dispatched_by_user?.full_name,
            details: dispatch.warehouse_dispatch_details?.map(d => this.toDetailResponse(d))
        };
    }

    private static toDetailResponse(detail: warehouse_dispatch_details): DispatchDetailResponse {
        return {
            id: detail.id,
            dispatch_id: detail.dispatch_id,
            product_id: detail.product_id,
            product_name: (detail as any).product?.name,
            product_code: (detail as any).product?.code,
            quantity: detail.quantity,
            delivered_quantity: detail.delivered_quantity,
            notes: detail.notes
        };
    }

    static async getAllDispatches(filters: DispatchFilters): Promise<{ dispatches: DispatchResponse[], total: number, page: number, limit: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;

        const { dispatches, total } = await DispatchRepository.findAll(filters, page, limit);

        return {
            dispatches: dispatches.map(d => this.toDispatchResponse(d)),
            total,
            page,
            limit
        };
    }

    static async getDispatchById(id: string): Promise<DispatchResponse> {
        const dispatch = await DispatchRepository.findById(id);
        return this.toDispatchResponse(dispatch);
    }

    static async createDispatch(data: CreateDispatchRequest, userId?: string): Promise<DispatchResponse> {
        if (data.source_warehouse_id === data.destination_warehouse_id) {
            throw new Error('Source and destination warehouses must be different');
        }

        const sourceWarehouse = await WarehouseRepository.findById(data.source_warehouse_id);
        if (!sourceWarehouse) throw new Error('Source warehouse not found');

        const destWarehouse = await WarehouseRepository.findById(data.destination_warehouse_id);
        if (!destWarehouse) throw new Error('Destination warehouse not found');

        for (const item of data.items) {
            const product = await ProductRepository.findById(item.product_id);
            if (!product) throw new Error(`Product ${item.product_id} not found`);
        }

        const dispatchData: any = {
            source_warehouse_id: data.source_warehouse_id,
            destination_warehouse_id: data.destination_warehouse_id,
            requester_name: data.requester_name,
            status: 'pending' as const
        };

        if (data.requester_user_id) dispatchData.requester_user_id = data.requester_user_id;
        if (data.notes) dispatchData.notes = data.notes;
        if (userId) dispatchData.created_by = userId;

        const detailsData = data.items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            ...(item.notes && { notes: item.notes })
        }));

        const dispatch = await DispatchRepository.create(dispatchData, detailsData);
        return this.toDispatchResponse(dispatch);
    }

    static async approveDispatch(id: string, userId?: string): Promise<DispatchResponse> {
        const dispatch = await DispatchRepository.findById(id);

        if (dispatch.status !== 'pending') {
            throw new Error(`Cannot approve dispatch in status: ${dispatch.status}`);
        }

        for (const detail of dispatch.warehouse_dispatch_details || []) {
            const availableStock = await this.getAvailableStock(dispatch.source_warehouse_id, detail.product_id);
            if (availableStock < detail.quantity) {
                const product = await ProductRepository.findById(detail.product_id);
                throw new Error(`Insufficient stock for ${product?.name || detail.product_id}. Available: ${availableStock}, Requested: ${detail.quantity}`);
            }
        }

        const updated = await DispatchRepository.updateStatus(id, 'approved');
        return this.toDispatchResponse(updated);
    }

    static async dispatchDispatch(id: string, userId?: string, notes?: string): Promise<DispatchResponse> {
        const dispatch = await DispatchRepository.findById(id);

        if (dispatch.status !== 'approved') {
            throw new Error(`Cannot dispatch in status: ${dispatch.status}`);
        }

        const transaction = await sequelize.transaction();

        try {
            for (const detail of dispatch.warehouse_dispatch_details || []) {
                const dispatchMovement: any = {
                    movement_type: 'dispatch',
                    warehouse_id: dispatch.source_warehouse_id,
                    movement_number: await StockMovementRepository.generateMovementNumber('dispatch'),
                    product_id: detail.product_id,
                    quantity: detail.quantity,
                    reference_type: 'dispatch',
                    reference_id: dispatch.id,
                    notes: `Dispatch ${dispatch.dispatch_number}`
                };
                if (userId) dispatchMovement.created_by = userId;
                await StockMovementRepository.create(dispatchMovement, transaction);

                const receptionMovement: any = {
                    movement_type: 'reception',
                    warehouse_id: dispatch.destination_warehouse_id,
                    movement_number: await StockMovementRepository.generateMovementNumber('reception'),
                    product_id: detail.product_id,
                    quantity: detail.quantity,
                    reference_type: 'dispatch',
                    reference_id: dispatch.id,
                    notes: `Reception from dispatch ${dispatch.dispatch_number}`
                };
                if (userId) receptionMovement.created_by = userId;
                await StockMovementRepository.create(receptionMovement, transaction);

                await models.warehouse_dispatch_details.update(
                    { delivered_quantity: detail.quantity },
                    { where: { id: detail.id }, transaction: transaction as any }
                );
            }

            await DispatchRepository.updateStatus(id, 'dispatched', userId, new Date(), notes, transaction);

            await transaction.commit();

            const updated = await DispatchRepository.findById(id);
            return this.toDispatchResponse(updated);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async completeDispatch(id: string): Promise<DispatchResponse> {
        const dispatch = await DispatchRepository.findById(id);

        if (dispatch.status !== 'dispatched') {
            throw new Error(`Cannot complete dispatch in status: ${dispatch.status}`);
        }

        const updated = await DispatchRepository.updateStatus(id, 'completed', undefined, undefined, undefined);
        return this.toDispatchResponse(updated);
    }

    static async cancelDispatch(id: string, notes?: string): Promise<DispatchResponse> {
        const dispatch = await DispatchRepository.findById(id);

        if (['dispatched', 'completed', 'cancelled'].includes(dispatch.status)) {
            throw new Error(`Cannot cancel dispatch in status: ${dispatch.status}`);
        }

        const updated = await DispatchRepository.updateStatus(id, 'cancelled', undefined, undefined, notes);
        return this.toDispatchResponse(updated);
    }

    static async deleteDispatch(id: string): Promise<void> {
        const dispatch = await DispatchRepository.findById(id);

        if (dispatch.status !== 'pending') {
            throw new Error(`Cannot delete dispatch in status: ${dispatch.status}. Only pending dispatches can be deleted.`);
        }

        await DispatchRepository.delete(id);
    }

    private static async getAvailableStock(warehouseId: string, productId: string): Promise<number> {
        try {
            const query = `SELECT quantity 
            FROM inventory.warehouse_stock
            WHERE warehouse_id = :warehouseId
            AND product_id = :productId`;

            const [result] = await sequelize.query(query, {
                replacements: { warehouseId, productId },
                type: QueryTypes.SELECT as any
            }) as any;

            return result ? result.quantity || 0 : 0;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}