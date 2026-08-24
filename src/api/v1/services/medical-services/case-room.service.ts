import { CaseRoomRepository } from '../../repositories/medical-repositories/case-room.repository';
import {
  ApplyCaseRoomRequest,
  VoidCaseRoomRequest,
  CaseRoomResponse
} from '../../dtos/medical-dtos/case-room.dto';
import { case_rooms } from '../../../../database/medical/case_rooms';

export class CaseRoomService {
  constructor(private readonly repo: CaseRoomRepository) {}

  async getRoomsByCaseFile(caseFileId: string): Promise<CaseRoomResponse[]> {
    const records = await this.repo.findByCaseFile(caseFileId);
    return records.map(CaseRoomService.toResponse);
  }

  async applyRoom(
    caseFileId: string,
    data: ApplyCaseRoomRequest
  ): Promise<CaseRoomResponse> {
    const record = await this.repo.applyRoom({
      case_file_id: caseFileId,
      room_id: data.room_id,
      ...(data.notes !== undefined && { notes: data.notes })
    });

    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve applied room');
    return CaseRoomService.toResponse(full);
  }

  async voidRoom(
    id: string,
    data: VoidCaseRoomRequest,
    voidedBy: string
  ): Promise<CaseRoomResponse> {
    if (!data.void_reason?.trim()) throw new Error('A void reason is required');

    const record = await this.repo.voidRoom(id, voidedBy, data.void_reason);
    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve voided room');
    return CaseRoomService.toResponse(full);
  }

  private static toResponse(cr: case_rooms): CaseRoomResponse {
    const msPerDay = 1000 * 60 * 60 * 24;
    const checkOut = cr.check_out ?? new Date();
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - cr.check_in.getTime()) / msPerDay));
    const dailyRate = Number(cr.daily_rate);

    return {
      id: cr.id,
      case_file_id: cr.case_file_id,
      room_id: cr.room_id,
      room_number: (cr as any).room?.room_number ?? 'Unknown',
      room_type: (cr as any).room?.room_type ?? 'Unknown',
      daily_rate: dailyRate,
      check_in: cr.check_in,
      ...(cr.check_out !== undefined && { check_out: cr.check_out }),
      nights,
      total_price: dailyRate * nights,
      ...(cr.notes !== undefined && { notes: cr.notes }),
      is_voided: cr.is_voided ?? false,
      ...(cr.voided_by !== undefined && { voided_by: cr.voided_by }),
      ...(cr.voided_at !== undefined && { voided_at: cr.voided_at }),
      ...(cr.void_reason !== undefined && { void_reason: cr.void_reason })
    };
  }
}
