import { models } from '../../../../database';
import { services, servicesCreationAttributes } from '../../../../database/medical/services';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Op } from 'sequelize';
import { ServiceListFilters } from '../../dtos/medical-dtos/services-dto';

/**
 * Service Repository
 * Handles all database operations for medical services
 */
export class ServiceRepository {
    /**
     * Find all services with optional filters
     */
    static async findAll(filters: ServiceListFilters = {}, page: number = 1, limit: number = 50): Promise<{ services: services[], total: number }> {
        try {
            const where: any = {};

            if (filters.search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${filters.search}%` } },
                    { code: { [Op.iLike]: `%${filters.search}%` } },
                    { description: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.service_type_id) {
                where.service_type_id = filters.service_type_id;
            }

            if (filters.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters.code) {
                where.code = filters.code;
            }

            const offset = (page - 1) * limit;

            const { rows, count } = await models.services.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [{
                    model: models.service_types,
                    as: 'service_type',
                    attributes: ['id', 'name', 'code']
                }]
            });

            return { services: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding services: ' + error);
            throw new Error('Failed to retrieve services');
        }
    }

    /**
     * Find service by ID
     */
    static async findById(id: string): Promise<services> {
        try {
            const service = await models.services.findByPk(id, {
                include: [{
                    model: models.service_types,
                    as: 'service_type',
                    attributes: ['id', 'name', 'code']
                }]
            });
            if (!service) {
                throw new Error('Service not found');
            }
            return service;
        } catch (error) {
            secureLogger.error('Error finding service by ID: ' + error);
            throw new Error('Error finding service by ID');
        }
    }

    /**
     * Find service by code
     */
    static async findByCode(code: string): Promise<services> {
        try {
            const service = await models.services.findOne({
                where: { code }
            });
            if (!service) {
                throw new Error('Service not found');
            }
            return service;
        } catch (error) {
            secureLogger.error('Error finding service by code: ' + error);
            throw new Error('Error finding service by code');
        }
    }

    /**
     * Create new service
     */
    static async create(serviceData: servicesCreationAttributes, userId?: string): Promise<services> {
        try {
            const service = await models.services.create({
                ...serviceData
            });

            return service;
        } catch (error) {
            secureLogger.error('Error creating service: ' + error);
            throw new Error('Failed to create service');
        }
    }

    /**
     * Update service
     */
    static async update(id: string, serviceData: Partial<servicesCreationAttributes>): Promise<boolean> {
        try {
            const [updatedCount] = await models.services.update(
                serviceData,
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating service: ' + error);
            throw new Error('Failed to update service');
        }
    }

    /**
     * Delete service (soft delete by setting is_active to false)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const [updatedCount] = await models.services.update(
                { is_active: false },
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting service: ' + error);
            throw new Error('Failed to delete service');
        }
    }
}