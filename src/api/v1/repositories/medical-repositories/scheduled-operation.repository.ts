import { Transaction } from 'sequelize';
import { scheduled_operations } from '../../../../database/medical/scheduled_operations';
import { operation_team } from '../../../../database/medical/operation_team';
import { models } from '../../../../database';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { ScheduledOperationStatus, OperationTeamRole } from '../../dtos/medical-dtos/scheduled-operation.dto';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
    return t !== undefined ? { transaction: t } : {};
}

export class ScheduledOperationRepository {
    async findAll(options?: {
        page?: number;
        limit?: number;
        case_file_id?: string;
        status?: ScheduledOperationStatus;
        from_date?: Date;
        to_date?: Date;
    }): Promise<{ operations: scheduled_operations[]; total: number }> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (options?.case_file_id) where.case_file_id = options.case_file_id;
        if (options?.status) where.status = options.status;

        if (options?.from_date || options?.to_date) {
            where.scheduled_date = {};
            if (options.from_date) where.scheduled_date[Symbol.for('gte')] = options.from_date;
            if (options.to_date) where.scheduled_date[Symbol.for('lte')] = options.to_date;
        }

        try {
            const { rows, count } = await models.scheduled_operations.findAndCountAll({
                where,
                include: [
                    {
                        model: models.case_files,
                        as: 'case_file',
                        include: [{
                            model: models.patients,
                            as: 'patient',
                            attributes: ['id', 'file_number', 'first_name', 'last_name']
                        }]
                    },
                    {
                        model: models.operation_types,
                        as: 'operation_type',
                        attributes: ['id', 'code', 'name', 'complexity']
                    },
                    {
                        model: models.doctors,
                        as: 'primary_surgeon',
                        attributes: ['id', 'specialty_id'],
                        include: [{
                            model: models.users,
                            as: 'user',
                            attributes: ['id', 'first_name', 'last_name']
                        }]
                    },
                    {
                        model: models.doctors,
                        as: 'anesthesiologist',
                        attributes: ['id'],
                        include: [{
                            model: models.users,
                            as: 'user',
                            attributes: ['id', 'first_name', 'last_name']
                        }]
                    },
                    {
                        model: models.operation_team,
                        as: 'operation_teams',
                        include: [{
                            model: models.doctors,
                            as: 'doctor',
                            attributes: ['id'],
                            include: [{
                                model: models.users,
                                as: 'user',
                                attributes: ['id', 'first_name', 'last_name']
                            }]
                        }]
                    }
                ],
                limit,
                offset,
                order: [['scheduled_date', 'ASC']]
            });

            return { operations: rows, total: count };
        } catch (error: any) {
            secureLogger.error('Error finding scheduled operations: ' + error);
            throw new Error('Failed to retrieve scheduled operations');
        }
    }

    async findById(id: string): Promise<scheduled_operations> {
        const operation = await models.scheduled_operations.findByPk(id, {
            include: [
                {
                    model: models.case_files,
                    as: 'case_file',
                    include: [{
                        model: models.patients,
                        as: 'patient',
                        attributes: ['id', 'file_number', 'first_name', 'last_name']
                    }]
                },
                {
                    model: models.operation_types,
                    as: 'operation_type',
                    attributes: ['id', 'code', 'name', 'complexity']
                },
                {
                    model: models.doctors,
                    as: 'primary_surgeon',
                    attributes: ['id', 'specialty_id'],
                    include: [{
                        model: models.users,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name']
                    }]
                },
                {
                    model: models.doctors,
                    as: 'anesthesiologist',
                    attributes: ['id'],
                    include: [{
                        model: models.users,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name']
                    }]
                },
                {
                    model: models.operation_team,
                    as: 'operation_teams',
                    include: [{
                        model: models.doctors,
                        as: 'doctor',
                        attributes: ['id'],
                        include: [{
                            model: models.users,
                            as: 'user',
                            attributes: ['id', 'first_name', 'last_name']
                        }]
                    }]
                }
            ]
        });

        if (!operation) {
            throw new Error('Scheduled operation not found');
        }

        return operation;
    }

    async findByCaseFileId(caseFileId: string): Promise<scheduled_operations[]> {
        const operations = await models.scheduled_operations.findAll({
            where: { case_file_id: caseFileId },
            include: [
                {
                    model: models.operation_types,
                    as: 'operation_type',
                    attributes: ['id', 'code', 'name']
                },
                {
                    model: models.doctors,
                    as: 'primary_surgeon',
                    attributes: ['id'],
                    include: [{
                        model: models.users,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name']
                    }]
                }
            ],
            order: [['scheduled_date', 'ASC']]
        });

        return operations;
    }

    async create(data: {
        case_file_id: string;
        operation_type_id: string;
        primary_surgeon_id: string;
        anesthesiologist_id?: string;
        scheduled_date: Date;
        estimated_duration_minutes: number;
        operating_room?: string;
        pre_operative_notes?: string;
    }, transaction?: Transaction): Promise<scheduled_operations> {
        try {
            const operation = await models.scheduled_operations.create({
                case_file_id: data.case_file_id,
                operation_type_id: data.operation_type_id,
                primary_surgeon_id: data.primary_surgeon_id,
                ...(data.anesthesiologist_id !== undefined && { anesthesiologist_id: data.anesthesiologist_id }),
                scheduled_date: data.scheduled_date,
                estimated_duration_minutes: data.estimated_duration_minutes,
                ...(data.operating_room !== undefined && { operating_room: data.operating_room }),
                ...(data.pre_operative_notes !== undefined && { pre_operative_notes: data.pre_operative_notes }),
                status: ScheduledOperationStatus.SCHEDULED
            }, txOpt(transaction));

            return operation;
        } catch (error: any) {
            secureLogger.error('Error creating scheduled operation: ' + error);
            throw new Error('Failed to create scheduled operation');
        }
    }

    async update(id: string, data: {
        scheduled_date?: Date;
        estimated_duration_minutes?: number;
        operating_room?: string;
        pre_operative_notes?: string;
        status?: ScheduledOperationStatus;
    }, transaction?: Transaction): Promise<scheduled_operations> {
        const operation = await this.findById(id);

        const updateData: any = {};
        if (data.scheduled_date !== undefined) updateData.scheduled_date = data.scheduled_date;
        if (data.estimated_duration_minutes !== undefined) updateData.estimated_duration_minutes = data.estimated_duration_minutes;
        if (data.operating_room !== undefined) updateData.operating_room = data.operating_room;
        if (data.pre_operative_notes !== undefined) updateData.pre_operative_notes = data.pre_operative_notes;
        if (data.status !== undefined) updateData.status = data.status;

        try {
            await operation.update(updateData, txOpt(transaction));
            return operation;
        } catch (error: any) {
            secureLogger.error('Error updating scheduled operation: ' + error);
            throw new Error('Failed to update scheduled operation');
        }
    }

    async updateStatus(id: string, status: ScheduledOperationStatus, transaction?: Transaction): Promise<scheduled_operations> {
        const operation = await this.findById(id);

        try {
            await operation.update({ status }, txOpt(transaction));
            return operation;
        } catch (error: any) {
            secureLogger.error('Error updating scheduled operation status: ' + error);
            throw new Error('Failed to update scheduled operation status');
        }
    }

    async delete(id: string, transaction?: Transaction): Promise<void> {
        const operation = await this.findById(id);

        try {
            await operation.destroy(txOpt(transaction));
        } catch (error: any) {
            secureLogger.error('Error deleting scheduled operation: ' + error);
            throw new Error('Failed to delete scheduled operation');
        }
    }

    async addTeamMember(scheduledOperationId: string, data: {
        doctor_id: string;
        role: OperationTeamRole;
    }, transaction?: Transaction): Promise<operation_team> {
        try {
            const member = await models.operation_team.create({
                scheduled_operation_id: scheduledOperationId,
                doctor_id: data.doctor_id,
                role: data.role
            }, txOpt(transaction));

            return member;
        } catch (error: any) {
            secureLogger.error('Error adding operation team member: ' + error);
            throw new Error('Failed to add operation team member');
        }
    }

    async removeTeamMember(memberId: string, transaction?: Transaction): Promise<void> {
        const member = await models.operation_team.findByPk(memberId);

        if (!member) {
            throw new Error('Operation team member not found');
        }

        try {
            await member.destroy(txOpt(transaction));
        } catch (error: any) {
            secureLogger.error('Error removing operation team member: ' + error);
            throw new Error('Failed to remove operation team member');
        }
    }

    async getTeamMembers(scheduledOperationId: string): Promise<operation_team[]> {
        const members = await models.operation_team.findAll({
            where: { scheduled_operation_id: scheduledOperationId },
            include: [{
                model: models.doctors,
                as: 'doctor',
                attributes: ['id', 'specialty_id'],
                include: [{
                    model: models.users,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name']
                }]
            }]
        });

        return members;
    }
}