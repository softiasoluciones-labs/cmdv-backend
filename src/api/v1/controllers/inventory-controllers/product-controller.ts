import { Request, Response } from 'express';
import { ProductService } from '../../services/inventory-services/product.service';
import { ProductListFilters } from '../../dtos/inventory-dtos/product-dto';

export class ProductController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: ProductListFilters = {
                categoryId: req.query.categoryId as string,
                isActive: req.query.isActive === 'true',
                requiresPrescription: req.query.requiresPrescription === 'true',
                lowStock: req.query.lowStock === 'true',
                search: req.query.search as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            console.log(filters);

            const result = await ProductService.getAllProducts(filters);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Products retrieved successfully',
                data: result,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message || 'Internal server error',
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString(),
                errorCode: 'PRODUCT_FETCH_ERROR'
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                throw new Error('Product ID is required');
            }

            const product = await ProductService.getProductById(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Product retrieved successfully',
                data: product,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const product = await ProductService.createProduct(req.body);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Product created successfully',
                data: product,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Product ID is required');
            }
            const product = await ProductService.updateProduct(id, req.body);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Product updated successfully',
                data: product,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 :
                error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Product ID is required');
            }

            await ProductService.deleteProduct(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Product deleted successfully',
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async getLowStock(req: Request, res: Response): Promise<void> {
        try {
            const products = await ProductService.getLowStockProducts();

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Low stock products retrieved successfully',
                data: products,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }
}
