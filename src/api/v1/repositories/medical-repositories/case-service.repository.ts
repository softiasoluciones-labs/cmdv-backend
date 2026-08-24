import { Transaction } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { recalculateCaseTotalCost } from './shared/recalculate-case-total-cost';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class CaseServiceRepository {

  async findByCaseFile(caseFileId: string) {
    return models.case_services.findAll({
      where: { case_file_id: caseFileId },
      include: [
        { model: models.services, as: 'service', attributes: ['id', 'code', 'name', 'use_doctor_consultation_fee'] },
        {
          model: models.doctors,
          as: 'doctor',
          attributes: ['id'],
          required: false,
          include: [{ model: models.users, as: 'user', attributes: ['full_name'], required: false }]
        }
      ],
      order: [['applied_at', 'DESC']]
    });
  }

  async findById(id: string) {
    return models.case_services.findByPk(id, {
      include: [
        { model: models.services, as: 'service', attributes: ['id', 'code', 'name', 'use_doctor_consultation_fee'] },
        {
          model: models.doctors,
          as: 'doctor',
          attributes: ['id'],
          required: false,
          include: [{ model: models.users, as: 'user', attributes: ['full_name'], required: false }]
        }
      ]
    });
  }

  async applyService(data: {
    case_file_id: string;
    service_id: string;
    quantity?: number;
    doctor_id?: string;
    applied_by?: string;
    notes?: string;
  }) {
    return sequelize.transaction(async (t) => {
      const service = await models.services.findByPk(data.service_id, txOpt(t));
      if (!service) throw new Error('Service not found');
      if (!service.is_active) throw new Error('Service is not active');

      const quantity = data.quantity ?? 1;
      let unitPrice = Number(service.base_price);
      let doctorId: string | undefined;

      if (service.use_doctor_consultation_fee) {
        if (!data.doctor_id) throw new Error('doctor_id is required for this service');
        const doctor = await models.doctors.findByPk(data.doctor_id, txOpt(t));
        if (!doctor) throw new Error('Doctor not found');
        if (!doctor.is_active) throw new Error('Doctor is not active');
        unitPrice = Number(doctor.consultation_fee) || Number(service.base_price);
        doctorId = doctor.id;
      }

      const totalPrice = unitPrice * quantity;

      const caseService = await models.case_services.create({
        case_file_id: data.case_file_id,
        service_id: data.service_id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        ...(doctorId && { doctor_id: doctorId }),
        ...(data.applied_by && { applied_by: data.applied_by }),
        ...(data.notes && { notes: data.notes }),
        applied_at: new Date(),
        is_voided: false
      } as any, txOpt(t));

      await recalculateCaseTotalCost(data.case_file_id, t);

      return caseService;
    });
  }

  async voidService(id: string, voidedBy: string, voidReason: string) {
    return sequelize.transaction(async (t) => {
      const record = await models.case_services.findByPk(id, txOpt(t));
      if (!record) throw new Error('Case service charge not found');
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
