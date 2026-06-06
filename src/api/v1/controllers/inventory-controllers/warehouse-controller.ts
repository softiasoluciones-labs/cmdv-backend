import { Request, Response } from 'express';
import { WarehouseService } from '../../services/inventory-services/warehouse-service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class WarehouseController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const warehouses = await WarehouseService.getAllWarehouses();
            successResponse(res, 200, 'Warehouses retrieved successfully', warehouses);
        } catch (error: any) {
            errorResponse(res, 500, error.message);
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            const warehouse = await WarehouseService.getWarehouseById(req.params.id);
            successResponse(res, 200, 'Warehouse retrieved successfully', warehouse);
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const warehouse = await WarehouseService.createWarehouse(req.body);
            successResponse(res, 201, 'Warehouse created successfully', warehouse);
        } catch (error: any) {
            const status = error.message.includes('exists') ? 409 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            const warehouse = await WarehouseService.updateWarehouse(req.params.id, req.body);
            successResponse(res, 200, 'Warehouse updated successfully', warehouse);
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            await WarehouseService.deleteWarehouse(req.params.id);
            successResponse(res, 200, 'Warehouse deleted successfully', null);
        } catch (error: any) {
            const status = error.message === 'Warehouse not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async getStockStatus(req: Request, res: Response): Promise<void> {
        try {
            const warehouseId = req.params.id;
            const stockStatus = await WarehouseService.getStockStatus(warehouseId);
            successResponse(res, 200, 'Stock status retrieved successfully', stockStatus);
        } catch (error: any) {
            errorResponse(res, 500, error.message);
        }
    }
}
