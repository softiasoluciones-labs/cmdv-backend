import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { notification_templates, notification_templatesId } from './notification_templates';
import type { users, usersId } from '../core/users';

export interface notificationsAttributes {
  id: string;
  notification_type: "email" | "sms" | "push" | "system" | "whatsapp";
  template_code?: string;
  recipient_user_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  subject?: string;
  body: string;
  priority?: "low" | "normal" | "high" | "urgent";
  status?: "pending" | "sent" | "failed" | "read";
  sent_at?: Date;
  read_at?: Date;
  error_message?: string;
  retry_count?: number;
  metadata?: object;
  created_at?: Date;
}

export type notificationsPk = "id";
export type notificationsId = notifications[notificationsPk];
export type notificationsOptionalAttributes = "id" | "template_code" | "recipient_user_id" | "recipient_email" | "recipient_phone" | "subject" | "priority" | "status" | "sent_at" | "read_at" | "error_message" | "retry_count" | "metadata" | "created_at";
export type notificationsCreationAttributes = Optional<notificationsAttributes, notificationsOptionalAttributes>;

export class notifications extends Model<notificationsAttributes, notificationsCreationAttributes> implements notificationsAttributes {
  id!: string;
  notification_type!: "email" | "sms" | "push" | "system" | "whatsapp";
  template_code?: string;
  recipient_user_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  subject?: string;
  body!: string;
  priority?: "low" | "normal" | "high" | "urgent";
  status?: "pending" | "sent" | "failed" | "read";
  sent_at?: Date;
  read_at?: Date;
  error_message?: string;
  retry_count?: number;
  metadata?: object;
  created_at?: Date;

  // notifications belongsTo notification_templates via template_code
  template_code_notification_template!: notification_templates;
  getTemplate_code_notification_template!: Sequelize.BelongsToGetAssociationMixin<notification_templates>;
  setTemplate_code_notification_template!: Sequelize.BelongsToSetAssociationMixin<notification_templates, notification_templatesId>;
  createTemplate_code_notification_template!: Sequelize.BelongsToCreateAssociationMixin<notification_templates>;
  // notifications belongsTo users via recipient_user_id
  recipient_user!: users;
  getRecipient_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setRecipient_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createRecipient_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof notifications {
    return sequelize.define('notifications', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      notification_type: {
        type: DataTypes.ENUM("email", "sms", "push", "system", "whatsapp"),
        allowNull: false
      },
      template_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
          model: 'notification_templates',
          key: 'code'
        }
      },
      recipient_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      recipient_email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      recipient_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      priority: {
        type: DataTypes.ENUM("low", "normal", "high", "urgent"),
        allowNull: true,
        defaultValue: "normal"
      },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed", "read"),
        allowNull: true,
        defaultValue: "pending"
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      retry_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "Number of send attempts"
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Additional data in JSON format (reference IDs, tracking info, etc.)"
      }
    }, {
      tableName: 'notifications',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "idx_notifications_created",
          fields: [
            { name: "created_at" },
          ]
        },
        {
          name: "idx_notifications_status",
          fields: [
            { name: "status" },
          ]
        },
        {
          name: "idx_notifications_type",
          fields: [
            { name: "notification_type" },
          ]
        },
        {
          name: "idx_notifications_user",
          fields: [
            { name: "recipient_user_id" },
          ]
        },
        {
          name: "notifications_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof notifications;
  }
}
