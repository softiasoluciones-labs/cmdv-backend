import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { permissions, permissionsId } from './permissions';
import type { users, usersId } from '../core/users';

export interface user_permissionsAttributes {
  id: string;
  user_id: string;
  permission_id: string;
  granted_at?: Date;
  granted_by?: string;
}

export type user_permissionsPk = "id";
export type user_permissionsId = user_permissions[user_permissionsPk];
export type user_permissionsOptionalAttributes = "id" | "granted_at" | "granted_by";
export type user_permissionsCreationAttributes = Optional<user_permissionsAttributes, user_permissionsOptionalAttributes>;

export class user_permissions extends Model<user_permissionsAttributes, user_permissionsCreationAttributes> implements user_permissionsAttributes {
  id!: string;
  user_id!: string;
  permission_id!: string;
  granted_at?: Date;
  granted_by?: string;

  // user_permissions belongsTo permissions via permission_id
  permission!: permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<permissions, permissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<permissions>;
  // user_permissions belongsTo users via granted_by
  granted_by_user!: users;
  getGranted_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setGranted_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createGranted_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // user_permissions belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof user_permissions {
    return sequelize.define('user_permissions', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        unique: "user_permissions_user_id_permission_id_key"
      },
      permission_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        unique: "user_permissions_user_id_permission_id_key"
      },
      granted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      granted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'user_permissions',
      schema: 'core',
      timestamps: false,
      indexes: [
        {
          name: "user_permissions_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "user_permissions_user_id_permission_id_key",
          unique: true,
          fields: [
            { name: "user_id" },
            { name: "permission_id" },
          ]
        },
      ]
    }) as typeof user_permissions;
  }
}
