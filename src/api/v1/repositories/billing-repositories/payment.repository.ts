import { Transaction, Op } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { RecordPaymentRequest } from '../../dtos/billing-dtos/billing.dto';
import { InvoiceRepository } from './invoice.repository';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class PaymentRepository {
  private invoiceRepo = new InvoiceRepository();

  async recordPayment(invoiceId: string, data: RecordPaymentRequest, receivedBy?: string) {
    return sequelize.transaction(async (t) => {
      const invoice = await models.invoices.findByPk(invoiceId, txOpt(t));
      if (!invoice) throw new Error('Invoice not found');
      if (!['confirmed', 'partially_paid'].includes(invoice.status)) {
        throw new Error(`Cannot record payment on invoice with status: ${invoice.status}`);
      }

      const amount = Number(data.amount);
      if (amount <= 0) throw new Error('Payment amount must be greater than zero');
      if (amount > Number(invoice.amount_pending)) {
        throw new Error(`Payment amount (${amount}) exceeds pending balance (${invoice.amount_pending})`);
      }

      // Validate session if cash payment
      if (data.payment_method === 'cash' && data.cash_session_id) {
        const session = await models.cash_sessions.findByPk(data.cash_session_id, txOpt(t));
        if (!session || session.status !== 'open') throw new Error('No active cash session found');
      }

      const paymentNumber = await this.generatePaymentNumber(t);

      const payment = await models.payments.create({
        payment_number: paymentNumber,
        invoice_id: invoiceId,
        payment_method: data.payment_method,
        amount,
        ...(data.cash_session_id && { cash_session_id: data.cash_session_id }),
        ...(data.reference_number && { reference_number: data.reference_number }),
        ...(data.card_brand && { card_brand: data.card_brand }),
        ...(data.card_last_four && { card_last_four: data.card_last_four }),
        ...(data.bank_name && { bank_name: data.bank_name }),
        ...(data.notes && { notes: data.notes }),
        ...(receivedBy && { received_by: receivedBy }),
        payment_date: new Date(),
        status: 'confirmed'
      }, txOpt(t));

      // Update cash session total_collected
      if (data.cash_session_id && data.payment_method === 'cash') {
        await sequelize.query(
          `UPDATE billing.cash_sessions SET total_collected = total_collected + :amount WHERE id = :id`,
          { replacements: { amount, id: data.cash_session_id }, transaction: t }
        );
      }

      // Recalculate invoice payment status (may close the case file if fully paid)
      await this.invoiceRepo.updatePaymentStatus(invoiceId, t);

      return payment;
    });
  }

  async voidPayment(paymentId: string, reason: string, voidedBy: string) {
    return sequelize.transaction(async (t) => {
      const payment = await models.payments.findByPk(paymentId, txOpt(t));
      if (!payment) throw new Error('Payment not found');
      if (payment.status === 'voided') throw new Error('Payment is already voided');

      const invoice = await models.invoices.findByPk(payment.invoice_id, txOpt(t));
      if (invoice?.status === 'paid') throw new Error('Cannot void a payment from a fully paid invoice');

      await payment.update({ status: 'voided', voided_at: new Date(), voided_by: voidedBy, void_reason: reason }, txOpt(t));

      // Restore cash session total if applicable
      if (payment.cash_session_id && payment.payment_method === 'cash') {
        await sequelize.query(
          `UPDATE billing.cash_sessions SET total_collected = total_collected - :amount WHERE id = :id`,
          { replacements: { amount: payment.amount, id: payment.cash_session_id }, transaction: t }
        );
      }

      await this.invoiceRepo.updatePaymentStatus(payment.invoice_id, t);

      return payment;
    });
  }

  async findByInvoice(invoiceId: string) {
    return models.payments.findAll({
      where: { invoice_id: invoiceId },
      order: [['payment_date', 'DESC']]
    });
  }

  private async generatePaymentNumber(t: Transaction): Promise<string> {
    const today = new Date();
    const prefix = `PAY-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const last = await models.payments.findOne({
      where: { payment_number: { [Op.like]: `${prefix}%` } },
      order: [['payment_number', 'DESC']],
      transaction: t
    });
    const seq = last ? parseInt(last.payment_number.split('-').pop() ?? '0') + 1 : 1;
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }
}
