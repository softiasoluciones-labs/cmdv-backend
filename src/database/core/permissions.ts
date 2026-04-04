import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { role_permissions, role_permissionsId } from './role_permissions';
import type { user_permissions, user_permissionsId } from './user_permissions';

export interface permissionsAttributes {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "approve" | "cancel";
  created_at?: Date;
}

export type permissionsPk = "id";
export type permissionsId = permissions[permissionsPk];
export type permissionsOptionalAttributes = "id" | "description" | "created_at";
export type permissionsCreationAttributes = Optional<permissionsAttributes, permissionsOptionalAttributes>;

export class permissions extends Model<permissionsAttributes, permissionsCreationAttributes> implements permissionsAttributes {
  id!: string;
  name!: string;
  description?: string;
  resource!: string;
  action!: "create" | "read" | "update" | "delete" | "approve" | "cancel";
  created_at?: Date;

  // permissions hasMany role_permissions via permission_id
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
  // permissions hasMany user_permissions via permission_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof permissions {
    return sequelize.define('permissions', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "permissions_name_key"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM("create","read","update","delete","approve","cancel"),
      allowNull: false
    }
  }, {
    tableName: 'permissions',
    schema: 'core',
    timestamps: true,
    indexes: [
      {
        name: "permissions_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "permissions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof permissions;
  }
}
