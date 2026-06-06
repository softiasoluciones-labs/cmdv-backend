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

            successResponse(res, 200, 'Roles retrieved successfully', data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve roles';

            errorResponse(res, 500, message);
        }
    }

    /**
     * GET /api/v1/roles/:name
     */
    static async getRoleByName(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name) {
                errorResponse(res, 400, 'Role name is required');
                return;
            }

            const roleKey = name as string;

            const data = await RoleService.getRoleByName(roleKey);

            if (!data) {
                errorResponse(res, 404, 'Role not found');
                return;
            }

            successResponse(res, 200, 'Role details retrieved successfully', data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve role details';

            errorResponse(res, 500, message);
        }
    }
}
