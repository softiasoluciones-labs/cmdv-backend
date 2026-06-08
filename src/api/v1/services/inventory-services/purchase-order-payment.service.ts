import { PurchaseOrderPaymentRepository, CreatePaymentData, CreatePaymentDetailData } from '../../repositories/inventory-repositories/purchase-order-payment.repository';
import { PurchaseOrderRepository } from '../../repositories/inventory-repositories/purchase-order.repository';
import { PaymentResponse, PaymentSummary, CreatePaymentRequest } from '../../dtos/inventory-dtos/purchase-order-payment.dto';
import { PaymentMethod } from '../../../../database/inventory/purchase_order_payments';
import { models, sequelize } from '../../../../database';
import { UserRepository } from '../../repositories/core-repositories/user.repository';

const PO_NOTIFICATION_TEMPLATE = 'purchase_order_completed';

export class PurchaseOrderPaymentService {
  private static toPaymentResponse(payment: any): PaymentResponse {
    return {
      id: payment.id,
      purchaseOrderId: payment.purchase_order_id,
      paymentNumber: payment.payment_number,
      paymentDate: payment.payment_date,
      amount: parseFloat(payment.amount.toString()),
      paymentMethod: payment.payment_method,
      bank: payment.bank,
      referenceNumber: payment.reference_number,
      authorizationCode: payment.authorization_code,
      documentType: payment.document_type,
      documentNumber: payment.document_number,
      notes: payment.notes,
      createdAt: payment.created_at?.toISOString(),
      createdBy: payment.created_by,
      paymentDetails: payment.purchase_order_payment_details?.map((d: any) => ({
        id: d.id,
        paymentMethod: d.payment_method,
        amount: parseFloat(d.amount.toString()),
        bank: d.bank,
        referenceNumber: d.reference_number,
        authorizationCode: d.authorization_code
      }))
    };
  }

  private static async hasAllStatusesInHistory(
    purchaseOrderId: string,
    statuses: string[],
    transaction?: any
  ): Promise<boolean> {
    const history = await models.purchase_order_status_history.findAll({
      where: { purchase_order_id: purchaseOrderId },
      ...(transaction ? { transaction } : {})
    });
    const uniqueStatuses = new Set(history.map((h: any) => h.status));
    return statuses.every(s => uniqueStatuses.has(s));
  }

  private static async findAdminAndWarehouseManagers(): Promise<any[]> {
    const admins = await UserRepository.findByRole('admin');
    const warehouseManagers = await UserRepository.findByRole('warehouse_manager');
    return [...admins, ...warehouseManagers];
  }

  private static async createStatusHistoryEntry(
    purchaseOrderId: string,
    status: string,
    changedBy: string,
    transaction?: any
  ): Promise<void> {
    await models.purchase_order_status_history.create(
      {
        purchase_order_id: purchaseOrderId,
        status: status as any,
        changed_by: changedBy,
        changed_at: new Date()
      },
      transaction ? { transaction } : undefined
    );
  }

  private static async closePurchaseOrder(
    purchaseOrderId: string,
    order: any,
    userId: string,
    transaction: any
  ): Promise<void> {
    const updated = await PurchaseOrderRepository.updateStatus(purchaseOrderId, 'closed', userId, transaction);
    if (!updated) {
      throw new Error('Failed to close purchase order');
    }

    await this.createStatusHistoryEntry(
      purchaseOrderId,
      'closed',
      userId,
      transaction
    );

    const adminUsers = await this.findAdminAndWarehouseManagers();
    for (const admin of adminUsers) {
      await models.notifications.create(
        {
          notification_type: 'email',
          template_code: PO_NOTIFICATION_TEMPLATE,
          recipient_user_id: admin.id,
          recipient_email: admin.email,
          body: `Notificacion de orden de compra ${order.po_number} completada`,
          priority: 'normal',
          metadata: {
            purchase_order_id: purchaseOrderId,
            po_number: order.po_number,
            supplier_id: order.supplier_id
          }
        },
        { transaction }
      );
    }
  }

  static async getPaymentsByPurchaseOrderId(purchaseOrderId: string): Promise<PaymentResponse[]> {
    const payments = await PurchaseOrderPaymentRepository.findByPurchaseOrderId(purchaseOrderId);
    return payments.map(p => this.toPaymentResponse(p));
  }

  static async getPaymentSummary(purchaseOrderId: string): Promise<PaymentSummary> {
    const order = await PurchaseOrderRepository.findById(purchaseOrderId);
    const totalAmount = parseFloat(order.total.toString());
    const totalPaid = await PurchaseOrderPaymentRepository.getTotalPaidForOrder(purchaseOrderId);
    const payments = await PurchaseOrderPaymentRepository.findByPurchaseOrderId(purchaseOrderId);

    return {
      totalPaid,
      totalAmount,
      pendingAmount: Math.max(0, totalAmount - totalPaid),
      paymentCount: payments.length,
      payments: payments.map(p => this.toPaymentResponse(p))
    };
  }

  static async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const payment = await PurchaseOrderPaymentRepository.findById(paymentId);
    return this.toPaymentResponse(payment);
  }

  static async createPayment(
    purchaseOrderId: string,
    userId: string,
    data: CreatePaymentRequest
  ): Promise<PaymentResponse> {
    const order = await PurchaseOrderRepository.findById(purchaseOrderId);

    if (!['approved', 'received'].includes(order.status || '')) {
      throw new Error(`Cannot add payment to order with status '${order.status}'. Order must be approved or received.`);
    }

    if (order.status === 'cancelled') {
      throw new Error('Cannot add payment to a cancelled order');
    }

    const totalAmount = parseFloat(order.total.toString());
    const totalPaid = await PurchaseOrderPaymentRepository.getTotalPaidForOrder(purchaseOrderId);
    const pendingAmount = totalAmount - totalPaid;

    if (data.amount > pendingAmount) {
      throw new Error(`Payment amount (${data.amount}) exceeds pending amount (${pendingAmount.toFixed(2)})`);
    }

    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    const paymentNumber = await PurchaseOrderPaymentRepository.getNextPaymentNumber(purchaseOrderId);

    const paymentData: CreatePaymentData = {
      purchase_order_id: purchaseOrderId,
      payment_number: paymentNumber,
      payment_date: data.paymentDate,
      amount: data.amount,
      payment_method: data.paymentMethod,
      ...(data.bank !== undefined && { bank: data.bank }),
      ...(data.referenceNumber !== undefined && { reference_number: data.referenceNumber }),
      ...(data.authorizationCode !== undefined && { authorization_code: data.authorizationCode }),
      ...(data.documentType !== undefined && { document_type: data.documentType }),
      ...(data.documentNumber !== undefined && { document_number: data.documentNumber }),
      ...(data.notes !== undefined && { notes: data.notes }),
      created_by: userId
    };

    let details: CreatePaymentDetailData[] | undefined;
    if (data.isMixed && data.paymentDetails && data.paymentDetails.length > 0) {
      const detailsTotal = data.paymentDetails.reduce((sum, d) => sum + d.amount, 0);
      if (Math.abs(detailsTotal - data.amount) > 0.01) {
        throw new Error('Payment details total does not match payment amount');
      }
      details = data.paymentDetails.map(d => ({
        payment_method: d.paymentMethod,
        amount: d.amount,
        ...(d.bank !== undefined && { bank: d.bank }),
        ...(d.referenceNumber !== undefined && { reference_number: d.referenceNumber }),
        ...(d.authorizationCode !== undefined && { authorization_code: d.authorizationCode })
      }));
    }

    const t = await sequelize.transaction();
    try {
      const payment = await PurchaseOrderPaymentRepository.create(paymentData, details, t);

      const newTotalPaid = totalPaid + data.amount;
      const isFullyPaid = newTotalPaid >= totalAmount;

      if (isFullyPaid) {
        await this.createStatusHistoryEntry(
          purchaseOrderId,
          'paid',
          userId,
          t
        );

        const hasAllStatuses = await this.hasAllStatusesInHistory(
          purchaseOrderId,
          ['approved', 'received', 'paid'],
          t
        );
        if (hasAllStatuses) {
          await this.closePurchaseOrder(purchaseOrderId, order, userId, t);
        }
      }

      await t.commit();
      return this.toPaymentResponse(payment);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async deletePayment(paymentId: string, userId: string): Promise<void> {
    const payment = await PurchaseOrderPaymentRepository.findById(paymentId);
    const order = await PurchaseOrderRepository.findById(payment.purchase_order_id);

    if (order.status === 'cancelled') {
      throw new Error('Cannot delete payment from a cancelled order');
    }

    if (payment.created_by !== userId) {
      throw new Error('Only the user who created the payment can delete it');
    }

    await PurchaseOrderPaymentRepository.delete(paymentId);
  }
}
