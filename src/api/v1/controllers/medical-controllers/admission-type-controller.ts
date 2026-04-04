import { Request, Response } from 'express';
import { AdmissionTypeService } from '../../services/medical-services/admission-type-service';
import { AdmissionCategory } from '../../dtos/medical-dtos/admission-type.dto';

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

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission types retrieved successfully',
                data: admissionTypes
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

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission types retrieved successfully',
                data: admissionTypes
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
     * GET /api/medical/admission-types/grouped
     * Get admission types grouped by category
     */
    static async getAdmissionTypesGrouped(req: Request, res: Response): Promise<void> {
        try {
            const grouped = await AdmissionTypeService.getAdmissionTypesGroupedByCategory();

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission types grouped by category retrieved successfully',
                data: grouped
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

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission type retrieved successfully',
                data: admissionType
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
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

            res.json({
                success: true,
                code: 200,
                message: 'Admission type retrieved successfully',
                data: admissionType
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
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

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission type rules retrieved successfully',
                data: rules
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    /**
     * POST /api/medical/admission-types
     * Create new admission type (admin only)
     */
    static async createAdmissionType(req: Request, res: Response) {
        try {
            const admissionType = await AdmissionTypeService.createAdmissionType(req.body);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Admission type created successfully',
                data: admissionType
            });

        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    /**
     * PUT /api/medical/admission-types/:id
     * Update admission type (admin only)
     */
    static async updateAdmissionType(req: Request, res: Response) {
        try {

            if (!req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: 'No ID provided'
                });
            }

            const admissionType = await AdmissionTypeService.updateAdmissionType(req.params.id, req.body);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Admission type updated successfully',
                data: admissionType
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
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

            res.json({
                success: true,
                code: 200,
                message: 'Admission type deleted successfully',
                data: null
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
                , data: null
            });
        }
    }
}
