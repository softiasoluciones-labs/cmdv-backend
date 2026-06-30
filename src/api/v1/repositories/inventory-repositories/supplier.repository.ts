import { models } from '../../../../database';
import { suppliers, suppliersCreationAttributes } from '../../../../database/inventory/suppliers';
import { secureLogger } from '../../../../utils/secure-logger.utils';

/**
 * Supplier Repository
 */
export class SupplierRepository {
    /**
     * Find all suppliers
     */
    static async findAll(activeOnly: boolean = true): Promise<suppliers[]> {
        try {
            const where: any = {};
            if (activeOnly) {
                where.is_active = true;
            }

            const suppliers = await models.suppliers.findAll({
                where,
                order: [['business_name', 'ASC']]
            });
            return suppliers;
        } catch (error) {
            secureLogger.error('Error finding suppliers: ' + error);
            return [];
        }
    }

    /**
     * Find supplier by ID
     */
    static async findById(id: string): Promise<suppliers | null> {
        try {
            const supplier = await models.suppliers.findByPk(id);
            return supplier ?? null;
        } catch (error) {
            secureLogger.error('Error finding supplier by ID: ' + error);
            throw new Error('Error finding supplier by ID');
        }
    }

    /**
     * Find supplier by code
     */
    static async findByCode(code: string): Promise<suppliers | null> {
        try {
            const supplier = await models.suppliers.findOne({
                where: { code }
            });
            return supplier ?? null;
        } catch (error) {
            secureLogger.error('Error finding supplier by code:', error);
            throw new Error('Error finding supplier by code');
        }
    }

    /**
     * Create new supplier
     */
    static async create(supplierData: suppliersCreationAttributes): Promise<suppliers> {
        try {
            const supplier = await models.suppliers.create(supplierData);
            return supplier;
        } catch (error) {
            secureLogger.error('Error creating supplier:', error);
            throw new Error('Failed to create supplier');
        }
    }

    /**
     * Update supplier
     */
    static async update(id: string, supplierData: Partial<suppliersCreationAttributes>): Promise<boolean> {
        try {
            const [updatedCount] = await models.suppliers.update(supplierData, {
                where: { id }
            });
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating supplier:', error);
            return false;
        }
    }

    /**
     * Delete supplier (soft delete)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const [updatedCount] = await models.suppliers.update(
                { is_active: false },
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting supplier:', error);
            return false;
        }
    }
}
