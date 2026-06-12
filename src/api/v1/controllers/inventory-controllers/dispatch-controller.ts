import { Request, Response } from 'express';
import { DispatchService } from '../../services/inventory-services/dispatch.service';
import { DispatchFilters } from '../../dtos/inventory-dtos/dispatch-dto';

export class DispatchController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: DispatchFilters = {
                sourceWarehouseId: req.query.sourceWarehouseId as string,
                destinationWarehouseId: req.query.destinationWarehouseId as string,
                status: req.query.status as any,
                dateFrom: req.query.dateFrom as string,
                dateTo: req.query.dateTo as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            const result = await DispatchService.getAllDispatches(filters);
            res.status(200).json({ success: true, code: 200, message: 'Dispatches retrieved successfully', data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Dispatch ID is required');
            }
            const dispatch = await DispatchService.getDispatchById(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch retrieved successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message === 'Dispatch not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const dispatch = await DispatchService.createDispatch(req.body, userId);
            res.status(201).json({ success: true, code: 201, message: 'Dispatch created successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message.includes('Source and destination') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async approve(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!req.params.id) throw new Error('Dispatch ID is required');
            const dispatch = await DispatchService.approveDispatch(req.params.id, userId);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch approved successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message.includes('Cannot approve') || error.message.includes('Insufficient stock') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async dispatch(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const notes = req.body.notes;
            if (!req.params.id) throw new Error('Dispatch ID is required');
            const dispatch = await DispatchService.dispatchDispatch(req.params.id, userId, notes);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch executed successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message.includes('Cannot dispatch') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async complete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) throw new Error('Dispatch ID is required');
            const dispatch = await DispatchService.completeDispatch(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch completed successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message.includes('Cannot complete') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async cancel(req: Request, res: Response): Promise<void> {
        try {
            const notes = req.body.notes;
            if (!req.params.id) throw new Error('Dispatch ID is required');
            const dispatch = await DispatchService.cancelDispatch(req.params.id, notes);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch cancelled successfully', data: dispatch });
        } catch (error: any) {
            const status = error.message.includes('Cannot cancel') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) throw new Error('Dispatch ID is required');
            await DispatchService.deleteDispatch(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Dispatch deleted successfully', data: null });
        } catch (error: any) {
            const status = error.message.includes('Cannot delete') || error.message.includes('not found') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }
}