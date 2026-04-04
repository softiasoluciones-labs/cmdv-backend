import { Request, Response } from 'express';
import { StockMovementService } from '../../services/inventory-services/stock-movement.service';
import { StockMovementFilters } from '../../dtos/inventory-dtos/stock-movement-dto';

export class StockMovementController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: StockMovementFilters = {
                warehouseId: req.query.warehouseId as string,
                productId: req.query.productId as string,
                movementType: req.query.movementType as any,
                dateFrom: req.query.dateFrom as string,
                dateTo: req.query.dateTo as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            const result = await StockMovementService.getAllStockMovements(filters);
            res.status(200).json({ success: true, code: 200, message: 'Stock movements retrieved successfully', data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Stock movement ID is required');
            }
            const movement = await StockMovementService.getStockMovementById(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Stock movement retrieved successfully', data: movement });
        } catch (error: any) {
            const status = error.message === 'Stock movement not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const movement = await StockMovementService.createStockMovement(req.body, userId);
            res.status(201).json({ success: true, code: 201, message: 'Stock movement created successfully', data: movement });
        } catch (error: any) {
            const status = error.message.includes('Insufficient stock') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }
}
