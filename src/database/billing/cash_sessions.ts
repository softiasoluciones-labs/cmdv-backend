import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface cash_sessionsAttributes {
  id: string;
  session_number: string;
  cashier_id: string;
  status: 'open' | 'closed';
  opened_at?: Date;
  closed_at?: Date;
  initial_cash: number;
  expected_cash?: number;
  actual_cash?: number;
  cash_difference?: number;
  total_collected: number;
  closed_by?: string;
  notes?: string;
}

export type cash_sessionsPk = 'id';
export type cash_sessionsId = cash_sessions[cash_sessionsPk];
export type cash_sessionsOptionalAttributes = 'id' | 'status' | 'opened_at' | 'closed_at' | 'initial_cash' | 'expected_cash' | 'actual_cash' | 'cash_difference' | 'total_collected' | 'closed_by' | 'notes';
export type cash_sessionsCreationAttributes = Optional<cash_sessionsAttributes, cash_sessionsOptionalAttributes>;

export class cash_sessions extends Model<cash_sessionsAttributes, cash_sessionsCreationAttributes> implements cash_sessionsAttributes {
  id!: string;
  session_number!: string;
  cashier_id!: string;
  status!: 'open' | 'closed';
  opened_at?: Date;
  closed_at?: Date;
  initial_cash!: number;
  expected_cash?: number;
  actual_cash?: number;
  cash_difference?: number;
  total_collected!: number;
  closed_by?: string;
  notes?: string;

  cashier!: users;
  getCashier!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCashier!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  closed_by_user!: users;
  getClosed_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setClosed_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof cash_sessions {
    return sequelize.define('cash_sessions', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_number: { type: DataTypes.STRING(30), allowNull: false, unique: 'cash_sessions_number_key' },
      cashier_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      status: { type: DataTypes.ENUM('open', 'closed'), allowNull: false, defaultValue: 'open' },
      opened_at: { type: DataTypes.DATE, allowNull: true, defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP') },
      closed_at: { type: DataTypes.DATE, allowNull: true },
      initial_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      expected_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      actual_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      cash_difference: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      total_collected: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      closed_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
      tableName: 'cash_sessions',
      schema: 'billing',
      timestamps: false,
      indexes: [
        { name: 'cash_sessions_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'cash_sessions_number_key', unique: true, fields: [{ name: 'session_number' }] },
        { name: 'idx_cash_sessions_cashier', fields: [{ name: 'cashier_id' }] },
        { name: 'idx_cash_sessions_status', fields: [{ name: 'status' }] }
      ]
    }) as typeof cash_sessions;
  }
}
