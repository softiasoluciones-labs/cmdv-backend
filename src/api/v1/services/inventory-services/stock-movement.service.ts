import { StockMovementRepository } from '../../repositories/inventory-repositories/stock-movement.repository';
import { WarehouseRepository } from '../../repositories/inventory-repositories/warehouse.repository';
import { ProductRepository } from '../../repositories/inventory-repositories/product.repository';
import { StockMovementResponse, CreateStockMovementRequest, StockMovementFilters } from '../../dtos/inventory-dtos/stock-movement-dto';
import { stock_movements } from '../../../../database/inventory/stock_movements';
import { models, sequelize } from '../../../../database';
import { QueryTypes } from 'sequelize';
import { stock_movementsCreationAttributes } from '../../../../database/inventory/stock_movements';


export class StockMovementService {
    private static toStockMovementResponse(movement: stock_movements): StockMovementResponse {
        return {
            id: movement.id,
            movementNumber: movement.movement_number ?? "",
            movementType: movement.movement_type,
            warehouseId: movement.warehouse_id,
            warehouseName: (movement as any).warehouse?.name,
            productId: movement.product_id,
            productName: (movement as any).product?.name,
            productCode: (movement as any).product?.code,
            quantity: movement.quantity,
            unitCost: movement.unit_cost ? parseFloat(movement.unit_cost.toString()) : 0,
            ...(movement.reference_type !== undefined && { referenceType: movement.reference_type }),
            ...(movement.reference_id !== undefined && { referenceId: movement.reference_id }),
            ...(movement.batch_number !== undefined && { batchNumber: movement.batch_number }),
            ...(movement.expiration_date !== undefined && { expirationDate: movement.expiration_date }),
            ...(movement.notes !== undefined && { notes: movement.notes }),
            ...(movement.movement_date !== undefined && { movementDate: movement.movement_date }),
            ...(movement.created_by !== undefined && { createdBy: movement.created_by }),
            ...(movement.created_by_user?.full_name !== undefined && { createdByName: (movement as any).created_by_user?.full_name })
        };
    }

    static async getAllStockMovements(filters: StockMovementFilters): Promise<{ movements: StockMovementResponse[], total: number, page: number, limit: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;

        const { movements, total } = await StockMovementRepository.findAll(filters, page, limit);

        return {
            movements: movements.map(m => this.toStockMovementResponse(m)),
            total,
            page,
            limit
        };
    }

    static async getStockMovementById(id: string): Promise<StockMovementResponse> {
        const movement = await StockMovementRepository.findById(id);
        if (!movement) throw new Error('Stock movement not found');
        return this.toStockMovementResponse(movement);
    }

    static async createStockMovement(data: CreateStockMovementRequest, userId?: string): Promise<StockMovementResponse> {
        // Validate warehouse exists
        const warehouse = await WarehouseRepository.findById(data.warehouseId);
        if (!warehouse) throw new Error('Warehouse not found');

        // Validate product exists
        const product = await ProductRepository.findById(data.productId);
        if (!product) throw new Error('Product not found');

        // For dispatch/sale movements, check available stock
        if (['dispatch', 'sale'].includes(data.movementType)) {
            const availableStock = await this.getAvailableStock(data.warehouseId, data.productId);
            if (availableStock < data.quantity) {
                throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${data.quantity}`);
            }
        }

        const movementData: stock_movementsCreationAttributes = {
            movement_type: data.movementType,
            warehouse_id: data.warehouseId,
            movement_number: await StockMovementRepository.generateMovementNumber(data.movementType),
            product_id: data.productId,
            quantity: data.quantity,
            ...(data.unitCost && { unit_cost: data.unitCost }),
            // Propiedades opcionales con spread operator
            ...(data.referenceType && { reference_type: data.referenceType }),
            ...(data.referenceId && { reference_id: data.referenceId }),
            ...(data.batchNumber && { batch_number: data.batchNumber }),
            ...(data.expirationDate && { expiration_date: data.expirationDate }),
            ...(data.notes && { notes: data.notes }),
            ...(userId && { created_by: userId })
        };

        const movement = await StockMovementRepository.create(movementData);

        return this.toStockMovementResponse(movement);
    }

    private static async getAvailableStock(warehouseId: string, productId: string): Promise<number> {
        try {
            let query = `SELECT quantity 
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
