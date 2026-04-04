import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { notifications, notificationsId } from './notifications';
import type { users, usersId } from '../core/users';

export interface notification_templatesAttributes {
  id: string;
  code: string;
  name: string;
  notification_type: "email" | "sms" | "push" | "system" | "whatsapp";
  subject?: string;
  body_template: string;
  variables?: string[];
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
}

export type notification_templatesPk = "id";
export type notification_templatesId = notification_templates[notification_templatesPk];
export type notification_templatesOptionalAttributes = "id" | "subject" | "variables" | "is_active" | "created_at" | "updated_at" | "updated_by";
export type notification_templatesCreationAttributes = Optional<notification_templatesAttributes, notification_templatesOptionalAttributes>;

export class notification_templates extends Model<notification_templatesAttributes, notification_templatesCreationAttributes> implements notification_templatesAttributes {
  id!: string;
  code!: string;
  name!: string;
  notification_type!: "email" | "sms" | "push" | "system" | "whatsapp";
  subject?: string;
  body_template!: string;
  variables?: string[];
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;

  // notification_templates hasMany notifications via template_code
  notifications!: notifications[];
  getNotifications!: Sequelize.HasManyGetAssociationsMixin<notifications>;
  setNotifications!: Sequelize.HasManySetAssociationsMixin<notifications, notificationsId>;
  addNotification!: Sequelize.HasManyAddAssociationMixin<notifications, notificationsId>;
  addNotifications!: Sequelize.HasManyAddAssociationsMixin<notifications, notificationsId>;
  createNotification!: Sequelize.HasManyCreateAssociationMixin<notifications>;
  removeNotification!: Sequelize.HasManyRemoveAssociationMixin<notifications, notificationsId>;
  removeNotifications!: Sequelize.HasManyRemoveAssociationsMixin<notifications, notificationsId>;
  hasNotification!: Sequelize.HasManyHasAssociationMixin<notifications, notificationsId>;
  hasNotifications!: Sequelize.HasManyHasAssociationsMixin<notifications, notificationsId>;
  countNotifications!: Sequelize.HasManyCountAssociationsMixin;
  // notification_templates belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof notification_templates {
    return sequelize.define('notification_templates', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "notification_templates_code_key"
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      notification_type: {
        type: DataTypes.ENUM("email", "sms", "push", "system", "whatsapp"),
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      body_template: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      variables: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        comment: "Array of variable names available in template (e.g., {patient_name}, {case_number})"
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
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
      tableName: 'notification_templates',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "idx_notification_templates_code",
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "idx_notification_templates_type",
          fields: [
            { name: "notification_type" },
          ]
        },
        {
          name: "notification_templates_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "notification_templates_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof notification_templates;
  }
}
