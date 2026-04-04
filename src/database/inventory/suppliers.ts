import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_orders, purchase_ordersId } from './purchase_orders';

export interface suppliersAttributes {
  id: string;
  code: string;
  business_name: string;
  contact_name?: string;
  tax_id?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  payment_terms?: "immediate" | "one_payment" | "two_payments" | "three_payments";
  credit_days?: number;
  credit_limit?: number;
  current_balance?: number;
  bank_account?: string;
  bank_name?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type suppliersPk = "id";
export type suppliersId = suppliers[suppliersPk];
export type suppliersOptionalAttributes = "id" | "contact_name" | "tax_id" | "phone" | "mobile" | "email" | "address" | "city" | "state" | "zip_code" | "payment_terms" | "credit_days" | "credit_limit" | "current_balance" | "bank_account" | "bank_name" | "notes" | "is_active" | "created_at" | "updated_at";
export type suppliersCreationAttributes = Optional<suppliersAttributes, suppliersOptionalAttributes>;

export class suppliers extends Model<suppliersAttributes, suppliersCreationAttributes> implements suppliersAttributes {
  id!: string;
  code!: string;
  business_name!: string;
  contact_name?: string;
  tax_id?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  payment_terms?: "immediate" | "one_payment" | "two_payments" | "three_payments";
  credit_days?: number;
  credit_limit?: number;
  current_balance?: number;
  bank_account?: string;
  bank_name?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  // suppliers hasMany purchase_orders via supplier_id
  purchase_orders!: purchase_orders[];
  getPurchase_orders!: Sequelize.HasManyGetAssociationsMixin<purchase_orders>;
  setPurchase_orders!: Sequelize.HasManySetAssociationsMixin<purchase_orders, purchase_ordersId>;
  addPurchase_order!: Sequelize.HasManyAddAssociationMixin<purchase_orders, purchase_ordersId>;
  addPurchase_orders!: Sequelize.HasManyAddAssociationsMixin<purchase_orders, purchase_ordersId>;
  createPurchase_order!: Sequelize.HasManyCreateAssociationMixin<purchase_orders>;
  removePurchase_order!: Sequelize.HasManyRemoveAssociationMixin<purchase_orders, purchase_ordersId>;
  removePurchase_orders!: Sequelize.HasManyRemoveAssociationsMixin<purchase_orders, purchase_ordersId>;
  hasPurchase_order!: Sequelize.HasManyHasAssociationMixin<purchase_orders, purchase_ordersId>;
  hasPurchase_orders!: Sequelize.HasManyHasAssociationsMixin<purchase_orders, purchase_ordersId>;
  countPurchase_orders!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof suppliers {
    return sequelize.define('suppliers', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "suppliers_code_key"
      },
      business_name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      contact_name: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      tax_id: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      payment_terms: {
        type: DataTypes.ENUM("immediate", "one_payment", "two_payments", "three_payments"),
        allowNull: true,
        defaultValue: "immediate"
      },
      credit_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      credit_limit: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      current_balance: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
      },
      bank_account: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      bank_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'suppliers',
      schema: 'inventory',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "suppliers_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "suppliers_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof suppliers;
  }
}
