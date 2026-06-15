import { Request, Response, NextFunction } from 'express';
import { OperationTypeService } from '../../services/medical-services/operation-type.service';
import { CreateOperationTypeRequest, UpdateOperationTypeRequest } from '../../dtos/medical-dtos/operation-type.dto';

export class OperationTypeController {
    private service: OperationTypeService;

    constructor() {
        this.service = new OperationTypeService();
    }

    getAllOperations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const options: any = { page, limit };

            if (req.query.specialty_id) {
                options.specialty_id = req.query.specialty_id as string;
            }
            if (req.query.is_active === 'true' || req.query.is_active === 'false') {
                options.is_active = req.query.is_active === 'true';
            }

            const result = await this.service.getAll(options);

            res.json({
                success: true,
                code: 200,
                message: 'Tipos de operación obtenidos exitosamente',
                data: result.data,
                page: result.page,
                limit: result.limit,
                total: result.total
            });
        } catch (error) {
            next(error);
        }
    }

    getOperationById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ success: false, code: 400, message: 'ID requerido' });
                return;
            }
            const data = await this.service.getById(id);

            res.json({
                success: true,
                code: 200,
                message: 'Tipo de operación obtenido exitosamente',
                data
            });
        } catch (error) {
            next(error);
        }
    }

    createOperation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: CreateOperationTypeRequest = req.body;
            const result = await this.service.create(data);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Tipo de operación creado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    updateOperation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ success: false, code: 400, message: 'ID requerido' });
                return;
            }
            const data: UpdateOperationTypeRequest = req.body;
            const result = await this.service.update(id, data);

            res.json({
                success: true,
                code: 200,
                message: 'Tipo de operación actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    deleteOperation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ success: false, code: 400, message: 'ID requerido' });
                return;
            }
            await this.service.delete(id);

            res.json({
                success: true,
                code: 200,
                message: 'Tipo de operación eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}
