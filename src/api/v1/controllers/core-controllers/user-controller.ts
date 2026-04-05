// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../../services/core-services/user-service';
import { UserFiltersDto, UsersRequestDto } from '../../dtos/core-dtos/user-dto';

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

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Users retrieved successfully',
                data: result
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    /**
     * Get all users with roles and permissions
     */
    static async getAllUsersWithRolesAndPermissions(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsersWithRolesAndPermissions();

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Users with roles and permissions retrieved successfully',
                data: {
                    total: users.length,
                    users
                }
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    static async createNewUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserService.createNewUser(req.body);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            const user = await UserService.updateUser(id, req.body);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }
}