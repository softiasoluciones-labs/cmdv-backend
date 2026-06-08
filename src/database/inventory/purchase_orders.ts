import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_order_details, purchase_order_detailsId } from './purchase_order_details';
import type { suppliers, suppliersId } from './suppliers';
import type { users, usersId } from '../core/users';
import type { warehouses, warehousesId } from './warehouses';

export interface purchase_ordersAttributes {
  id: string;
  po_number: string;
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  shipping_cost?: number;
  total: number;
  payment_terms: "immediate" | "one_payment" | "two_payments" | "three_payments";
  status?: "draft" | "pending" | "approved" | "received" | "cancelled" | "closed";
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
}

export type purchase_ordersPk = "id";
export type purchase_ordersId = purchase_orders[purchase_ordersPk];
export type purchase_ordersOptionalAttributes = "id" | "order_date" | "expected_delivery_date" | "actual_delivery_date" | "tax" | "discount" | "shipping_cost" | "payment_terms" | "status" | "notes" | "created_at" | "updated_at" | "created_by" | "approved_by" | "approved_at";
export type purchase_ordersCreationAttributes = Optional<purchase_ordersAttributes, purchase_ordersOptionalAttributes>;

export class purchase_orders extends Model<purchase_ordersAttributes, purchase_ordersCreationAttributes> implements purchase_ordersAttributes {
  id!: string;
  po_number!: string;
  supplier_id!: string;
  warehouse_id!: string;
  order_date!: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal!: number;
  tax?: number;
  discount?: number;
  shipping_cost?: number;
  total!: number;
  payment_terms!: "immediate" | "one_payment" | "two_payments" | "three_payments";
  status?: "draft" | "pending" | "approved" | "received" | "cancelled" | "closed";
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;

  // purchase_orders hasMany purchase_order_details via purchase_order_id
  purchase_order_details!: purchase_order_details[];
  getPurchase_order_details!: Sequelize.HasManyGetAssociationsMixin<purchase_order_details>;
  setPurchase_order_details!: Sequelize.HasManySetAssociationsMixin<purchase_order_details, purchase_order_detailsId>;
  addPurchase_order_detail!: Sequelize.HasManyAddAssociationMixin<purchase_order_details, purchase_order_detailsId>;
  addPurchase_order_details!: Sequelize.HasManyAddAssociationsMixin<purchase_order_details, purchase_order_detailsId>;
  createPurchase_order_detail!: Sequelize.HasManyCreateAssociationMixin<purchase_order_details>;
  removePurchase_order_detail!: Sequelize.HasManyRemoveAssociationMixin<purchase_order_details, purchase_order_detailsId>;
  removePurchase_order_details!: Sequelize.HasManyRemoveAssociationsMixin<purchase_order_details, purchase_order_detailsId>;
  hasPurchase_order_detail!: Sequelize.HasManyHasAssociationMixin<purchase_order_details, purchase_order_detailsId>;
  hasPurchase_order_details!: Sequelize.HasManyHasAssociationsMixin<purchase_order_details, purchase_order_detailsId>;
  countPurchase_order_details!: Sequelize.HasManyCountAssociationsMixin;
  // purchase_orders belongsTo suppliers via supplier_id
  supplier!: suppliers;
  getSupplier!: Sequelize.BelongsToGetAssociationMixin<suppliers>;
  setSupplier!: Sequelize.BelongsToSetAssociationMixin<suppliers, suppliersId>;
  createSupplier!: Sequelize.BelongsToCreateAssociationMixin<suppliers>;
  // purchase_orders belongsTo users via approved_by
  approved_by_user!: users;
  getApproved_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApproved_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createApproved_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // purchase_orders belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // purchase_orders belongsTo warehouses via warehouse_id
  warehouse!: warehouses;
  getWarehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setWarehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createWarehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;

  static initModel(sequelize: Sequelize.Sequelize): typeof purchase_orders {
    return sequelize.define('purchase_orders', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      po_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "purchase_orders_po_number_key"
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id'
        }
      },
      warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        }
      },
      order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_DATE')
      },
      expected_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      actual_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      subtotal: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      tax: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
      },
      discount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
      },
      shipping_cost: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
      },
      total: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      payment_terms: {
        type: DataTypes.ENUM("immediate", "one_payment", "two_payments", "three_payments"),
        allowNull: false,
        defaultValue: "immediate"
      },
      status: {
        type: DataTypes.ENUM("draft", "pending", "approved", "received", "cancelled", "closed"),
        allowNull: true,
        defaultValue: "draft"
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
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'purchase_orders',
      schema: 'inventory',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "idx_purchase_orders_status",
          fields: [
            { name: "status" },
          ]
        },
        {
          name: "idx_purchase_orders_supplier",
          fields: [
            { name: "supplier_id" },
          ]
        },
        {
          name: "purchase_orders_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "purchase_orders_po_number_key",
          unique: true,
          fields: [
            { name: "po_number" },
          ]
        },
      ]
    }) as typeof purchase_orders;
  }
}
