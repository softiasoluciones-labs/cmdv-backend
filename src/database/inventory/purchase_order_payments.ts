import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_order_payment_details, purchase_order_payment_detailsId } from './purchase_order_payment_details';
import type { purchase_orders, purchase_ordersId } from './purchase_orders';
import type { users, usersId } from '../core/users';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'deposit' | 'check' | 'credit_card' | 'debit_card';

export interface purchase_order_paymentsAttributes {
  id: string;
  purchase_order_id: string;
  payment_number: number;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  bank?: string;
  reference_number?: string;
  authorization_code?: string;
  document_type?: string;
  document_number?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export type purchase_order_paymentsPk = "id";
export type purchase_order_paymentsId = purchase_order_payments[purchase_order_paymentsPk];
export type purchase_order_paymentsOptionalAttributes = "id" | "bank" | "reference_number" | "authorization_code" | "document_type" | "document_number" | "notes" | "created_at" | "updated_at" | "created_by";
export type purchase_order_paymentsCreationAttributes = Optional<purchase_order_paymentsAttributes, purchase_order_paymentsOptionalAttributes>;

export class purchase_order_payments extends Model<purchase_order_paymentsAttributes, purchase_order_paymentsCreationAttributes> implements purchase_order_paymentsAttributes {
  id!: string;
  purchase_order_id!: string;
  payment_number!: number;
  payment_date!: string;
  amount!: number;
  payment_method!: PaymentMethod;
  bank?: string;
  reference_number?: string;
  authorization_code?: string;
  document_type?: string;
  document_number?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;

  purchase_order_payment_details!: purchase_order_payment_details[];
  getPurchase_order_payment_details!: Sequelize.HasManyGetAssociationsMixin<purchase_order_payment_details>;
  setPurchase_order_payment_details!: Sequelize.HasManySetAssociationsMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  addPurchase_order_payment_detail!: Sequelize.HasManyAddAssociationMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  addPurchase_order_payment_details!: Sequelize.HasManyAddAssociationsMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  createPurchase_order_payment_detail!: Sequelize.HasManyCreateAssociationMixin<purchase_order_payment_details>;
  removePurchase_order_payment_detail!: Sequelize.HasManyRemoveAssociationMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  removePurchase_order_payment_details!: Sequelize.HasManyRemoveAssociationsMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  hasPurchase_order_payment_detail!: Sequelize.HasManyHasAssociationMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  hasPurchase_order_payment_details!: Sequelize.HasManyHasAssociationsMixin<purchase_order_payment_details, purchase_order_payment_detailsId>;
  countPurchase_order_payment_details!: Sequelize.HasManyCountAssociationsMixin;

  purchase_order!: purchase_orders;
  getPurchase_order!: Sequelize.BelongsToGetAssociationMixin<purchase_orders>;
  setPurchase_order!: Sequelize.BelongsToSetAssociationMixin<purchase_orders, purchase_ordersId>;
  createPurchase_order!: Sequelize.BelongsToCreateAssociationMixin<purchase_orders>;

  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof purchase_order_payments {
    return sequelize.define('purchase_order_payments', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      purchase_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        }
      },
      payment_number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      payment_method: {
        type: DataTypes.ENUM("cash", "bank_transfer", "deposit", "check", "credit_card", "debit_card"),
        allowNull: false
      },
      bank: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      authorization_code: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      document_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      document_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'purchase_order_payments',
      schema: 'inventory',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "idx_po_payments_po_id",
          fields: [
            { name: "purchase_order_id" },
          ]
        },
        {
          name: "idx_po_payments_payment_date",
          fields: [
            { name: "payment_date" },
          ]
        },
      ]
    }) as typeof purchase_order_payments;
  }
}