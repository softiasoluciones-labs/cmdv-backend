import { Request, Response } from 'express';
import { ServiceService } from '../../services/medical-services/service-service';
import { ServicesRequest } from '../../dtos/medical-dtos/services-dto';

export class ServiceController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
            const search = req.query.search as string | undefined;

            const filters: any = {};

            if (search) {
                filters.search = search;
            }

            if (req.query.service_type_id) {
                filters.service_type_id = req.query.service_type_id as string;
            }

            if (req.query.is_active !== undefined) {
                filters.is_active = req.query.is_active === 'true' || req.query.is_active === '1';
            }

            if (req.query.code) {
                filters.code = req.query.code as string;
            }

            const result = await ServiceService.getAllServices(filters, page, limit);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Services retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('Error retrieving services:', error);
            res.status(500).json({
                success: false,
                code: 500,
                message: 'Failed to retrieve services',
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Service ID is required');
            }

            const service = await ServiceService.getServiceById(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Service retrieved successfully',
                data: service
            });
        } catch (error) {
            console.error('Error retrieving service:', error);
            const statusCode = error instanceof Error && error.message === 'Service not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Failed to retrieve service',
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const {
                code,
                name,
                service_type_id,
                description,
                base_price,
                estimated_duration_minutes,
                requires_preparation,
                preparation_instructions,
                is_active
            } = req.body;

            if (!code || !name || !service_type_id || base_price === undefined) {
                res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'code, name, service_type_id, and base_price are required',
                });
                return;
            }

            const serviceData: ServicesRequest = {
                code,
                name,
                service_type_id,
                description,
                base_price,
                estimated_duration_minutes,
                requires_preparation,
                preparation_instructions,
                is_active
            };

            const service = await ServiceService.createService(serviceData, userId);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Service created successfully',
                data: service
            });
        } catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({
                success: false,
                code: 500,
                message: 'Failed to create service',
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const { id: serviceId } = req.params;
            const {
                description,
                base_price,
                estimated_duration_minutes,
                requires_preparation,
                preparation_instructions,
                is_active
            } = req.body;

            if (!serviceId) {
                res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'Service ID is required',
                });
                return;
            }

            const updateData: any = {};

            if (description !== undefined) updateData.description = description;
            if (base_price !== undefined) updateData.base_price = base_price;
            if (estimated_duration_minutes !== undefined) updateData.estimated_duration_minutes = estimated_duration_minutes;
            if (requires_preparation !== undefined) updateData.requires_preparation = requires_preparation;
            if (preparation_instructions !== undefined) updateData.preparation_instructions = preparation_instructions;
            if (is_active !== undefined) updateData.is_active = is_active;

            const service = await ServiceService.updateService(serviceId, updateData);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Service updated successfully',
                data: service
            });
        } catch (error) {
            console.error('Error updating service:', error);
            const statusCode = error instanceof Error && error.message === 'Service not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Failed to update service',
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id: serviceId } = req.params;

            if (!serviceId) {
                res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'Service ID is required',
                });
                return;
            }

            await ServiceService.deleteService(serviceId);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Service deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting service:', error);
            const statusCode = error instanceof Error && error.message === 'Service not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Failed to delete service',
            });
        }
    }
}