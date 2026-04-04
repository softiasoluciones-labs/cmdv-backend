import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { products, productsId } from './products';
import type { users, usersId } from '../core/users';

import type { warehouses, warehousesId } from './warehouses';

export interface stock_movementsAttributes {
  id?: string;
  movement_number: string;
  movement_type: "purchase" | "sale" | "adjustment" | "transfer" | "return" | "dispatch" | "reception";
  warehouse_id: string;
  product_id: string;
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
  movement_date?: Date;
  created_by?: string;
}

export type stock_movementsPk = "id";
export type stock_movementsId = stock_movements[stock_movementsPk];
export type stock_movementsOptionalAttributes = "id" | "unit_cost" | "reference_type" | "reference_id" | "batch_number" | "expiration_date" | "notes" | "movement_date" | "created_by";
export type stock_movementsCreationAttributes = Optional<stock_movementsAttributes, stock_movementsOptionalAttributes>;

export class stock_movements extends Model<stock_movementsAttributes, stock_movementsCreationAttributes> implements stock_movementsAttributes {
  id!: string;
  movement_number!: string;
  movement_type!: "purchase" | "sale" | "adjustment" | "transfer" | "return" | "dispatch" | "reception";
  warehouse_id!: string;
  product_id!: string;
  quantity!: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
  movement_date?: Date;
  created_by?: string;

  // stock_movements belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;
  // stock_movements belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // stock_movements belongsTo warehouses via warehouse_id
  warehouse!: warehouses;
  getWarehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setWarehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createWarehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;

  static initModel(sequelize: Sequelize.Sequelize): typeof stock_movements {
    return sequelize.define('stock_movements', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      movement_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "stock_movements_movement_number_key"
      },
      movement_type: {
        type: DataTypes.ENUM("purchase", "sale", "adjustment", "transfer", "return", "dispatch", "reception"),
        allowNull: false
      },
      warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        }
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      unit_cost: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      batch_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      expiration_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      movement_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
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
      tableName: 'stock_movements',
      schema: 'inventory',
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "idx_stock_movements_date",
          fields: [
            { name: "movement_date" },
          ]
        },
        {
          name: "idx_stock_movements_product",
          fields: [
            { name: "product_id" },
          ]
        },
        {
          name: "idx_stock_movements_warehouse",
          fields: [
            { name: "warehouse_id" },
          ]
        },
        {
          name: "stock_movements_movement_number_key",
          unique: true,
          fields: [
            { name: "movement_number" },
          ]
        },
        {
          name: "stock_movements_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof stock_movements;
  }
}
