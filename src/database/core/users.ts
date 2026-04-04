import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { audit_logs, audit_logsId } from './audit_logs';
import type { jwt_tokens, jwt_tokensId } from './jwt_tokens';
import type { role_permissions, role_permissionsId } from './role_permissions';
import type { user_permissions, user_permissionsId } from './user_permissions';

export interface usersAttributes {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: "super_admin" | "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist" | "lab_technician" | "billing_staff" | "warehouse_manager";
  is_active?: boolean;
  last_login?: Date;
  password_changed_at?: Date;
  failed_login_attempts?: number;
  locked_until?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "id" | "is_active" | "last_login" | "password_changed_at" | "failed_login_attempts" | "locked_until" | "created_at" | "updated_at" | "created_by" | "updated_by";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: string;
  username!: string;
  email!: string;
  password_hash!: string;
  full_name!: string;
  role!: "super_admin" | "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist" | "lab_technician" | "billing_staff" | "warehouse_manager";
  is_active?: boolean;
  last_login?: Date;
  password_changed_at?: Date;
  failed_login_attempts?: number;
  locked_until?: Date;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;

  // users hasMany audit_logs via user_id
  audit_logs!: audit_logs[];
  getAudit_logs!: Sequelize.HasManyGetAssociationsMixin<audit_logs>;
  setAudit_logs!: Sequelize.HasManySetAssociationsMixin<audit_logs, audit_logsId>;
  addAudit_log!: Sequelize.HasManyAddAssociationMixin<audit_logs, audit_logsId>;
  addAudit_logs!: Sequelize.HasManyAddAssociationsMixin<audit_logs, audit_logsId>;
  createAudit_log!: Sequelize.HasManyCreateAssociationMixin<audit_logs>;
  removeAudit_log!: Sequelize.HasManyRemoveAssociationMixin<audit_logs, audit_logsId>;
  removeAudit_logs!: Sequelize.HasManyRemoveAssociationsMixin<audit_logs, audit_logsId>;
  hasAudit_log!: Sequelize.HasManyHasAssociationMixin<audit_logs, audit_logsId>;
  hasAudit_logs!: Sequelize.HasManyHasAssociationsMixin<audit_logs, audit_logsId>;
  countAudit_logs!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany jwt_tokens via user_id
  jwt_tokens!: jwt_tokens[];
  getJwt_tokens!: Sequelize.HasManyGetAssociationsMixin<jwt_tokens>;
  setJwt_tokens!: Sequelize.HasManySetAssociationsMixin<jwt_tokens, jwt_tokensId>;
  addJwt_token!: Sequelize.HasManyAddAssociationMixin<jwt_tokens, jwt_tokensId>;
  addJwt_tokens!: Sequelize.HasManyAddAssociationsMixin<jwt_tokens, jwt_tokensId>;
  createJwt_token!: Sequelize.HasManyCreateAssociationMixin<jwt_tokens>;
  removeJwt_token!: Sequelize.HasManyRemoveAssociationMixin<jwt_tokens, jwt_tokensId>;
  removeJwt_tokens!: Sequelize.HasManyRemoveAssociationsMixin<jwt_tokens, jwt_tokensId>;
  hasJwt_token!: Sequelize.HasManyHasAssociationMixin<jwt_tokens, jwt_tokensId>;
  hasJwt_tokens!: Sequelize.HasManyHasAssociationsMixin<jwt_tokens, jwt_tokensId>;
  countJwt_tokens!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany role_permissions via granted_by
  role_permissions!: role_permissions[];
  getRole_permissions!: Sequelize.HasManyGetAssociationsMixin<role_permissions>;
  setRole_permissions!: Sequelize.HasManySetAssociationsMixin<role_permissions, role_permissionsId>;
  addRole_permission!: Sequelize.HasManyAddAssociationMixin<role_permissions, role_permissionsId>;
  addRole_permissions!: Sequelize.HasManyAddAssociationsMixin<role_permissions, role_permissionsId>;
  createRole_permission!: Sequelize.HasManyCreateAssociationMixin<role_permissions>;
  removeRole_permission!: Sequelize.HasManyRemoveAssociationMixin<role_permissions, role_permissionsId>;
  removeRole_permissions!: Sequelize.HasManyRemoveAssociationsMixin<role_permissions, role_permissionsId>;
  hasRole_permission!: Sequelize.HasManyHasAssociationMixin<role_permissions, role_permissionsId>;
  hasRole_permissions!: Sequelize.HasManyHasAssociationsMixin<role_permissions, role_permissionsId>;
  countRole_permissions!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany user_permissions via granted_by
  user_permissions!: user_permissions[];
  getUser_permissions!: Sequelize.HasManyGetAssociationsMixin<user_permissions>;
  setUser_permissions!: Sequelize.HasManySetAssociationsMixin<user_permissions, user_permissionsId>;
  addUser_permission!: Sequelize.HasManyAddAssociationMixin<user_permissions, user_permissionsId>;
  addUser_permissions!: Sequelize.HasManyAddAssociationsMixin<user_permissions, user_permissionsId>;
  createUser_permission!: Sequelize.HasManyCreateAssociationMixin<user_permissions>;
  removeUser_permission!: Sequelize.HasManyRemoveAssociationMixin<user_permissions, user_permissionsId>;
  removeUser_permissions!: Sequelize.HasManyRemoveAssociationsMixin<user_permissions, user_permissionsId>;
  hasUser_permission!: Sequelize.HasManyHasAssociationMixin<user_permissions, user_permissionsId>;
  hasUser_permissions!: Sequelize.HasManyHasAssociationsMixin<user_permissions, user_permissionsId>;
  countUser_permissions!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany user_permissions via user_id
  user_user_permissions!: user_permissions[];
  getUser_user_permissions!: Sequelize.HasManyGetAssociationsMixin<user_permissions>;
  setUser_user_permissions!: Sequelize.HasManySetAssociationsMixin<user_permissions, user_permissionsId>;
  addUser_user_permission!: Sequelize.HasManyAddAssociationMixin<user_permissions, user_permissionsId>;
  addUser_user_permissions!: Sequelize.HasManyAddAssociationsMixin<user_permissions, user_permissionsId>;
  createUser_user_permission!: Sequelize.HasManyCreateAssociationMixin<user_permissions>;
  removeUser_user_permission!: Sequelize.HasManyRemoveAssociationMixin<user_permissions, user_permissionsId>;
  removeUser_user_permissions!: Sequelize.HasManyRemoveAssociationsMixin<user_permissions, user_permissionsId>;
  hasUser_user_permission!: Sequelize.HasManyHasAssociationMixin<user_permissions, user_permissionsId>;
  hasUser_user_permissions!: Sequelize.HasManyHasAssociationsMixin<user_permissions, user_permissionsId>;
  countUser_user_permissions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return sequelize.define('users', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "users_username_key"
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "users_email_key"
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      full_name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin", "doctor", "nurse", "pharmacist", "receptionist", "lab_technician", "billing_staff", "warehouse_manager"),
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      failed_login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      locked_until: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true
      }
    }, {
      tableName: 'users',
      schema: 'core',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
      indexes: [
        {
          name: "idx_users_email",
          fields: [
            { name: "email" },
          ]
        },
        {
          name: "idx_users_role",
          fields: [
            { name: "role" },
          ]
        },
        {
          name: "idx_users_username",
          fields: [
            { name: "username" },
          ]
        },
        {
          name: "users_email_key",
          unique: true,
          fields: [
            { name: "email" },
          ]
        },
        {
          name: "users_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "users_username_key",
          unique: true,
          fields: [
            { name: "username" },
          ]
        },
      ]
    }) as typeof users;
  }
}
