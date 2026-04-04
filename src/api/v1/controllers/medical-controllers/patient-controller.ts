import { Request, Response } from 'express';
import { PatientService } from '../../services/medical-services/patient-service';

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
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Patients retrieved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                code: 500,
                message: error.message,
                data: null
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            const patient = await PatientService.getPatientById(req.params.id);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Patient retrieved successfully',
                data: patient
            });
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }

    static async getByFileNumber(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.fileNumber) {
                throw new Error('File number is required');
            }

            const patient = await PatientService.getPatientByFileNumber(req.params.fileNumber);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Patient retrieved successfully',
                data: patient
            });
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const patient = await PatientService.createPatient(req.body, userId);
            res.status(201).json({
                success: true,
                code: 201,
                message: 'Patient created successfully',
                data: patient
            });
        } catch (error: any) {
            const status = error.message.includes('already exists') ? 409 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            const patient = await PatientService.updatePatient(req.params.id, req.body);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Patient updated successfully',
                data: patient
            });
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 :
                error.message.includes('already exists') ? 409 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Patient ID is required');
            }

            await PatientService.deletePatient(req.params.id);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Patient deleted successfully',
                data: null
            });
        } catch (error: any) {
            const status = error.message === 'Patient not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }
}
