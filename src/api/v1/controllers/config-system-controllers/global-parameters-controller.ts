import { Request, Response } from 'express';
import { GlobalParameterService } from '../../services/config-system-serivces/global-parameter-service';
import { GlobalParameterFilters } from '../../dtos/config-dtos/global-parameter-dto';

export class GlobalParametersController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: GlobalParameterFilters = {
                category: req.query.category as string,
                data_type: req.query.data_type as string,
                is_editable: req.query.is_editable === 'true',
                is_visible: req.query.is_visible === 'true',
                search: req.query.search as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 50
            };

            const result = await GlobalParameterService.getAllGlobalParameters(
                filters,
                filters.page || 1,
                filters.limit || 50
            );

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Global parameters retrieved successfully',
                data: result,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message || 'Internal server error',
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString(),
                errorCode: 'GLOBAL_PARAMETER_FETCH_ERROR'
            });
        }
    }

    static async getByCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;

            if (!category) {
                throw new Error('Category is required');
            }

            const globalParameters = await GlobalParameterService.getGlobalParametersByCategory(category);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Global parameters retrieved successfully',
                data: globalParameters,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async getByKey(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;

            if (!key) {
                throw new Error('Parameter key is required');
            }

            const globalParameter = await GlobalParameterService.getGlobalParameterByKey(key);

            if (!globalParameter) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    message: 'Global parameter not found',
                    data: null,
                    version: process.env.API_VERSION || '1.0.0',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Global parameter retrieved successfully',
                data: globalParameter,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const globalParameter = await GlobalParameterService.createGlobalParameter(req.body);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Global parameter created successfully',
                data: globalParameter,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                throw new Error('Global parameter ID is required');
            }

            const updated = await GlobalParameterService.updateGlobalParameter(id, req.body);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    message: 'Global parameter not found',
                    data: null,
                    version: process.env.API_VERSION || '1.0.0',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Global parameter updated successfully',
                data: { updated: true },
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const statusCode = error.message === 'Global parameter not found' ? 404 :
                error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error.message,
                data: null,
                version: process.env.API_VERSION || '1.0.0',
                timestamp: new Date().toISOString()
            });
        }
    }
}