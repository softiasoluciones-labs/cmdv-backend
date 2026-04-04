export interface RoomResponse {
    id: string;
    room_number: string;
    room_type: string;
    floor?: number;
    capacity: number;
    daily_rate: number;
    has_bathroom?: boolean;
    has_oxygen?: boolean;
    has_monitor?: boolean;
    equipment?: object;
    status?: "available" | "occupied" | "maintenance" | "cleaning" | "reserved";
    is_active?: boolean;
    created_at?: Date;
}

export interface RoomListFilters {
    search?: string;
    status?: "available" | "occupied" | "maintenance" | "cleaning" | "reserved";
    is_active?: boolean;
}