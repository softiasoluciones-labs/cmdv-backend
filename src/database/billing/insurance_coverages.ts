import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { invoices, invoicesId } from './invoices';

export type InsuranceStatus = 'pending_auth' | 'authorized' | 'rejected' | 'paid';

// NOTE: This table is designed for future use when insurance integration is required.
// Currently not exposed via API endpoints. Structure is finalized to avoid schema migrations later.
export interface insurance_coveragesAttributes {
  id: string;
  invoice_id: string;
  insurance_company: string;
  policy_number?: string;
  authorization_number?: string;
  coverage_percentage?: number;
  coverage_amount: number;
  patient_copay: number;
  status: InsuranceStatus;
  submitted_at?: Date;
  response_at?: Date;
  notes?: string;
  created_at?: Date;
}

export type insurance_coveragesPk = 'id';
export type insurance_coveragesId = insurance_coverages[insurance_coveragesPk];
export type insurance_coveragesOptionalAttributes = 'id' | 'policy_number' | 'authorization_number' | 'coverage_percentage' | 'coverage_amount' | 'patient_copay' | 'status' | 'submitted_at' | 'response_at' | 'notes' | 'created_at';
export type insurance_coveragesCreationAttributes = Optional<insurance_coveragesAttributes, insurance_coveragesOptionalAttributes>;

export class insurance_coverages extends Model<insurance_coveragesAttributes, insurance_coveragesCreationAttributes> implements insurance_coveragesAttributes {
  id!: string;
  invoice_id!: string;
  insurance_company!: string;
  policy_number?: string;
  authorization_number?: string;
  coverage_percentage?: number;
  coverage_amount!: number;
  patient_copay!: number;
  status!: InsuranceStatus;
  submitted_at?: Date;
  response_at?: Date;
  notes?: string;
  created_at?: Date;

  invoice!: invoices;
  getInvoice!: Sequelize.BelongsToGetAssociationMixin<invoices>;
  setInvoice!: Sequelize.BelongsToSetAssociationMixin<invoices, invoicesId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof insurance_coverages {
    return sequelize.define('insurance_coverages', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      invoice_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'invoices', key: 'id' } },
      insurance_company: { type: DataTypes.STRING(200), allowNull: false },
      policy_number: { type: DataTypes.STRING(100), allowNull: true },
      authorization_number: { type: DataTypes.STRING(100), allowNull: true },
      coverage_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      coverage_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      patient_copay: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('pending_auth', 'authorized', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'pending_auth'
      },
      submitted_at: { type: DataTypes.DATE, allowNull: true },
      response_at: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
      tableName: 'insurance_coverages',
      schema: 'billing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { name: 'insurance_coverages_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'idx_insurance_coverages_invoice', fields: [{ name: 'invoice_id' }] }
      ]
    }) as typeof insurance_coverages;
  }
}
