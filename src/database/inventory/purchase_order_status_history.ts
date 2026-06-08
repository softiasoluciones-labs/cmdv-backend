import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_orders, purchase_ordersId } from './purchase_orders';
import type { users, usersId } from '../core/users';

export type PurchaseOrderStatus = "draft" | "pending" | "approved" | "received" | "paid" | "cancelled" | "closed";

export interface purchase_order_status_historyAttributes {
  id: string;
  purchase_order_id: string;
  status: PurchaseOrderStatus;
  changed_by?: string;
  changed_at?: Date;
}

export type purchase_order_status_historyPk = "id";
export type purchase_order_status_historyId = purchase_order_status_history[purchase_order_status_historyPk];
export type purchase_order_status_historyOptionalAttributes = "id" | "changed_by" | "changed_at";
export type purchase_order_status_historyCreationAttributes = Optional<purchase_order_status_historyAttributes, purchase_order_status_historyOptionalAttributes>;

export class purchase_order_status_history extends Model<purchase_order_status_historyAttributes, purchase_order_status_historyCreationAttributes> implements purchase_order_status_historyAttributes {
  id!: string;
  purchase_order_id!: string;
  status!: PurchaseOrderStatus;
  changed_by?: string;
  changed_at?: Date;

  // purchase_order_status_history belongsTo purchase_orders via purchase_order_id
  purchase_order!: purchase_orders;
  getPurchase_order!: Sequelize.BelongsToGetAssociationMixin<purchase_orders>;
  setPurchase_order!: Sequelize.BelongsToSetAssociationMixin<purchase_orders, purchase_ordersId>;
  createPurchase_order!: Sequelize.BelongsToCreateAssociationMixin<purchase_orders>;
  // purchase_order_status_history belongsTo users via changed_by
  changed_by_user!: users;
  getChanged_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setChanged_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createChanged_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof purchase_order_status_history {
    return sequelize.define('purchase_order_status_history', {
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
      status: {
        type: DataTypes.ENUM("draft", "pending", "approved", "received", "paid", "cancelled", "closed"),
        allowNull: false,
        comment: "New status after change"
      },
      changed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: "When the status change occurred"
      }
    }, {
      tableName: 'purchase_order_status_history',
      schema: 'inventory',
      timestamps: false,
      updatedAt: false,
      indexes: [
        {
          name: "purchase_order_status_history_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_po_status_history_order",
          fields: [
            { name: "purchase_order_id" },
          ]
        },
        {
          name: "idx_po_status_history_date",
          fields: [
            { name: "changed_at" },
          ]
        },
      ]
    }) as typeof purchase_order_status_history;
  }
}
