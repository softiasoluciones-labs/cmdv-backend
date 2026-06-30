import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { products, productsId } from '../inventory/products';
import type { warehouses, warehousesId } from '../inventory/warehouses';
import type { stock_movements, stock_movementsId } from '../inventory/stock_movements';
import type { users, usersId } from '../core/users';

export interface case_productsAttributes {
  id: string;
  case_file_id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  stock_movement_id?: string;
  applied_by?: string;
  applied_at?: Date;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}

export type case_productsPk = "id";
export type case_productsId = case_products[case_productsPk];
export type case_productsOptionalAttributes =
  | "id"
  | "stock_movement_id"
  | "applied_by"
  | "applied_at"
  | "notes"
  | "is_voided"
  | "voided_by"
  | "voided_at"
  | "void_reason";
export type case_productsCreationAttributes = Optional<case_productsAttributes, case_productsOptionalAttributes>;

export class case_products
  extends Model<case_productsAttributes, case_productsCreationAttributes>
  implements case_productsAttributes {
  id!: string;
  case_file_id!: string;
  product_id!: string;
  warehouse_id!: string;
  quantity!: number;
  unit_price!: number;
  total_price!: number;
  stock_movement_id?: string;
  applied_by?: string;
  applied_at?: Date;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;

  // case_products belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;

  // case_products belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;

  // case_products belongsTo warehouses via warehouse_id
  warehouse!: warehouses;
  getWarehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setWarehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createWarehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;

  // case_products belongsTo stock_movements via stock_movement_id
  stock_movement!: stock_movements;
  getStock_movement!: Sequelize.BelongsToGetAssociationMixin<stock_movements>;
  setStock_movement!: Sequelize.BelongsToSetAssociationMixin<stock_movements, stock_movementsId>;
  createStock_movement!: Sequelize.BelongsToCreateAssociationMixin<stock_movements>;

  // case_products belongsTo users via applied_by
  applied_by_user!: users;
  getApplied_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApplied_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createApplied_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  // case_products belongsTo users via voided_by
  voided_by_user!: users;
  getVoided_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setVoided_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createVoided_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_products {
    return sequelize.define('case_products', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      case_file_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'case_files', key: 'id' }
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' }
      },
      warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'warehouses', key: 'id' }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      stock_movement_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'stock_movements', key: 'id' }
      },
      applied_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      applied_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_voided: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      voided_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      voided_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      void_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'case_products',
      schema: 'medical',
      timestamps: false,
      indexes: [
        {
          name: "case_products_pkey",
          unique: true,
          fields: [{ name: "id" }]
        },
        {
          name: "idx_case_products_case_file",
          fields: [{ name: "case_file_id" }]
        },
        {
          name: "idx_case_products_product",
          fields: [{ name: "product_id" }]
        },
        {
          name: "idx_case_products_applied_at",
          fields: [{ name: "applied_at" }]
        }
      ]
    }) as typeof case_products;
  }
}
