import { models } from '../../../../database';
import { products, productsCreationAttributes } from '../../../../database/inventory/products';
import { product_categories } from '../../../../database/inventory/product_categories';
//import { warehouse_stock } from '../../../database/inventory/warehouse_stock';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Op } from 'sequelize';

/**
 * Product Repository
 */
export class ProductRepository {
    /**
     * Find all products with optional filters
     */
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ products: products[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};

            if (filters.categoryId) {
                where.category_id = filters.categoryId;
            }

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.requiresPrescription !== undefined) {
                where.requires_prescription = filters.requiresPrescription;
            }

            if (filters.search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${filters.search}%` } },
                    { code: { [Op.iLike]: `%${filters.search}%` } },
                    { barcode: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            const { rows, count } = await models.products.findAndCountAll({
                where,
                include: [{
                    model: models.product_categories,
                    as: 'category',
                    attributes: ['id', 'name', 'code']
                }],
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                limit,
                offset,
                order: [['name', 'ASC']]
            });

            return { products: rows, total: count };
        } catch (error: any) {
            secureLogger.error('Error finding products:', error.message);
            throw new Error('Failed to retrieve products' + error);
        }
    }

    /**
     * Find product by ID
     */
    static async findById(id: string): Promise<products | null> {
        try {
            const product = await models.products.findByPk(id, {
                include: [{
                    model: models.product_categories,
                    as: 'category',
                    attributes: ['id', 'name', 'code']
                }]
            });
            return product;
        } catch (error) {
            secureLogger.error('Error finding product by ID:', error);
            return null;
        }
    }

    /**
     * Find product by code
     */
    static async findByCode(code: string): Promise<products | null> {
        try {
            const product = await models.products.findOne({
                where: { code },
                include: [{
                    model: models.product_categories,
                    as: 'category',
                    attributes: ['id', 'name', 'code']
                }]
            });
            return product;
        } catch (error) {
            secureLogger.error('Error finding product by code:', error);
            return null;
        }
    }

    /**
     * Create new product
     */
    static async create(productData: productsCreationAttributes): Promise<products> {
        try {
            const product = await models.products.create(productData);
            return product;
        } catch (error) {
            secureLogger.error('Error creating product:', error);
            throw new Error('Failed to create product');
        }
    }

    /**
     * Update product
     */
    static async update(id: string, productData: Partial<productsCreationAttributes>): Promise<boolean> {
        try {
            const [updatedCount] = await models.products.update(productData, {
                where: { id }
            });
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating product:', error);
            return false;
        }
    }

    /**
     * Delete product (soft delete by marking as inactive)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const [updatedCount] = await models.products.update(
                { is_active: false },
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting product:', error);
            return false;
        }
    }

    /**
     * Get products with low stock across all warehouses
     */
    static async getLowStockProducts(): Promise<any[]> {
        try {
            const lowStockProducts = await models.products.findAll({
                include: [{
                    model: models.warehouse_stock,
                    as: 'warehouse_stocks',
                    required: true,
                    where: {
                        quantity: {
                            [Op.lt]: models.products.sequelize!.col('products.minimum_stock')
                        }
                    },
                    include: [{
                        model: models.warehouses,
                        as: 'warehouse',
                        attributes: ['id', 'name', 'code']
                    }]
                }],
                where: {
                    is_active: true
                }
            });

            return lowStockProducts;
        } catch (error) {
            secureLogger.error('Error getting low stock products:', error);
            return [];
        }
    }
}
