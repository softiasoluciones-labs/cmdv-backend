import { models, sequelize } from '../../../../database';
import { purchase_orders, purchase_ordersCreationAttributes } from '../../../../database/inventory/purchase_orders';
import { purchase_order_details, purchase_order_detailsAttributes } from '../../../../database/inventory/purchase_order_details';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Op, Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Purchase Order Repository
 */
export class PurchaseOrderRepository {
    private static async setAuditUserContext(userId: string, transaction: Transaction): Promise<void> {
        await sequelize.query(
            "SELECT set_config('app.current_user_id', :userId, true)",
            {
                replacements: { userId },
                transaction
            }
        );
    }

    /**
     * Find all purchase orders with optional status filter
     */
    static async findAll(
        page: number = 1,
        limit: number = 50,
        status?: string | string[]
    ): Promise<{ orders: purchase_orders[], total: number }> {
        try {
            const offset = (page - 1) * limit;

            const where: any = {};
            if (status) {
                const statuses = Array.isArray(status)
                    ? status.flatMap(value => value.split(',')).map(value => value.trim()).filter(Boolean)
                    : status.split(',').map(value => value.trim()).filter(Boolean);

                if (statuses.length > 1) {
                    where.status = { [Op.in]: statuses };
                } else if (statuses.length === 1) {
                    where.status = statuses[0];
                }
            }

            const { rows, count } = await models.purchase_orders.findAndCountAll({
                where,
                include: [
                    {
                        model: models.suppliers,
                        as: 'supplier',
                        attributes: ['id', 'business_name', 'code']
                    },
                    {
                        model: models.warehouses,
                        as: 'warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.purchase_order_details,
                        as: 'purchase_order_details',
                        include: [{
                            model: models.products,
                            as: 'product',
                            attributes: ['id', 'name', 'code']
                        }]
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            return { orders: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding purchase orders:' + error);
            throw new Error('Failed to retrieve purchase orders');
        }
    }

    /**
     * Find purchase order by ID with details
     */
    static async findById(
        id: string,
        options: { transaction?: Transaction; lock?: boolean } = {}
    ): Promise<purchase_orders | null> {
        try {
            const findOptions: Record<string, unknown> = {
                include: [
                    {
                        model: models.suppliers,
                        as: 'supplier',
                        attributes: ['id', 'business_name', 'code']
                    },
                    {
                        model: models.warehouses,
                        as: 'warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.purchase_order_details,
                        as: 'purchase_order_details',
                        include: [{
                            model: models.products,
                            as: 'product',
                            attributes: ['id', 'name', 'code']
                        }]
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    }
                ]
            };
            if (options.transaction) findOptions.transaction = options.transaction;
            if (options.lock) {
                findOptions.lock = { level: Transaction.LOCK.UPDATE, of: models.purchase_orders };
            }

            const order = await models.purchase_orders.findByPk(id, findOptions);
            return order ?? null;
        } catch (error) {
            secureLogger.error('Error finding purchase order by ID:', error);
            throw new Error('Error finding purchase order by ID');
        }
    }

    /**
     * Find purchase order by order number
     */
    static async findByOrderNumber(orderNumber: string): Promise<purchase_orders> {
        try {
            const order = await models.purchase_orders.findOne({
                where: { po_number: orderNumber }
            });
            if (!order) {
                throw new Error('Purchase order not found');
            }
            return order;
        } catch (error) {
            secureLogger.error('Error finding purchase order by number:', error);
            throw new Error('Error finding purchase order by number');
        }
    }

    /**
     * Create purchase order with details
     */
    static async create(orderData: Omit<purchase_ordersCreationAttributes, 'po_number' | 'total' | 'subtotal'>, items: any[]): Promise<purchase_orders> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Generate order number (sequential within the transaction)
            const orderNumber = await this.generateOrderNumber(transaction);

            // Calculate total amount
            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
            const discount = (orderData as any).discount ?? 0;
            const shippingCost = (orderData as any).shipping_cost ?? 0;
            const total = subtotal - discount + shippingCost;

            // Create purchase order
            const order = await models.purchase_orders.create({
                ...orderData,
                po_number: orderNumber,
                subtotal,
                total,
                status: 'draft'
            } as purchase_ordersCreationAttributes, { transaction });

            // Create order details
            for (const item of items) {
                const detailId = uuidv4();
                const purchase_order_detail: purchase_order_detailsAttributes = {
                    purchase_order_id: order.id,
                    id: detailId,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_cost: item.unitCost,
                    subtotal: item.quantity * item.unitCost,
                    tax: 0,
                    total: item.quantity * item.unitCost,
                    received_quantity: 0,
                    expiration_date: item.expirationDate,
                    batch_number: item.batchNumber,
                    notes: item.notes
                };

                await models.purchase_order_details.create(purchase_order_detail, { transaction });
            }

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            secureLogger.error('Error creating purchase order:' + error);
            throw new Error('Failed to create purchase order');
        }
    }

    /**
     * Update purchase order status.
     * - Only sets approved_by/approved_at when transitioning to 'approved'.
     * - Auto-sets actual_delivery_date when transitioning to 'received'.
     * - Preserves existing audit fields for all other transitions.
     */
    static async updateStatus(
        id: string,
        status: string,
        approvedBy: string,
        transaction?: Transaction
    ): Promise<boolean> {
        try {
            const updateFields: any = { status: status as any };

            if (transaction && approvedBy) {
                await this.setAuditUserContext(approvedBy, transaction);
            }

            if (status === 'approved') {
                updateFields.approved_by = approvedBy;
                updateFields.approved_at = new Date();
            }

            if (status === 'received') {
                updateFields.actual_delivery_date = new Date().toISOString().split('T')[0];
            }

            const updateOptions: any = { where: { id } };
            if (transaction) updateOptions.transaction = transaction;

            const [updatedCount] = await models.purchase_orders.update(updateFields, updateOptions);
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating purchase order status:', error);
            return false;
        }
    }

    /**
     * Update received quantity for order detail
     */
    static async updateReceivedQuantity(
        detailId: string,
        receivedQty: number,
        transaction?: Transaction
    ): Promise<boolean> {
        try {
            const updateOptions: any = { where: { id: detailId } };
            if (transaction) updateOptions.transaction = transaction;

            const [updatedCount] = await models.purchase_order_details.update(
                { received_quantity: receivedQty },
                updateOptions
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating received quantity:', error);
            return false;
        }
    }

    /**
     * Remove item detail for order detail 
     */
    static async removeDetail(
        orderId: string,
        detailId: string,
        transaction?: Transaction
    ): Promise<boolean> {
        try {
            const purchase_order_detail = await models.purchase_order_details.findOne({
                where: {
                    id: detailId,
                    purchase_order_id: orderId
                },
                ...(transaction ? { transaction } : {})
            });
            if (!purchase_order_detail) {
                throw new Error('Purchase order detail not found');
            }

            const updateOptions: any = { where: { id: detailId } };
            if (transaction) updateOptions.transaction = transaction;

            const updatedCount = await models.purchase_order_details.destroy(updateOptions);

            if (updatedCount > 0) {
                await this.recalculateOrderTotals(orderId, transaction);
            }

            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error removing order detail:', error);
            throw error;
        }
    }

    /**
     * Recalculate order subtotal and total based on remaining details
     */
    private static async recalculateOrderTotals(
        orderId: string,
        transaction?: Transaction
    ): Promise<void> {
        try {
            const order = await models.purchase_orders.findByPk(orderId, {
                include: [{
                    model: models.purchase_order_details,
                    as: 'purchase_order_details'
                }],
                transaction: transaction || null
            });

            if (!order) return;

            const subtotal = (order as any).purchase_order_details.reduce(
                (sum: number, detail: any) => sum + parseFloat((detail.total || 0).toString()),
                0
            );

            const discount = order.discount ? parseFloat(order.discount.toString()) : 0;
            const shippingCost = order.shipping_cost ? parseFloat(order.shipping_cost.toString()) : 0;
            const total = subtotal - discount + shippingCost;

            await models.purchase_orders.update(
                { subtotal, total },
                { where: { id: orderId }, transaction: transaction || null }
            );
        } catch (error) {
            secureLogger.error('Error recalculating order totals:', error);
            throw error;
        }
    }

    /**
     * Generate unique sequential order number for the day.
     * Uses SELECT MAX within the transaction — if two concurrent creations
     * race, Postgres will reject one via the UNIQUE constraint on po_number
     * and the caller can retry.
     */
    private static async generateOrderNumber(transaction?: Transaction): Promise<string> {
        try {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const prefix = `PO-${year}${month}${day}-`;

            const findOptions: any = {
                where: { po_number: { [Op.like]: `${prefix}%` } },
                order: [['po_number', 'DESC']],
                attributes: ['po_number']
            };
            if (transaction) findOptions.transaction = transaction;

            const latest = await models.purchase_orders.findOne(findOptions);

            let nextSeq = 1;
            if (latest && latest.po_number) {
                const parts = latest.po_number.split('-');
                const lastSeq = parseInt(parts[parts.length - 1] || '0', 10);
                if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
            }
            return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
        } catch (error) {
            secureLogger.error('Error generating order number:', error);
            throw new Error('Failed to generate order number');
        }
    }
}
