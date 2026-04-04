import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { products, productsId } from './products';
import type { purchase_orders, purchase_ordersId } from './purchase_orders';

export interface purchase_order_detailsAttributes {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  tax?: number;
  total: number;
  received_quantity?: number;
  expiration_date?: string;
  batch_number?: string;
  notes?: string;
}

export type purchase_order_detailsPk = "id";
export type purchase_order_detailsId = purchase_order_details[purchase_order_detailsPk];
export type purchase_order_detailsOptionalAttributes = "id" | "tax" | "received_quantity" | "expiration_date" | "batch_number" | "notes";
export type purchase_order_detailsCreationAttributes = Optional<purchase_order_detailsAttributes, purchase_order_detailsOptionalAttributes>;

export class purchase_order_details extends Model<purchase_order_detailsAttributes, purchase_order_detailsCreationAttributes> implements purchase_order_detailsAttributes {
  id!: string;
  purchase_order_id!: string;
  product_id!: string;
  quantity!: number;
  unit_cost!: number;
  subtotal!: number;
  tax?: number;
  total!: number;
  received_quantity?: number;
  expiration_date?: string;
  batch_number?: string;
  notes?: string;

  // purchase_order_details belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;
  // purchase_order_details belongsTo purchase_orders via purchase_order_id
  purchase_order!: purchase_orders;
  getPurchase_order!: Sequelize.BelongsToGetAssociationMixin<purchase_orders>;
  setPurchase_order!: Sequelize.BelongsToSetAssociationMixin<purchase_orders, purchase_ordersId>;
  createPurchase_order!: Sequelize.BelongsToCreateAssociationMixin<purchase_orders>;

  static initModel(sequelize: Sequelize.Sequelize): typeof purchase_order_details {
    return sequelize.define('purchase_order_details', {
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
      allowNull: false
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
    total: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    received_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'purchase_order_details',
    schema: 'inventory',
    timestamps: false,
    indexes: [
      {
        name: "purchase_order_details_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof purchase_order_details;
  }
}
