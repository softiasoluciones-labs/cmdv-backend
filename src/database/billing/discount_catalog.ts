import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export type DiscountCategory = 'manual' | 'employee' | 'insurance' | 'promotional' | 'courtesy';
export type DiscountType = 'percentage' | 'fixed_amount';

export interface discount_catalogAttributes {
  id: string;
  code: string;
  name: string;
  category: DiscountCategory;
  discount_type: DiscountType;
  value: number;
  max_amount?: number;
  requires_approval: boolean;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
  created_at?: Date;
}

export type discount_catalogPk = 'id';
export type discount_catalogId = discount_catalog[discount_catalogPk];
export type discount_catalogOptionalAttributes = 'id' | 'max_amount' | 'requires_approval' | 'valid_from' | 'valid_until' | 'is_active' | 'created_at';
export type discount_catalogCreationAttributes = Optional<discount_catalogAttributes, discount_catalogOptionalAttributes>;

export class discount_catalog extends Model<discount_catalogAttributes, discount_catalogCreationAttributes> implements discount_catalogAttributes {
  id!: string;
  code!: string;
  name!: string;
  category!: DiscountCategory;
  discount_type!: DiscountType;
  value!: number;
  max_amount?: number;
  requires_approval!: boolean;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
  created_at?: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof discount_catalog {
    return sequelize.define('discount_catalog', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING(30), allowNull: false, unique: 'discount_catalog_code_key' },
      name: { type: DataTypes.STRING(100), allowNull: false },
      category: {
        type: DataTypes.ENUM('manual', 'employee', 'insurance', 'promotional', 'courtesy'),
        allowNull: false
      },
      discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount'),
        allowNull: false
      },
      value: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
      max_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      requires_approval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      valid_from: { type: DataTypes.DATEONLY, allowNull: true },
      valid_until: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
      tableName: 'discount_catalog',
      schema: 'billing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { name: 'discount_catalog_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'discount_catalog_code_key', unique: true, fields: [{ name: 'code' }] },
        { name: 'idx_discount_catalog_active', fields: [{ name: 'is_active' }] }
      ]
    }) as typeof discount_catalog;
  }
}
