import { Request, Response } from 'express';
import { PatientService } from '../../services/medical-services/patient-service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class PatientController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

            const filters = {
                search: req.query.search as string,
                gender: req.query.gender as 'male' | 'female' | 'other',
                isActive: req.query.isActive ? req.query.isActive === 'true' : true,
                city: req.query.city as string,
                state: req.query.state as string,
            };

            const result = await PatientService.getAllPatients(filters, page, limit);
            successResponse(res, 200, 'Patients retrieved successfully', result);
        } catch (error: any) {
            errorResponse(res, 500, error.message);
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            const patient = await PatientService.getPatientById(req.params.id);
            successResponse(res, 200, 'Patient retrieved successfully', patient);
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async getByFileNumber(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.fileNumber) {
                throw new Error('File number is required');
            }

            const patient = await PatientService.getPatientByFileNumber(req.params.fileNumber);
            successResponse(res, 200, 'Patient retrieved successfully', patient);
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const patient = await PatientService.createPatient(req.body, userId);
            successResponse(res, 201, 'Patient created successfully', patient);
        } catch (error: any) {
            const status = error.message.includes('already exists') ? 409 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            const patient = await PatientService.updatePatient(req.params.id, req.body);
            successResponse(res, 200, 'Patient updated successfully', patient);
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 :
                error.message.includes('already exists') ? 409 : 500;
            errorResponse(res, status, error.message);
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            await PatientService.deletePatient(req.params.id);
            successResponse(res, 200, 'Patient deleted successfully', null);
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }
}
