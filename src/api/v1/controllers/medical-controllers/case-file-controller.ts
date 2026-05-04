import { Request, Response } from 'express';
import { CaseFileService } from '../../services/medical-services/case-file-service';
import { CaseStatus, CaseStatusFlow, ShiftType } from '../../dtos/medical-dtos/case-file.dto';

export class CaseFileController {
    constructor(private readonly service: CaseFileService) {}

    getAllCaseFiles = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page, limit, patient_id, admission_type_id, case_status, status_flow, shift_type, from_date, to_date } = req.query;

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

            const result = await this.service.getAllCaseFiles(options);

            res.json({
                success: true,
                code: 200,
                message: 'Case files retrieved successfully',
                data: result.cases,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit: options.limit ?? 20
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    };

    getCaseFileById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const caseFile = await this.service.getCaseFileById(id);
            res.status(200).json({ success: true, code: 200, message: 'Case file retrieved successfully', data: caseFile });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    getCaseFileByCaseNumber = async (req: Request, res: Response): Promise<void> => {
        try {
            const caseNumber = req.params['caseNumber'] as string;
            const caseFile = await this.service.getCaseFileByCaseNumber(caseNumber);
            res.status(200).json({ success: true, code: 200, message: 'Case file retrieved successfully', data: caseFile });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    validateCaseFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const validation = await this.service.validateCaseCompliance(id);
            res.status(200).json({ success: true, code: 200, message: 'Case file validation retrieved successfully', data: validation });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    canTransferCase = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const result = await this.service.canTransferCase(id);
            res.status(200).json({ success: true, code: 200, message: 'Case file transferability retrieved successfully', data: result });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    canCloseCase = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const result = await this.service.canCloseCase(id);
            res.status(200).json({ success: true, code: 200, message: 'Case file closability retrieved successfully', data: result });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    createCaseFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const createdBy = (req as any).user?.userId;
            const caseFile = await this.service.createCaseFile(req.body, createdBy);
            res.status(201).json({ success: true, code: 201, data: caseFile, message: 'Case file created successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 422 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    updateCaseFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const caseFile = await this.service.updateCaseFile(id, req.body);
            res.status(200).json({ success: true, code: 200, data: caseFile, message: 'Case file updated successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Invalid') ? 422 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    updateCaseStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const performedBy = (req as any).user?.id;
            const caseFile = await this.service.updateCaseStatus(id, req.body, performedBy);
            res.status(200).json({ success: true, code: 200, data: caseFile, message: 'Case status updated successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Invalid') ? 422 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    deleteCaseFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            await this.service.deleteCaseFile(id);
            res.status(200).json({ success: true, code: 200, message: 'Case file deleted successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('Cannot delete') ? 422 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };
}
