import { Request, Response } from 'express';
import { DoctorService } from '../../services/medical-services/doctor-service';
import { DoctorListFilters } from '../../dtos/medical-dtos/doctor-dto';

export class DoctorController {
    static async getAll(req: Request, res: Response) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

            const filters: DoctorListFilters = {
                search: req.query.search as string,
                doctor_type: req.query.doctor_type as 'internal' | 'external',
                isActive: req.query.isActive ? req.query.isActive === 'true' : true,
                specialty_id: req.query.specialty_id as string,
            };

            const result = await DoctorService.getAllDoctors(filters, page, limit);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Doctors retrieved successfully',
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

    static async getById(req: Request, res: Response) {
        try {

            if (!req.params.id) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'No id provided',
                    data: null
                });
            }

            const doctor = await DoctorService.getDoctorById(req.params.id);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Doctor retrieved successfully',
                data: doctor
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

    static async create(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'No data provided',
                    data: null
                });
            }

            const doctor = await DoctorService.createDoctor(req.body);
            res.status(201).json({
                success: true,
                code: 201,
                message: 'Doctor created successfully',
                data: doctor
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

    static async update(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'No id provided',
                    data: null
                });
            }

            const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Doctor updated successfully',
                data: doctor
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

    static async delete(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'No id provided',
                    data: null
                });
            }

            const doctor = await DoctorService.deleteDoctor(req.params.id);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Doctor deleted successfully',
                data: doctor
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
}
