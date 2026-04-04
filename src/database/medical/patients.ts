import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { consultations, consultationsId } from './consultations';
import type { lab_tests, lab_testsId } from './lab_tests';
import type { users, usersId } from '../core/users';

export interface patientsAttributes {
  id: string;
  file_number: string;
  first_name: string;
  last_name: string;
  identification_number?: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  blood_type?: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_company?: string;
  insurance_policy_number?: string;
  is_active?: boolean;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

export type patientsPk = "id";
export type patientsId = patients[patientsPk];
export type patientsOptionalAttributes = "id" | "identification_number" | "blood_type" | "phone" | "mobile" | "email" | "address" | "city" | "state" | "zip_code" | "emergency_contact_name" | "emergency_contact_phone" | "emergency_contact_relationship" | "allergies" | "chronic_conditions" | "current_medications" | "insurance_company" | "insurance_policy_number" | "is_active" | "notes" | "created_at" | "updated_at" | "created_by";
export type patientsCreationAttributes = Optional<patientsAttributes, patientsOptionalAttributes>;

export class patients extends Model<patientsAttributes, patientsCreationAttributes> implements patientsAttributes {
  id!: string;
  file_number!: string;
  first_name!: string;
  last_name!: string;
  identification_number?: string;
  date_of_birth!: string;
  gender!: "male" | "female" | "other";
  blood_type?: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_company?: string;
  insurance_policy_number?: string;
  is_active?: boolean;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;

  // patients hasMany case_files via patient_id
  case_files!: case_files[];
  getCase_files!: Sequelize.HasManyGetAssociationsMixin<case_files>;
  setCase_files!: Sequelize.HasManySetAssociationsMixin<case_files, case_filesId>;
  addCase_file!: Sequelize.HasManyAddAssociationMixin<case_files, case_filesId>;
  addCase_files!: Sequelize.HasManyAddAssociationsMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.HasManyCreateAssociationMixin<case_files>;
  removeCase_file!: Sequelize.HasManyRemoveAssociationMixin<case_files, case_filesId>;
  removeCase_files!: Sequelize.HasManyRemoveAssociationsMixin<case_files, case_filesId>;
  hasCase_file!: Sequelize.HasManyHasAssociationMixin<case_files, case_filesId>;
  hasCase_files!: Sequelize.HasManyHasAssociationsMixin<case_files, case_filesId>;
  countCase_files!: Sequelize.HasManyCountAssociationsMixin;
  // patients hasMany consultations via patient_id
  consultations!: consultations[];
  getConsultations!: Sequelize.HasManyGetAssociationsMixin<consultations>;
  setConsultations!: Sequelize.HasManySetAssociationsMixin<consultations, consultationsId>;
  addConsultation!: Sequelize.HasManyAddAssociationMixin<consultations, consultationsId>;
  addConsultations!: Sequelize.HasManyAddAssociationsMixin<consultations, consultationsId>;
  createConsultation!: Sequelize.HasManyCreateAssociationMixin<consultations>;
  removeConsultation!: Sequelize.HasManyRemoveAssociationMixin<consultations, consultationsId>;
  removeConsultations!: Sequelize.HasManyRemoveAssociationsMixin<consultations, consultationsId>;
  hasConsultation!: Sequelize.HasManyHasAssociationMixin<consultations, consultationsId>;
  hasConsultations!: Sequelize.HasManyHasAssociationsMixin<consultations, consultationsId>;
  countConsultations!: Sequelize.HasManyCountAssociationsMixin;
  // patients hasMany lab_tests via patient_id
  lab_tests!: lab_tests[];
  getLab_tests!: Sequelize.HasManyGetAssociationsMixin<lab_tests>;
  setLab_tests!: Sequelize.HasManySetAssociationsMixin<lab_tests, lab_testsId>;
  addLab_test!: Sequelize.HasManyAddAssociationMixin<lab_tests, lab_testsId>;
  addLab_tests!: Sequelize.HasManyAddAssociationsMixin<lab_tests, lab_testsId>;
  createLab_test!: Sequelize.HasManyCreateAssociationMixin<lab_tests>;
  removeLab_test!: Sequelize.HasManyRemoveAssociationMixin<lab_tests, lab_testsId>;
  removeLab_tests!: Sequelize.HasManyRemoveAssociationsMixin<lab_tests, lab_testsId>;
  hasLab_test!: Sequelize.HasManyHasAssociationMixin<lab_tests, lab_testsId>;
  hasLab_tests!: Sequelize.HasManyHasAssociationsMixin<lab_tests, lab_testsId>;
  countLab_tests!: Sequelize.HasManyCountAssociationsMixin;
  // patients belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof patients {
    return sequelize.define('patients', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      file_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "patients_file_number_key"
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      identification_number: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: "patients_identification_number_key"
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false
      },
      blood_type: {
        type: DataTypes.ENUM("O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      emergency_contact_name: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      emergency_contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      emergency_contact_relationship: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      allergies: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true
      },
      chronic_conditions: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true
      },
      current_medications: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true
      },
      insurance_company: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      insurance_policy_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
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
      }
    }, {
      tableName: 'patients',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "patients_file_number_key",
          unique: true,
          fields: [
            { name: "file_number" },
          ]
        },
        {
          name: "patients_identification_number_key",
          unique: true,
          fields: [
            { name: "identification_number" },
          ]
        },
        {
          name: "patients_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof patients;
  }
}
