import { OperationTypeRepository } from '../../repositories/medical-repositories/operation-type.repository';
import { CreateOperationTypeRequest, UpdateOperationTypeRequest, OperationTypeResponse } from '../../dtos/medical-dtos/operation-type.dto';

export class OperationTypeService {
    private repository: OperationTypeRepository;

    constructor() {
        this.repository = new OperationTypeRepository();
    }

    async getAll(options?: {
        page?: number;
        limit?: number;
        specialty_id?: string;
        is_active?: boolean;
    }): Promise<{ data: OperationTypeResponse[]; page: number; limit: number; total: number }> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 50;

        const { operationTypes, total } = await this.repository.findAll(options);

        const data = operationTypes.map(op => this.transformToResponse(op));

        return { data, page, limit, total };
    }

    async getById(id: string): Promise<OperationTypeResponse> {
        const operationType = await this.repository.findById(id);
        if (!operationType) {
            throw new Error('Tipo de operación no encontrado');
        }
        return this.transformToResponse(operationType);
    }

    async create(data: CreateOperationTypeRequest): Promise<OperationTypeResponse> {
        const existing = await this.repository.findByCode(data.code);
        if (existing) {
            throw new Error('Ya existe un tipo de operación con este código');
        }

        const createData: any = {
            code: data.code,
            name: data.name,
            complexity: data.complexity,
            base_cost: data.base_cost,
            is_active: true
        };

        if (data.description !== undefined) createData.description = data.description;
        if (data.specialty_id !== undefined) createData.specialty_id = data.specialty_id;
        if (data.estimated_duration_minutes !== undefined) createData.estimated_duration_minutes = data.estimated_duration_minutes;
        if (data.anesthesia_required !== undefined) createData.anesthesia_required = data.anesthesia_required;
        if (data.pre_operative_requirements !== undefined) createData.pre_operative_requirements = data.pre_operative_requirements;
        if (data.post_operative_care !== undefined) createData.post_operative_care = data.post_operative_care;

        const operationType = await this.repository.create(createData);

        return this.transformToResponse(operationType);
    }

    async update(id: string, data: UpdateOperationTypeRequest): Promise<OperationTypeResponse> {
        const updateData: any = {};
        if (data.code !== undefined) updateData.code = data.code;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.specialty_id !== undefined) updateData.specialty_id = data.specialty_id;
        if (data.complexity !== undefined) updateData.complexity = data.complexity;
        if (data.estimated_duration_minutes !== undefined) updateData.estimated_duration_minutes = data.estimated_duration_minutes;
        if (data.base_cost !== undefined) updateData.base_cost = data.base_cost;
        if (data.anesthesia_required !== undefined) updateData.anesthesia_required = data.anesthesia_required;
        if (data.pre_operative_requirements !== undefined) updateData.pre_operative_requirements = data.pre_operative_requirements;
        if (data.post_operative_care !== undefined) updateData.post_operative_care = data.post_operative_care;
        if (data.is_active !== undefined) updateData.is_active = data.is_active;

        const operationType = await this.repository.update(id, updateData);
        return this.transformToResponse(operationType);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    private transformToResponse(op: any): OperationTypeResponse {
        return {
            id: op.id,
            code: op.code,
            name: op.name,
            description: op.description ?? null,
            specialty_id: op.specialty_id ?? null,
            specialty: op.specialty ? {
                id: op.specialty.id,
                name: op.specialty.name
            } : null,
            complexity: op.complexity,
            estimated_duration_minutes: op.estimated_duration_minutes ?? null,
            base_cost: parseFloat(op.base_cost) || 0,
            anesthesia_required: op.anesthesia_required ?? null,
            pre_operative_requirements: op.pre_operative_requirements ?? null,
            post_operative_care: op.post_operative_care ?? null,
            is_active: op.is_active ?? null,
            created_at: op.created_at
        };
    }
}
