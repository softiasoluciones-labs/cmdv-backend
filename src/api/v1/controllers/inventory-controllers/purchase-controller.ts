import { Request, Response } from 'express';
import { PurchaseOrderService } from '../../services/inventory-services/purchase-order.service';

export class PurchaseController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const status = req.query.status as string | undefined;
            const result = await PurchaseOrderService.getAllPurchaseOrders(page, limit, status);
            res.status(200).json({ success: true, code: 200, message: 'Purchase orders retrieved successfully', data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Purchase order ID is required');
            }

            const order = await PurchaseOrderService.getPurchaseOrderById(req.params.id);
            res.status(200).json({ success: true, code: 200, message: 'Purchase order retrieved successfully', data: order });
        } catch (error: any) {
            const status = error.message === 'Purchase order not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }


    static async getByPoNumber(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.poNumber) {
                throw new Error('Purchase order number is required');
            }

            const order = await PurchaseOrderService.getPurchaseOrderByPoNumber(req.params.poNumber);
            res.status(200).json({ success: true, code: 200, message: 'Purchase order retrieved successfully', data: order });
        } catch (error: any) {
            const status = error.message === 'Purchase order not found' ? 404 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const order = await PurchaseOrderService.createPurchaseOrder(req.body, userId);
            res.status(201).json({ success: true, code: 201, message: 'Purchase order created successfully', data: order });
        } catch (error: any) {
            res.status(500).json({ success: false, code: 500, message: error.message, data: null });
        }
    }

    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Purchase order ID is required');
            }

            const userId = (req as any).user?.userId;
            const { status } = req.body;

            if (!status) {
                throw new Error('Status is required');
            }

            const order = await PurchaseOrderService.updatePurchaseOrderStatus(req.params.id, status, userId);
            res.status(200).json({ success: true, code: 200, message: 'Purchase order status updated successfully', data: order });
        } catch (error: any) {
            const status = error.message === 'Purchase order not found' ? 404 :
                error.message.includes('Invalid status') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }

    static async receive(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Purchase order ID is required');
            }

            const userId = (req as any).user?.userId;
            const order = await PurchaseOrderService.receivePurchaseOrder(req.params.id, req.body, userId);
            res.status(200).json({ success: true, code: 200, message: 'Purchase order received successfully', data: order });
        } catch (error: any) {
            const status = error.message === 'Purchase order not found' ? 404 :
                error.message.includes('Cannot receive') ? 400 : 500;
            res.status(status).json({ success: false, code: status, message: error.message, data: null });
        }
    }
}
