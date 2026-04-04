
import { models } from '../../../../database';
import { admission_types } from '../../../../database/medical/admission_types';
import { AdmissionCategory } from '../../dtos/medical-dtos/admission-type.dto';
import { Op } from 'sequelize';

/**
 * Repository for admission types data access
 */
export class AdmissionTypeRepository {
    /**
     * Find all admission types with optional filtering
     */
    static async findAll(filters?: {
        is_active?: boolean;
        category?: AdmissionCategory;
    }): Promise<admission_types[]> {
        const where: any = {};

        if (filters?.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        return await models.admission_types.findAll({
            where,
            order: [['name', 'ASC']]
        });
    }

    /**
     * Find admission type by ID
     */
    static async findById(id: string): Promise<admission_types | null> {
        return await models.admission_types.findByPk(id);
    }

    /**
     * Find admission type by code
     */
    static async findByCode(code: string): Promise<admission_types | null> {
        return await models.admission_types.findOne({
            where: { code }
        });
    }

    /**
     * Create new admission type
     */
    static async create(data: {
        code: string;
        name: string;
        requires_hospitalization: boolean;
        requires_package: boolean;
        allows_transfer: boolean;
        requires_immediate_payment: boolean;
        category?: AdmissionCategory;
        description?: string;
        is_active?: boolean;
    }): Promise<admission_types> {
        const createData: any = {
            code: data.code.toUpperCase(), // Ensure uppercase
            name: data.name,
            requires_hospitalization: data.requires_hospitalization,
            requires_package: data.requires_package,
            allows_transfer: data.allows_transfer,
            requires_immediate_payment: data.requires_immediate_payment,
            is_active: data.is_active ?? true
        };

        // Only include optional properties if they have values
        if (data.category !== undefined) {
            createData.category = data.category;
        }
        if (data.description !== undefined) {
            createData.description = data.description;
        }

        return await models.admission_types.create(createData);
    }

    /**
     * Update admission type
     */
    static async update(id: string, data: any): Promise<admission_types | null> {
        const type = await models.admission_types.findByPk(id);

        if (!type) {
            return null;
        }

        const updateData: any = {};

        if (data.code) updateData.code = data.code.toUpperCase();
        if (data.name) updateData.name = data.name;
        if (data.requires_hospitalization !== undefined) updateData.requires_hospitalization = data.requires_hospitalization;
        if (data.requires_package !== undefined) updateData.requires_package = data.requires_package;
        if (data.allows_transfer !== undefined) updateData.allows_transfer = data.allows_transfer;
        if (data.requires_immediate_payment !== undefined) updateData.requires_immediate_payment = data.requires_immediate_payment;
        if (data.category) updateData.category = data.category;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.is_active !== undefined) updateData.is_active = data.is_active;

        await type.update(updateData);
        return type;
    }

    /**
     * Soft delete admission type (set is_active = false)
     */
    static async delete(id: string): Promise<boolean> {
        const type = await models.admission_types.findByPk(id);

        if (!type) {
            return false;
        }

        await type.update({ is_active: false });
        return true;
    }

    /**
     * Check if code already exists
     */
    static async codeExists(code: string, excludeId?: string): Promise<boolean> {
        const where: any = { code: code.toUpperCase() };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        const count = await models.admission_types.count({ where });
        return count > 0;
    }
}
