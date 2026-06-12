import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { products, productsId } from './products';
import type { warehouse_dispatches, warehouse_dispatchesId } from './warehouse_dispatches';

export interface warehouse_dispatch_detailsAttributes {
  id: string;
  dispatch_id: string;
  product_id: string;
  quantity: number;
  delivered_quantity?: number;
  notes?: string;
}

export type warehouse_dispatch_detailsPk = "id";
export type warehouse_dispatch_detailsId = warehouse_dispatch_details[warehouse_dispatch_detailsPk];
export type warehouse_dispatch_detailsOptionalAttributes = "id" | "delivered_quantity" | "notes";
export type warehouse_dispatch_detailsCreationAttributes = Optional<warehouse_dispatch_detailsAttributes, warehouse_dispatch_detailsOptionalAttributes>;

export class warehouse_dispatch_details extends Model<warehouse_dispatch_detailsAttributes, warehouse_dispatch_detailsCreationAttributes> implements warehouse_dispatch_detailsAttributes {
  id!: string;
  dispatch_id!: string;
  product_id!: string;
  quantity!: number;
  delivered_quantity?: number;
  notes?: string;

  // warehouse_dispatch_details belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;
  // warehouse_dispatch_details belongsTo warehouse_dispatches via dispatch_id
  warehouse_dispatch!: warehouse_dispatches;
  getWarehouse_dispatch!: Sequelize.BelongsToGetAssociationMixin<warehouse_dispatches>;
  setWarehouse_dispatch!: Sequelize.BelongsToSetAssociationMixin<warehouse_dispatches, warehouse_dispatchesId>;
  createWarehouse_dispatch!: Sequelize.BelongsToCreateAssociationMixin<warehouse_dispatches>;

  static initModel(sequelize: Sequelize.Sequelize): typeof warehouse_dispatch_details {
    return sequelize.define('warehouse_dispatch_details', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      dispatch_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'warehouse_dispatches',
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
      delivered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'warehouse_dispatch_details',
      schema: 'inventory',
      timestamps: false,
      indexes: [
        {
          name: "warehouse_dispatch_details_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_warehouse_dispatch_details_dispatch",
          fields: [
            { name: "dispatch_id" },
          ]
        },
      ]
    }) as typeof warehouse_dispatch_details;
  }
}