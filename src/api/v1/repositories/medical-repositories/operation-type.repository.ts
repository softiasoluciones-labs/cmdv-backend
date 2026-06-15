import { Transaction } from 'sequelize';
import { operation_types, operation_typesCreationAttributes } from '../../../../database/medical/operation_types';
import { models } from '../../../../database';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
    return t !== undefined ? { transaction: t } : {};
}

export class OperationTypeRepository {
    async findAll(options?: {
        page?: number;
        limit?: number;
        specialty_id?: string;
        is_active?: boolean;
    }): Promise<{ operationTypes: operation_types[]; total: number }> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 50;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (options?.specialty_id) where.specialty_id = options.specialty_id;
        if (options?.is_active !== undefined) where.is_active = options.is_active;

        try {
            const { rows, count } = await models.operation_types.findAndCountAll({
                where,
                include: [{
                    model: models.specialties,
                    as: 'specialty',
                    attributes: ['id', 'name']
                }],
                offset,
                limit,
                order: [['name', 'ASC']]
            });

            return { operationTypes: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string): Promise<operation_types | null> {
        try {
            return await models.operation_types.findByPk(id, {
                include: [{
                    model: models.specialties,
                    as: 'specialty',
                    attributes: ['id', 'name']
                }]
            });
        } catch (error) {
            throw error;
        }
    }

    async findByCode(code: string): Promise<operation_types | null> {
        try {
            return await models.operation_types.findOne({
                where: { code }
            });
        } catch (error) {
            throw error;
        }
    }

    async create(data: operation_typesCreationAttributes, t?: Transaction): Promise<operation_types> {
        try {
            const result = await models.operation_types.create(data, txOpt(t));
            return result;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, data: Partial<operation_typesCreationAttributes>, t?: Transaction): Promise<operation_types> {
        try {
            const instance = await models.operation_types.findByPk(id, txOpt(t));
            if (!instance) {
                throw new Error('Operation type not found');
            }
            await instance.update(data, txOpt(t));
            return instance;
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string, t?: Transaction): Promise<void> {
        try {
            const instance = await models.operation_types.findByPk(id, txOpt(t));
            if (!instance) {
                throw new Error('Operation type not found');
            }
            await instance.destroy(txOpt(t));
        } catch (error) {
            throw error;
        }
    }
}
