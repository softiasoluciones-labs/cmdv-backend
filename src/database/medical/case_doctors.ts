import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { doctors, doctorsId } from './doctors';

export interface case_doctorsAttributes {
  id: string;
  case_file_id: string;
  doctor_id: string;
  role: string;
  assigned_at?: Date;
  removed_at?: Date;
  notes?: string;
}

export type case_doctorsPk = "id";
export type case_doctorsId = case_doctors[case_doctorsPk];
export type case_doctorsOptionalAttributes = "id" | "assigned_at" | "removed_at" | "notes";
export type case_doctorsCreationAttributes = Optional<case_doctorsAttributes, case_doctorsOptionalAttributes>;

export class case_doctors extends Model<case_doctorsAttributes, case_doctorsCreationAttributes> implements case_doctorsAttributes {
  id!: string;
  case_file_id!: string;
  doctor_id!: string;
  role!: string;
  assigned_at?: Date;
  removed_at?: Date;
  notes?: string;

  // case_doctors belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_doctors belongsTo doctors via doctor_id
  doctor!: doctors;
  getDoctor!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setDoctor!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createDoctor!: Sequelize.BelongsToCreateAssociationMixin<doctors>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_doctors {
    return sequelize.define('case_doctors', {
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
        },
        unique: "case_doctors_case_file_id_doctor_id_role_key"
      },
      doctor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        },
        unique: "case_doctors_case_file_id_doctor_id_role_key"
      },
      role: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "case_doctors_case_file_id_doctor_id_role_key"
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      removed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'case_doctors',
      schema: 'medical',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "case_doctors_case_file_id_doctor_id_role_key",
          unique: true,
          fields: [
            { name: "case_file_id" },
            { name: "doctor_id" },
            { name: "role" },
          ]
        },
        {
          name: "case_doctors_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof case_doctors;
  }
}
