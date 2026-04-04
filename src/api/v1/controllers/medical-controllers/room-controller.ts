import { Request, Response } from 'express';
import { RoomService } from '../../services/medical-services/room-service';

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
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Rooms retrieved successfully',
                data: result
            });
        }
        catch (error: any) {
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
                throw new Error('Room ID is required');
            }

            const room = await RoomService.findById(req.params.id);
            res.status(200).json({
                success: true,
                code: 200,
                message: 'Room retrieved successfully',
                data: room
            });
        }
        catch (error: any) {
            const status = error.message === 'Room not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                code: status,
                message: error.message,
                data: null
            });
        }
    }
}