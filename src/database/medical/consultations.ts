import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { doctors, doctorsId } from './doctors';
import type { patients, patientsId } from './patients';

export interface consultationsAttributes {
  id: string;
  case_file_id?: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: Date;
  chief_complaint: string;
  vital_signs?: object;
  physical_examination?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescriptions?: object;
  follow_up_date?: string;
  notes?: string;
  created_at?: Date;
}

export type consultationsPk = "id";
export type consultationsId = consultations[consultationsPk];
export type consultationsOptionalAttributes = "id" | "case_file_id" | "consultation_date" | "vital_signs" | "physical_examination" | "diagnosis" | "treatment_plan" | "prescriptions" | "follow_up_date" | "notes" | "created_at";
export type consultationsCreationAttributes = Optional<consultationsAttributes, consultationsOptionalAttributes>;

export class consultations extends Model<consultationsAttributes, consultationsCreationAttributes> implements consultationsAttributes {
  id!: string;
  case_file_id?: string;
  patient_id!: string;
  doctor_id!: string;
  consultation_date!: Date;
  chief_complaint!: string;
  vital_signs?: object;
  physical_examination?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescriptions?: object;
  follow_up_date?: string;
  notes?: string;
  created_at?: Date;

  // consultations belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // consultations belongsTo doctors via doctor_id
  doctor!: doctors;
  getDoctor!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setDoctor!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createDoctor!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // consultations belongsTo patients via patient_id
  patient!: patients;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patients>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patients, patientsId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<patients>;

  static initModel(sequelize: Sequelize.Sequelize): typeof consultations {
    return sequelize.define('consultations', {
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
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    consultation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    chief_complaint: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vital_signs: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    physical_examination: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatment_plan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prescriptions: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    follow_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'consultations',
    schema: 'medical',
    timestamps: true,
    indexes: [
      {
        name: "consultations_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof consultations;
  }
}
