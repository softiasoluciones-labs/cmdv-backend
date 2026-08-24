import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { invoices, invoicesId } from './invoices';
import type { discount_catalog, discount_catalogId } from './discount_catalog';
import type { users, usersId } from '../core/users';
import type { DiscountType } from './discount_catalog';

export interface invoice_discountsAttributes {
  id: string;
  invoice_id: string;
  discount_id?: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  calculated_amount: number;
  applied_by: string;
  approved_by?: string;
  approved_at?: Date;
  reason?: string;
  created_at?: Date;
}

export type invoice_discountsPk = 'id';
export type invoice_discountsId = invoice_discounts[invoice_discountsPk];
export type invoice_discountsOptionalAttributes = 'id' | 'discount_id' | 'approved_by' | 'approved_at' | 'reason' | 'created_at';
export type invoice_discountsCreationAttributes = Optional<invoice_discountsAttributes, invoice_discountsOptionalAttributes>;

export class invoice_discounts extends Model<invoice_discountsAttributes, invoice_discountsCreationAttributes> implements invoice_discountsAttributes {
  id!: string;
  invoice_id!: string;
  discount_id?: string;
  description!: string;
  discount_type!: DiscountType;
  value!: number;
  calculated_amount!: number;
  applied_by!: string;
  approved_by?: string;
  approved_at?: Date;
  reason?: string;
  created_at?: Date;

  invoice!: invoices;
  getInvoice!: Sequelize.BelongsToGetAssociationMixin<invoices>;
  setInvoice!: Sequelize.BelongsToSetAssociationMixin<invoices, invoicesId>;

  discount_catalog_item!: discount_catalog;
  getDiscount_catalog_item!: Sequelize.BelongsToGetAssociationMixin<discount_catalog>;
  setDiscount_catalog_item!: Sequelize.BelongsToSetAssociationMixin<discount_catalog, discount_catalogId>;

  applied_by_user!: users;
  getApplied_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApplied_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  approved_by_user!: users;
  getApproved_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApproved_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof invoice_discounts {
    return sequelize.define('invoice_discounts', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      invoice_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'invoices', key: 'id' } },
      discount_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'discount_catalog', key: 'id' } },
      description: { type: DataTypes.STRING(200), allowNull: false },
      discount_type: { type: DataTypes.ENUM('percentage', 'fixed_amount'), allowNull: false },
      value: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
      calculated_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      applied_by: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      approved_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      reason: { type: DataTypes.TEXT, allowNull: true }
    }, {
      tableName: 'invoice_discounts',
      schema: 'billing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { name: 'invoice_discounts_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'idx_invoice_discounts_invoice', fields: [{ name: 'invoice_id' }] }
      ]
    }) as typeof invoice_discounts;
  }
}
