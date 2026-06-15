import { Transaction } from 'sequelize';
import { operation_records, operation_recordsCreationAttributes } from '../../../../database/medical/operation_records';
import { models } from '../../../../database';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
    return t !== undefined ? { transaction: t } : {};
}

export class OperationRecordRepository {
    async findAll(options?: {
        page?: number;
        limit?: number;
        scheduled_operation_id?: string;
    }): Promise<{ records: operation_records[]; total: number }> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (options?.scheduled_operation_id) {
            where.scheduled_operation_id = options.scheduled_operation_id;
        }

        try {
            const { rows, count } = await models.operation_records.findAndCountAll({
                where,
                include: [
                    {
                        model: models.scheduled_operations,
                        as: 'scheduled_operation',
                        attributes: ['id', 'case_file_id', 'operation_type_id', 'scheduled_date']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ],
                offset,
                limit,
                order: [['actual_start_time', 'DESC']]
            });

            return { records: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string): Promise<operation_records | null> {
        try {
            return await models.operation_records.findByPk(id, {
                include: [
                    {
                        model: models.scheduled_operations,
                        as: 'scheduled_operation',
                        attributes: ['id', 'case_file_id', 'operation_type_id', 'scheduled_date']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    async findByScheduledOperationId(scheduledOperationId: string): Promise<operation_records | null> {
        try {
            return await models.operation_records.findOne({
                where: { scheduled_operation_id: scheduledOperationId },
                include: [
                    {
                        model: models.scheduled_operations,
                        as: 'scheduled_operation',
                        attributes: ['id', 'case_file_id', 'operation_type_id', 'scheduled_date']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    async create(data: operation_recordsCreationAttributes, t?: Transaction): Promise<operation_records> {
        try {
            const result = await models.operation_records.create(data, txOpt(t));
            return result;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, data: Partial<operation_recordsCreationAttributes>, t?: Transaction): Promise<operation_records> {
        try {
            const instance = await models.operation_records.findByPk(id, txOpt(t));
            if (!instance) {
                throw new Error('Operation record not found');
            }
            await instance.update(data, txOpt(t));
            return instance;
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string, t?: Transaction): Promise<void> {
        try {
            const instance = await models.operation_records.findByPk(id, txOpt(t));
            if (!instance) {
                throw new Error('Operation record not found');
            }
            await instance.destroy(txOpt(t));
        } catch (error) {
            throw error;
        }
    }
}
