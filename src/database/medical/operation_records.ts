import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { scheduled_operations, scheduled_operationsId } from './scheduled_operations';
import type { users, usersId } from '../core/users';

export interface operation_recordsAttributes {
  id: string;
  scheduled_operation_id: string;
  actual_start_time: Date;
  actual_end_time: Date;
  anesthesia_type?: string;
  procedure_performed: string;
  findings?: string;
  complications?: string;
  blood_loss_ml?: number;
  specimens_sent?: string[];
  post_operative_orders?: string;
  created_at?: Date;
  created_by?: string;
}

export type operation_recordsPk = "id";
export type operation_recordsId = operation_records[operation_recordsPk];
export type operation_recordsOptionalAttributes = "id" | "anesthesia_type" | "findings" | "complications" | "blood_loss_ml" | "specimens_sent" | "post_operative_orders" | "created_at" | "created_by";
export type operation_recordsCreationAttributes = Optional<operation_recordsAttributes, operation_recordsOptionalAttributes>;

export class operation_records extends Model<operation_recordsAttributes, operation_recordsCreationAttributes> implements operation_recordsAttributes {
  id!: string;
  scheduled_operation_id!: string;
  actual_start_time!: Date;
  actual_end_time!: Date;
  anesthesia_type?: string;
  procedure_performed!: string;
  findings?: string;
  complications?: string;
  blood_loss_ml?: number;
  specimens_sent?: string[];
  post_operative_orders?: string;
  created_at?: Date;
  created_by?: string;

  // operation_records belongsTo scheduled_operations via scheduled_operation_id
  scheduled_operation!: scheduled_operations;
  getScheduled_operation!: Sequelize.BelongsToGetAssociationMixin<scheduled_operations>;
  setScheduled_operation!: Sequelize.BelongsToSetAssociationMixin<scheduled_operations, scheduled_operationsId>;
  createScheduled_operation!: Sequelize.BelongsToCreateAssociationMixin<scheduled_operations>;
  // operation_records belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof operation_records {
    return sequelize.define('operation_records', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      scheduled_operation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'scheduled_operations',
          key: 'id'
        },
        unique: "operation_records_scheduled_operation_id_key"
      },
      actual_start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      actual_end_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      anesthesia_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      procedure_performed: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      findings: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      complications: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      blood_loss_ml: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      specimens_sent: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true
      },
      post_operative_orders: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'operation_records',
      schema: 'medical',
      timestamps: true,
      indexes: [
        {
          name: "operation_records_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "operation_records_scheduled_operation_id_key",
          unique: true,
          fields: [
            { name: "scheduled_operation_id" },
          ]
        },
      ]
    }) as typeof operation_records;
  }
}
