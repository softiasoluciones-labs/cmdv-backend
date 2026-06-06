import { sequelize } from '../../../../database';
import { ScheduledOperationRepository } from '../../repositories/medical-repositories/scheduled-operation.repository';
import {
    ScheduledOperationResponse,
    ScheduledOperationListResponse,
    CreateScheduledOperationRequest,
    UpdateScheduledOperationRequest,
    UpdateScheduledOperationStatusRequest,
    AddOperationTeamMemberRequest,
    ScheduledOperationStatus
} from '../../dtos/medical-dtos/scheduled-operation.dto';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { case_files } from '../../../../database/medical/case_files';
import { doctors } from '../../../../database/medical/doctors';
import { operation_types } from '../../../../database/medical/operation_types';

export class ScheduledOperationService {
    constructor(private readonly repository: ScheduledOperationRepository) {}

    async getAllOperations(options?: {
        page?: number;
        limit?: number;
        case_file_id?: string;
        status?: ScheduledOperationStatus;
        from_date?: Date;
        to_date?: Date;
    }): Promise<{ operations: ScheduledOperationListResponse[]; total: number; page: number; totalPages: number }> {
        const result = await this.repository.findAll(options);
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;

        return {
            operations: result.operations.map(ScheduledOperationService.toResponse),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    async getOperationById(id: string): Promise<ScheduledOperationResponse> {
        const operation = await this.repository.findById(id);
        return ScheduledOperationService.toResponse(operation);
    }

    async getOperationsByCaseFileId(caseFileId: string): Promise<ScheduledOperationResponse[]> {
        const operations = await this.repository.findByCaseFileId(caseFileId);
        return operations.map(ScheduledOperationService.toResponse);
    }

    async createOperation(data: CreateScheduledOperationRequest): Promise<ScheduledOperationResponse> {
        const caseFile = await this.validateCaseFile(data.case_file_id);
        const operationType = await this.validateOperationType(data.operation_type_id);
        const surgeon = await this.validateDoctor(data.primary_surgeon_id, 'Primary surgeon');

        if (data.anesthesiologist_id) {
            await this.validateDoctor(data.anesthesiologist_id, 'Anesthesiologist');
        }

        if (data.scheduled_date < new Date()) {
            throw new Error('Scheduled date cannot be in the past');
        }

        const operation = await sequelize.transaction(async (t) => {
            return await this.repository.create(data, t);
        });

        secureLogger.info(`Scheduled operation created: ${operation.id}`);
        return ScheduledOperationService.toResponse(operation);
    }

    async updateOperation(id: string, data: UpdateScheduledOperationRequest): Promise<ScheduledOperationResponse> {
        const existing = await this.repository.findById(id);

        if (existing.status === ScheduledOperationStatus.COMPLETED) {
            throw new Error('Cannot update a completed operation');
        }

        if (existing.status === ScheduledOperationStatus.CANCELLED) {
            throw new Error('Cannot update a cancelled operation');
        }

        if (data.scheduled_date && data.scheduled_date < new Date()) {
            throw new Error('Scheduled date cannot be in the past');
        }

        const operation = await sequelize.transaction(async (t) => {
            return await this.repository.update(id, data, t);
        });

        secureLogger.info(`Scheduled operation updated: ${operation.id}`);
        return ScheduledOperationService.toResponse(operation);
    }

    async updateOperationStatus(id: string, data: UpdateScheduledOperationStatusRequest): Promise<ScheduledOperationResponse> {
        const existing = await this.repository.findById(id);

        if (!existing.status) {
            throw new Error('Operation status is undefined');
        }
        this.validateStatusTransition(existing.status, data.status);

        const operation = await sequelize.transaction(async (t) => {
            return await this.repository.updateStatus(id, data.status, t);
        });

        secureLogger.info(`Scheduled operation status updated: ${operation.id} -> ${data.status}`);
        return ScheduledOperationService.toResponse(operation);
    }

    async deleteOperation(id: string): Promise<void> {
        const existing = await this.repository.findById(id);

        if (existing.status === ScheduledOperationStatus.IN_PROGRESS) {
            throw new Error('Cannot delete an operation that is in progress');
        }

        if (existing.status === ScheduledOperationStatus.COMPLETED) {
            throw new Error('Cannot delete a completed operation');
        }

        await sequelize.transaction(async (t) => {
            await this.repository.delete(id, t);
        });

        secureLogger.info(`Scheduled operation deleted: ${id}`);
    }

    async addTeamMember(operationId: string, data: AddOperationTeamMemberRequest): Promise<any> {
        const operation = await this.repository.findById(operationId);

        if (operation.status === ScheduledOperationStatus.COMPLETED) {
            throw new Error('Cannot add team members to a completed operation');
        }

        if (operation.status === ScheduledOperationStatus.CANCELLED) {
            throw new Error('Cannot add team members to a cancelled operation');
        }

        await this.validateDoctor(data.doctor_id, 'Team member');

        const member = await sequelize.transaction(async (t) => {
            return await this.repository.addTeamMember(operationId, data, t);
        });

        secureLogger.info(`Team member added to operation ${operationId}: ${data.doctor_id}`);
        return member;
    }

    async removeTeamMember(operationId: string, memberId: string): Promise<void> {
        const operation = await this.repository.findById(operationId);

        if (operation.status === ScheduledOperationStatus.COMPLETED) {
            throw new Error('Cannot remove team members from a completed operation');
        }

        await sequelize.transaction(async (t) => {
            await this.repository.removeTeamMember(memberId, t);
        });

        secureLogger.info(`Team member removed from operation ${operationId}: ${memberId}`);
    }

    async getTeamMembers(operationId: string): Promise<any[]> {
        const members = await this.repository.getTeamMembers(operationId);
        return members.map(m => ({
            id: m.id,
            doctor_id: m.doctor_id,
            role: m.role,
            doctor: m.doctor ? {
                first_name: (m.doctor as any).user?.first_name ?? 'Unknown',
                last_name: (m.doctor as any).user?.last_name ?? 'Unknown',
                specialty: (m.doctor as any).specialty_id
            } : undefined
        }));
    }

    private async validateCaseFile(caseFileId: string): Promise<case_files> {
        const { models } = await import('../../../../database');
        const caseFile = await models.case_files.findByPk(caseFileId);
        if (!caseFile) {
            throw new Error(`Case file with ID ${caseFileId} not found`);
        }
        return caseFile;
    }

    private async validateOperationType(operationTypeId: string): Promise<operation_types> {
        const { models } = await import('../../../../database');
        const operationType = await models.operation_types.findByPk(operationTypeId);
        if (!operationType) {
            throw new Error(`Operation type with ID ${operationTypeId} not found`);
        }
        if (!operationType.is_active) {
            throw new Error(`Operation type "${operationType.name}" is not active`);
        }
        return operationType;
    }

    private async validateDoctor(doctorId: string, role: string): Promise<doctors> {
        const { models } = await import('../../../../database');
        const doctor = await models.doctors.findByPk(doctorId);
        if (!doctor) {
            throw new Error(`${role} with ID ${doctorId} not found`);
        }
        return doctor;
    }

    private validateStatusTransition(currentStatus: string, newStatus: ScheduledOperationStatus): void {
        const allowedTransitions: Record<string, ScheduledOperationStatus[]> = {
            [ScheduledOperationStatus.SCHEDULED]: [
                ScheduledOperationStatus.CONFIRMED,
                ScheduledOperationStatus.CANCELLED,
                ScheduledOperationStatus.POSTPONED
            ],
            [ScheduledOperationStatus.CONFIRMED]: [
                ScheduledOperationStatus.IN_PROGRESS,
                ScheduledOperationStatus.CANCELLED,
                ScheduledOperationStatus.POSTPONED
            ],
            [ScheduledOperationStatus.IN_PROGRESS]: [
                ScheduledOperationStatus.COMPLETED,
                ScheduledOperationStatus.CANCELLED
            ],
            [ScheduledOperationStatus.POSTPONED]: [
                ScheduledOperationStatus.SCHEDULED,
                ScheduledOperationStatus.CANCELLED
            ],
            [ScheduledOperationStatus.COMPLETED]: [],
            [ScheduledOperationStatus.CANCELLED]: []
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }

    private static toResponse(operation: any): ScheduledOperationResponse {
        const primarySurgeon = operation.primary_surgeon;
        const anesthesiologist = operation.anesthesiologist;

        return {
            id: operation.id,
            case_file_id: operation.case_file_id,
            ...(operation.case_file && {
                case_file: {
                    id: operation.case_file.id,
                    case_number: operation.case_file.case_number,
                    ...(operation.case_file.patient && {
                        patient: {
                            id: operation.case_file.patient.id,
                            file_number: operation.case_file.patient.file_number,
                            first_name: operation.case_file.patient.first_name,
                            last_name: operation.case_file.patient.last_name
                        }
                    })
                }
            }),
            operation_type_id: operation.operation_type_id,
            ...(operation.operation_type && {
                operation_type: {
                    id: operation.operation_type.id,
                    code: operation.operation_type.code,
                    name: operation.operation_type.name,
                    complexity: operation.operation_type.complexity
                }
            }),
            primary_surgeon_id: operation.primary_surgeon_id,
            ...(primarySurgeon && {
                primary_surgeon: {
                    id: primarySurgeon.id,
                    first_name: primarySurgeon.user?.first_name ?? 'Unknown',
                    last_name: primarySurgeon.user?.last_name ?? 'Unknown',
                    specialty: primarySurgeon.specialty_id
                }
            }),
            anesthesiologist_id: operation.anesthesiologist_id,
            ...(anesthesiologist && {
                anesthesiologist: {
                    id: anesthesiologist.id,
                    first_name: anesthesiologist.user?.first_name ?? 'Unknown',
                    last_name: anesthesiologist.user?.last_name ?? 'Unknown'
                }
            }),
            scheduled_date: operation.scheduled_date,
            estimated_duration_minutes: operation.estimated_duration_minutes,
            ...(operation.operating_room && { operating_room: operation.operating_room }),
            ...(operation.pre_operative_notes && { pre_operative_notes: operation.pre_operative_notes }),
            status: operation.status,
            ...(operation.operation_teams && {
                operation_teams: operation.operation_teams.map((t: any) => {
                    const teamDoctor = t.doctor;
                    return {
                        id: t.id,
                        doctor_id: t.doctor_id,
                        ...(teamDoctor && {
                            doctor: {
                                first_name: teamDoctor.user?.first_name ?? 'Unknown',
                                last_name: teamDoctor.user?.last_name ?? 'Unknown'
                            }
                        }),
                        role: t.role
                    };
                })
            }),
            created_at: operation.created_at,
            updated_at: operation.updated_at
        };
    }
}