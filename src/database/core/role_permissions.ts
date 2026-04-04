import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { permissions, permissionsId } from './permissions';
import type { users, usersId } from '../core/users';

export interface role_permissionsAttributes {
  id: string;
  role: "super_admin" | "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist" | "lab_technician" | "billing_staff" | "warehouse_manager";
  permission_id: string;
  granted_at?: Date;
  granted_by?: string;
}

export type role_permissionsPk = "id";
export type role_permissionsId = role_permissions[role_permissionsPk];
export type role_permissionsOptionalAttributes = "id" | "granted_at" | "granted_by";
export type role_permissionsCreationAttributes = Optional<role_permissionsAttributes, role_permissionsOptionalAttributes>;

export class role_permissions extends Model<role_permissionsAttributes, role_permissionsCreationAttributes> implements role_permissionsAttributes {
  id!: string;
  role!: "super_admin" | "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist" | "lab_technician" | "billing_staff" | "warehouse_manager";
  permission_id!: string;
  granted_at?: Date;
  granted_by?: string;

  // role_permissions belongsTo permissions via permission_id
  permission!: permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<permissions, permissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<permissions>;
  // role_permissions belongsTo users via granted_by
  granted_by_user!: users;
  getGranted_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setGranted_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createGranted_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof role_permissions {
    return sequelize.define('role_permissions', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin", "doctor", "nurse", "pharmacist", "receptionist", "lab_technician", "billing_staff", "warehouse_manager"),
        allowNull: false,
        unique: "role_permissions_role_permission_id_key"
      },
      permission_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        unique: "role_permissions_role_permission_id_key"
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
      tableName: 'role_permissions',
      schema: 'core',
      timestamps: false,
      indexes: [
        {
          name: "role_permissions_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "role_permissions_role_permission_id_key",
          unique: true,
          fields: [
            { name: "role" },
            { name: "permission_id" },
          ]
        },
      ]
    }) as typeof role_permissions;
  }
}
