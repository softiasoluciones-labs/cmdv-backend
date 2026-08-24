import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from '../medical/case_files';
import type { patients, patientsId } from '../medical/patients';
import type { users, usersId } from '../core/users';
import type { invoice_items, invoice_itemsId } from './invoice_items';
import type { invoice_discounts, invoice_discountsId } from './invoice_discounts';
import type { payments, paymentsId } from './payments';
import type { tax_invoices } from './tax_invoices';
import type { insurance_coverages } from './insurance_coverages';

export type InvoiceStatus = 'draft' | 'confirmed' | 'partially_paid' | 'paid' | 'voided';

export interface invoicesAttributes {
  id: string;
  invoice_number: string;
  case_file_id: string;
  patient_id: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  iva_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  requires_tax_invoice: boolean;
  confirmed_at?: Date;
  paid_at?: Date;
  due_date?: string;
  notes?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type invoicesPk = 'id';
export type invoicesId = invoices[invoicesPk];
export type invoicesOptionalAttributes = 'id' | 'status' | 'subtotal' | 'discount_total' | 'taxable_amount' | 'iva_amount' | 'total_amount' | 'amount_paid' | 'amount_pending' | 'requires_tax_invoice' | 'confirmed_at' | 'paid_at' | 'due_date' | 'notes' | 'created_by' | 'created_at' | 'updated_at';
export type invoicesCreationAttributes = Optional<invoicesAttributes, invoicesOptionalAttributes>;

export class invoices extends Model<invoicesAttributes, invoicesCreationAttributes> implements invoicesAttributes {
  id!: string;
  invoice_number!: string;
  case_file_id!: string;
  patient_id!: string;
  status!: InvoiceStatus;
  subtotal!: number;
  discount_total!: number;
  taxable_amount!: number;
  iva_amount!: number;
  total_amount!: number;
  amount_paid!: number;
  amount_pending!: number;
  requires_tax_invoice!: boolean;
  confirmed_at?: Date;
  paid_at?: Date;
  due_date?: string;
  notes?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;

  // Associations
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;

  patient!: patients;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patients>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patients, patientsId>;

  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  invoice_items!: invoice_items[];
  getInvoice_items!: Sequelize.HasManyGetAssociationsMixin<invoice_items>;
  addInvoice_item!: Sequelize.HasManyAddAssociationMixin<invoice_items, invoice_itemsId>;
  createInvoice_item!: Sequelize.HasManyCreateAssociationMixin<invoice_items>;

  invoice_discounts!: invoice_discounts[];
  getInvoice_discounts!: Sequelize.HasManyGetAssociationsMixin<invoice_discounts>;
  addInvoice_discount!: Sequelize.HasManyAddAssociationMixin<invoice_discounts, invoice_discountsId>;
  createInvoice_discount!: Sequelize.HasManyCreateAssociationMixin<invoice_discounts>;

  payments!: payments[];
  getPayments!: Sequelize.HasManyGetAssociationsMixin<payments>;
  addPayment!: Sequelize.HasManyAddAssociationMixin<payments, paymentsId>;
  createPayment!: Sequelize.HasManyCreateAssociationMixin<payments>;

  tax_invoice!: tax_invoices;
  getTax_invoice!: Sequelize.HasOneGetAssociationMixin<tax_invoices>;

  insurance_coverages!: insurance_coverages[];
  getInsurance_coverages!: Sequelize.HasManyGetAssociationsMixin<insurance_coverages>;

  static initModel(sequelize: Sequelize.Sequelize): typeof invoices {
    return sequelize.define('invoices', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: 'invoices_number_key' },
      case_file_id: { type: DataTypes.UUID, allowNull: false, unique: 'invoices_case_file_key', references: { model: 'case_files', key: 'id' } },
      patient_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'patients', key: 'id' } },
      status: {
        type: DataTypes.ENUM('draft', 'confirmed', 'partially_paid', 'paid', 'voided'),
        allowNull: false,
        defaultValue: 'draft'
      },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      // NOTE: IVA (12%) is currently set to 0 for all items as medical services are IVA-exempt
      // per Guatemala tax code (Decreto 27-92, Art. 7). When non-exempt items are added,
      // enable per-line iva calculation using invoice_items.is_iva_exempt = false.
      taxable_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      iva_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      amount_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      amount_pending: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      requires_tax_invoice: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      confirmed_at: { type: DataTypes.DATE, allowNull: true },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      due_date: { type: DataTypes.DATEONLY, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } }
    }, {
      tableName: 'invoices',
      schema: 'billing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { name: 'invoices_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'invoices_number_key', unique: true, fields: [{ name: 'invoice_number' }] },
        { name: 'invoices_case_file_key', unique: true, fields: [{ name: 'case_file_id' }] },
        { name: 'idx_invoices_patient', fields: [{ name: 'patient_id' }] },
        { name: 'idx_invoices_status', fields: [{ name: 'status' }] },
        { name: 'idx_invoices_created_at', fields: [{ name: 'created_at' }] }
      ]
    }) as typeof invoices;
  }
}
