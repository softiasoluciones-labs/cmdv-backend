import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { packages, packagesId } from './packages';
import type { products, productsId } from '../inventory/products';

export interface package_detailsAttributes {
  id: string;
  package_id: string;
  product_id: string;
  quantity: number;
  notes?: string;
  created_at?: Date;
}

export type package_detailsPk = "id";
export type package_detailsId = package_details[package_detailsPk];
export type package_detailsOptionalAttributes = "id" | "quantity" | "notes" | "created_at";
export type package_detailsCreationAttributes = Optional<package_detailsAttributes, package_detailsOptionalAttributes>;

export class package_details extends Model<package_detailsAttributes, package_detailsCreationAttributes> implements package_detailsAttributes {
  id!: string;
  package_id!: string;
  product_id!: string;
  quantity!: number;
  notes?: string;
  created_at?: Date;

  // package_details belongsTo packages via package_id
  package!: packages;
  getPackage!: Sequelize.BelongsToGetAssociationMixin<packages>;
  setPackage!: Sequelize.BelongsToSetAssociationMixin<packages, packagesId>;
  createPackage!: Sequelize.BelongsToCreateAssociationMixin<packages>;
  // package_details belongsTo products via product_id
  product!: products;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<products>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<products, productsId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<products>;

  static initModel(sequelize: Sequelize.Sequelize): typeof package_details {
    return sequelize.define('package_details', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      package_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'packages',
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
        allowNull: false,
        defaultValue: 1
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'package_details',
      schema: 'medical',
      timestamps: true,
      indexes: [
        {
          name: "idx_package_details_package",
          fields: [
            { name: "package_id" },
          ]
        },
        {
          name: "idx_package_details_product",
          fields: [
            { name: "product_id" },
          ]
        },
        {
          name: "package_details_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof package_details;
  }
}
