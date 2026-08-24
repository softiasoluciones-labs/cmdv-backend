import { models } from '../../../../database';
import { InvoiceRepository } from '../../repositories/billing-repositories/invoice.repository';
import { PaymentRepository } from '../../repositories/billing-repositories/payment.repository';
import { CashSessionRepository } from '../../repositories/billing-repositories/cash-session.repository';
import {
  GenerateInvoiceRequest,
  InvoiceResponse,
  ApplyDiscountRequest,
  RecordPaymentRequest,
  VoidPaymentRequest,
  OpenCashSessionRequest,
  CloseCashSessionRequest,
  CashSessionResponse,
  CreateTaxInvoiceRequest,
  CreateDiscountCatalogRequest
} from '../../dtos/billing-dtos/billing.dto';
import { invoices } from '../../../../database/billing/invoices';
import { cash_sessions } from '../../../../database/billing/cash_sessions';

export class BillingService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly sessionRepo: CashSessionRepository
  ) {}

  // ─── Invoice ──────────────────────────────────────────────────────────────

  async generateInvoice(data: GenerateInvoiceRequest, createdBy?: string): Promise<InvoiceResponse> {
    const invoice = await this.invoiceRepo.generateFromCaseFile(data.case_file_id, createdBy, {
      ...(data.requires_tax_invoice !== undefined && { requires_tax_invoice: data.requires_tax_invoice }),
      ...(data.due_date !== undefined && { due_date: data.due_date }),
      ...(data.notes !== undefined && { notes: data.notes })
    });
    const full = await this.invoiceRepo.findById(invoice.id);
    if (!full) throw new Error('Failed to retrieve generated invoice');
    return BillingService.toInvoiceResponse(full);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponse> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new Error('Invoice not found');
    return BillingService.toInvoiceResponse(invoice);
  }

  async getInvoiceByCaseFile(caseFileId: string): Promise<InvoiceResponse> {
    const invoice = await this.invoiceRepo.findByCaseFile(caseFileId);
    if (!invoice) throw new Error('No invoice found for this case file');
    return BillingService.toInvoiceResponse(invoice);
  }

  async confirmInvoice(invoiceId: string): Promise<InvoiceResponse> {
    await this.invoiceRepo.confirmInvoice(invoiceId);
    const full = await this.invoiceRepo.findById(invoiceId);
    if (!full) throw new Error('Failed to retrieve confirmed invoice');
    return BillingService.toInvoiceResponse(full);
  }

  async voidInvoice(invoiceId: string, reason: string): Promise<InvoiceResponse> {
    if (!reason?.trim()) throw new Error('A void reason is required');
    await this.invoiceRepo.voidInvoice(invoiceId, reason);
    const full = await this.invoiceRepo.findById(invoiceId);
    if (!full) throw new Error('Failed to retrieve voided invoice');
    return BillingService.toInvoiceResponse(full);
  }

  // ─── Discounts ────────────────────────────────────────────────────────────

  async applyDiscount(invoiceId: string, data: ApplyDiscountRequest, appliedBy: string) {
    if (data.value <= 0) throw new Error('Discount value must be greater than zero');
    const result = await this.invoiceRepo.applyDiscount(invoiceId, data, appliedBy);
    const full = await this.invoiceRepo.findById(invoiceId);
    return {
      invoice: full ? BillingService.toInvoiceResponse(full) : null,
      requires_approval: result.requires_approval,
      message: result.requires_approval
        ? 'Discount applied but requires admin approval before it is reflected in totals'
        : 'Discount applied successfully'
    };
  }

  async approveDiscount(discountId: string, approvedBy: string) {
    await this.invoiceRepo.approveDiscount(discountId, approvedBy);
    const discount = await models.invoice_discounts.findByPk(discountId);
    if (!discount) throw new Error('Discount not found after approval');
    const full = await this.invoiceRepo.findById(discount.invoice_id);
    return full ? BillingService.toInvoiceResponse(full) : null;
  }

  async removeDiscount(discountId: string) {
    await this.invoiceRepo.removeDiscount(discountId);
  }

  async getDiscountCatalog() {
    return models.discount_catalog.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
  }

  async createDiscountCatalogItem(data: CreateDiscountCatalogRequest) {
    return models.discount_catalog.create({
      code: data.code,
      name: data.name,
      category: data.category,
      discount_type: data.discount_type,
      value: data.value,
      ...(data.max_amount !== undefined && { max_amount: data.max_amount }),
      requires_approval: data.requires_approval ?? false,
      ...(data.valid_from && { valid_from: data.valid_from }),
      ...(data.valid_until && { valid_until: data.valid_until })
    });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async recordPayment(invoiceId: string, data: RecordPaymentRequest, receivedBy?: string) {
    const payment = await this.paymentRepo.recordPayment(invoiceId, data, receivedBy);
    const full = await this.invoiceRepo.findById(invoiceId);
    return {
      payment,
      invoice: full ? BillingService.toInvoiceResponse(full) : null
    };
  }

  async voidPayment(paymentId: string, data: VoidPaymentRequest, voidedBy: string) {
    if (!data.void_reason?.trim()) throw new Error('A void reason is required');
    return this.paymentRepo.voidPayment(paymentId, data.void_reason, voidedBy);
  }

  async getPaymentsByInvoice(invoiceId: string) {
    return this.paymentRepo.findByInvoice(invoiceId);
  }

  // ─── Tax Invoices (FEL) ───────────────────────────────────────────────────

  async createTaxInvoice(invoiceId: string, data: CreateTaxInvoiceRequest) {
    const invoice = await models.invoices.findByPk(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (!['confirmed', 'partially_paid', 'paid'].includes(invoice.status)) {
      throw new Error('Tax invoice can only be created for confirmed or paid invoices');
    }

    const existing = await models.tax_invoices.findOne({ where: { invoice_id: invoiceId } });
    if (existing) throw new Error('A tax invoice already exists for this invoice');

    // FEL integration is pending — record is created with status 'pending'
    // Once a certified SAT issuer is contracted, update fel_status to 'issued'
    // and populate fel_uuid, fel_series, fel_number, fel_issued_at, fel_issuer
    return models.tax_invoices.create({
      invoice_id: invoiceId,
      nit: data.nit || 'CF',
      tax_name: data.tax_name,
      ...(data.tax_address && { tax_address: data.tax_address }),
      document_type: data.document_type ?? 'FACT',
      fel_status: 'pending'
    });
  }

  // ─── Cash Sessions ────────────────────────────────────────────────────────

  async openCashSession(data: OpenCashSessionRequest, cashierId: string): Promise<CashSessionResponse> {
    if (data.initial_cash < 0) throw new Error('Initial cash cannot be negative');
    const session = await this.sessionRepo.openSession(cashierId, data.initial_cash, data.notes);
    return BillingService.toSessionResponse(session);
  }

  async closeCashSession(sessionId: string, data: CloseCashSessionRequest, closedBy: string): Promise<CashSessionResponse> {
    if (data.actual_cash < 0) throw new Error('Actual cash cannot be negative');
    const session = await this.sessionRepo.closeSession(sessionId, data.actual_cash, closedBy, data.notes);
    return BillingService.toSessionResponse(session);
  }

  async getOpenSessions(): Promise<CashSessionResponse[]> {
    const sessions = await this.sessionRepo.findCurrentOpen();
    return sessions.map(BillingService.toSessionResponse);
  }

  async getSessionById(id: string): Promise<CashSessionResponse> {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new Error('Cash session not found');
    return BillingService.toSessionResponse(session);
  }

  async getMyCashSession(cashierId: string): Promise<CashSessionResponse | null> {
    const session = await this.sessionRepo.findOpenByCashier(cashierId);
    return session ? BillingService.toSessionResponse(session) : null;
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private static toInvoiceResponse(inv: invoices): InvoiceResponse {
    const patient = (inv as any).patient;
    const caseFile = (inv as any).case_file;
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      case_file_id: inv.case_file_id,
      ...(caseFile && { case_number: caseFile.case_number }),
      patient_id: inv.patient_id,
      ...(patient && { patient_name: `${patient.first_name} ${patient.last_name}`.trim() }),
      status: inv.status,
      subtotal: Number(inv.subtotal),
      discount_total: Number(inv.discount_total),
      taxable_amount: Number(inv.taxable_amount),
      iva_amount: Number(inv.iva_amount),
      total_amount: Number(inv.total_amount),
      amount_paid: Number(inv.amount_paid),
      amount_pending: Number(inv.amount_pending),
      requires_tax_invoice: inv.requires_tax_invoice,
      ...(inv.confirmed_at && { confirmed_at: inv.confirmed_at }),
      ...(inv.paid_at && { paid_at: inv.paid_at }),
      ...(inv.due_date && { due_date: inv.due_date }),
      ...(inv.notes && { notes: inv.notes }),
      ...(inv.created_by && { created_by: inv.created_by }),
      created_at: inv.created_at!,
      updated_at: inv.updated_at!,
      ...((inv as any).invoice_items && {
        items: (inv as any).invoice_items.map((i: any) => ({
          id: i.id,
          item_type: i.item_type,
          ...(i.reference_id && { reference_id: i.reference_id }),
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          subtotal: Number(i.subtotal),
          discount_amount: Number(i.discount_amount),
          total: Number(i.total),
          is_iva_exempt: i.is_iva_exempt
        }))
      }),
      ...((inv as any).invoice_discounts && {
        discounts: (inv as any).invoice_discounts.map((d: any) => ({
          id: d.id,
          ...(d.discount_id && { discount_id: d.discount_id }),
          description: d.description,
          discount_type: d.discount_type,
          value: Number(d.value),
          calculated_amount: Number(d.calculated_amount),
          applied_by: d.applied_by,
          ...(d.approved_by && { approved_by: d.approved_by }),
          ...(d.approved_at && { approved_at: d.approved_at }),
          requires_approval: d.discount_catalog_item?.requires_approval ?? false,
          ...(d.reason && { reason: d.reason }),
          created_at: d.created_at
        }))
      }),
      ...((inv as any).payments && {
        payments: (inv as any).payments.map((p: any) => ({
          id: p.id,
          payment_number: p.payment_number,
          payment_method: p.payment_method,
          amount: Number(p.amount),
          ...(p.reference_number && { reference_number: p.reference_number }),
          ...(p.card_brand && { card_brand: p.card_brand }),
          ...(p.card_last_four && { card_last_four: p.card_last_four }),
          ...(p.bank_name && { bank_name: p.bank_name }),
          payment_date: p.payment_date,
          status: p.status,
          ...(p.received_by && { received_by: p.received_by }),
          ...(p.notes && { notes: p.notes })
        }))
      }),
      ...((inv as any).tax_invoice && {
        tax_invoice: {
          id: (inv as any).tax_invoice.id,
          nit: (inv as any).tax_invoice.nit,
          tax_name: (inv as any).tax_invoice.tax_name,
          document_type: (inv as any).tax_invoice.document_type,
          fel_status: (inv as any).tax_invoice.fel_status,
          ...((inv as any).tax_invoice.fel_uuid && { fel_uuid: (inv as any).tax_invoice.fel_uuid }),
          ...((inv as any).tax_invoice.fel_series && { fel_series: (inv as any).tax_invoice.fel_series }),
          ...((inv as any).tax_invoice.fel_number && { fel_number: (inv as any).tax_invoice.fel_number }),
          ...((inv as any).tax_invoice.fel_issued_at && { fel_issued_at: (inv as any).tax_invoice.fel_issued_at })
        }
      })
    };
  }

  private static toSessionResponse(s: cash_sessions): CashSessionResponse {
    const cashier = (s as any).cashier;
    return {
      id: s.id,
      session_number: s.session_number,
      cashier_id: s.cashier_id,
      ...(cashier && { cashier_name: cashier.name ?? cashier.email }),
      status: s.status,
      opened_at: s.opened_at!,
      ...(s.closed_at && { closed_at: s.closed_at }),
      initial_cash: Number(s.initial_cash),
      ...(s.expected_cash !== undefined && s.expected_cash !== null && { expected_cash: Number(s.expected_cash) }),
      ...(s.actual_cash !== undefined && s.actual_cash !== null && { actual_cash: Number(s.actual_cash) }),
      ...(s.cash_difference !== undefined && s.cash_difference !== null && { cash_difference: Number(s.cash_difference) }),
      total_collected: Number(s.total_collected),
      ...(s.notes && { notes: s.notes })
    };
  }
}
