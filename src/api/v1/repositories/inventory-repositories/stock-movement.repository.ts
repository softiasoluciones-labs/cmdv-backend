import { models } from '../../../../database';
import { stock_movements, stock_movementsCreationAttributes } from '../../../../database/inventory/stock_movements';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { CreateOptions, Op, Transaction } from 'sequelize';
import crypto from 'crypto';

/**
 * Stock Movement Repository
 * Note: Trigger automatically updates warehouse_stock on INSERT
 */
export class StockMovementRepository {
    /**
     * Find all stock movements with filters
     */
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ movements: stock_movements[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};

            if (filters.warehouseId) {
                where.warehouse_id = filters.warehouseId;
            }

            if (filters.productId) {
                where.product_id = filters.productId;
            }

            if (filters.movementType) {
                where.movement_type = filters.movementType;
            }

            if (filters.dateFrom || filters.dateTo) {
                where.movement_date = {};
                if (filters.dateFrom) {
                    where.movement_date[Op.gte] = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    where.movement_date[Op.lte] = new Date(filters.dateTo + ' 23:59:59');
                }
            }

            const { rows, count } = await models.stock_movements.findAndCountAll({
                where,
                include: [
                    {
                        model: models.warehouses,
                        as: 'warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.products,
                        as: 'product',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    }
                ],
                limit,
                offset,
                order: [['movement_date', 'DESC']]
            });

            return { movements: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding stock movements:', error);
            throw new Error('Failed to retrieve stock movements');
        }
    }

    /**
     * Find stock movement by ID
     */
    static async findById(id: string): Promise<stock_movements> {
        try {
            const movement = await models.stock_movements.findByPk(id, {
                include: [
                    {
                        model: models.warehouses,
                        as: 'warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.products,
                        as: 'product',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    }
                ]
            });
            if (!movement) {
                throw new Error('Stock movement not found');
            }
            return movement;
        } catch (error) {
            secureLogger.error('Error finding stock movement by ID:', error);
            throw new Error('Error finding stock movement by ID');
        }
    }

    /**
     * Create stock movement (triggers warehouse_stock update)
     */
    static async create(
        movementData: stock_movementsCreationAttributes,
        transaction?: Transaction
    ): Promise<stock_movements> {
        try {
            const movementNumber = await this.generateMovementNumber(movementData.movement_type);

            const createOptions: CreateOptions<stock_movementsCreationAttributes> = {};
            if (transaction) createOptions.transaction = transaction;

            const movement = await models.stock_movements.create(
                { ...movementData, movement_number: movementNumber },
                createOptions
            );

            return movement;
        } catch (error) {
            secureLogger.error('Error creating stock movement:', error);
            throw new Error('Failed to create stock movement');
        }
    }

    /**
     * Generate unique movement number
     * Format: <PREFIX>-<YYYYMMDD>-<8 hex chars> → 32 bits of entropy, collision-resistant
     */
    static async generateMovementNumber(movementType: string): Promise<string> {
        const prefix = movementType.substring(0, 3).toUpperCase();
        const date = new Date();
        const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const unique = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}-${datePart}-${unique}`;
    }
}
