import { Transaction } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { recalculateCaseTotalCost } from './shared/recalculate-case-total-cost';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class CaseRoomRepository {

  async findByCaseFile(caseFileId: string) {
    return models.case_rooms.findAll({
      where: { case_file_id: caseFileId },
      include: [
        { model: models.rooms, as: 'room', attributes: ['id', 'room_number', 'room_type'] }
      ],
      order: [['check_in', 'DESC']]
    });
  }

  async findById(id: string) {
    return models.case_rooms.findByPk(id, {
      include: [
        { model: models.rooms, as: 'room', attributes: ['id', 'room_number', 'room_type'] }
      ]
    });
  }

  async applyRoom(data: {
    case_file_id: string;
    room_id: string;
    notes?: string;
  }) {
    return sequelize.transaction(async (t) => {
      const room = await models.rooms.findByPk(data.room_id, txOpt(t));
      if (!room) throw new Error('Room not found');
      if (!room.is_active) throw new Error('Room is not active');

      const caseRoom = await models.case_rooms.create({
        case_file_id: data.case_file_id,
        room_id: data.room_id,
        daily_rate: room.daily_rate,
        check_in: new Date(),
        ...(data.notes && { notes: data.notes }),
        is_voided: false
      } as any, txOpt(t));

      await recalculateCaseTotalCost(data.case_file_id, t);

      return caseRoom;
    });
  }

  async voidRoom(id: string, voidedBy: string, voidReason: string) {
    return sequelize.transaction(async (t) => {
      const record = await models.case_rooms.findByPk(id, txOpt(t));
      if (!record) throw new Error('Case room charge not found');
      if (record.is_voided) throw new Error('This charge is already voided');

      await record.update({
        is_voided: true,
        voided_by: voidedBy,
        voided_at: new Date(),
        void_reason: voidReason
      }, txOpt(t));

      await recalculateCaseTotalCost(record.case_file_id, t);

      return record;
    });
  }
}
