import { models, sequelize } from '../../../../database';
import { purchase_order_payments, purchase_order_paymentsAttributes, purchase_order_paymentsCreationAttributes } from '../../../../database/inventory/purchase_order_payments';
import { purchase_order_payment_details, purchase_order_payment_detailsCreationAttributes } from '../../../../database/inventory/purchase_order_payment_details';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Transaction } from 'sequelize';

export interface CreatePaymentData {
  purchase_order_id: string;
  payment_number: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  bank?: string | null;
  reference_number?: string | null;
  authorization_code?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface CreatePaymentDetailData {
  payment_method: string;
  amount: number;
  bank?: string | null;
  reference_number?: string | null;
  authorization_code?: string | null;
}

export class PurchaseOrderPaymentRepository {
  static async findByPurchaseOrderId(purchaseOrderId: string): Promise<purchase_order_payments[]> {
    try {
      const payments = await models.purchase_order_payments.findAll({
        where: { purchase_order_id: purchaseOrderId },
        include: [{
          model: models.purchase_order_payment_details,
          as: 'purchase_order_payment_details',
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        }],
        order: [['payment_number', 'ASC'], ['created_at', 'ASC']]
      });
      return payments;
    } catch (error) {
      secureLogger.error('Error finding payments by purchase order:', error);
      throw new Error('Failed to retrieve payments');
    }
  }

  static async findById(id: string): Promise<purchase_order_payments> {
    try {
      const payment = await models.purchase_order_payments.findByPk(id, {
        include: [{
          model: models.purchase_order_payment_details,
          as: 'purchase_order_payment_details'
        }]
      });
      if (!payment) {
        throw new Error('Payment not found');
      }
      return payment;
    } catch (error) {
      secureLogger.error('Error finding payment by ID:', error);
      throw new Error('Error finding payment by ID');
    }
  }

  static async getTotalPaidForOrder(purchaseOrderId: string): Promise<number> {
    try {
      const result = await models.purchase_order_payments.sum('amount', {
        where: { purchase_order_id: purchaseOrderId }
      });
      return result || 0;
    } catch (error) {
      secureLogger.error('Error calculating total paid:', error);
      throw new Error('Failed to calculate total paid');
    }
  }

  static async getNextPaymentNumber(purchaseOrderId: string): Promise<number> {
    try {
      const maxPayment = await models.purchase_order_payments.max('payment_number', {
        where: { purchase_order_id: purchaseOrderId }
      });
      return (typeof maxPayment === 'number' ? maxPayment : 0) + 1;
    } catch (error) {
      secureLogger.error('Error getting next payment number:', error);
      return 1;
    }
  }

  static async create(
    paymentData: CreatePaymentData,
    details?: CreatePaymentDetailData[],
    transaction?: Transaction
  ): Promise<purchase_order_payments> {
    const t = transaction || await sequelize.transaction();
    let payment: purchase_order_payments | null = null;

    try {
      payment = await models.purchase_order_payments.create(
        paymentData as purchase_order_paymentsCreationAttributes,
        { transaction: t }
      );

      if (details && details.length > 0) {
        for (const detail of details) {
          await models.purchase_order_payment_details.create(
            {
              payment_id: payment.id,
              ...detail
            } as purchase_order_payment_detailsCreationAttributes,
            { transaction: t }
          );
        }
      }

      if (!transaction) {
        await t.commit();
      }

      try {
        const paymentWithDetails = await models.purchase_order_payments.findByPk(payment.id, {
          include: [{
            model: models.purchase_order_payment_details,
            as: 'purchase_order_payment_details'
          }]
        });
        return paymentWithDetails || payment;
      } catch {
        return payment;
      }
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      secureLogger.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  static async delete(id: string, transaction?: Transaction): Promise<boolean> {
    const t = transaction || await sequelize.transaction();

    try {
      const payment = await models.purchase_order_payments.findByPk(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      await models.purchase_order_payment_details.destroy({
        where: { payment_id: id },
        transaction: t
      });

      await payment.destroy({ transaction: t });

      if (!transaction) {
        await t.commit();
      }

      return true;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      secureLogger.error('Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }

  static async findAll(filters: {
    purchaseOrderId?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: purchase_order_payments[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (filters.purchaseOrderId) {
        where.purchase_order_id = filters.purchaseOrderId;
      }
      if (filters.paymentMethod) {
        where.payment_method = filters.paymentMethod;
      }
      if (filters.dateFrom || filters.dateTo) {
        where.payment_date = {};
        if (filters.dateFrom) {
          (where.payment_date as Record<string, unknown>)[`${filters.dateFrom}`] = { gte: filters.dateFrom };
        }
        if (filters.dateTo) {
          (where.payment_date as Record<string, unknown>)[`${filters.dateTo}`] = { lte: filters.dateTo };
        }
      }

      const { rows, count } = await models.purchase_order_payments.findAndCountAll({
        where,
        include: [{
          model: models.purchase_order_payment_details,
          as: 'purchase_order_payment_details'
        }],
        limit,
        offset,
        order: [['payment_date', 'DESC'], ['payment_number', 'ASC']]
      });

      return { payments: rows, total: count };
    } catch (error) {
      secureLogger.error('Error finding payments:', error);
      throw new Error('Failed to retrieve payments');
    }
  }
}