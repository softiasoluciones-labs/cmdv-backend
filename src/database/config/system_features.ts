import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface system_featuresAttributes {
  id: string;
  feature_code: string;
  feature_name: string;
  description?: string;
  is_enabled?: boolean;
  requires_license?: boolean;
  module?: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
}

export type system_featuresPk = "id";
export type system_featuresId = system_features[system_featuresPk];
export type system_featuresOptionalAttributes = "id" | "description" | "is_enabled" | "requires_license" | "module" | "created_at" | "updated_at" | "updated_by";
export type system_featuresCreationAttributes = Optional<system_featuresAttributes, system_featuresOptionalAttributes>;

export class system_features extends Model<system_featuresAttributes, system_featuresCreationAttributes> implements system_featuresAttributes {
  id!: string;
  feature_code!: string;
  feature_name!: string;
  description?: string;
  is_enabled?: boolean;
  requires_license?: boolean;
  module?: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;

  // system_features belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof system_features {
    return sequelize.define('system_features', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      feature_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "system_features_feature_code_key"
      },
      feature_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      requires_license: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: true
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
      tableName: 'system_features',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "idx_system_features_code",
          fields: [
            { name: "feature_code" },
          ]
        },
        {
          name: "idx_system_features_module",
          fields: [
            { name: "module" },
          ]
        },
        {
          name: "system_features_feature_code_key",
          unique: true,
          fields: [
            { name: "feature_code" },
          ]
        },
        {
          name: "system_features_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof system_features;
  }
}
