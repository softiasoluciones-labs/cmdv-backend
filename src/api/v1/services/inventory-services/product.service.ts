import { ProductRepository } from '../../repositories/inventory-repositories/product.repository';
import { ProductResponse, CreateProductRequest, UpdateProductRequest, ProductListFilters } from '../../dtos/inventory-dtos/product-dto';
import { products } from '../../../../database/inventory/products';

/**
 * Product Service
 */
export class ProductService {
    /**
     * Transform product model to response DTO
     */
    private static toProductResponse(product: products): ProductResponse {
        const totalStockQuantity = product.get('totalStockQuantity') as string | undefined;
        const totalReservedQuantity = product.get('totalReservedQuantity') as string | undefined;
        const totalAvailableQuantity = product.get('totalAvailableQuantity') as string | undefined;
        
        return {
            id: product.id,
            code: product.code,
            ...(product.barcode !== undefined && { barcode: product.barcode }),
            name: product.name,
            categoryId: product.category_id,
            ...((product as any).category?.name && { categoryName: (product as any).category.name }),
            ...(product.description !== undefined && { description: product.description }),
            unitOfMeasure: product.unit_of_measure,
            ...(product.minimum_stock !== undefined && { minimumStock: product.minimum_stock }),
            ...(product.maximum_stock !== undefined && { maximumStock: product.maximum_stock }),
            ...(product.reorder_point !== undefined && { reorderPoint: product.reorder_point }),
            ...(product.unit_cost !== undefined && { unitCost: parseFloat(product.unit_cost.toString()) }),
            ...(product.selling_price !== undefined && { sellingPrice: parseFloat(product.selling_price.toString()) }),
            ...(product.requires_prescription !== undefined && { requiresPrescription: product.requires_prescription }),
            ...(product.requires_refrigeration !== undefined && { requiresRefrigeration: product.requires_refrigeration }),
            ...(product.expiration_alert_days !== undefined && { expirationAlertDays: product.expiration_alert_days }),
            ...(product.is_active !== undefined && { isActive: product.is_active }),
            ...(totalStockQuantity !== undefined && { totalStockQuantity: parseFloat(totalStockQuantity) }),
            ...(totalReservedQuantity !== undefined && { totalReservedQuantity: parseFloat(totalReservedQuantity) }),
            ...(totalAvailableQuantity !== undefined && { totalAvailableQuantity: parseFloat(totalAvailableQuantity) }),
            ...(product.created_at !== undefined && { createdAt: product.created_at }),
            ...(product.updated_at !== undefined && { updatedAt: product.updated_at })
        };
    }

    /**
     * Get all products with filters
     */
    static async getAllProducts(filters: ProductListFilters): Promise<{ products: ProductResponse[], total: number, page: number, limit: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;

        const { products, total } = await ProductRepository.findAll(filters, page, limit);

        const mappedProducts = await Promise.all(products.map(p => this.toProductResponse(p)));

        return {
            products: mappedProducts,
            total,
            page,
            limit
        };
    }

    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<ProductResponse> {
        const product = await ProductRepository.findById(id);
        if (!product) throw new Error('Product not found');
        return this.toProductResponse(product);
    }

    /**
     * Create new product
     */
    static async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
        const existingByCode = await ProductRepository.findByCode(data.code);
        if (existingByCode) throw new Error('Product code already exists');

        const productData = {
            code: data.code,
            name: data.name,
            category_id: data.categoryId,
            unit_of_measure: data.unitOfMeasure,

            ...(data.barcode && { barcode: data.barcode }),
            ...(data.description && { description: data.description }),
            ...(data.minimumStock !== undefined && { minimum_stock: data.minimumStock }),
            ...(data.maximumStock !== undefined && { maximum_stock: data.maximumStock }),
            ...(data.reorderPoint !== undefined && { reorder_point: data.reorderPoint }),
            ...(data.unitCost !== undefined && { unit_cost: data.unitCost }),
            ...(data.sellingPrice !== undefined && { selling_price: data.sellingPrice }),

            ...(data.requiresPrescription !== undefined && { requires_prescription: data.requiresPrescription }),
            ...(data.requiresRefrigeration !== undefined && { requires_refrigeration: data.requiresRefrigeration }),
            ...(data.expirationAlertDays !== undefined && { expiration_alert_days: data.expirationAlertDays })
        };

        const product = await ProductRepository.create(productData);
        return this.toProductResponse(product);
    }

    /**
     * Update product
     */
    static async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
        const product = await ProductRepository.findById(id);
        if (!product) throw new Error('Product not found');

        if (data.code && data.code !== product.code) {
            const existingByCode = await ProductRepository.findByCode(data.code);
            if (existingByCode) throw new Error('Product code already exists');
        }

        const updateData: Record<string, unknown> = {};
        if (data.code !== undefined) updateData.code = data.code;
        if (data.barcode !== undefined) updateData.barcode = data.barcode;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.unitOfMeasure !== undefined) updateData.unit_of_measure = data.unitOfMeasure;
        if (data.minimumStock !== undefined) updateData.minimum_stock = data.minimumStock;
        if (data.maximumStock !== undefined) updateData.maximum_stock = data.maximumStock;
        if (data.reorderPoint !== undefined) updateData.reorder_point = data.reorderPoint;
        if (data.unitCost !== undefined) updateData.unit_cost = data.unitCost;
        if (data.sellingPrice !== undefined) updateData.selling_price = data.sellingPrice;
        if (data.requiresPrescription !== undefined) updateData.requires_prescription = data.requiresPrescription;
        if (data.requiresRefrigeration !== undefined) updateData.requires_refrigeration = data.requiresRefrigeration;
        if (data.expirationAlertDays !== undefined) updateData.expiration_alert_days = data.expirationAlertDays;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        await ProductRepository.update(id, updateData);

        const updatedProduct = await ProductRepository.findById(id);
        if (!updatedProduct) throw new Error('Product not found');
        return this.toProductResponse(updatedProduct);
    }

    /**
     * Delete product (soft delete)
     */
    static async deleteProduct(id: string): Promise<void> {
        await ProductRepository.findById(id);

        const deleted = await ProductRepository.delete(id);
        if (!deleted) {
            throw new Error('Failed to delete product');
        }
    }

    /**
     * Get low stock products
     */
    static async getLowStockProducts(): Promise<any[]> {
        return await ProductRepository.getLowStockProducts();
    }
}
