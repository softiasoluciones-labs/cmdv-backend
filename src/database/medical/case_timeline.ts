import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { service_types, service_typesId } from './service_types';
import type { users, usersId } from '../core/users';

export interface case_timelineAttributes {
  id: string;
  case_file_id: string;
  stage: string;
  service_type_id?: string;
  started_at: Date;
  ended_at?: Date;
  notes?: string;
  created_by?: string;
  status_flow?: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  shift_type?: "daytime" | "nighttime";
}

export type case_timelinePk = "id";
export type case_timelineId = case_timeline[case_timelinePk];
export type case_timelineOptionalAttributes = "id" | "service_type_id" | "started_at" | "ended_at" | "notes" | "created_by" | "status_flow" | "shift_type";
export type case_timelineCreationAttributes = Optional<case_timelineAttributes, case_timelineOptionalAttributes>;

export class case_timeline extends Model<case_timelineAttributes, case_timelineCreationAttributes> implements case_timelineAttributes {
  id!: string;
  case_file_id!: string;
  stage!: string;
  service_type_id?: string;
  started_at!: Date;
  ended_at?: Date;
  notes?: string;
  created_by?: string;
  status_flow?: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  shift_type?: "daytime" | "nighttime";

  // case_timeline belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_timeline belongsTo service_types via service_type_id
  service_type!: service_types;
  getService_type!: Sequelize.BelongsToGetAssociationMixin<service_types>;
  setService_type!: Sequelize.BelongsToSetAssociationMixin<service_types, service_typesId>;
  createService_type!: Sequelize.BelongsToCreateAssociationMixin<service_types>;
  // case_timeline belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_timeline {
    return sequelize.define('case_timeline', {
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
      stage: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      service_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'service_types',
          key: 'id'
        }
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
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
      },
      status_flow: {
        type: DataTypes.ENUM("C1_CREACION", "C2_CANCELACION", "C3_CERRADO", "CE_CARGOS_EXPEDIENTE", "CC_CONFIRMACION_CARGOS", "TR_TRASLADO_PROCEDIMIENTO", "RA_REAPERTURA", "EX_EXTORNO"),
        allowNull: true,
        comment: "🆕 NEW: Case status flow at this timeline point"
      },
      shift_type: {
        type: DataTypes.ENUM("daytime", "nighttime"),
        allowNull: true,
        comment: "🆕 NEW: Shift type when this timeline event occurred"
      }
    }, {
      tableName: 'case_timeline',
      schema: 'medical',
      timestamps: false,
      indexes: [
        {
          name: "case_timeline_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof case_timeline;
  }
}
