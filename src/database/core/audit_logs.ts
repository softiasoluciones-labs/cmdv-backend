import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface audit_logsAttributes {
  id: string;
  user_id?: string;
  action: "insert" | "update" | "delete" | "login" | "logout" | "access";
  table_name?: string;
  record_id?: string;
  old_values?: object;
  new_values?: object;
  ip_address?: string;
  user_agent?: string;
  description?: string;
  created_at?: Date;
}

export type audit_logsPk = "id";
export type audit_logsId = audit_logs[audit_logsPk];
export type audit_logsOptionalAttributes = "id" | "user_id" | "table_name" | "record_id" | "old_values" | "new_values" | "ip_address" | "user_agent" | "description" | "created_at";
export type audit_logsCreationAttributes = Optional<audit_logsAttributes, audit_logsOptionalAttributes>;

export class audit_logs extends Model<audit_logsAttributes, audit_logsCreationAttributes> implements audit_logsAttributes {
  id!: string;
  user_id?: string;
  action!: "insert" | "update" | "delete" | "login" | "logout" | "access";
  table_name?: string;
  record_id?: string;
  old_values?: object;
  new_values?: object;
  ip_address?: string;
  user_agent?: string;
  description?: string;
  created_at?: Date;

  // audit_logs belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof audit_logs {
    return sequelize.define('audit_logs', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.ENUM("insert", "update", "delete", "login", "logout", "access"),
        allowNull: false
      },
      table_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      record_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      old_values: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      new_values: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.INET,
        allowNull: true
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'audit_logs',
      schema: 'core',
      timestamps: true,
      indexes: [
        {
          name: "audit_logs_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_audit_logs_created",
          fields: [
            { name: "created_at" },
          ]
        },
        {
          name: "idx_audit_logs_user",
          fields: [
            { name: "user_id" },
          ]
        },
      ]
    }) as typeof audit_logs;
  }
}
