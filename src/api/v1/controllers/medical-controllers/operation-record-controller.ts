import { Request, Response, NextFunction } from 'express';
import { OperationRecordService } from '../../services/medical-services/operation-record.service';
import { CreateOperationRecordRequest, UpdateOperationRecordRequest } from '../../dtos/medical-dtos/operation-record.dto';

export class OperationRecordController {
    private service: OperationRecordService;

    constructor() {
        this.service = new OperationRecordService();
    }

    getAllRecords = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const options: any = { page, limit };

            if (req.query.scheduled_operation_id) {
                options.scheduled_operation_id = req.query.scheduled_operation_id as string;
            }

            const result = await this.service.getAll(options);

            res.json({
                success: true,
                code: 200,
                message: 'Registros de operación obtenidos exitosamente',
                data: result.data,
                page: result.page,
                limit: result.limit,
                total: result.total
            });
        } catch (error) {
            next(error);
        }
    }

    getRecordById = async (req: Request, res: Response, next: NextFunction) => {
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
                message: 'Registro de operación obtenido exitosamente',
                data
            });
        } catch (error) {
            next(error);
        }
    }

    getRecordByScheduledOperation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduledOperationId = req.params.scheduledOperationId;
            if (!scheduledOperationId) {
                res.status(400).json({ success: false, code: 400, message: 'ID de operación requerida' });
                return;
            }
            const data = await this.service.getByScheduledOperationId(scheduledOperationId);

            res.json({
                success: true,
                code: 200,
                message: data ? 'Registro de operación obtenido exitosamente' : 'No existe registro para esta operación',
                data
            });
        } catch (error) {
            next(error);
        }
    }

    createRecord = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: CreateOperationRecordRequest = req.body;
            const userId = (req as any).user?.id;
            const result = await this.service.create(data, userId);

            res.status(201).json({
                success: true,
                code: 201,
                message: 'Registro de operación creado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    updateRecord = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ success: false, code: 400, message: 'ID requerido' });
                return;
            }
            const data: UpdateOperationRecordRequest = req.body;
            const result = await this.service.update(id, data);

            res.json({
                success: true,
                code: 200,
                message: 'Registro de operación actualizado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
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
                message: 'Registro de operación eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}
