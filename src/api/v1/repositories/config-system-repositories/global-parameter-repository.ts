import { models } from "../../../../database";
import { global_parameters } from "../../../../database/config/init-models";
import { global_parametersCreationAttributes } from "../../../../database/config/init-models";
import { secureLogger } from "../../../../utils/secure-logger.utils";
import { Op } from "sequelize";

export class GlobalParameterRepository {
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ globalParameters: global_parameters[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};

            if (filters.category) {
                where.category = filters.category;
            }

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${filters.search}%` } },
                    { code: { [Op.iLike]: `%${filters.search}%` } },
                    { barcode: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            const { rows, count } = await models.global_parameters.findAndCountAll({
                where,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                limit,
                offset,
                order: [['category', 'ASC'], ['sort_order', 'ASC']]
            });

            return { globalParameters: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding global parameters:', error);
            throw new Error('Failed to retrieve global parameters');
        }
    }

    static async findByCategory(category: string): Promise<global_parameters[]> {
        try {
            const globalParameters = await models.global_parameters.findAll({
                where: {
                    category
                }
            });
            return globalParameters;
        } catch (error) {
            secureLogger.error('Error finding global parameters by category:', error);
            throw new Error('Failed to retrieve global parameters by category');
        }
    }

    static async findByParameterKey(parameterKey: string): Promise<global_parameters | null> {
        try {
            const globalParameter = await models.global_parameters.findOne({
                where: {
                    parameter_key: parameterKey
                }
            });
            return globalParameter;
        } catch (error) {
            secureLogger.error('Error finding global parameter by key:', error);
            throw new Error('Failed to retrieve global parameter by key');
        }
    }

    static async create(globalParameterData: global_parametersCreationAttributes): Promise<global_parameters> {
        try {
            const globalParameter = await models.global_parameters.create(globalParameterData);
            return globalParameter;
        } catch (error) {
            secureLogger.error('Error creating global parameter:', error);
            throw new Error('Failed to create global parameter');
        }
    }

    static async update(id: string, globalParameterData: Partial<global_parameters>): Promise<boolean> {
        try {
            const [updateCount] = await models.global_parameters.update(globalParameterData, {
                where: {
                    id
                }
            });
            return updateCount > 0;
        } catch (error) {
            secureLogger.error('Error updating global parameter:', error);
            return false;
        }
    }
}