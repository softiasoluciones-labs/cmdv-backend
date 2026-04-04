import { PurchaseOrderRepository } from '../../repositories/inventory-repositories/purchase-order.repository';
import { StockMovementRepository } from '../../repositories/inventory-repositories/stock-movement.repository';
import { PurchaseOrderResponse, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, ReceivePurchaseOrderRequest, PurchaseOrderItemResponse } from '../../dtos/inventory-dtos/purchase-order-dto';
import { purchase_orders } from '../../../../database/inventory/purchase_orders';
import { sequelize } from '../../../../database';
import { stock_movementsAttributes } from '../../../../database/inventory/stock_movements';

export class PurchaseOrderService {
    private static toPurchaseOrderResponse(order: purchase_orders): PurchaseOrderResponse {
        const items: PurchaseOrderItemResponse[] = ((order as any).purchase_order_details || []).map((detail: any) => ({
            id: detail.id,
            productId: detail.product_id,
            productCode: detail.product?.code,
            productName: detail.product?.name,
            quantity: detail.quantity,
            unitCost: detail.unit_cost ? parseFloat(detail.unit_cost.toString()) : 0,
            totalCost: detail.total_cost ? parseFloat(detail.total_cost.toString()) : 0,
            receivedQuantity: detail.received_quantity,
            expirationDate: detail.expiration_date,
            batchNumber: detail.batch_number,
            notes: detail.notes
        }));

        return {
            id: order.id,
            orderNumber: order.po_number,
            supplierId: order.supplier_id,
            warehouseId: order.warehouse_id,
            ...((order as any).supplier?.name !== undefined && { supplierName: (order as any).supplier.name }),
            ...((order as any).warehouse?.name !== undefined && { warehouseName: (order as any).warehouse.name }),
            ...(order.order_date && { orderDate: order.order_date.toString() }),
            ...(order.expected_delivery_date && { expectedDate: order.expected_delivery_date.toString() }),
            ...(order.actual_delivery_date && { receivedDate: order.actual_delivery_date.toString() }),
            ...(order.status && { status: order.status }),
            ...(order.total !== null && order.total !== undefined && { totalAmount: parseFloat(order.total.toString()) }),
            ...(order.notes && { notes: order.notes }),
            ...(order.created_by && { createdBy: order.created_by }),
            ...(items.length > 0 && { items }),
            ...(order.created_at && { createdAt: order.created_at })
        };
    }

    static async getAllPurchaseOrders(page: number = 1, limit: number = 50): Promise<{ orders: PurchaseOrderResponse[], total: number, page: number, limit: number }> {
        const { orders, total } = await PurchaseOrderRepository.findAll(page, limit);
        return {
            orders: orders.map(o => this.toPurchaseOrderResponse(o)),
            total,
            page,
            limit
        };
    }

    static async getPurchaseOrderById(id: string): Promise<PurchaseOrderResponse> {
        const order = await PurchaseOrderRepository.findById(id);
        if (!order) throw new Error('Purchase order not found');
        return this.toPurchaseOrderResponse(order);
    }

    static async getPurchaseOrderByPoNumber(poNumber: string): Promise<PurchaseOrderResponse> {
        const order = await PurchaseOrderRepository.findByOrderNumber(poNumber);
        if (!order) throw new Error('Purchase order not found');
        return this.toPurchaseOrderResponse(order);
    }

    static async createPurchaseOrder(data: CreatePurchaseOrderRequest, userId?: string): Promise<PurchaseOrderResponse> {
        const order = await PurchaseOrderRepository.create({
            supplier_id: data.supplierId,
            warehouse_id: data.warehouseId,
            ...(data.expectedDate && { expected_delivery_date: data.expectedDate }),
            ...(data.notes && { notes: data.notes }),
            ...(userId && { created_by: userId })
        }, data.items);

        const created = await PurchaseOrderRepository.findById(order.id);
        return this.toPurchaseOrderResponse(created!);
    }

    static async updatePurchaseOrderStatus(id: string, status: string, userId: string): Promise<PurchaseOrderResponse> {
        const order = await PurchaseOrderRepository.findById(id);
        if (!order) throw new Error('Purchase order not found');

        // Validate status transitions
        const validStatuses = ['draft', 'pending', 'approved', 'received', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        // Update status
        const updated = await PurchaseOrderRepository.updateStatus(id, status, userId);
        if (!updated) throw new Error('Failed to update purchase order status');

        const updatedOrder = await PurchaseOrderRepository.findById(id);
        return this.toPurchaseOrderResponse(updatedOrder!);
    }

    static async receivePurchaseOrder(id: string, data: ReceivePurchaseOrderRequest, userId: string): Promise<PurchaseOrderResponse> {
        const order = await PurchaseOrderRepository.findById(id);
        if (!order) throw new Error('Purchase order not found');

        if (!['pending', 'approved'].includes(order.status || '')) {
            throw new Error(`Cannot receive order with status: ${order.status}`);
        }

        const transaction = await sequelize.transaction();

        try {
            // Create stock movements for received items
            for (const item of data.receivedItems) {
                const orderDetail = (order as any).purchase_order_details.find(
                    (d: any) => d.product_id === item.productId
                );

                if (!orderDetail) {
                    throw new Error(`Product ${item.productId} not found in order`);
                }

                const stockMovementData: stock_movementsAttributes = {
                    movement_type: 'reception',
                    warehouse_id: order.warehouse_id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_cost: parseFloat(orderDetail.unit_cost.toString()),
                    reference_type: 'purchase_order',
                    reference_id: order.id,
                    movement_number: await StockMovementRepository.generateMovementNumber('reception'),
                    created_by: userId,
                    ...(item.batchNumber && { batch_number: item.batchNumber }),
                    ...(item.expirationDate && { expiration_date: item.expirationDate }),
                    ...(data.notes && { notes: data.notes })
                };

                // Create reception stock movement
                await StockMovementRepository.create(stockMovementData);

                // Update received quantity
                const newReceivedQty = (orderDetail.received_quantity || 0) + item.quantity;
                await PurchaseOrderRepository.updateReceivedQuantity(orderDetail.id, newReceivedQty);
            }

            // Update order status
            const allItemsReceived = (order as any).purchase_order_details.every((detail: any) => {
                const receivedItem = data.receivedItems.find(i => i.productId === detail.product_id);
                const totalReceived = (detail.received_quantity || 0) + (receivedItem?.quantity || 0);
                return totalReceived >= detail.quantity;
            });

            const newStatus = allItemsReceived ? 'received' : 'approved';
            await PurchaseOrderRepository.updateStatus(id, newStatus, userId);

            await transaction.commit();

            const updated = await PurchaseOrderRepository.findById(id);
            return this.toPurchaseOrderResponse(updated!);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
