import { ServiceRepository } from '../../repositories/medical-repositories/service-repository';
import { ServicesRequest, ServiceResponse, ServiceListFilters, ServiceTypeResponse } from '../../dtos/medical-dtos/services-dto';
import { services } from '../../../../database/medical/services';

export class ServiceService {
    /**
     * Convert service model to response DTO
     */
    private static toServiceResponse(service: services): ServiceResponse {
        const response: ServiceResponse = {
            id: service.id,
            code: service.code,
            name: service.name,
            service_type_id: service.service_type_id,
            description: service.description,
            base_price: service.base_price,
            estimated_duration_minutes: service.estimated_duration_minutes,
            requires_preparation: service.requires_preparation,
            preparation_instructions: service.preparation_instructions,
            is_active: service.is_active,
            created_at: service.created_at,
            use_doctor_consultation_fee: service.use_doctor_consultation_fee
        };

        if (service.service_type) {
            response.service_type = {
                id: service.service_type.id,
                name: service.service_type.name,
                code: service.service_type.code,
                description: service.service_type.description,
                is_active: service.service_type.is_active
            };
        }

        return response;
    }

    /**
     * Get all services with filters
     */
    static async getAllServices(filters: ServiceListFilters, page: number = 1, limit: number = 50): Promise<{ services: ServiceResponse[], total: number, page: number, totalPages: number }> {
        const result = await ServiceRepository.findAll(filters, page, limit);

        return {
            services: result.services.map(s => this.toServiceResponse(s)),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    /**
     * Get service by ID
     */
    static async getServiceById(id: string): Promise<ServiceResponse> {
        const service = await ServiceRepository.findById(id);
        if (!service) throw new Error('Service not found');
        return this.toServiceResponse(service);
    }

    /**
     * Create new service
     */
    static async createService(data: ServicesRequest, userId?: string): Promise<ServiceResponse> {
        const serviceData: any = {
            code: data.code,
            name: data.name,
            service_type_id: data.service_type_id,
            base_price: data.base_price,
        };

        if (data.description) serviceData.description = data.description;
        if (data.estimated_duration_minutes !== undefined) serviceData.estimated_duration_minutes = data.estimated_duration_minutes;
        if (data.requires_preparation !== undefined) serviceData.requires_preparation = data.requires_preparation;
        if (data.preparation_instructions) serviceData.preparation_instructions = data.preparation_instructions;
        if (data.is_active !== undefined) serviceData.is_active = data.is_active;

        const service = await ServiceRepository.create(serviceData, userId);
        return this.toServiceResponse(service);
    }

    /**
     * Update service
     */
    static async updateService(id: string, data: Partial<ServicesRequest>): Promise<ServiceResponse> {
        const service = await ServiceRepository.findById(id);
        if (!service) throw new Error('Service not found');

        const updateData: any = {};

        if (data.description !== undefined) updateData.description = data.description;
        if (data.base_price !== undefined) updateData.base_price = data.base_price;
        if (data.estimated_duration_minutes !== undefined) updateData.estimated_duration_minutes = data.estimated_duration_minutes;
        if (data.requires_preparation !== undefined) updateData.requires_preparation = data.requires_preparation;
        if (data.preparation_instructions !== undefined) updateData.preparation_instructions = data.preparation_instructions;
        if (data.is_active !== undefined) updateData.is_active = data.is_active;

        const updated = await ServiceRepository.update(id, updateData);
        if (!updated) throw new Error('Failed to update service');

        const updatedService = await ServiceRepository.findById(id);
        if (!updatedService) throw new Error('Service not found');
        return this.toServiceResponse(updatedService);
    }

    /**
     * Delete service (soft delete)
     */
    static async deleteService(id: string): Promise<void> {
        const service = await ServiceRepository.findById(id);
        if (!service) throw new Error('Service not found');

        const deleted = await ServiceRepository.delete(id);
        if (!deleted) throw new Error('Failed to delete service');
    }
}