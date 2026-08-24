import { Transaction } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { recalculateCaseTotalCost } from './shared/recalculate-case-total-cost';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class CasePackageAssignmentRepository {

  async findByCaseFile(caseFileId: string) {
    return models.case_package_assignments.findAll({
      where: { case_file_id: caseFileId },
      include: [
        { model: models.packages, as: 'package', attributes: ['id', 'name'] },
        {
          model: models.doctors,
          as: 'doctor',
          attributes: ['id'],
          include: [{ model: models.users, as: 'user', attributes: ['full_name'], required: false }]
        }
      ],
      order: [['assigned_date', 'DESC']]
    });
  }

  async findById(id: string) {
    return models.case_package_assignments.findByPk(id, {
      include: [
        { model: models.packages, as: 'package', attributes: ['id', 'name'] },
        {
          model: models.doctors,
          as: 'doctor',
          attributes: ['id'],
          include: [{ model: models.users, as: 'user', attributes: ['full_name'], required: false }]
        }
      ]
    });
  }

  async applyPackageAssignment(data: {
    case_file_id: string;
    package_id: string;
    doctor_id: string;
    doctor_type_used: 'internal' | 'external';
    assigned_by?: string;
    notes?: string;
  }) {
    return sequelize.transaction(async (t) => {
      const pkg = await models.packages.findByPk(data.package_id, txOpt(t));
      if (!pkg) throw new Error('Package not found');
      if (!pkg.is_active) throw new Error('Package is not active');

      const doctor = await models.doctors.findByPk(data.doctor_id, txOpt(t));
      if (!doctor) throw new Error('Doctor not found');
      if (!doctor.is_active) throw new Error('Doctor is not active');

      const priceApplied = data.doctor_type_used === 'internal'
        ? Number(pkg.internal_doctor_price ?? 0)
        : Number(pkg.external_doctor_price ?? 0);

      let assignment;
      try {
        assignment = await models.case_package_assignments.create({
          case_file_id: data.case_file_id,
          package_id: data.package_id,
          doctor_id: data.doctor_id,
          doctor_type_used: data.doctor_type_used,
          price_applied: priceApplied,
          assigned_date: new Date(),
          ...(data.assigned_by && { assigned_by: data.assigned_by }),
          ...(data.notes && { notes: data.notes }),
          is_voided: false
        } as any, txOpt(t));
      } catch (error: any) {
        if (error?.name === 'SequelizeUniqueConstraintError') {
          throw new Error('This package has already been assigned to this case file');
        }
        throw error;
      }

      await recalculateCaseTotalCost(data.case_file_id, t);

      return assignment;
    });
  }

  async voidPackageAssignment(id: string, voidedBy: string, voidReason: string) {
    return sequelize.transaction(async (t) => {
      const record = await models.case_package_assignments.findByPk(id, txOpt(t));
      if (!record) throw new Error('Package assignment not found');
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
