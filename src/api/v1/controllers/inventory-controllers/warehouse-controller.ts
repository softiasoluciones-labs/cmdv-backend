import { Request, Response } from 'express';
import { WarehouseService } from '../../services/inventory-services/warehouse-service';

export class WarehouseController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await WarehouseService.getAllWarehouses();
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Warehouses retrieved successfully',
                data: warehouses,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            const warehouse = await WarehouseService.getWarehouseById(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Warehouse retrieved successfully', data: warehouse });
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const warehouse = await WarehouseService.createWarehouse(req.body);
            res.status(201).json({ success: true, code: 201, message: 'Warehouse created successfully', data: warehouse });
        } catch (error: any) {
            const status = error.message.includes('exists') ? 409 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            const warehouse = await WarehouseService.updateWarehouse(req.params.id, req.body);
            res.status(200).json({ success: true, code: 200, message: 'Warehouse updated successfully', data: warehouse });
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            await WarehouseService.deleteWarehouse(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Warehouse deleted successfully', data: null });
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async getStockStatus(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = req.params.id;
            const stockStatus = await WarehouseService.getStockStatus(warehouseId);
            res.status(200).json({ success: true, code: 200, message: 'Stock status retrieved successfully', data: stockStatus });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }
}
