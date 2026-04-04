import { GlobalParameterRepository } from "../../repositories/config-system-repositories/global-parameter-repository";
import { global_parameters } from "../../../../database/config/global_parameters";
import { GlobalParameterResponse } from "../../dtos/config-dtos/global-parameter-dto";
import { global_parametersCreationAttributes } from "../../../../database/config/init-models";

export class GlobalParameterService {

    private static toGlobalParameterResponse(globalParameter: global_parameters): GlobalParameterResponse {
        return {
            id: globalParameter.id,
            category: globalParameter.category,
            parameter_key: globalParameter.parameter_key,
            parameter_value: globalParameter.parameter_value,
            data_type: globalParameter.data_type,
            display_name: globalParameter.display_name,
            ...(globalParameter.description !== undefined && { description: globalParameter.description }),
            ...(globalParameter.is_editable !== undefined && { is_editable: globalParameter.is_editable }),
            ...(globalParameter.is_visible !== undefined && { is_visible: globalParameter.is_visible }),
            ...(globalParameter.sort_order !== undefined && { sort_order: globalParameter.sort_order }),
            ...(globalParameter.created_at !== undefined && { created_at: globalParameter.created_at }),
            ...(globalParameter.updated_at !== undefined && { updated_at: globalParameter.updated_at }),
            ...(globalParameter.updated_by !== undefined && { updated_by: globalParameter.updated_by })
        };
    }

    static async getAllGlobalParameters(
        filters: any = {},
        page: number = 1,
        limit: number = 50
    ): Promise<{ globalParameters: GlobalParameterResponse[], total: number }> {
        // Repository returns global_parameters[] (Sequelize models)
        const { globalParameters, total } = await GlobalParameterRepository.findAll(filters, page, limit);

        // Transform to DTOs
        const globalParameterResponses = globalParameters.map(gp => this.toGlobalParameterResponse(gp));

        return { globalParameters: globalParameterResponses, total };
    }

    static async getGlobalParametersByCategory(category: string): Promise<GlobalParameterResponse[]> {
        // Repository returns global_parameters[] (Sequelize models)
        const globalParameters = await GlobalParameterRepository.findByCategory(category);

        // Transform to DTOs
        return globalParameters.map(gp => this.toGlobalParameterResponse(gp));
    }

    static async getGlobalParameterByKey(parameterKey: string): Promise<GlobalParameterResponse | null> {
        // Repository returns global_parameters | null (Sequelize model)
        const globalParameter = await GlobalParameterRepository.findByParameterKey(parameterKey);

        if (!globalParameter) {
            return null;
        }

        // Transform to DTO
        return this.toGlobalParameterResponse(globalParameter);
    }

    static async createGlobalParameter(
        globalParameterData: global_parametersCreationAttributes
    ): Promise<GlobalParameterResponse> {
        // Repository returns global_parameters (Sequelize model)
        const globalParameter = await GlobalParameterRepository.create(globalParameterData);

        // Transform to DTO
        return this.toGlobalParameterResponse(globalParameter);
    }

    static async updateGlobalParameter(
        id: string,
        globalParameterData: Partial<global_parameters>
    ): Promise<boolean> {
        // Repository returns boolean, no transformation needed
        return await GlobalParameterRepository.update(id, globalParameterData);
    }

}