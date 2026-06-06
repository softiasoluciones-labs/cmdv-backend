import { Request, Response } from 'express';
import { PurchaseOrderPaymentService } from '../../services/inventory-services/purchase-order-payment.service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class PurchaseOrderPaymentController {
  static async getPaymentsByPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      if (!orderId) {
        errorResponse(res, 400, 'Order ID is required');
        return;
      }
      const payments = await PurchaseOrderPaymentService.getPaymentsByPurchaseOrderId(orderId);
      successResponse(res, 200, 'Payments retrieved successfully', payments);
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  }

  static async getPaymentSummary(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      if (!orderId) {
        errorResponse(res, 400, 'Order ID is required');
        return;
      }
      const summary = await PurchaseOrderPaymentService.getPaymentSummary(orderId);
      successResponse(res, 200, 'Payment summary retrieved successfully', summary);
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  }

  static async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      const paymentId = req.params.paymentId;
      if (!orderId || !paymentId) {
        errorResponse(res, 400, 'Order ID and Payment ID are required');
        return;
      }
      const payment = await PurchaseOrderPaymentService.getPaymentById(paymentId);
      if (payment.purchaseOrderId !== orderId) {
        errorResponse(res, 404, 'Payment not found for this order');
        return;
      }
      successResponse(res, 200, 'Payment retrieved successfully', payment);
    } catch (error: any) {
      const status = error.message === 'Payment not found' ? 404 : 500;
      errorResponse(res, status, error.message);
    }
  }

  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      if (!orderId) {
        errorResponse(res, 400, 'Order ID is required');
        return;
      }
      const userId = req.user?.userId;
      if (!userId) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const payment = await PurchaseOrderPaymentService.createPayment(orderId, userId, req.body);
      successResponse(res, 201, 'Payment created successfully', payment);
    } catch (error: any) {
      const status = error.message.includes('exceeds') || error.message.includes('must be')
        ? 400
        : error.message.includes('Cannot') || error.message.includes('status')
          ? 400
          : 500;
      errorResponse(res, status, error.message);
    }
  }

  static async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      const paymentId = req.params.paymentId;
      if (!orderId || !paymentId) {
        errorResponse(res, 400, 'Order ID and Payment ID are required');
        return;
      }
      const userId = req.user?.userId;
      if (!userId) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }

      const payment = await PurchaseOrderPaymentService.getPaymentById(paymentId);
      if (payment.purchaseOrderId !== orderId) {
        errorResponse(res, 404, 'Payment not found for this order');
        return;
      }

      await PurchaseOrderPaymentService.deletePayment(paymentId, userId);
      successResponse(res, 200, 'Payment deleted successfully', null);
    } catch (error: any) {
      const status = error.message.includes('Only') || error.message.includes('Cannot')
        ? 403
        : error.message === 'Payment not found'
          ? 404
          : 500;
      errorResponse(res, status, error.message);
    }
  }
}