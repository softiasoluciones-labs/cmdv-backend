import { AdmissionTypeRepository } from '../../repositories/medical-repositories/admission-type-repository';
import { AdmissionTypeResponse, AdmissionTypeListResponse, CreateAdmissionTypeRequest, UpdateAdmissionTypeRequest, AdmissionCategory } from '../../dtos/medical-dtos/admission-type.dto';
//import { AdmissionTypeValidator } from '../../validators/medical-validators/admission-type.validator';
import { admission_types } from '../../../../database/medical/admission_types';

/**
 * Service for admission types business logic
 */
export class AdmissionTypeService {
    /*private repository: AdmissionTypeRepository;

    constructor() {
        this.repository = new AdmissionTypeRepository();
    }*/

    /**
     * Convert database model to full response DTO
     */
    static toResponse(type: admission_types): AdmissionTypeResponse {
        return {
            id: type.id,
            code: type.code,
            name: type.name,
            requires_hospitalization: type.requires_hospitalization,
            requires_package: type.requires_package,
            allows_transfer: type.allows_transfer,
            requires_immediate_payment: type.requires_immediate_payment,
            ...(type.category !== undefined && { category: type.category as AdmissionCategory }),
            ...(type.description && { description: type.description }),
            is_active: type.is_active ?? true,
            created_at: type.created_at!,
            updated_at: type.updated_at!
        };
    }

    /**
     * Convert database model to list response DTO
     */
    static toListResponse(type: admission_types): AdmissionTypeListResponse {
        return {
            id: type.id,
            code: type.code,
            name: type.name,
            ...(type.category !== undefined && { category: type.category as AdmissionCategory }),
            requires_hospitalization: type.requires_hospitalization,
            requires_package: type.requires_package,
            is_active: type.is_active ?? true
        };
    }

    /**
     * Get all admission types with optional filtering
     */
    static async getAllAdmissionTypes(filters?: {
        is_active?: boolean;
        category?: AdmissionCategory;
    }): Promise<AdmissionTypeListResponse[]> {
        const types = await AdmissionTypeRepository.findAll(filters);
        return types.map(type => this.toListResponse(type));
    }

    /**
     * Get admission type by ID
     */
    static async getAdmissionTypeById(id: string): Promise<AdmissionTypeResponse> {
        const admissionType = await AdmissionTypeRepository.findById(id);

        if (!admissionType) {
            throw new Error(`Admission type with ID ${id} not found`);
        }

        return this.toResponse(admissionType);
    }

    /**
     * Get admission type by code
     */
    static async getAdmissionTypeByCode(code: string): Promise<AdmissionTypeResponse> {
        const admissionType = await AdmissionTypeRepository.findByCode(code);

        if (!admissionType) {
            throw new Error(`Admission type with code ${code} not found`);
        }

        return this.toResponse(admissionType);
    }

    /**
     * Create new admission type
     */
    static async createAdmissionType(data: CreateAdmissionTypeRequest): Promise<AdmissionTypeResponse> {
        // Validate code format
        /*const codeValidation = AdmissionTypeValidator.validateCode(data.code);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.message);
        }

        // Validate category
        const categoryValidation = AdmissionTypeValidator.validateCategory(data.category);
        if (!categoryValidation.valid) {
            throw new Error(categoryValidation.message);
        }

        // Validate business logic
        const businessValidation = AdmissionTypeValidator.validateBusinessLogic(data);
        if (!businessValidation.valid) {
            throw new Error(businessValidation.message);
        }*/

        // Check if code already exists
        const codeExists = await AdmissionTypeRepository.codeExists(data.code);
        if (codeExists) {
            throw new Error(`Admission type with code ${data.code} already exists`);
        }

        const type = await AdmissionTypeRepository.create(data);
        return AdmissionTypeService.toResponse(type);
    }

    /**
     * Update admission type
     */
    static async updateAdmissionType(id: string, data: UpdateAdmissionTypeRequest): Promise<AdmissionTypeResponse> {
        // Validate code format if provided
        /*if (data.code) {
            const codeValidation = AdmissionTypeValidator.validateCode(data.code);
            if (!codeValidation.valid) {
                throw new Error(codeValidation.message);
            }

            // Check if code already exists (excluding current record)
            const codeExists = await AdmissionTypeRepository.codeExists(data.code, id);
            if (codeExists) {
                throw new Error(`Admission type with code ${data.code} already exists`);
            }
        }

        // Validate category if provided
        if (data.category) {
            const categoryValidation = AdmissionTypeValidator.validateCategory(data.category);
            if (!categoryValidation.valid) {
                throw new Error(categoryValidation.message);
            }
        }

        // Validate business logic
        const businessValidation = AdmissionTypeValidator.validateBusinessLogic(data);
        if (!businessValidation.valid) {
            throw new Error(businessValidation.message);
        }*/

        const updated = await AdmissionTypeRepository.update(id, data as unknown as Record<string, unknown>);

        if (!updated) {
            throw new Error(`Admission type with ID ${id} not found`);
        }

        return AdmissionTypeService.toResponse(updated);
    }

    /**
     * Delete admission type (soft delete)
     */
    static async deleteAdmissionType(id: string): Promise<void> {
        const deleted = await AdmissionTypeRepository.delete(id);

        if (!deleted) {
            throw new Error(`Admission type with ID ${id} not found`);
        }
    }

    /**
     * Get active admission types grouped by category
     */
    static async getAdmissionTypesGroupedByCategory(): Promise<Record<string, AdmissionTypeListResponse[]>> {
        const types = await AdmissionTypeRepository.findAll({ is_active: true });

        const grouped: Record<string, AdmissionTypeListResponse[]> = {
            E: [],
            P: [],
            NULL: []
        };

        types.forEach(type => {
            const listResponse = AdmissionTypeService.toListResponse(type);
            const category = listResponse.category || 'NULL';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(listResponse);
        });

        return grouped;
    }

    /**
     * Get admission type rules for UI
     * Returns simplified object with just the rules
     */
    static async getAdmissionTypeRules(id: string): Promise<{
        requires_hospitalization: boolean;
        requires_package: boolean;
        allows_transfer: boolean;
        requires_immediate_payment: boolean;
    }> {
        const admissionType = await AdmissionTypeService.getAdmissionTypeById(id);

        return {
            requires_hospitalization: admissionType.requires_hospitalization,
            requires_package: admissionType.requires_package,
            allows_transfer: admissionType.allows_transfer,
            requires_immediate_payment: admissionType.requires_immediate_payment
        };
    }
}
