import { models } from '../../../../database';
import { Op } from 'sequelize';
import { packages } from '../../../../database/medical/packages';
import { PackageListFilters } from '../../dtos/medical-dtos/package-dto';
import { secureLogger } from '../../../../utils/secure-logger.utils';

export class PackageRepository {

    /**
     * Find all packages with optional filters
     */
    static async findAll(
        page: number = 1,
        limit: number = 50,
        filters?: PackageListFilters
    ): Promise<{ packages: packages[], total: number }> {
        try {
            const where: any = {};

            // Apply filters if provided
            if (filters?.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters?.doctor_type) {
                where.doctor_type = filters.doctor_type;
            }

            if (filters?.code) {
                where.code = { [Op.iLike]: `%${filters.code}%` };
            }

            if (filters?.service_id) {
                where.service_id = filters.service_id;
            }

            if (filters?.year) {
                where.year = filters.year;
            }

            const offset = (page - 1) * limit;

            const { rows, count } = await models.packages.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                attributes: {
                    exclude: ['created_by']
                }
            });

            return { packages: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding packages: ' + error);
            throw new Error('Failed to retrieve packages');
        }
    }

    static async getPackageById(packageId: string): Promise<packages | null> {
        return models.packages.findOne({
            where: {
                id: packageId,
            }
        });
    }


    static async getPackageDetails(packageId: string): Promise<packages | null> {
        return models.packages.findOne({
            where: {
                id: packageId,
            },
            include: [
                {
                    model: models.package_details
                }
            ]
        });
    }


}