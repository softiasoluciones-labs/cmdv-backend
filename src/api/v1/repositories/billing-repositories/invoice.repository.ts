import { Transaction, Op } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { CaseStatusFlow } from '../../dtos/medical-dtos/case-file.dto';
import { ApplyDiscountRequest } from '../../dtos/billing-dtos/billing.dto';

const IVA_RATE = 0.12;

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class InvoiceRepository {

  async findById(id: string) {
    return models.invoices.findByPk(id, {
      include: [
        { model: models.case_files, as: 'case_file', attributes: ['id', 'case_number', 'current_status_flow'] },
        { model: models.patients, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
        { model: models.invoice_items, as: 'invoice_items', order: [['sort_order', 'ASC']] as any },
        {
          model: models.invoice_discounts, as: 'invoice_discounts',
          include: [{ model: models.discount_catalog, as: 'discount_catalog_item', attributes: ['requires_approval'] }]
        },
        { model: models.payments, as: 'payments', where: { status: 'confirmed' }, required: false },
        { model: models.tax_invoices, as: 'tax_invoice', required: false }
      ]
    });
  }

  async findByCaseFile(caseFileId: string) {
    return models.invoices.findOne({
      where: { case_file_id: caseFileId },
      include: [
        { model: models.patients, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
        { model: models.invoice_items, as: 'invoice_items', order: [['sort_order', 'ASC']] as any },
        {
          model: models.invoice_discounts, as: 'invoice_discounts',
          include: [{ model: models.discount_catalog, as: 'discount_catalog_item', attributes: ['requires_approval'] }]
        },
        { model: models.payments, as: 'payments', where: { status: 'confirmed' }, required: false },
        { model: models.tax_invoices, as: 'tax_invoice', required: false }
      ]
    });
  }

  async generateFromCaseFile(caseFileId: string, createdBy?: string, opts?: { requires_tax_invoice?: boolean; due_date?: string; notes?: string }) {
    return sequelize.transaction(async (t) => {
      // Prevent duplicate invoices
      const existing = await models.invoices.findOne({ where: { case_file_id: caseFileId }, transaction: t });
      if (existing) throw new Error('An invoice already exists for this case file');

      const caseFile = await models.case_files.findByPk(caseFileId, { transaction: t });
      if (!caseFile) throw new Error('Case file not found');

      // Read all charge sources
      const [packages, rooms, services, products] = await Promise.all([
        models.case_package_assignments.findAll({
          where: { case_file_id: caseFileId, is_voided: false },
          include: [{ model: models.packages, as: 'package', attributes: ['name'] }],
          transaction: t
        }),
        models.case_rooms.findAll({
          where: { case_file_id: caseFileId, is_voided: false },
          include: [{ model: models.rooms, as: 'room', attributes: ['room_number', 'room_type'] }],
          transaction: t
        }),
        models.case_services.findAll({
          where: { case_file_id: caseFileId, is_voided: false },
          include: [{ model: models.services, as: 'service', attributes: ['name'] }],
          transaction: t
        }),
        models.case_products.findAll({
          where: { case_file_id: caseFileId, is_voided: false },
          include: [{ model: models.products, as: 'product', attributes: ['name', 'unit_of_measure'] }],
          transaction: t
        })
      ]);

      const invoiceNumber = await this.generateInvoiceNumber(t);

      const invoice = await models.invoices.create({
        invoice_number: invoiceNumber,
        case_file_id: caseFileId,
        patient_id: caseFile.patient_id,
        requires_tax_invoice: opts?.requires_tax_invoice ?? false,
        ...(opts?.due_date && { due_date: opts.due_date }),
        ...(opts?.notes && { notes: opts.notes }),
        ...(createdBy && { created_by: createdBy })
      }, txOpt(t));

      const now = new Date();
      let sortOrder = 0;
      const itemsToCreate: any[] = [];

      // 1. Paquetes
      for (const pa of packages) {
        const total = Number(pa.price_applied);
        itemsToCreate.push({
          invoice_id: invoice.id,
          item_type: 'package',
          reference_id: pa.id,
          description: (pa as any).package?.name ?? 'Paquete',
          quantity: 1,
          unit_price: total,
          subtotal: total,
          discount_amount: 0,
          total,
          is_iva_exempt: true,
          sort_order: sortOrder++
        });
      }

      // 2. Habitaciones (calcula días)
      for (const cr of rooms) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.max(1, Math.ceil(((cr.check_out ?? now).getTime() - cr.check_in.getTime()) / msPerDay));
        const rate = Number(cr.daily_rate ?? 0);
        const subtotal = rate * days;
        itemsToCreate.push({
          invoice_id: invoice.id,
          item_type: 'room',
          reference_id: cr.id,
          description: (cr as any).room ? `Habitación ${(cr as any).room.room_number} (${(cr as any).room.room_type})` : 'Habitación',
          quantity: days,
          unit_price: rate,
          subtotal,
          discount_amount: 0,
          total: subtotal,
          is_iva_exempt: true,
          sort_order: sortOrder++
        });
      }

      // 3. Servicios
      for (const cs of services) {
        const total = Number(cs.total_price);
        itemsToCreate.push({
          invoice_id: invoice.id,
          item_type: 'service',
          reference_id: cs.id,
          description: (cs as any).service?.name ?? 'Servicio',
          quantity: cs.quantity ?? 1,
          unit_price: Number(cs.unit_price),
          subtotal: total,
          discount_amount: 0,
          total,
          is_iva_exempt: true,
          sort_order: sortOrder++
        });
      }

      // 4. Insumos/Medicamentos
      for (const cp of products) {
        const total = Number(cp.total_price);
        const prod = (cp as any).product;
        itemsToCreate.push({
          invoice_id: invoice.id,
          item_type: 'product',
          reference_id: cp.id,
          description: prod ? `${prod.name} (${prod.unit_of_measure})` : 'Insumo',
          quantity: cp.quantity,
          unit_price: Number(cp.unit_price),
          subtotal: total,
          discount_amount: 0,
          total,
          is_iva_exempt: true,
          sort_order: sortOrder++
        });
      }

      await models.invoice_items.bulkCreate(itemsToCreate, txOpt(t));

      // Recalculate totals
      await this.recalculateTotals(invoice.id, t);

      // Advance case file status to CE_CARGOS_EXPEDIENTE
      await models.case_files.update(
        { current_status_flow: CaseStatusFlow.CE_CARGOS_EXPEDIENTE },
        { where: { id: caseFileId }, transaction: t }
      );

      return invoice;
    });
  }

  async applyDiscount(invoiceId: string, data: ApplyDiscountRequest, appliedBy: string) {
    return sequelize.transaction(async (t) => {
      const invoice = await models.invoices.findByPk(invoiceId, txOpt(t));
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'draft') throw new Error('Discounts can only be applied to draft invoices');

      let requiresApproval = false;
      let description = data.description;

      if (data.discount_id) {
        const catalogItem = await models.discount_catalog.findByPk(data.discount_id, txOpt(t));
        if (!catalogItem) throw new Error('Discount not found in catalog');
        if (!catalogItem.is_active) throw new Error('Discount is not active');
        requiresApproval = catalogItem.requires_approval;
        description = catalogItem.name;
      }

      const base = Number(invoice.subtotal);
      let calculated = data.discount_type === 'percentage'
        ? (base * Number(data.value)) / 100
        : Number(data.value);

      // Apply max_amount cap if from catalog
      if (data.discount_id) {
        const catalogItem = await models.discount_catalog.findByPk(data.discount_id, txOpt(t));
        if (catalogItem?.max_amount && calculated > Number(catalogItem.max_amount)) {
          calculated = Number(catalogItem.max_amount);
        }
      }

      const discount = await models.invoice_discounts.create({
        invoice_id: invoiceId,
        ...(data.discount_id && { discount_id: data.discount_id }),
        description,
        discount_type: data.discount_type,
        value: data.value,
        calculated_amount: calculated,
        applied_by: appliedBy,
        ...(data.reason && { reason: data.reason })
      }, txOpt(t));

      // Only apply to totals if does not require approval (auto-approved)
      if (!requiresApproval) {
        await this.recalculateTotals(invoiceId, t);
      }

      return { discount, requires_approval: requiresApproval };
    });
  }

  async approveDiscount(discountId: string, approvedBy: string) {
    return sequelize.transaction(async (t) => {
      const discount = await models.invoice_discounts.findByPk(discountId, txOpt(t));
      if (!discount) throw new Error('Discount not found');
      if (discount.approved_by) throw new Error('Discount is already approved');

      const invoice = await models.invoices.findByPk(discount.invoice_id, txOpt(t));
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'draft') throw new Error('Cannot approve discount on a non-draft invoice');

      await discount.update({ approved_by: approvedBy, approved_at: new Date() }, txOpt(t));
      await this.recalculateTotals(discount.invoice_id, t);

      return discount;
    });
  }

  async removeDiscount(discountId: string) {
    return sequelize.transaction(async (t) => {
      const discount = await models.invoice_discounts.findByPk(discountId, txOpt(t));
      if (!discount) throw new Error('Discount not found');
      if (discount.approved_by) throw new Error('Cannot remove an already approved discount');

      const invoiceId = discount.invoice_id;
      await discount.destroy(txOpt(t));
      await this.recalculateTotals(invoiceId, t);
    });
  }

  async confirmInvoice(invoiceId: string) {
    return sequelize.transaction(async (t) => {
      const invoice = await models.invoices.findByPk(invoiceId, txOpt(t));
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'draft') throw new Error(`Invoice cannot be confirmed from status: ${invoice.status}`);

      // Check no pending unapproved discounts that require approval
      const pendingDiscounts = await models.invoice_discounts.findAll({
        where: sequelize.literal(`invoice_id = '${invoiceId}' AND approved_by IS NULL`) as any,
        include: [{ model: models.discount_catalog, as: 'discount_catalog_item', attributes: ['requires_approval'] }],
        transaction: t
      });

      const unapproved = pendingDiscounts.filter(
        (d) => (d as any).discount_catalog_item?.requires_approval && !d.approved_by
      );
      if (unapproved.length > 0) {
        throw new Error(`There are ${unapproved.length} discount(s) pending admin approval before confirming`);
      }

      await invoice.update({ status: 'confirmed', confirmed_at: new Date() }, txOpt(t));

      // Advance case file to CC_CONFIRMACION_CARGOS
      await models.case_files.update(
        { current_status_flow: CaseStatusFlow.CC_CONFIRMACION_CARGOS },
        { where: { id: invoice.case_file_id }, transaction: t }
      );

      return invoice;
    });
  }

  async voidInvoice(invoiceId: string, reason: string) {
    return sequelize.transaction(async (t) => {
      const invoice = await models.invoices.findByPk(invoiceId, txOpt(t));
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status === 'paid') throw new Error('Cannot void a paid invoice');
      if (invoice.status === 'voided') throw new Error('Invoice is already voided');

      await invoice.update({ status: 'voided', notes: `VOIDED: ${reason}` }, txOpt(t));
      return invoice;
    });
  }

  // Called after payments to check if invoice is fully paid
  async updatePaymentStatus(invoiceId: string, t: Transaction) {
    const [result]: any[] = await sequelize.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid
       FROM billing.payments
       WHERE invoice_id = :id AND status = 'confirmed'`,
      { replacements: { id: invoiceId }, transaction: t, type: 'SELECT' as any }
    );

    const totalPaid = Number(result?.total_paid ?? 0);
    const invoice = await models.invoices.findByPk(invoiceId, txOpt(t));
    if (!invoice) return;

    const totalAmount = Number(invoice.total_amount);
    const amountPending = Math.max(0, totalAmount - totalPaid);
    let status: string = invoice.status;

    if (totalPaid >= totalAmount && totalAmount > 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partially_paid';
    } else {
      status = 'confirmed';
    }

    await invoice.update({
      amount_paid: totalPaid,
      amount_pending: amountPending,
      status: status as any,
      ...(status === 'paid' && { paid_at: new Date() })
    }, txOpt(t));

    // Close the case file when fully paid
    if (status === 'paid') {
      await models.case_files.update(
        { current_status_flow: CaseStatusFlow.C3_CERRADO, discharge_date: new Date() },
        { where: { id: invoice.case_file_id }, transaction: t }
      );
    }

    return invoice;
  }

  private async recalculateTotals(invoiceId: string, t: Transaction) {
    const items = await models.invoice_items.findAll({ where: { invoice_id: invoiceId }, transaction: t });
    const approvedDiscounts = await models.invoice_discounts.findAll({
      where: sequelize.literal(`invoice_id = '${invoiceId}' AND (discount_id IS NULL OR approved_by IS NOT NULL)`) as any,
      include: [{ model: models.discount_catalog, as: 'discount_catalog_item', attributes: ['requires_approval'] }],
      transaction: t
    });

    // Filter: include only discounts that are either manual or approved
    const effectiveDiscounts = approvedDiscounts.filter((d) => {
      if (!d.discount_id) return true; // manual discount, auto-approved
      return !!d.approved_by;          // catalog discount, only if approved
    });

    const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
    const discountTotal = effectiveDiscounts.reduce((s, d) => s + Number(d.calculated_amount), 0);
    const afterDiscount = Math.max(0, subtotal - discountTotal);

    // All items are IVA-exempt by default (Decreto 27-92 Guatemala)
    const taxableAmount = items.filter(i => !i.is_iva_exempt).reduce((s, i) => s + Number(i.total), 0);
    const ivaAmount = taxableAmount * IVA_RATE;
    const totalAmount = afterDiscount + ivaAmount;

    await models.invoices.update({
      subtotal,
      discount_total: discountTotal,
      taxable_amount: taxableAmount,
      iva_amount: ivaAmount,
      total_amount: totalAmount,
      amount_pending: Math.max(0, totalAmount - Number((await models.invoices.findByPk(invoiceId, txOpt(t)))?.amount_paid ?? 0))
    }, { where: { id: invoiceId }, transaction: t });
  }

  private async generateInvoiceNumber(t: Transaction): Promise<string> {
    const today = new Date();
    const prefix = `FAC-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const last = await models.invoices.findOne({
      where: { invoice_number: { [Op.like]: `${prefix}%` } },
      order: [['invoice_number', 'DESC']],
      transaction: t
    });

    const seq = last ? parseInt(last.invoice_number.split('-').pop() ?? '0') + 1 : 1;
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }
}
