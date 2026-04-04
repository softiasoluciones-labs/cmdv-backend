import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface global_parametersAttributes {
  id: string;
  category: string;
  parameter_key: string;
  parameter_value: string;
  data_type: "string" | "number" | "boolean" | "json" | "date" | "time" | "datetime" | "email" | "url";
  display_name: string;
  description?: string;
  is_editable?: boolean;
  is_visible?: boolean;
  sort_order?: number;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
}

export type global_parametersPk = "id";
export type global_parametersId = global_parameters[global_parametersPk];
export type global_parametersOptionalAttributes = "id" | "data_type" | "description" | "is_editable" | "is_visible" | "sort_order" | "created_at" | "updated_at" | "updated_by";
export type global_parametersCreationAttributes = Optional<global_parametersAttributes, global_parametersOptionalAttributes>;

export class global_parameters extends Model<global_parametersAttributes, global_parametersCreationAttributes> implements global_parametersAttributes {
  id!: string;
  category!: string;
  parameter_key!: string;
  parameter_value!: string;
  data_type!: "string" | "number" | "boolean" | "json" | "date" | "time" | "datetime" | "email" | "url";
  display_name!: string;
  description?: string;
  is_editable?: boolean;
  is_visible?: boolean;
  sort_order?: number;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;

  // global_parameters belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof global_parameters {
    return sequelize.define('global_parameters', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Parameter category for grouping (billing, medical, inventory, etc.)",
        unique: "global_parameters_category_parameter_key_key"
      },
      parameter_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Unique key for parameter within category",
        unique: "global_parameters_category_parameter_key_key"
      },
      parameter_value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      data_type: {
        type: DataTypes.ENUM("string", "number", "boolean", "json", "date", "time", "datetime", "email", "url"),
        allowNull: false,
        defaultValue: "string",
        comment: "Data type for validation and UI rendering"
      },
      display_name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_editable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: "If FALSE, parameter cannot be changed via UI"
      },
      is_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'global_parameters',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "global_parameters_category_parameter_key_key",
          unique: true,
          fields: [
            { name: "category" },
            { name: "parameter_key" },
          ]
        },
        {
          name: "global_parameters_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_global_params_category",
          fields: [
            { name: "category" },
          ]
        },
        {
          name: "idx_global_params_key",
          fields: [
            { name: "parameter_key" },
          ]
        },
      ]
    }) as typeof global_parameters;
  }
}
