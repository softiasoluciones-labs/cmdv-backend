import { Op } from 'sequelize';
import { sequelize, models } from '../../../../database';

export class CashSessionRepository {

  async findById(id: string) {
    return models.cash_sessions.findByPk(id, {
      include: [{ model: models.users, as: 'cashier', attributes: ['id', 'name', 'email'] }]
    });
  }

  async findOpenByCashier(cashierId: string) {
    return models.cash_sessions.findOne({
      where: { cashier_id: cashierId, status: 'open' },
      include: [{ model: models.users, as: 'cashier', attributes: ['id', 'name', 'email'] }]
    });
  }

  async findCurrentOpen() {
    return models.cash_sessions.findAll({
      where: { status: 'open' },
      include: [{ model: models.users, as: 'cashier', attributes: ['id', 'name', 'email'] }],
      order: [['opened_at', 'DESC']]
    });
  }

  async openSession(cashierId: string, initialCash: number, notes?: string) {
    return sequelize.transaction(async (t) => {
      const existingOpen = await models.cash_sessions.findOne({
        where: { cashier_id: cashierId, status: 'open' },
        transaction: t
      });
      if (existingOpen) throw new Error('Cashier already has an open session. Close it before opening a new one.');

      const sessionNumber = await this.generateSessionNumber(t);

      return models.cash_sessions.create({
        session_number: sessionNumber,
        cashier_id: cashierId,
        status: 'open',
        initial_cash: initialCash,
        total_collected: 0,
        opened_at: new Date(),
        ...(notes && { notes })
      }, { transaction: t });
    });
  }

  async closeSession(sessionId: string, actualCash: number, closedBy: string, notes?: string) {
    return sequelize.transaction(async (t) => {
      const session = await models.cash_sessions.findByPk(sessionId, { transaction: t });
      if (!session) throw new Error('Cash session not found');
      if (session.status === 'closed') throw new Error('Session is already closed');

      const expectedCash = Number(session.initial_cash) + Number(session.total_collected);
      const cashDifference = actualCash - expectedCash;

      await session.update({
        status: 'closed',
        closed_at: new Date(),
        closed_by: closedBy,
        expected_cash: expectedCash,
        actual_cash: actualCash,
        cash_difference: cashDifference,
        ...(notes && { notes })
      }, { transaction: t });

      return session;
    });
  }

  private async generateSessionNumber(t: any): Promise<string> {
    const today = new Date();
    const prefix = `CJ-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const last = await models.cash_sessions.findOne({
      where: { session_number: { [Op.like]: `${prefix}%` } },
      order: [['session_number', 'DESC']],
      transaction: t
    });
    const seq = last ? parseInt(last.session_number.split('-').pop() ?? '0') + 1 : 1;
    return `${prefix}-${String(seq).padStart(2, '0')}`;
  }
}
