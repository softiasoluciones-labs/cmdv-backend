import { Request, Response } from 'express';
import { ScheduledOperationService } from '../../services/medical-services/scheduled-operation.service';
import { ScheduledOperationStatus } from '../../dtos/medical-dtos/scheduled-operation.dto';

export class ScheduledOperationController {
    constructor(private readonly service: ScheduledOperationService) {}

    getAllOperations = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page, limit, case_file_id, status, from_date, to_date } = req.query;

            const options: any = {};
            if (page) options.page = parseInt(page as string);
            if (limit) options.limit = parseInt(limit as string);
            if (case_file_id) options.case_file_id = case_file_id as string;
            if (status) options.status = status as ScheduledOperationStatus;
            if (from_date) options.from_date = new Date(from_date as string);
            if (to_date) options.to_date = new Date(to_date as string);

            const result = await this.service.getAllOperations(options);

            res.json({
                success: true,
                code: 200,
                message: 'Scheduled operations retrieved successfully',
                data: result.operations,
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

    getOperationById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const operation = await this.service.getOperationById(id);
            res.status(200).json({ success: true, code: 200, message: 'Scheduled operation retrieved successfully', data: operation });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    getOperationsByCaseFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const caseFileId = req.params['caseFileId'] as string;
            const operations = await this.service.getOperationsByCaseFileId(caseFileId);
            res.status(200).json({ success: true, code: 200, message: 'Scheduled operations retrieved successfully', data: operations });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    createOperation = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = req.body;
            const operation = await this.service.createOperation(data);
            res.status(201).json({ success: true, code: 201, message: 'Scheduled operation created successfully', data: operation });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    updateOperation = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const data = req.body;
            const operation = await this.service.updateOperation(id, data);
            res.status(200).json({ success: true, code: 200, message: 'Scheduled operation updated successfully', data: operation });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    updateOperationStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            const data = req.body;
            const operation = await this.service.updateOperationStatus(id, data);
            res.status(200).json({ success: true, code: 200, message: 'Scheduled operation status updated successfully', data: operation });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    deleteOperation = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params['id'] as string;
            await this.service.deleteOperation(id);
            res.status(200).json({ success: true, code: 200, message: 'Scheduled operation deleted successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    addTeamMember = async (req: Request, res: Response): Promise<void> => {
        try {
            const operationId = req.params['id'] as string;
            const data = req.body;
            const member = await this.service.addTeamMember(operationId, data);
            res.status(201).json({ success: true, code: 201, message: 'Team member added successfully', data: member });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    removeTeamMember = async (req: Request, res: Response): Promise<void> => {
        try {
            const operationId = req.params['id'] as string;
            const memberId = req.params['memberId'] as string;
            await this.service.removeTeamMember(operationId, memberId);
            res.status(200).json({ success: true, code: 200, message: 'Team member removed successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    getTeamMembers = async (req: Request, res: Response): Promise<void> => {
        try {
            const operationId = req.params['id'] as string;
            const members = await this.service.getTeamMembers(operationId);
            res.status(200).json({ success: true, code: 200, message: 'Team members retrieved successfully', data: members });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, code: statusCode, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    };
}