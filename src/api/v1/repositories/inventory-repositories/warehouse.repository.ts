import { models } from '../../../../database';
import { warehouses, warehousesCreationAttributes } from '../../../../database/inventory/warehouses';
import { sequelize } from '../../../../database';
import { QueryTypes } from 'sequelize';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { StockStatusResponse } from '../../dtos/inventory-dtos/warehouse-dto';

/**
 * Warehouse Repository
 */
export class WarehouseRepository {
    /**
     * Find all warehouses
     */
    static async findAll(): Promise<warehouses[]> {
        try {
            const warehouses = await models.warehouses.findAll({
                include: [
                    {
                        model: models.users,
                        as: 'manager',
                        attributes: ['id', 'full_name', 'email']
                    },
                    {
                        model: models.warehouse_stock,
                        as: 'warehouse_stocks',
                        attributes: [],
                        duplicating: false,
                        required: false
                    }
                ],
                attributes: [
                    'id',
                    'code',
                    'name',
                    'location',
                    'manager_id',
                    'capacity_m3',
                    'temperature_controlled',
                    'is_active',
                    'created_at',
                    [sequelize.fn('COUNT', sequelize.col('warehouse_stocks.product_id')), 'product_count']
                ],
                group: [
                    'warehouses.id',
                    'warehouses.code',
                    'warehouses.name',
                    'warehouses.location',
                    'warehouses.manager_id',
                    'warehouses.capacity_m3',
                    'warehouses.temperature_controlled',
                    'warehouses.is_active',
                    'warehouses.created_at',
                    'manager.id', 'manager.full_name', 'manager.email'
                ],
                order: [['name', 'ASC']],
                subQuery: false
            });

            return warehouses;
        } catch (error: any) {
            secureLogger.error('Error finding warehouses: ' + error);
            return [];
        }
    }

    /**
     * Find warehouse by ID
     */
    static async findById(id: string): Promise<warehouses | null> {
        try {
            const warehouse = await models.warehouses.findByPk(id, {
                include: [{
                    model: models.users,
                    as: 'manager',
                    attributes: ['id', 'full_name', 'email']
                }]
            });
            return warehouse ?? null;
        } catch (error) {
            secureLogger.error('Error finding warehouse by ID:' + error);
            throw new Error('Error finding warehouse by ID');
        }
    }

    /**
     * Find warehouse by code
     */
    static async findByCode(code: string): Promise<warehouses | null> {
        try {
            const warehouse = await models.warehouses.findOne({
                where: { code }
            });
            return warehouse ?? null;
        } catch (error) {
            secureLogger.error('Error finding warehouse by code:', error);
            throw new Error('Error finding warehouse by code');
        }
    }

    /**
     * Create new warehouse
     */
    static async create(warehouseData: warehousesCreationAttributes): Promise<warehouses> {
        try {
            const warehouse = await models.warehouses.create(warehouseData);
            return warehouse;
        } catch (error) {
            secureLogger.error('Error creating warehouse:', error);
            throw new Error('Failed to create warehouse');
        }
    }

    /**
     * Update warehouse
     */
    static async update(id: string, warehouseData: Partial<warehousesCreationAttributes>): Promise<boolean> {
        try {
            const [updatedCount] = await models.warehouses.update(warehouseData, {
                where: { id }
            });
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating warehouse:', error);
            return false;
        }
    }

    /**
     * Delete warehouse (soft delete)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const [updatedCount] = await models.warehouses.update(
                { is_active: false },
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting warehouse:', error);
            return false;
        }
    }

    /**
     * Get stock status for a warehouse using v_stock_status view
     */
    static async getStockStatus(warehouseId?: string): Promise<StockStatusResponse[]> {
        try {
            let query = `
                SELECT 
                    warehouse_id, 
                    warehouse_name,
                    warehouse_code,
                    product_code,
                    product_name,
                    category,
                    current_stock,
                    reserved_quantity,
                    available_quantity,
                    minimum_stock,
                    reorder_point,
                    stock_level,
                    unit_cost,
                    total_value
                FROM inventory.v_stock_status
            `;

            const replacements: any = {};
            if (warehouseId) {
                query += ` WHERE warehouse_id = :warehouseId`;
                replacements.warehouseId = warehouseId;
            }

            query += ` ORDER BY warehouse_code, product_code`;

            const [results] = await sequelize.query(query, {
                replacements,
                type: QueryTypes.SELECT
            }) as any;

            return results || [];
        } catch (error) {
            secureLogger.error('Error getting stock status:', error);
            return [];
        }
    }
}
