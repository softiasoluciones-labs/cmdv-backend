import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { product_categories, product_categoriesId } from './product_categories';
import type { purchase_order_details, purchase_order_detailsId } from './purchase_order_details';
import type { stock_movements, stock_movementsId } from './stock_movements';
import type { warehouse_stock, warehouse_stockId } from './warehouse_stock';

export interface productsAttributes {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  category_id: string;
  description?: string;
  unit_of_measure: string;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
  unit_cost?: number;
  selling_price?: number;
  requires_prescription?: boolean;
  requires_refrigeration?: boolean;
  expiration_alert_days?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type productsPk = "id";
export type productsId = products[productsPk];
export type productsOptionalAttributes = "id" | "barcode" | "description" | "minimum_stock" | "maximum_stock" | "reorder_point" | "unit_cost" | "selling_price" | "requires_prescription" | "requires_refrigeration" | "expiration_alert_days" | "is_active" | "created_at" | "updated_at";
export type productsCreationAttributes = Optional<productsAttributes, productsOptionalAttributes>;

export class products extends Model<productsAttributes, productsCreationAttributes> implements productsAttributes {
  id!: string;
  code!: string;
  barcode?: string;
  name!: string;
  category_id!: string;
  description?: string;
  unit_of_measure!: string;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
  unit_cost?: number;
  selling_price?: number;
  requires_prescription?: boolean;
  requires_refrigeration?: boolean;
  expiration_alert_days?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  // products belongsTo product_categories via category_id
  category!: product_categories;
  getCategory!: Sequelize.BelongsToGetAssociationMixin<product_categories>;
  setCategory!: Sequelize.BelongsToSetAssociationMixin<product_categories, product_categoriesId>;
  createCategory!: Sequelize.BelongsToCreateAssociationMixin<product_categories>;
  // products hasMany purchase_order_details via product_id
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
  // products hasMany stock_movements via product_id
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
  // products hasMany warehouse_stock via product_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof products {
    return sequelize.define('products', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "products_code_key"
      },
      barcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: "products_barcode_key"
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'product_categories',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      unit_of_measure: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      minimum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10
      },
      maximum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      reorder_point: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      unit_cost: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      selling_price: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      requires_prescription: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      requires_refrigeration: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      expiration_alert_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'products',
      schema: 'inventory',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: "idx_products_category",
          fields: [
            { name: "category_id" },
          ]
        },
        {
          name: "idx_products_code",
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "products_barcode_key",
          unique: true,
          fields: [
            { name: "barcode" },
          ]
        },
        {
          name: "products_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "products_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof products;
  }
}
