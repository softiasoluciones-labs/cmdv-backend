import { models } from '../../../../database';
import { Op } from 'sequelize';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { rooms } from '../../../../database/medical/rooms';

/**
 * Room Repository
 * Handles all database operations for rooms
 */
export class RoomRepository {
    /**
     * Find all rooms with optional filters
     */
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ rooms: rooms[], total: number }> {
        try {
            const where: any = {};

            // Search filter (name, file number, identification)
            if (filters.search) {
                where[Op.or] = [
                    { room_number: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.roomType !== undefined) {
                where.room_type = filters.roomType;
            }

            const offset = (page - 1) * limit;

            const { rows, count } = await models.rooms.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                attributes: {
                    exclude: ['created_by']
                }
            });

            return { rooms: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding rooms: ' + error);
            throw new Error('Failed to retrieve rooms');
        }
    }

    /**
     * Find room by ID
     */
    static async findById(id: string): Promise<rooms | null> {
        try {
            const room = await models.rooms.findByPk(id, {
                attributes: {
                    exclude: ['created_by']
                }
            });
            return room;
        } catch (error) {
            secureLogger.error('Error finding room by ID: ' + error);
            return null;
        }
    }
}