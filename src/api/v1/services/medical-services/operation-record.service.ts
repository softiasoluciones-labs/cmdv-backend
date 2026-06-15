import { OperationRecordRepository } from '../../repositories/medical-repositories/operation-record.repository';
import { CreateOperationRecordRequest, UpdateOperationRecordRequest, OperationRecordResponse } from '../../dtos/medical-dtos/operation-record.dto';

export class OperationRecordService {
    private repository: OperationRecordRepository;

    constructor() {
        this.repository = new OperationRecordRepository();
    }

    async getAll(options?: {
        page?: number;
        limit?: number;
        scheduled_operation_id?: string;
    }): Promise<{ data: OperationRecordResponse[]; page: number; limit: number; total: number }> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;

        const { records, total } = await this.repository.findAll(options);

        const data = records.map(record => this.transformToResponse(record));

        return { data, page, limit, total };
    }

    async getById(id: string): Promise<OperationRecordResponse> {
        const record = await this.repository.findById(id);
        if (!record) {
            throw new Error('Registro de operación no encontrado');
        }
        return this.transformToResponse(record);
    }

    async getByScheduledOperationId(scheduledOperationId: string): Promise<OperationRecordResponse | null> {
        const record = await this.repository.findByScheduledOperationId(scheduledOperationId);
        if (!record) {
            return null;
        }
        return this.transformToResponse(record);
    }

    async create(data: CreateOperationRecordRequest, userId?: string): Promise<OperationRecordResponse> {
        const existing = await this.repository.findByScheduledOperationId(data.scheduled_operation_id);
        if (existing) {
            throw new Error('Ya existe un registro para esta operación');
        }

        const createData: any = {
            scheduled_operation_id: data.scheduled_operation_id,
            actual_start_time: data.actual_start_time,
            actual_end_time: data.actual_end_time,
            procedure_performed: data.procedure_performed,
        };

        if (data.anesthesia_type !== undefined) createData.anesthesia_type = data.anesthesia_type;
        if (data.findings !== undefined) createData.findings = data.findings;
        if (data.complications !== undefined) createData.complications = data.complications;
        if (data.blood_loss_ml !== undefined) createData.blood_loss_ml = data.blood_loss_ml;
        if (data.specimens_sent !== undefined) createData.specimens_sent = data.specimens_sent;
        if (data.post_operative_orders !== undefined) createData.post_operative_orders = data.post_operative_orders;
        if (userId !== undefined) createData.created_by = userId;

        const record = await this.repository.create(createData);

        return this.transformToResponse(record);
    }

    async update(id: string, data: UpdateOperationRecordRequest): Promise<OperationRecordResponse> {
        const updateData: any = {};
        if (data.actual_start_time !== undefined) updateData.actual_start_time = data.actual_start_time;
        if (data.actual_end_time !== undefined) updateData.actual_end_time = data.actual_end_time;
        if (data.anesthesia_type !== undefined) updateData.anesthesia_type = data.anesthesia_type;
        if (data.procedure_performed !== undefined) updateData.procedure_performed = data.procedure_performed;
        if (data.findings !== undefined) updateData.findings = data.findings;
        if (data.complications !== undefined) updateData.complications = data.complications;
        if (data.blood_loss_ml !== undefined) updateData.blood_loss_ml = data.blood_loss_ml;
        if (data.specimens_sent !== undefined) updateData.specimens_sent = data.specimens_sent;
        if (data.post_operative_orders !== undefined) updateData.post_operative_orders = data.post_operative_orders;

        const record = await this.repository.update(id, updateData);
        return this.transformToResponse(record);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    private transformToResponse(record: any): OperationRecordResponse {
        return {
            id: record.id,
            scheduled_operation_id: record.scheduled_operation_id,
            scheduled_operation: record.scheduled_operation ? {
                id: record.scheduled_operation.id,
                case_file_id: record.scheduled_operation.case_file_id,
                operation_type_id: record.scheduled_operation.operation_type_id,
                scheduled_date: record.scheduled_operation.scheduled_date
            } : null,
            actual_start_time: record.actual_start_time,
            actual_end_time: record.actual_end_time,
            anesthesia_type: record.anesthesia_type ?? null,
            procedure_performed: record.procedure_performed,
            findings: record.findings ?? null,
            complications: record.complications ?? null,
            blood_loss_ml: record.blood_loss_ml ?? null,
            specimens_sent: record.specimens_sent ?? null,
            post_operative_orders: record.post_operative_orders ?? null,
            created_at: record.created_at,
            created_by: record.created_by ?? null,
            created_by_user: record.created_by_user ? {
                id: record.created_by_user.id,
                first_name: record.created_by_user.first_name,
                last_name: record.created_by_user.last_name
            } : null
        };
    }
}
