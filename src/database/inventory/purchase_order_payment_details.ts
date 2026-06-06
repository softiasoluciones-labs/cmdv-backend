import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_order_payments, purchase_order_paymentsId } from './purchase_order_payments';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'deposit' | 'check' | 'credit_card' | 'debit_card';

export interface purchase_order_payment_detailsAttributes {
  id: string;
  payment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  bank?: string;
  reference_number?: string;
  authorization_code?: string;
  created_at?: Date;
}

export type purchase_order_payment_detailsPk = "id";
export type purchase_order_payment_detailsId = purchase_order_payment_details[purchase_order_payment_detailsPk];
export type purchase_order_payment_detailsOptionalAttributes = "id" | "bank" | "reference_number" | "authorization_code" | "created_at";
export type purchase_order_payment_detailsCreationAttributes = Optional<purchase_order_payment_detailsAttributes, purchase_order_payment_detailsOptionalAttributes>;

export class purchase_order_payment_details extends Model<purchase_order_payment_detailsAttributes, purchase_order_payment_detailsCreationAttributes> implements purchase_order_payment_detailsAttributes {
  id!: string;
  payment_id!: string;
  payment_method!: PaymentMethod;
  amount!: number;
  bank?: string;
  reference_number?: string;
  authorization_code?: string;
  created_at?: Date;

  payment!: purchase_order_payments;
  getPayment!: Sequelize.BelongsToGetAssociationMixin<purchase_order_payments>;
  setPayment!: Sequelize.BelongsToSetAssociationMixin<purchase_order_payments, purchase_order_paymentsId>;
  createPayment!: Sequelize.BelongsToCreateAssociationMixin<purchase_order_payments>;

  static initModel(sequelize: Sequelize.Sequelize): typeof purchase_order_payment_details {
    return sequelize.define('purchase_order_payment_details', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      payment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'purchase_order_payments',
          key: 'id'
        }
      },
      payment_method: {
        type: DataTypes.ENUM("cash", "bank_transfer", "deposit", "check", "credit_card", "debit_card"),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
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
      }
    }, {
      tableName: 'purchase_order_payment_details',
      schema: 'inventory',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "idx_po_payment_details_payment_id",
          fields: [
            { name: "payment_id" },
          ]
        },
      ]
    }) as typeof purchase_order_payment_details;
  }
}