// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../../services/core-services/user-service';
import { UserFiltersDto, UsersRequestDto } from '../../dtos/core-dtos/user-dto';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class UserController {
    /**
     * Get paginated users with statistics
     */
    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            // Extraer y parsear parámetros
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            // Construir filtros
            const filters: UserFiltersDto = {};
            if (req.query.role) filters.role = req.query.role as string;
            if (req.query.is_active !== undefined) {
                filters.is_active = req.query.is_active === 'true' || req.query.is_active === '1';
            }
            if (req.query.search) filters.search = req.query.search as string;
            if (req.query.created_from) {
                filters.created_from = new Date(req.query.created_from as string);
            }
            if (req.query.created_to) {
                filters.created_to = new Date(req.query.created_to as string);
            }

            // Crear objeto de opciones con tipos correctos
            const options: UsersRequestDto = {
                page,
                limit,
                filters: Object.keys(filters).length > 0 ? filters : undefined
            };

            // Usar el método optimizado
            const result = await UserService.getUsersWithStatsOptimized(options);

            successResponse(res, 200, 'Users retrieved successfully', result);

        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * Get all users with roles and permissions
     */
    static async getAllUsersWithRolesAndPermissions(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsersWithRolesAndPermissions();

            successResponse(res, 200, 'Users with roles and permissions retrieved successfully', {
                    total: users.length,
                    users
                });

        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * Get all users by warehouse role
     */
    static async getUsersByRole(req: Request, res: Response): Promise<void> {
        try {
            const role = req.query.role as string;

            if (!role) {
                errorResponse(res, 400, 'Role query parameter is required');
                return;
            }

            const users = await UserService.getUsersByRole(role);

            successResponse(res, 200, `Users with role ${role} retrieved successfully`, {
                total: users.length,
                users
            });

        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    static async createNewUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserService.createNewUser(req.body);

            successResponse(res, 201, 'User created successfully', user);
        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            const user = await UserService.updateUser(id, req.body);

            successResponse(res, 200, 'User updated successfully', user);
        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }
}