import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { doctors, doctorsId } from './doctors';
import type { patients, patientsId } from './patients';
import type { services, servicesId } from './services';

export interface lab_testsAttributes {
  id: string;
  case_file_id?: string;
  patient_id: string;
  service_id: string;
  ordered_by: string;
  ordered_at?: Date;
  sample_collected_at?: Date;
  result_date?: Date;
  results?: object;
  interpretation?: string;
  status?: string;
  is_urgent?: boolean;
  notes?: string;
}

export type lab_testsPk = "id";
export type lab_testsId = lab_tests[lab_testsPk];
export type lab_testsOptionalAttributes = "id" | "case_file_id" | "ordered_at" | "sample_collected_at" | "result_date" | "results" | "interpretation" | "status" | "is_urgent" | "notes";
export type lab_testsCreationAttributes = Optional<lab_testsAttributes, lab_testsOptionalAttributes>;

export class lab_tests extends Model<lab_testsAttributes, lab_testsCreationAttributes> implements lab_testsAttributes {
  id!: string;
  case_file_id?: string;
  patient_id!: string;
  service_id!: string;
  ordered_by!: string;
  ordered_at?: Date;
  sample_collected_at?: Date;
  result_date?: Date;
  results?: object;
  interpretation?: string;
  status?: string;
  is_urgent?: boolean;
  notes?: string;

  // lab_tests belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // lab_tests belongsTo doctors via ordered_by
  ordered_by_doctor!: doctors;
  getOrdered_by_doctor!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setOrdered_by_doctor!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createOrdered_by_doctor!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // lab_tests belongsTo patients via patient_id
  patient!: patients;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patients>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patients, patientsId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<patients>;
  // lab_tests belongsTo services via service_id
  service!: services;
  getService!: Sequelize.BelongsToGetAssociationMixin<services>;
  setService!: Sequelize.BelongsToSetAssociationMixin<services, servicesId>;
  createService!: Sequelize.BelongsToCreateAssociationMixin<services>;

  static initModel(sequelize: Sequelize.Sequelize): typeof lab_tests {
    return sequelize.define('lab_tests', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    case_file_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'case_files',
        key: 'id'
      }
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      }
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    ordered_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    ordered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    sample_collected_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    result_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    interpretation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "ordered"
    },
    is_urgent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'lab_tests',
    schema: 'medical',
    timestamps: false,
    indexes: [
      {
        name: "lab_tests_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof lab_tests;
  }
}
