import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { invoices, invoicesId } from './invoices';
import type { cash_sessions, cash_sessionsId } from './cash_sessions';
import type { users, usersId } from '../core/users';

export type PaymentMethod = 'cash' | 'card_credit' | 'card_debit' | 'bank_transfer' | 'check' | 'insurance';
export type PaymentStatus = 'confirmed' | 'voided';

export interface paymentsAttributes {
  id: string;
  payment_number: string;
  invoice_id: string;
  cash_session_id?: string;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  payment_date?: Date;
  status: PaymentStatus;
  voided_at?: Date;
  voided_by?: string;
  void_reason?: string;
  received_by?: string;
  notes?: string;
}

export type paymentsPk = 'id';
export type paymentsId = payments[paymentsPk];
export type paymentsOptionalAttributes = 'id' | 'cash_session_id' | 'reference_number' | 'card_brand' | 'card_last_four' | 'bank_name' | 'payment_date' | 'status' | 'voided_at' | 'voided_by' | 'void_reason' | 'received_by' | 'notes';
export type paymentsCreationAttributes = Optional<paymentsAttributes, paymentsOptionalAttributes>;

export class payments extends Model<paymentsAttributes, paymentsCreationAttributes> implements paymentsAttributes {
  id!: string;
  payment_number!: string;
  invoice_id!: string;
  cash_session_id?: string;
  payment_method!: PaymentMethod;
  amount!: number;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  payment_date?: Date;
  status!: PaymentStatus;
  voided_at?: Date;
  voided_by?: string;
  void_reason?: string;
  received_by?: string;
  notes?: string;

  invoice!: invoices;
  getInvoice!: Sequelize.BelongsToGetAssociationMixin<invoices>;
  setInvoice!: Sequelize.BelongsToSetAssociationMixin<invoices, invoicesId>;

  cash_session!: cash_sessions;
  getCash_session!: Sequelize.BelongsToGetAssociationMixin<cash_sessions>;
  setCash_session!: Sequelize.BelongsToSetAssociationMixin<cash_sessions, cash_sessionsId>;

  received_by_user!: users;
  getReceived_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setReceived_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  voided_by_user!: users;
  getVoided_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setVoided_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof payments {
    return sequelize.define('payments', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      payment_number: { type: DataTypes.STRING(30), allowNull: false, unique: 'payments_number_key' },
      invoice_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'invoices', key: 'id' } },
      cash_session_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'cash_sessions', key: 'id' } },
      payment_method: {
        type: DataTypes.ENUM('cash', 'card_credit', 'card_debit', 'bank_transfer', 'check', 'insurance'),
        allowNull: false
      },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      reference_number: { type: DataTypes.STRING(100), allowNull: true },
      card_brand: { type: DataTypes.STRING(30), allowNull: true },
      card_last_four: { type: DataTypes.CHAR(4), allowNull: true },
      bank_name: { type: DataTypes.STRING(100), allowNull: true },
      payment_date: { type: DataTypes.DATE, allowNull: true, defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP') },
      status: { type: DataTypes.ENUM('confirmed', 'voided'), allowNull: false, defaultValue: 'confirmed' },
      voided_at: { type: DataTypes.DATE, allowNull: true },
      voided_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      void_reason: { type: DataTypes.TEXT, allowNull: true },
      received_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
      tableName: 'payments',
      schema: 'billing',
      timestamps: false,
      indexes: [
        { name: 'payments_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'payments_number_key', unique: true, fields: [{ name: 'payment_number' }] },
        { name: 'idx_payments_invoice', fields: [{ name: 'invoice_id' }] },
        { name: 'idx_payments_session', fields: [{ name: 'cash_session_id' }] },
        { name: 'idx_payments_method', fields: [{ name: 'payment_method' }] },
        { name: 'idx_payments_date', fields: [{ name: 'payment_date' }] }
      ]
    }) as typeof payments;
  }
}
