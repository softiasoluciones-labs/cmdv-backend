import { Request, Response } from 'express';
import { AdmissionTypeService } from '../../services/medical-services/admission-type-service';
import { AdmissionCategory } from '../../dtos/medical-dtos/admission-type.dto';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

/**
 * Controller for admission types REST API
 */
export class AdmissionTypeController {
    /*private service: AdmissionTypeService;

    constructor() {
        this.service = new AdmissionTypeService();
    }*/

    /**
     * GET /api/medical/admission-types
     * List all admission types with optional filtering
     */

    static async getAll(req: Request, res: Response) {
        try {
            const { is_active, category } = req.query;

            const filters: any = {};
            if (is_active !== undefined) {
                filters.is_active = is_active === 'true';
            }
            if (category) {
                filters.category = category as AdmissionCategory;
            }

            const admissionTypes = await AdmissionTypeService.getAllAdmissionTypes(filters);

            successResponse(res, 200, 'Admission types retrieved successfully', admissionTypes);
        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    static async getAllAdmissionTypes(req: Request, res: Response): Promise<void> {
        try {
            const { is_active, category } = req.query;

            const filters: any = {};
            if (is_active !== undefined) {
                filters.is_active = is_active === 'true';
            }
            if (category) {
                filters.category = category as AdmissionCategory;
            }

            const admissionTypes = await AdmissionTypeService.getAllAdmissionTypes(filters);

            successResponse(res, 200, 'Admission types retrieved successfully', admissionTypes);
        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * GET /api/medical/admission-types/grouped
     * Get admission types grouped by category
     */
    static async getAdmissionTypesGrouped(req: Request, res: Response): Promise<void> {
        try {
            const grouped = await AdmissionTypeService.getAdmissionTypesGroupedByCategory();

            successResponse(res, 200, 'Admission types grouped by category retrieved successfully', grouped);
        } catch (error) {
            errorResponse(res, 500, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * GET /api/medical/admission-types/:id
     * Get single admission type by ID
     */
    static async getAdmissionTypeById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('No ID provided');
            }
            const admissionType = await AdmissionTypeService.getAdmissionTypeById(id);

            successResponse(res, 200, 'Admission type retrieved successfully', admissionType);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * GET /api/medical/admission-types/code/:code
     * Get admission type by code
     */
    static async getAdmissionTypeByCode(req: Request, res: Response): Promise<void> {
        try {
            const code = req.params.code;
            if (!code) {
                throw new Error('No code provided');
            }

            const admissionType = await AdmissionTypeService.getAdmissionTypeByCode(code);

            successResponse(res, 200, 'Admission type retrieved successfully', admissionType);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * GET /api/medical/admission-types/:id/rules
     * Get admission type rules for UI
     */
    static async getAdmissionTypeRules(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('No ID provided');
            }

            const rules = await AdmissionTypeService.getAdmissionTypeRules(id);

            successResponse(res, 200, 'Admission type rules retrieved successfully', rules);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * POST /api/medical/admission-types
     * Create new admission type (admin only)
     */
    static async createAdmissionType(req: Request, res: Response) {
        try {
            const admissionType = await AdmissionTypeService.createAdmissionType(req.body);

            successResponse(res, 201, 'Admission type created successfully', admissionType);

        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * PUT /api/medical/admission-types/:id
     * Update admission type (admin only)
     */
    static async updateAdmissionType(req: Request, res: Response) {
        try {

            if (!req.params.id) {
                return errorResponse(res, 400, 'No ID provided');
            }

            const admissionType = await AdmissionTypeService.updateAdmissionType(req.params.id, req.body);

            successResponse(res, 200, 'Admission type updated successfully', admissionType);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }

    /**
     * DELETE /api/medical/admission-types/:id
     * Soft delete admission type (admin only)
     */
    static async deleteAdmissionType(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('No ID provided');
            }

            await AdmissionTypeService.deleteAdmissionType(id);

            successResponse(res, 200, 'Admission type deleted successfully', null);
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            errorResponse(res, statusCode, error instanceof Error ? error.message : 'Internal server error');
        }
    }
}
