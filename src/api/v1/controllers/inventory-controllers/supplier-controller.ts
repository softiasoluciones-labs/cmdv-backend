import { Request, Response } from 'express';
import { SupplierService } from '../../services/inventory-services/supplier.service';

export class SupplierController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const activeOnly = req.query.activeOnly !== 'false';
            const suppliers = await SupplierService.getAllSuppliers(activeOnly);
            res.status(200).json({ success: true, code: 200, message: 'Suppliers retrieved successfully', data: suppliers });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            const supplier = await SupplierService.getSupplierById(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Supplier retrieved successfully', data: supplier });
        } catch (error: any) {
            const status = error.message === 'Supplier not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const supplier = await SupplierService.createSupplier(req.body);
            res.status(201).json({ success: true, code: 201, message: 'Supplier created successfully', data: supplier });
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
            const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
            res.status(200).json({ success: true, code: 200, message: 'Supplier updated successfully', data: supplier });
        } catch (error: any) {
            const status = error.message === 'Supplier not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Supplier ID is required');
            }
            await SupplierService.deleteSupplier(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Supplier deleted successfully', data: null });
        } catch (error: any) {
            const status = error.message === 'Supplier not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }
}
