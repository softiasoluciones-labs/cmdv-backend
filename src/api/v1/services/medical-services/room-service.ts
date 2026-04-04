import { rooms } from "../../../../database/medical/rooms";
import { RoomRepository } from "../../repositories/medical-repositories/room-repository";
import { RoomResponse, RoomListFilters } from "../../dtos/medical-dtos/room-dto";

export class RoomService {

    /**
     * Convert room model to response DTO
     */
    private static toRoomResponse(room: rooms): RoomResponse {
        return {
            id: room.id,
            room_number: room.room_number,
            room_type: room.room_type,
            capacity: room.capacity,
            daily_rate: room.daily_rate,
            ...(room.floor !== undefined && room.floor !== null && { floor: room.floor }),
            ...(room.equipment !== undefined && room.equipment !== null && { equipment: room.equipment }),
            ...(room.has_bathroom !== undefined && room.has_bathroom !== null && { has_bathroom: room.has_bathroom }),
            ...(room.has_oxygen !== undefined && room.has_oxygen !== null && { has_oxygen: room.has_oxygen }),
            ...(room.has_monitor !== undefined && room.has_monitor !== null && { has_monitor: room.has_monitor }),
            ...(room.is_active !== undefined && room.is_active !== null && { is_active: room.is_active }),
            ...(room.status !== undefined && room.status !== null && { status: room.status }),
            ...(room.created_at !== undefined && room.created_at !== null && { created_at: room.created_at })
        };
    }

    static async findAll(filters: RoomListFilters, page: number, limit: number): Promise<{ rooms: RoomResponse[], total: number, page: number, totalPages: number }> {
        const result = await RoomRepository.findAll(filters, page, limit);

        return {
            rooms: result.rooms.map(r => this.toRoomResponse(r)),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        }
    }

    static async findById(id: string): Promise<RoomResponse | null> {
        const room = await RoomRepository.findById(id);
        return room ? this.toRoomResponse(room) : null;
    }
}