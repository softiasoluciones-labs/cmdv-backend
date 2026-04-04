import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { products, productsId } from './products';
import type { warehouses, warehousesId } from './warehouses';

export interface warehouse_stockAttributes {
  id: string;
  warehouse_id: string;
  product_id: string;
  quantity: number;
  reserved_quantity?: number;
  available_quantity?: number;
  last_updated?: Date;
}

export type warehouse_stockPk = "id";
export type warehouse_stockId = warehouse_stock[warehouse_stockPk];
export type warehouse_stockOptionalAttributes = "id" | "quantity" | "reserved_quantity" | "available_quantity" | "last_updated";
export type warehouse_stockCreationAttributes = Optional<warehouse_stockAttributes, warehouse_stockOptionalAttributes>;

export class warehouse_stock extends Model<warehouse_stockAttributes, warehouse_stockCreationAttributes> implements warehouse_stockAttributes {
  id!: string;
  warehouse_id!: string;
  product_id!: string;
  quantity!: number;
  reserved_quantity?: number;
  available_quantity?: number;
  last_updated?: Date;

  // warehouse_stock belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;
  // warehouse_stock belongsTo warehouses via warehouse_id
  warehouse!: warehouses;
  getWarehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setWarehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createWarehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;

  static initModel(sequelize: Sequelize.Sequelize): typeof warehouse_stock {
    return sequelize.define('warehouse_stock', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id'
      },
      unique: "warehouse_stock_warehouse_id_product_id_key"
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      unique: "warehouse_stock_warehouse_id_product_id_key"
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'warehouse_stock',
    schema: 'inventory',
    timestamps: false,
    indexes: [
      {
        name: "idx_warehouse_stock_product",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "idx_warehouse_stock_warehouse",
        fields: [
          { name: "warehouse_id" },
        ]
      },
      {
        name: "warehouse_stock_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "warehouse_stock_warehouse_id_product_id_key",
        unique: true,
        fields: [
          { name: "warehouse_id" },
          { name: "product_id" },
        ]
      },
    ]
  }) as typeof warehouse_stock;
  }
}
