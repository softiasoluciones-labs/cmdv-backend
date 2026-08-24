import { Request, Response } from 'express';
import { BillingService } from '../../services/billing-services/billing.service';

function userId(req: Request): string | undefined {
  return (req as any).user?.userId;
}

function err(res: Response, error: unknown, defaultCode = 500) {
  const msg = error instanceof Error ? error.message : 'Internal server error';
  const code = error instanceof Error && (
    msg.includes('not found') ? 404 :
    msg.includes('already') || msg.includes('Cannot') || msg.includes('cannot') ||
    msg.includes('must') || msg.includes('Insufficient') || msg.includes('required') ||
    msg.includes('status') || msg.includes('pending')
      ? 422 : defaultCode
  ) ? (
    msg.includes('not found') ? 404 : 422
  ) : defaultCode;
  res.status(code).json({ success: false, code, message: msg });
}

export class BillingController {
  constructor(private readonly service: BillingService) {}

  // ─── Invoices ─────────────────────────────────────────────────────────────

  generateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.generateInvoice(req.body, userId(req));
      res.status(201).json({ success: true, code: 201, message: 'Invoice generated successfully', data });
    } catch (e) { err(res, e); }
  };

  getInvoiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getInvoiceById(req.params['id'] as string);
      res.json({ success: true, code: 200, message: 'Invoice retrieved successfully', data });
    } catch (e) { err(res, e); }
  };

  getInvoiceByCaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getInvoiceByCaseFile(req.params['caseFileId'] as string);
      res.json({ success: true, code: 200, message: 'Invoice retrieved successfully', data });
    } catch (e) { err(res, e); }
  };

  confirmInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.confirmInvoice(req.params['id'] as string);
      res.json({ success: true, code: 200, message: 'Invoice confirmed successfully', data });
    } catch (e) { err(res, e); }
  };

  voidInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.voidInvoice(req.params['id'] as string, req.body.reason);
      res.json({ success: true, code: 200, message: 'Invoice voided successfully', data });
    } catch (e) { err(res, e); }
  };

  // ─── Discounts ────────────────────────────────────────────────────────────

  applyDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.applyDiscount(req.params['id'] as string, req.body, uid);
      res.status(201).json({ success: true, code: 201, message: data.message, data });
    } catch (e) { err(res, e); }
  };

  approveDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.approveDiscount(req.params['discountId'] as string, uid);
      res.json({ success: true, code: 200, message: 'Discount approved successfully', data });
    } catch (e) { err(res, e); }
  };

  removeDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.removeDiscount(req.params['discountId'] as string);
      res.json({ success: true, code: 200, message: 'Discount removed successfully' });
    } catch (e) { err(res, e); }
  };

  getDiscountCatalog = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getDiscountCatalog();
      res.json({ success: true, code: 200, message: 'Discount catalog retrieved successfully', data });
    } catch (e) { err(res, e); }
  };

  createDiscountCatalogItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.createDiscountCatalogItem(req.body);
      res.status(201).json({ success: true, code: 201, message: 'Discount catalog item created successfully', data });
    } catch (e) { err(res, e); }
  };

  // ─── Payments ─────────────────────────────────────────────────────────────

  recordPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.recordPayment(req.params['id'] as string, req.body, userId(req));
      res.status(201).json({ success: true, code: 201, message: 'Payment recorded successfully', data });
    } catch (e) { err(res, e); }
  };

  voidPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.voidPayment(req.params['paymentId'] as string, req.body, uid);
      res.json({ success: true, code: 200, message: 'Payment voided successfully', data });
    } catch (e) { err(res, e); }
  };

  getPaymentsByInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getPaymentsByInvoice(req.params['id'] as string);
      res.json({ success: true, code: 200, message: 'Payments retrieved successfully', data });
    } catch (e) { err(res, e); }
  };

  // ─── Tax Invoices (FEL) ───────────────────────────────────────────────────

  createTaxInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.createTaxInvoice(req.params['id'] as string, req.body);
      res.status(201).json({ success: true, code: 201, message: 'Tax invoice record created (FEL pending integration)', data });
    } catch (e) { err(res, e); }
  };

  // ─── Cash Sessions ────────────────────────────────────────────────────────

  openCashSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.openCashSession(req.body, uid);
      res.status(201).json({ success: true, code: 201, message: 'Cash session opened successfully', data });
    } catch (e) { err(res, e); }
  };

  closeCashSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.closeCashSession(req.params['id'] as string, req.body, uid);
      res.json({ success: true, code: 200, message: 'Cash session closed successfully', data });
    } catch (e) { err(res, e); }
  };

  getOpenSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getOpenSessions();
      res.json({ success: true, code: 200, message: 'Open sessions retrieved successfully', data });
    } catch (e) { err(res, e); }
  };

  getMySession = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = userId(req);
      if (!uid) { res.status(401).json({ success: false, code: 401, message: 'Authentication required' }); return; }
      const data = await this.service.getMyCashSession(uid);
      res.json({ success: true, code: 200, message: data ? 'Active session found' : 'No active session', data });
    } catch (e) { err(res, e); }
  };

  getSessionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getSessionById(req.params['id'] as string);
      res.json({ success: true, code: 200, message: 'Cash session retrieved successfully', data });
    } catch (e) { err(res, e); }
  };
}
