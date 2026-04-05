import { Request, Response } from 'express';
import { RoleService } from '../../services/core-services/role-service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

/**
 * Role Controller - Handles Role Management Requests
 */
export class RoleController {

    /**
     * GET /api/v1/roles
     */
    static async getRoles(req: Request, res: Response): Promise<void> {
        try {
            const { search } = req.query;

            const data = await RoleService.getAllRoles({
                search: typeof search === 'string' ? search : undefined
            });

            res.status(200).json(
                successResponse(data, 'Roles retrieved successfully')
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve roles';

            res.status(500).json(errorResponse(message));
        }
    }

    /**
     * GET /api/v1/roles/:name
     */
    static async getRoleByName(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name) {
                res.status(400).json(errorResponse('Role name is required'));
                return;
            }

            const roleKey = name as string;

            const data = await RoleService.getRoleByName(roleKey);

            if (!data) {
                res.status(404).json(errorResponse('Role not found'));
                return;
            }

            res.status(200).json(
                successResponse(data, 'Role details retrieved successfully')
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve role details';

            res.status(500).json(errorResponse(message));
        }
    }
}
