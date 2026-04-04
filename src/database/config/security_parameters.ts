import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface security_parametersAttributes {
  id: string;
  parameter_key: string;
  parameter_value: string;
  display_name: string;
  description?: string;
  requires_restart?: boolean;
  is_sensitive?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
}

export type security_parametersPk = "id";
export type security_parametersId = security_parameters[security_parametersPk];
export type security_parametersOptionalAttributes = "id" | "description" | "requires_restart" | "is_sensitive" | "created_at" | "updated_at" | "updated_by";
export type security_parametersCreationAttributes = Optional<security_parametersAttributes, security_parametersOptionalAttributes>;

export class security_parameters extends Model<security_parametersAttributes, security_parametersCreationAttributes> implements security_parametersAttributes {
  id!: string;
  parameter_key!: string;
  parameter_value!: string;
  display_name!: string;
  description?: string;
  requires_restart?: boolean;
  is_sensitive?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;

  // security_parameters belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof security_parameters {
    return sequelize.define('security_parameters', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      parameter_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "security_parameters_parameter_key_key"
      },
      parameter_value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      display_name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requires_restart: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: "If TRUE, system restart needed after change"
      },
      is_sensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: "If TRUE, value should be masked in UI"
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
      tableName: 'security_parameters',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "idx_security_params_key",
          fields: [
            { name: "parameter_key" },
          ]
        },
        {
          name: "security_parameters_parameter_key_key",
          unique: true,
          fields: [
            { name: "parameter_key" },
          ]
        },
        {
          name: "security_parameters_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof security_parameters;
  }
}
