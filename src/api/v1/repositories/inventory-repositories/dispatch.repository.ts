import { models, sequelize } from '../../../../database';
import { warehouse_dispatches, warehouse_dispatchesCreationAttributes } from '../../../../database/inventory/warehouse_dispatches';
import { warehouse_dispatch_details, warehouse_dispatch_detailsCreationAttributes } from '../../../../database/inventory/warehouse_dispatch_details';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { CreateOptions, Op, Transaction } from 'sequelize';
import crypto from 'crypto';

export class DispatchRepository {
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ dispatches: warehouse_dispatches[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};

            if (filters.sourceWarehouseId) {
                where.source_warehouse_id = filters.sourceWarehouseId;
            }

            if (filters.destinationWarehouseId) {
                where.destination_warehouse_id = filters.destinationWarehouseId;
            }

            if (filters.status) {
                if (Array.isArray(filters.status)) {
                    where.status = { [Op.in]: filters.status };
                } else {
                    where.status = filters.status;
                }
            }

            if (filters.dateFrom || filters.dateTo) {
                where.requested_date = {};
                if (filters.dateFrom) {
                    where.requested_date[Op.gte] = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    where.requested_date[Op.lte] = new Date(filters.dateTo + ' 23:59:59');
                }
            }

            const { rows, count } = await models.warehouse_dispatches.findAndCountAll({
                where,
                include: [
                    {
                        model: models.warehouses,
                        as: 'source_warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.warehouses,
                        as: 'destination_warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.users,
                        as: 'requester',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.users,
                        as: 'dispatched_by_user',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.warehouse_dispatch_details,
                        as: 'warehouse_dispatch_details',
                        include: [
                            {
                                model: models.products,
                                as: 'product',
                                attributes: ['id', 'name', 'code']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                order: [['requested_date', 'DESC']]
            });

            return { dispatches: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding dispatches:', error);
            throw new Error('Failed to retrieve dispatches');
        }
    }

    static async findById(id: string): Promise<warehouse_dispatches> {
        try {
            const dispatch = await models.warehouse_dispatches.findByPk(id, {
                include: [
                    {
                        model: models.warehouses,
                        as: 'source_warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.warehouses,
                        as: 'destination_warehouse',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: models.users,
                        as: 'requester',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.users,
                        as: 'created_by_user',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.users,
                        as: 'dispatched_by_user',
                        attributes: ['id', 'full_name']
                    },
                    {
                        model: models.warehouse_dispatch_details,
                        as: 'warehouse_dispatch_details',
                        include: [
                            {
                                model: models.products,
                                as: 'product',
                                attributes: ['id', 'name', 'code']
                            }
                        ]
                    }
                ]
            });
            if (!dispatch) {
                throw new Error('Dispatch not found');
            }
            return dispatch;
        } catch (error) {
            secureLogger.error('Error finding dispatch by ID:', error);
            throw new Error('Error finding dispatch by ID');
        }
    }

    static async create(dispatchData: warehouse_dispatchesCreationAttributes, details: warehouse_dispatch_detailsCreationAttributes[], transaction?: Transaction): Promise<warehouse_dispatches> {
        try {
            const dispatchNumber = await this.generateDispatchNumber();

            const createOptions: CreateOptions<warehouse_dispatchesCreationAttributes> = {};
            if (transaction) createOptions.transaction = transaction as any;

            const dispatch = await models.warehouse_dispatches.create(
                { ...dispatchData, dispatch_number: dispatchNumber },
                createOptions
            );

            for (const detail of details) {
                await models.warehouse_dispatch_details.create(
                    { ...detail, dispatch_id: dispatch.id },
                    { transaction: transaction as any }
                );
            }

            return dispatch;
        } catch (error) {
            secureLogger.error('Error creating dispatch:', error);
            throw new Error('Failed to create dispatch');
        }
    }

    static async updateStatus(id: string, status: string, dispatchedBy?: string, dispatchedAt?: Date, notes?: string, transaction?: Transaction): Promise<warehouse_dispatches> {
        try {
            const dispatch = await models.warehouse_dispatches.findByPk(id, { transaction: transaction as any });
            if (!dispatch) {
                throw new Error('Dispatch not found');
            }

            const updateData: any = { status };
            if (dispatchedBy) updateData.dispatched_by = dispatchedBy;
            if (dispatchedAt) updateData.dispatched_at = dispatchedAt;
            if (status === 'dispatched') updateData.dispatch_date = new Date();
            if (status === 'completed') updateData.completed_date = new Date();
            if (notes) updateData.notes = notes;

            await dispatch.update(updateData, { transaction: transaction as any });
            return dispatch;
        } catch (error) {
            secureLogger.error('Error updating dispatch status:', error);
            throw new Error('Failed to update dispatch status');
        }
    }

    static async generateDispatchNumber(): Promise<string> {
        const date = new Date();
        const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const unique = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `DSP-${datePart}-${unique}`;
    }

    static async delete(id: string): Promise<void> {
        try {
            const dispatch = await models.warehouse_dispatches.findByPk(id);
            if (!dispatch) {
                throw new Error('Dispatch not found');
            }

            await models.warehouse_dispatch_details.destroy({
                where: { dispatch_id: id }
            });

            await dispatch.destroy();
        } catch (error) {
            secureLogger.error('Error deleting dispatch:', error);
            throw new Error('Failed to delete dispatch');
        }
    }
}