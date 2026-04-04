import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { purchase_orders, purchase_ordersId } from './purchase_orders';
import type { stock_movements, stock_movementsId } from './stock_movements';
import type { users, usersId } from '../core/users';
import type { warehouse_stock, warehouse_stockId } from './warehouse_stock';

export interface warehousesAttributes {
  id: string;
  code: string;
  name: string;
  location?: string;
  manager_id?: string;
  capacity_m3?: number;
  temperature_controlled?: boolean;
  is_active?: boolean;
  created_at?: Date;
}

export type warehousesPk = "id";
export type warehousesId = warehouses[warehousesPk];
export type warehousesOptionalAttributes = "id" | "location" | "manager_id" | "capacity_m3" | "temperature_controlled" | "is_active" | "created_at";
export type warehousesCreationAttributes = Optional<warehousesAttributes, warehousesOptionalAttributes>;

export class warehouses extends Model<warehousesAttributes, warehousesCreationAttributes> implements warehousesAttributes {
  id!: string;
  code!: string;
  name!: string;
  location?: string;
  manager_id?: string;
  capacity_m3?: number;
  temperature_controlled?: boolean;
  is_active?: boolean;
  created_at?: Date;

  // warehouses belongsTo users via manager_id
  manager!: users;
  getManager!: Sequelize.BelongsToGetAssociationMixin<users>;
  setManager!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createManager!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // warehouses hasMany purchase_orders via warehouse_id
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
  // warehouses hasMany stock_movements via warehouse_id
  stock_movements!: stock_movements[];
  getStock_movements!: Sequelize.HasManyGetAssociationsMixin<stock_movements>;
  setStock_movements!: Sequelize.HasManySetAssociationsMixin<stock_movements, stock_movementsId>;
  addStock_movement!: Sequelize.HasManyAddAssociationMixin<stock_movements, stock_movementsId>;
  addStock_movements!: Sequelize.HasManyAddAssociationsMixin<stock_movements, stock_movementsId>;
  createStock_movement!: Sequelize.HasManyCreateAssociationMixin<stock_movements>;
  removeStock_movement!: Sequelize.HasManyRemoveAssociationMixin<stock_movements, stock_movementsId>;
  removeStock_movements!: Sequelize.HasManyRemoveAssociationsMixin<stock_movements, stock_movementsId>;
  hasStock_movement!: Sequelize.HasManyHasAssociationMixin<stock_movements, stock_movementsId>;
  hasStock_movements!: Sequelize.HasManyHasAssociationsMixin<stock_movements, stock_movementsId>;
  countStock_movements!: Sequelize.HasManyCountAssociationsMixin;
  // warehouses hasMany warehouse_stock via warehouse_id
  warehouse_stocks!: warehouse_stock[];
  getWarehouse_stocks!: Sequelize.HasManyGetAssociationsMixin<warehouse_stock>;
  setWarehouse_stocks!: Sequelize.HasManySetAssociationsMixin<warehouse_stock, warehouse_stockId>;
  addWarehouse_stock!: Sequelize.HasManyAddAssociationMixin<warehouse_stock, warehouse_stockId>;
  addWarehouse_stocks!: Sequelize.HasManyAddAssociationsMixin<warehouse_stock, warehouse_stockId>;
  createWarehouse_stock!: Sequelize.HasManyCreateAssociationMixin<warehouse_stock>;
  removeWarehouse_stock!: Sequelize.HasManyRemoveAssociationMixin<warehouse_stock, warehouse_stockId>;
  removeWarehouse_stocks!: Sequelize.HasManyRemoveAssociationsMixin<warehouse_stock, warehouse_stockId>;
  hasWarehouse_stock!: Sequelize.HasManyHasAssociationMixin<warehouse_stock, warehouse_stockId>;
  hasWarehouse_stocks!: Sequelize.HasManyHasAssociationsMixin<warehouse_stock, warehouse_stockId>;
  countWarehouse_stocks!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof warehouses {
    return sequelize.define('warehouses', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: "warehouses_code_key"
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      manager_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      capacity_m3: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      temperature_controlled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'warehouses',
      schema: 'inventory',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          name: "warehouses_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "warehouses_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof warehouses;
  }
}
