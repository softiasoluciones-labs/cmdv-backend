import { Transaction } from 'sequelize';
import { sequelize, models } from '../../../../../database';

export async function recalculateCaseTotalCost(caseFileId: string, t: Transaction): Promise<void> {
  const [result]: any[] = await sequelize.query(`
    SELECT
      COALESCE((SELECT SUM(price_applied) FROM medical.case_package_assignments WHERE case_file_id = :id AND is_voided = false), 0)
      + COALESCE((
          SELECT SUM(
            EXTRACT(DAY FROM (COALESCE(check_out, NOW()) - check_in)) * daily_rate
          )
          FROM medical.case_rooms WHERE case_file_id = :id AND is_voided = false
        ), 0)
      + COALESCE((SELECT SUM(total_price) FROM medical.case_services WHERE case_file_id = :id AND is_voided = false), 0)
      + COALESCE((SELECT SUM(total_price) FROM medical.case_products WHERE case_file_id = :id AND is_voided = false), 0)
      AS total_cost
  `, { replacements: { id: caseFileId }, transaction: t, type: 'SELECT' as any });

  await models.case_files.update(
    { total_cost: Number(result?.total_cost ?? 0) },
    { where: { id: caseFileId }, transaction: t }
  );
}
