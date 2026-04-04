import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { doctors, doctorsId } from './doctors';
import type { operation_records, operation_recordsCreationAttributes, operation_recordsId } from './operation_records';
import type { operation_team, operation_teamId } from './operation_team';
import type { operation_types, operation_typesId } from './operation_types';

export interface scheduled_operationsAttributes {
  id: string;
  case_file_id: string;
  operation_type_id: string;
  primary_surgeon_id: string;
  anesthesiologist_id?: string;
  scheduled_date: Date;
  estimated_duration_minutes: number;
  operating_room?: string;
  pre_operative_notes?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type scheduled_operationsPk = "id";
export type scheduled_operationsId = scheduled_operations[scheduled_operationsPk];
export type scheduled_operationsOptionalAttributes = "id" | "anesthesiologist_id" | "operating_room" | "pre_operative_notes" | "status" | "created_at" | "updated_at";
export type scheduled_operationsCreationAttributes = Optional<scheduled_operationsAttributes, scheduled_operationsOptionalAttributes>;

export class scheduled_operations extends Model<scheduled_operationsAttributes, scheduled_operationsCreationAttributes> implements scheduled_operationsAttributes {
  id!: string;
  case_file_id!: string;
  operation_type_id!: string;
  primary_surgeon_id!: string;
  anesthesiologist_id?: string;
  scheduled_date!: Date;
  estimated_duration_minutes!: number;
  operating_room?: string;
  pre_operative_notes?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;

  // scheduled_operations belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // scheduled_operations belongsTo doctors via anesthesiologist_id
  anesthesiologist!: doctors;
  getAnesthesiologist!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setAnesthesiologist!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createAnesthesiologist!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // scheduled_operations belongsTo doctors via primary_surgeon_id
  primary_surgeon!: doctors;
  getPrimary_surgeon!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setPrimary_surgeon!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createPrimary_surgeon!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // scheduled_operations belongsTo operation_types via operation_type_id
  operation_type!: operation_types;
  getOperation_type!: Sequelize.BelongsToGetAssociationMixin<operation_types>;
  setOperation_type!: Sequelize.BelongsToSetAssociationMixin<operation_types, operation_typesId>;
  createOperation_type!: Sequelize.BelongsToCreateAssociationMixin<operation_types>;
  // scheduled_operations hasOne operation_records via scheduled_operation_id
  operation_record!: operation_records;
  getOperation_record!: Sequelize.HasOneGetAssociationMixin<operation_records>;
  setOperation_record!: Sequelize.HasOneSetAssociationMixin<operation_records, operation_recordsId>;
  createOperation_record!: Sequelize.HasOneCreateAssociationMixin<operation_records>;
  // scheduled_operations hasMany operation_team via scheduled_operation_id
  operation_teams!: operation_team[];
  getOperation_teams!: Sequelize.HasManyGetAssociationsMixin<operation_team>;
  setOperation_teams!: Sequelize.HasManySetAssociationsMixin<operation_team, operation_teamId>;
  addOperation_team!: Sequelize.HasManyAddAssociationMixin<operation_team, operation_teamId>;
  addOperation_teams!: Sequelize.HasManyAddAssociationsMixin<operation_team, operation_teamId>;
  createOperation_team!: Sequelize.HasManyCreateAssociationMixin<operation_team>;
  removeOperation_team!: Sequelize.HasManyRemoveAssociationMixin<operation_team, operation_teamId>;
  removeOperation_teams!: Sequelize.HasManyRemoveAssociationsMixin<operation_team, operation_teamId>;
  hasOperation_team!: Sequelize.HasManyHasAssociationMixin<operation_team, operation_teamId>;
  hasOperation_teams!: Sequelize.HasManyHasAssociationsMixin<operation_team, operation_teamId>;
  countOperation_teams!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof scheduled_operations {
    return sequelize.define('scheduled_operations', {
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
    operation_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'operation_types',
        key: 'id'
      }
    },
    primary_surgeon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    anesthesiologist_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estimated_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    operating_room: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    pre_operative_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "scheduled"
    }
  }, {
    tableName: 'scheduled_operations',
    schema: 'medical',
    timestamps: true,
    indexes: [
      {
        name: "scheduled_operations_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof scheduled_operations;
  }
}
