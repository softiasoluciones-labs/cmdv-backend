import { PurchaseOrderRepository } from '../../repositories/inventory-repositories/purchase-order.repository';
import { StockMovementRepository } from '../../repositories/inventory-repositories/stock-movement.repository';
import { PurchaseOrderPaymentRepository } from '../../repositories/inventory-repositories/purchase-order-payment.repository';
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
            totalCost: detail.total ? parseFloat(detail.total.toString()) : 0,
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
            ...((order as any).supplier?.business_name !== undefined && { supplierName: (order as any).supplier.business_name }),
            ...((order as any).warehouse?.name !== undefined && { warehouseName: (order as any).warehouse.name }),
            ...(order.order_date && { orderDate: order.order_date.toString() }),
            ...(order.expected_delivery_date && { expectedDate: order.expected_delivery_date.toString() }),
            ...(order.actual_delivery_date && { receivedDate: order.actual_delivery_date.toString() }),
            ...(order.status && { status: order.status }),
            ...(order.subtotal !== null && order.subtotal !== undefined && { subtotal: parseFloat(order.subtotal.toString()) }),
            ...(order.discount !== null && order.discount !== undefined && { discount: parseFloat(order.discount.toString()) }),
            ...(order.shipping_cost !== null && order.shipping_cost !== undefined && { shippingCost: parseFloat(order.shipping_cost.toString()) }),
            ...(order.total !== null && order.total !== undefined && { totalAmount: parseFloat(order.total.toString()) }),
            ...(order.payment_terms && { paymentTerms: order.payment_terms }),
            ...(order.notes && { notes: order.notes }),
            ...(order.created_by && { createdBy: order.created_by }),
            ...({ items }),
            ...(order.created_at && { createdAt: order.created_at })
        };
    }

    static async getAllPurchaseOrders(
        page: number = 1,
        limit: number = 50,
        status?: string | string[]
    ): Promise<{ orders: PurchaseOrderResponse[], total: number, page: number, limit: number }> {
        const { orders, total } = await PurchaseOrderRepository.findAll(page, limit, status as string | string[] | undefined);
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
            ...(data.discount !== undefined && { discount: data.discount }),
            ...(data.shippingCost !== undefined && { shipping_cost: data.shippingCost }),
            payment_terms: data.paymentTerms,
            ...(data.expectedDate && { expected_delivery_date: data.expectedDate }),
            ...(data.notes && { notes: data.notes }),
            ...(userId && { created_by: userId })
        }, data.items);

        const created = await PurchaseOrderRepository.findById(order.id);
        return this.toPurchaseOrderResponse(created!);
    }

    /**
     * Valid transitions between PO statuses.
     * Note: transition to 'received' is only allowed through receivePurchaseOrder
     * (which must also create the corresponding stock movements).
     */
    private static readonly STATUS_TRANSITIONS: Record<string, string[]> = {
        draft: ['pending', 'cancelled'],
        pending: ['approved', 'cancelled', 'draft'],
        approved: ['cancelled'],
        received: [],
        cancelled: []
    };

    static async updatePurchaseOrderStatus(id: string, status: string, userId: string): Promise<PurchaseOrderResponse> {
        const transaction = await sequelize.transaction();
        try {
            const order = await PurchaseOrderRepository.findById(id, { transaction, lock: true });
            if (!order) throw new Error('Purchase order not found');

            const validStatuses = Object.keys(this.STATUS_TRANSITIONS);
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status: ${status}`);
            }

            const currentStatus = order.status || 'draft';
            if (currentStatus === status) {
                throw new Error(`Purchase order is already in status: ${status}`);
            }

            const allowed = this.STATUS_TRANSITIONS[currentStatus] || [];
            if (!allowed.includes(status)) {
                throw new Error(`Invalid status transition from '${currentStatus}' to '${status}'`);
            }

            // Cancelling an order with any received items would leave stock inflated.
            // Block this — partial returns must go through a separate dedicated flow.
            if (status === 'cancelled') {
                const hasReceived = ((order as any).purchase_order_details || []).some(
                    (d: any) => (d.received_quantity || 0) > 0
                );
                if (hasReceived) {
                    throw new Error('Cannot cancel order with received items. Create a return instead.');
                }
            }

            const updated = await PurchaseOrderRepository.updateStatus(id, status, userId, transaction);
            if (!updated) throw new Error('Failed to update purchase order status');

            const updatedOrder = await PurchaseOrderRepository.findById(id, { transaction });
            await transaction.commit();
            return this.toPurchaseOrderResponse(updatedOrder!);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async receivePurchaseOrder(id: string, data: ReceivePurchaseOrderRequest, userId: string): Promise<PurchaseOrderResponse> {
        const transaction = await sequelize.transaction();

        try {
            // Lock the PO row to prevent concurrent receptions from racing.
            const order = await PurchaseOrderRepository.findById(id, { transaction, lock: true });
            if (!order) throw new Error('Purchase order not found');

            if (!['pending', 'approved'].includes(order.status || '')) {
                throw new Error(`Cannot receive order with status: ${order.status}`);
            }

            const details: any[] = (order as any).purchase_order_details || [];
            const pendingByDetailId = new Map<string, number>();
            for (const detail of details) {
                pendingByDetailId.set(detail.id, detail.quantity - (detail.received_quantity || 0));
            }

            // Process each received item against a specific order detail.
            // We match by product_id but track consumption of pending quantity
            // per-detail row so duplicate product lines (e.g. same product in
            // two batches) are handled safely.
            for (const item of data.receivedItems) {
                const orderDetail = details.find(
                    (d: any) => d.product_id === item.productId && (pendingByDetailId.get(d.id) || 0) > 0
                );

                if (!orderDetail) {
                    throw new Error(`Product ${item.productId} not found in order or already fully received`);
                }

                const pending = pendingByDetailId.get(orderDetail.id) || 0;
                if (item.quantity > pending) {
                    throw new Error(
                        `Cannot receive ${item.quantity} units of product ${item.productId}. Only ${pending} pending on this line.`
                    );
                }

                const stockMovementData: stock_movementsAttributes = {
                    movement_type: 'reception',
                    warehouse_id: order.warehouse_id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_cost: parseFloat(orderDetail.unit_cost.toString()),
                    reference_type: 'purchase_order',
                    reference_id: order.id,
                    movement_number: '', // overwritten by repository
                    created_by: userId,
                    ...(item.batchNumber && { batch_number: item.batchNumber }),
                    ...(item.expirationDate && { expiration_date: item.expirationDate }),
                    ...(data.notes && { notes: data.notes })
                };

                await StockMovementRepository.create(stockMovementData, transaction);

                const newReceivedQty = (orderDetail.received_quantity || 0) + item.quantity;
                await PurchaseOrderRepository.updateReceivedQuantity(orderDetail.id, newReceivedQty, transaction);

                // Keep the in-memory pending counter in sync for the rest of the loop
                pendingByDetailId.set(orderDetail.id, pending - item.quantity);
                orderDetail.received_quantity = newReceivedQty;
            }

            // Decide final status based on accumulated pending quantities.
            const allItemsReceived = details.every((d: any) => (pendingByDetailId.get(d.id) || 0) <= 0);
            const newStatus = allItemsReceived ? 'received' : 'approved';
            await PurchaseOrderRepository.updateStatus(id, newStatus, userId, transaction);

            await transaction.commit();

            const updated = await PurchaseOrderRepository.findById(id);
            return this.toPurchaseOrderResponse(updated!);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async removeOrderDetail(orderId: string, detailId: string): Promise<PurchaseOrderResponse> {
        const transaction = await sequelize.transaction();
        try {
            const order = await PurchaseOrderRepository.findById(orderId, { transaction });

            if (order.status !== 'draft') {
                throw new Error(`No se puede eliminar detalles de una orden en estado "${order.status}". Solo se permiten eliminaciones en estado "borrador"`);
            }

            const payments = await PurchaseOrderPaymentRepository.findByPurchaseOrderId(orderId);
            if (payments.length > 0) {
                throw new Error('No se puede eliminar detalles de una orden que ya tiene pagos asociados');
            }

            const removed = await PurchaseOrderRepository.removeDetail(orderId, detailId, transaction);
            if (!removed) {
                throw new Error('Detalle no encontrado o no pertenece a esta orden');
            }

            const updatedOrder = await PurchaseOrderRepository.findById(orderId, { transaction });
            await transaction.commit();
            return this.toPurchaseOrderResponse(updatedOrder!);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
