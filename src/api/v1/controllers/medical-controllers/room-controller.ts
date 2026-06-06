import { Request, Response } from 'express';
import { RoomService } from '../../services/medical-services/room-service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

export class RoomController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

            const filters = {
                search: req.query.search as string,
                roomType: req.query.roomType as string,
                isActive: req.query.isActive ? req.query.isActive === 'true' : true,
            };

            const result = await RoomService.findAll(filters, page, limit);
            successResponse(res, 200, 'Rooms retrieved successfully', result);
        }
        catch (error: any) {
            errorResponse(res, 500, error.message);
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                throw new Error('Room ID is required');
            }

            const room = await RoomService.findById(req.params.id);
            successResponse(res, 200, 'Room retrieved successfully', room);
        }
        catch (error: any) {
            const status = error.message === 'Room not found' ? 404 : 500;
            errorResponse(res, status, error.message);
        }
    }
}