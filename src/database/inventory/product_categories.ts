import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { products, productsId } from './products';

export interface product_categoriesAttributes {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  is_active?: boolean;
  created_at?: Date;
}

export type product_categoriesPk = "id";
export type product_categoriesId = product_categories[product_categoriesPk];
export type product_categoriesOptionalAttributes = "id" | "description" | "parent_category_id" | "is_active" | "created_at";
export type product_categoriesCreationAttributes = Optional<product_categoriesAttributes, product_categoriesOptionalAttributes>;

export class product_categories extends Model<product_categoriesAttributes, product_categoriesCreationAttributes> implements product_categoriesAttributes {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  parent_category_id?: string;
  is_active?: boolean;
  created_at?: Date;

  // product_categories belongsTo product_categories via parent_category_id
  parent_category!: product_categories;
  getParent_category!: Sequelize.BelongsToGetAssociationMixin<product_categories>;
  setParent_category!: Sequelize.BelongsToSetAssociationMixin<product_categories, product_categoriesId>;
  createParent_category!: Sequelize.BelongsToCreateAssociationMixin<product_categories>;
  // product_categories hasMany products via category_id
  products!: products[];
  getProducts!: Sequelize.HasManyGetAssociationsMixin<products>;
  setProducts!: Sequelize.HasManySetAssociationsMixin<products, productsId>;
  addProduct!: Sequelize.HasManyAddAssociationMixin<products, productsId>;
  addProducts!: Sequelize.HasManyAddAssociationsMixin<products, productsId>;
  createProduct!: Sequelize.HasManyCreateAssociationMixin<products>;
  removeProduct!: Sequelize.HasManyRemoveAssociationMixin<products, productsId>;
  removeProducts!: Sequelize.HasManyRemoveAssociationsMixin<products, productsId>;
  hasProduct!: Sequelize.HasManyHasAssociationMixin<products, productsId>;
  hasProducts!: Sequelize.HasManyHasAssociationsMixin<products, productsId>;
  countProducts!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof product_categories {
    return sequelize.define('product_categories', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "product_categories_code_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'product_categories',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'product_categories',
    schema: 'inventory',
    timestamps: true,
    indexes: [
      {
        name: "product_categories_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "product_categories_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof product_categories;
  }
}
