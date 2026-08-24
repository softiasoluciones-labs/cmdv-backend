import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { BillingController } from '../controllers/billing-controllers/billing.controller';
import { BillingService } from '../services/billing-services/billing.service';
import { InvoiceRepository } from '../repositories/billing-repositories/invoice.repository';
import { PaymentRepository } from '../repositories/billing-repositories/payment.repository';
import { CashSessionRepository } from '../repositories/billing-repositories/cash-session.repository';

const router = Router();

const billing = new BillingController(
  new BillingService(
    new InvoiceRepository(),
    new PaymentRepository(),
    new CashSessionRepository()
  )
);

router.use(authMiddleware);

// ─── Invoices ─────────────────────────────────────────────────────────────────
// Generate invoice from a case file (snapshot all charges)
router.post('/invoices', billing.generateInvoice);
// Get invoice by ID
router.get('/invoices/:id', billing.getInvoiceById);
// Get invoice for a specific case file
router.get('/invoices/case-file/:caseFileId', billing.getInvoiceByCaseFile);
// Confirm invoice — locks charges, advances case to CC_CONFIRMACION_CARGOS
router.patch('/invoices/:id/confirm', billing.confirmInvoice);
// Void invoice
router.patch('/invoices/:id/void', billing.voidInvoice);

// ─── Discounts ────────────────────────────────────────────────────────────────
// Apply a discount to an invoice (requires admin approval if catalog item requires it)
router.post('/invoices/:id/discounts', billing.applyDiscount);
// Remove an unapproved discount
router.delete('/invoices/:id/discounts/:discountId', billing.removeDiscount);
// Approve a pending discount (admin/superadmin only — enforce at middleware layer when roles are wired)
router.patch('/invoices/:id/discounts/:discountId/approve', billing.approveDiscount);

// ─── Payments ─────────────────────────────────────────────────────────────────
// Record a payment (can be partial — multiple payments per invoice allowed)
router.post('/invoices/:id/payments', billing.recordPayment);
// List all payments for an invoice
router.get('/invoices/:id/payments', billing.getPaymentsByInvoice);
// Void a single payment
router.patch('/invoices/:id/payments/:paymentId/void', billing.voidPayment);

// ─── Tax Invoices (FEL Guatemala) ─────────────────────────────────────────────
// Create tax invoice record (FEL integration pending — status stays 'pending')
router.post('/invoices/:id/tax-invoice', billing.createTaxInvoice);

// ─── Cash Sessions ────────────────────────────────────────────────────────────
// Open a new cash session
router.post('/cash-sessions', billing.openCashSession);
// Get all currently open sessions
router.get('/cash-sessions/open', billing.getOpenSessions);
// Get my own active session
router.get('/cash-sessions/me', billing.getMySession);
// Get session by ID
router.get('/cash-sessions/:id', billing.getSessionById);
// Close a session with reconciliation
router.patch('/cash-sessions/:id/close', billing.closeCashSession);

// ─── Discount Catalog ─────────────────────────────────────────────────────────
router.get('/discount-catalog', billing.getDiscountCatalog);
router.post('/discount-catalog', billing.createDiscountCatalogItem);

export { router as billingRoutes };
