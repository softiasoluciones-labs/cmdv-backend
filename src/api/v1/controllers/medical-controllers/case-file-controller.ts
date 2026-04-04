import { Request, Response } from 'express';
import { CaseFileService } from '../../services/medical-services/case-file-service';
import { CreateCaseFileRequest, UpdateCaseFileRequest, UpdateCaseStatusRequest, CaseStatus, CaseStatusFlow, ShiftType } from '../../dtos/medical-dtos/case-file.dto';

/**
 * Controller for case files REST API
 */
export class CaseFileController {
    /*private service: CaseFileService;

    constructor() {
        this.service = new CaseFileService();
    }*/

    /**
     * GET /api/medical/case-files
     * List all case files with pagination and filtering
     */
    static async getAllCaseFiles(req: Request, res: Response): Promise<void> {
        try {
            const {
                page,
                limit,
                patient_id,
                admission_type_id,
                case_status,
                status_flow,
                shift_type,
                from_date,
                to_date
            } = req.query;

            const options: any = {};
            if (page) options.page = parseInt(page as string);
            if (limit) options.limit = parseInt(limit as string);
            if (patient_id) options.patient_id = patient_id as string;
            if (admission_type_id) options.admission_type_id = admission_type_id as string;
            if (case_status) options.case_status = case_status as CaseStatus;
            if (status_flow) options.status_flow = status_flow as CaseStatusFlow;
            if (shift_type) options.shift_type = shift_type as ShiftType;
            if (from_date) options.from_date = new Date(from_date as string);
            if (to_date) options.to_date = new Date(to_date as string);

            const result = await CaseFileService.getAllCaseFiles(options);

            res.json({
                success: true,
                code: 200,
                message: 'Case files retrieved successfully',
                data: result.cases,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit: options.limit || 20
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/medical/case-files/:id
     * Get single case file with all relations
     */
    static async getCaseFileById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            const caseFile = await CaseFileService.getCaseFileById(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file retrieved successfully',
                data: caseFile
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/medical/case-files/case-number/:caseNumber
     * Get case file by case number
     */
    static async getCaseFileByCaseNumber(req: Request, res: Response): Promise<void> {
        try {
            const caseNumber = req.params.caseNumber;
            if (!caseNumber) {
                throw new Error('Case number is required');
            }

            const caseFile = await CaseFileService.getCaseFileByCaseNumber(caseNumber);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file retrieved successfully',
                data: caseFile
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/medical/case-files/:id/validation
     * Get validation status for a case file
     */
    static async validateCaseFile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            const validation = await CaseFileService.validateCaseCompliance(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file validation retrieved successfully',
                data: validation
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/medical/case-files/:id/can-transfer
     * Check if case can be transferred
     */
    static async canTransferCase(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            const result = await CaseFileService.canTransferCase(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file transferability retrieved successfully',
                data: result
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/medical/case-files/:id/can-close
     * Check if case can be closed
     */
    static async canCloseCase(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            const result = await CaseFileService.canCloseCase(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file closability retrieved successfully',
                data: result
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * POST /api/medical/case-files
     * Create new case file
     */
    static async createCaseFile(req: Request, res: Response): Promise<void> {
        try {

            // Get user ID from request (assuming auth middleware sets this)
            const createdBy = (req as any).user?.userId;
            const caseFile = await CaseFileService.createCaseFile(req.body, createdBy);

            res.status(201).json({
                success: true,
                code: 201,
                data: caseFile,
                message: 'Case file created successfully'
            });
        } catch (error) {
            console.log("Error:", error);
            // Use 422 for business rule violations
            const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 422 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * PUT /api/medical/case-files/:id
     * Update case file
     */
    static async updateCaseFile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            const caseFile = await CaseFileService.updateCaseFile(id, req.body);

            res.status(200).json({
                success: true,
                code: 200,
                data: caseFile,
                message: 'Case file updated successfully'
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Invalid') ? 422 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * PATCH /api/medical/case-files/:id/status
     * Update case status only
     */
    static async updateCaseStatus(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }

            // Get user ID from request
            const performedBy = (req as any).user?.id;

            const caseFile = await CaseFileService.updateCaseStatus(id, req.body, performedBy);

            res.status(200).json({
                success: true,
                code: 200,
                data: caseFile,
                message: 'Case status updated successfully'
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Invalid') ? 422 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * DELETE /api/medical/case-files/:id
     * Delete case file
     */
    static async deleteCaseFile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Case file ID is required');
            }
            await CaseFileService.deleteCaseFile(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Case file deleted successfully'
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Cannot delete') ? 422 : 500;
            res.status(statusCode).json({
                success: false,
                code: statusCode,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
}
