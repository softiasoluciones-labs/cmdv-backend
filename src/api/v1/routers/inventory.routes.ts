import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { ProductController } from '../controllers/inventory-controllers/product-controller';
import { WarehouseController } from '../controllers/inventory-controllers/warehouse-controller';
import { SupplierController } from '../controllers/inventory-controllers/supplier-controller';
import { StockMovementController } from '../controllers/inventory-controllers/stock-movement-controller';
import { PurchaseController } from '../controllers/inventory-controllers/purchase-controller';
import { PurchaseOrderPaymentController } from '../controllers/inventory-controllers/purchase-order-payment.controller';
import { DispatchController } from '../controllers/inventory-controllers/dispatch-controller';
import {
    createProductValidator,
    updateProductValidator,
    productListValidator
} from '../validators/inventory-validators/product-validator';
import {
    createWarehouseValidator,
    updateWarehouseValidator
} from '../validators/inventory-validators/warehouse-validator';
import {
    createSupplierValidator,
    updateSupplierValidator
} from '../validators/inventory-validators/supplier-validator';
import {
    createStockMovementValidator,
    stockMovementFiltersValidator
} from '../validators/inventory-validators/stock-movement-validator';
import {
    createPurchaseOrderValidator,
    updatePurchaseOrderValidator,
    receivePurchaseOrderValidator,
    updateStatusValidator,
    deletePurchaseOrderItemValidator
} from '../validators/inventory-validators/purchase-order-validator';
import {
    createPaymentValidator,
    paymentIdValidator,
    orderIdValidator
} from '../validators/inventory-validators/purchase-order-payment.validator';
import {
    createDispatchValidator,
    dispatchIdValidator,
    dispatchFiltersValidator,
    cancelDispatchValidator,
    executeDispatchValidator
} from '../validators/inventory-validators/dispatch-validator';

const router = Router();

// All inventory routes require authentication
router.use(authMiddleware);

// Product routes
router.get('/products/low-stock', ProductController.getLowStock);
router.get('/products', productListValidator, ProductController.getAll);
router.get('/products/:id', ProductController.getById);
router.post('/products', createProductValidator, ProductController.create);
router.put('/products/:id', updateProductValidator, ProductController.update);
router.delete('/products/:id', ProductController.delete);

// Warehouse routes
router.get('/warehouses', WarehouseController.getAll);
router.get('/warehousesStock', WarehouseController.getStockStatus);
router.get('/warehouses/:id/stock', WarehouseController.getStockStatus);
router.get('/warehouses/:id', WarehouseController.getById);
router.post('/warehouses', createWarehouseValidator, WarehouseController.create);
router.put('/warehouses/:id', updateWarehouseValidator, WarehouseController.update);
router.delete('/warehouses/:id', WarehouseController.delete);

// Supplier routes
router.get('/suppliers', SupplierController.getAll);
router.get('/suppliers/:id', SupplierController.getById);
router.post('/suppliers', createSupplierValidator, SupplierController.create);
router.put('/suppliers/:id', updateSupplierValidator, SupplierController.update);
router.delete('/suppliers/:id', SupplierController.delete);

// Stock movement routes
router.get('/stock-movements', stockMovementFiltersValidator, StockMovementController.getAll);
router.get('/stock-movements/:id', StockMovementController.getById);
router.post('/stock-movements', createStockMovementValidator, StockMovementController.create);

// Purchase order routes
router.get('/purchase-orders', PurchaseController.getAll);
router.get('/purchase-orders/:id', PurchaseController.getById);
router.get('/purchase-orders/po-number/:poNumber', PurchaseController.getByPoNumber);
router.post('/purchase-orders', createPurchaseOrderValidator, PurchaseController.create);
router.patch('/purchase-orders/:id/status', updateStatusValidator, PurchaseController.updateStatus);
router.post('/purchase-orders/:id/receive', receivePurchaseOrderValidator, PurchaseController.receive);
router.delete('/purchase-orders/:orderId/details/:detailId', deletePurchaseOrderItemValidator, PurchaseController.removeOrderDetail);

// Purchase order payment routes
router.get('/purchase-orders/:orderId/payments', orderIdValidator, PurchaseOrderPaymentController.getPaymentsByPurchaseOrder);
router.get('/purchase-orders/:orderId/payments/summary', orderIdValidator, PurchaseOrderPaymentController.getPaymentSummary);
router.get('/purchase-orders/:orderId/payments/:paymentId', paymentIdValidator, PurchaseOrderPaymentController.getPaymentById);
router.post('/purchase-orders/:orderId/payments', createPaymentValidator, PurchaseOrderPaymentController.createPayment);
router.delete('/purchase-orders/:orderId/payments/:paymentId', paymentIdValidator, PurchaseOrderPaymentController.deletePayment);

// Dispatch routes
router.get('/dispatches', dispatchFiltersValidator, DispatchController.getAll);
router.get('/dispatches/:id', dispatchIdValidator, DispatchController.getById);
router.post('/dispatches', createDispatchValidator, DispatchController.create);
router.post('/dispatches/:id/approve', dispatchIdValidator, DispatchController.approve);
router.post('/dispatches/:id/dispatch', executeDispatchValidator, DispatchController.dispatch);
router.post('/dispatches/:id/complete', dispatchIdValidator, DispatchController.complete);
router.post('/dispatches/:id/cancel', cancelDispatchValidator, DispatchController.cancel);
router.delete('/dispatches/:id', dispatchIdValidator, DispatchController.delete);

export { router as inventoryRoutes };
