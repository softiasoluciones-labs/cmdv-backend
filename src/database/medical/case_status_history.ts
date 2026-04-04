import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { users, usersId } from '../core/users';

export interface case_status_historyAttributes {
  id: string;
  case_file_id: string;
  from_status: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  to_status: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  transition_date: Date;
  reason?: string;
  notes?: string;
  performed_by?: string;
  created_at?: Date;
}

export type case_status_historyPk = "id";
export type case_status_historyId = case_status_history[case_status_historyPk];
export type case_status_historyOptionalAttributes = "id" | "transition_date" | "reason" | "notes" | "performed_by" | "created_at";
export type case_status_historyCreationAttributes = Optional<case_status_historyAttributes, case_status_historyOptionalAttributes>;

export class case_status_history extends Model<case_status_historyAttributes, case_status_historyCreationAttributes> implements case_status_historyAttributes {
  id!: string;
  case_file_id!: string;
  from_status!: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  to_status!: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  transition_date!: Date;
  reason?: string;
  notes?: string;
  performed_by?: string;
  created_at?: Date;

  // case_status_history belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_status_history belongsTo users via performed_by
  performed_by_user!: users;
  getPerformed_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setPerformed_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createPerformed_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_status_history {
    return sequelize.define('case_status_history', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      case_file_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'case_files',
          key: 'id'
        }
      },
      from_status: {
        type: DataTypes.ENUM("C1_CREACION", "C2_CANCELACION", "C3_CERRADO", "CE_CARGOS_EXPEDIENTE", "CC_CONFIRMACION_CARGOS", "TR_TRASLADO_PROCEDIMIENTO", "RA_REAPERTURA", "EX_EXTORNO"),
        allowNull: false,
        comment: "Previous status in flow"
      },
      to_status: {
        type: DataTypes.ENUM("C1_CREACION", "C2_CANCELACION", "C3_CERRADO", "CE_CARGOS_EXPEDIENTE", "CC_CONFIRMACION_CARGOS", "TR_TRASLADO_PROCEDIMIENTO", "RA_REAPERTURA", "EX_EXTORNO"),
        allowNull: false,
        comment: "New status in flow"
      },
      transition_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: "When the transition occurred"
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Reason for status change"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'case_status_history',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      updatedAt: false,
      indexes: [
        {
          name: "case_status_history_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_case_status_history_case",
          fields: [
            { name: "case_file_id" },
          ]
        },
        {
          name: "idx_case_status_history_date",
          fields: [
            { name: "transition_date" },
          ]
        },
      ]
    }) as typeof case_status_history;
  }
}
