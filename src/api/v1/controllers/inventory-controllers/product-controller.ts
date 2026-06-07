import { Request, Response } from 'express';
import { ProductService } from '../../services/inventory-services/product.service';
import { ProductListFilters } from '../../dtos/inventory-dtos/product-dto';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class ProductController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: ProductListFilters = {
                categoryId: req.query.categoryId as string,
                ...(req.query.isActive !== undefined && { isActive: req.query.isActive === 'true' }),
                ...(req.query.requiresPrescription !== undefined && { requiresPrescription: req.query.requiresPrescription === 'true' }),
                ...(req.query.lowStock !== undefined && { lowStock: req.query.lowStock === 'true' }),
                search: req.query.search as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };


            const result = await ProductService.getAllProducts(filters);

            successResponse(res, 200, 'Products retrieved successfully', result);
        } catch (error: any) {
            errorResponse(res, 500, error.message || 'Internal server error');
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                throw new Error('Product ID is required');
            }

            const product = await ProductService.getProductById(id);

            successResponse(res, 200, 'Product retrieved successfully', product);
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            errorResponse(res, statusCode, error.message);
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const product = await ProductService.createProduct(req.body);

            successResponse(res, 201, 'Product created successfully', product);
        } catch (error: any) {
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            errorResponse(res, statusCode, error.message);
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Product ID is required');
            }
            const product = await ProductService.updateProduct(id, req.body);

            successResponse(res, 200, 'Product updated successfully', product);
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 :
                error.message.includes('already exists') ? 409 : 500;
            errorResponse(res, statusCode, error.message);
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Product ID is required');
            }

            await ProductService.deleteProduct(id);

            successResponse(res, 200, 'Product deleted successfully', null);
        } catch (error: any) {
            const statusCode = error.message === 'Product not found' ? 404 : 500;
            errorResponse(res, statusCode, error.message);
        }
    }

    static async getLowStock(req: Request, res: Response): Promise<void> {
        try {
            const products = await ProductService.getLowStockProducts();

            successResponse(res, 200, 'Low stock products retrieved successfully', products);
        } catch (error: any) {
            errorResponse(res, 500, error.message);
        }
    }
}
