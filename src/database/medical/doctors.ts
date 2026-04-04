import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_doctors, case_doctorsId } from './case_doctors';
import type { case_package_assignments, case_package_assignmentsId } from './case_package_assignments';
import type { consultations, consultationsId } from './consultations';
import type { lab_tests, lab_testsId } from './lab_tests';
import type { operation_team, operation_teamId } from './operation_team';
import type { scheduled_operations, scheduled_operationsId } from './scheduled_operations';
import type { specialties, specialtiesId } from './specialties';
import type { users, usersId } from '../core/users';

export interface doctorsAttributes {
  id: string;
  user_id?: string;
  medical_license: string;
  specialty_id?: string;
  doctor_type: "internal" | "external";
  consultation_fee?: number;
  surgery_fee?: number;
  identification_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type doctorsPk = "id";
export type doctorsId = doctors[doctorsPk];
export type doctorsOptionalAttributes = "id" | "user_id" | "specialty_id" | "doctor_type" | "consultation_fee" | "surgery_fee" | "identification_number" | "phone" | "email" | "address" | "is_active" | "created_at" | "updated_at";
export type doctorsCreationAttributes = Optional<doctorsAttributes, doctorsOptionalAttributes>;

export class doctors extends Model<doctorsAttributes, doctorsCreationAttributes> implements doctorsAttributes {
  id!: string;
  user_id?: string;
  medical_license!: string;
  specialty_id?: string;
  doctor_type!: "internal" | "external";
  consultation_fee?: number;
  surgery_fee?: number;
  identification_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  // doctors hasMany case_doctors via doctor_id
  case_doctors!: case_doctors[];
  getCase_doctors!: Sequelize.HasManyGetAssociationsMixin<case_doctors>;
  setCase_doctors!: Sequelize.HasManySetAssociationsMixin<case_doctors, case_doctorsId>;
  addCase_doctor!: Sequelize.HasManyAddAssociationMixin<case_doctors, case_doctorsId>;
  addCase_doctors!: Sequelize.HasManyAddAssociationsMixin<case_doctors, case_doctorsId>;
  createCase_doctor!: Sequelize.HasManyCreateAssociationMixin<case_doctors>;
  removeCase_doctor!: Sequelize.HasManyRemoveAssociationMixin<case_doctors, case_doctorsId>;
  removeCase_doctors!: Sequelize.HasManyRemoveAssociationsMixin<case_doctors, case_doctorsId>;
  hasCase_doctor!: Sequelize.HasManyHasAssociationMixin<case_doctors, case_doctorsId>;
  hasCase_doctors!: Sequelize.HasManyHasAssociationsMixin<case_doctors, case_doctorsId>;
  countCase_doctors!: Sequelize.HasManyCountAssociationsMixin;
  // doctors hasMany case_package_assignments via doctor_id
  case_package_assignments!: case_package_assignments[];
  getCase_package_assignments!: Sequelize.HasManyGetAssociationsMixin<case_package_assignments>;
  setCase_package_assignments!: Sequelize.HasManySetAssociationsMixin<case_package_assignments, case_package_assignmentsId>;
  addCase_package_assignment!: Sequelize.HasManyAddAssociationMixin<case_package_assignments, case_package_assignmentsId>;
  addCase_package_assignments!: Sequelize.HasManyAddAssociationsMixin<case_package_assignments, case_package_assignmentsId>;
  createCase_package_assignment!: Sequelize.HasManyCreateAssociationMixin<case_package_assignments>;
  removeCase_package_assignment!: Sequelize.HasManyRemoveAssociationMixin<case_package_assignments, case_package_assignmentsId>;
  removeCase_package_assignments!: Sequelize.HasManyRemoveAssociationsMixin<case_package_assignments, case_package_assignmentsId>;
  hasCase_package_assignment!: Sequelize.HasManyHasAssociationMixin<case_package_assignments, case_package_assignmentsId>;
  hasCase_package_assignments!: Sequelize.HasManyHasAssociationsMixin<case_package_assignments, case_package_assignmentsId>;
  countCase_package_assignments!: Sequelize.HasManyCountAssociationsMixin;
  // doctors hasMany consultations via doctor_id
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
  // doctors hasMany lab_tests via ordered_by
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
  // doctors hasMany operation_team via doctor_id
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
  // doctors hasMany scheduled_operations via anesthesiologist_id
  scheduled_operations!: scheduled_operations[];
  getScheduled_operations!: Sequelize.HasManyGetAssociationsMixin<scheduled_operations>;
  setScheduled_operations!: Sequelize.HasManySetAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  addScheduled_operation!: Sequelize.HasManyAddAssociationMixin<scheduled_operations, scheduled_operationsId>;
  addScheduled_operations!: Sequelize.HasManyAddAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  createScheduled_operation!: Sequelize.HasManyCreateAssociationMixin<scheduled_operations>;
  removeScheduled_operation!: Sequelize.HasManyRemoveAssociationMixin<scheduled_operations, scheduled_operationsId>;
  removeScheduled_operations!: Sequelize.HasManyRemoveAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  hasScheduled_operation!: Sequelize.HasManyHasAssociationMixin<scheduled_operations, scheduled_operationsId>;
  hasScheduled_operations!: Sequelize.HasManyHasAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  countScheduled_operations!: Sequelize.HasManyCountAssociationsMixin;
  // doctors hasMany scheduled_operations via primary_surgeon_id
  primary_surgeon_scheduled_operations!: scheduled_operations[];
  getPrimary_surgeon_scheduled_operations!: Sequelize.HasManyGetAssociationsMixin<scheduled_operations>;
  setPrimary_surgeon_scheduled_operations!: Sequelize.HasManySetAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  addPrimary_surgeon_scheduled_operation!: Sequelize.HasManyAddAssociationMixin<scheduled_operations, scheduled_operationsId>;
  addPrimary_surgeon_scheduled_operations!: Sequelize.HasManyAddAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  createPrimary_surgeon_scheduled_operation!: Sequelize.HasManyCreateAssociationMixin<scheduled_operations>;
  removePrimary_surgeon_scheduled_operation!: Sequelize.HasManyRemoveAssociationMixin<scheduled_operations, scheduled_operationsId>;
  removePrimary_surgeon_scheduled_operations!: Sequelize.HasManyRemoveAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  hasPrimary_surgeon_scheduled_operation!: Sequelize.HasManyHasAssociationMixin<scheduled_operations, scheduled_operationsId>;
  hasPrimary_surgeon_scheduled_operations!: Sequelize.HasManyHasAssociationsMixin<scheduled_operations, scheduled_operationsId>;
  countPrimary_surgeon_scheduled_operations!: Sequelize.HasManyCountAssociationsMixin;
  // doctors belongsTo specialties via specialty_id
  specialty!: specialties;
  getSpecialty!: Sequelize.BelongsToGetAssociationMixin<specialties>;
  setSpecialty!: Sequelize.BelongsToSetAssociationMixin<specialties, specialtiesId>;
  createSpecialty!: Sequelize.BelongsToCreateAssociationMixin<specialties>;
  // doctors belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof doctors {
    return sequelize.define('doctors', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        unique: "doctors_user_id_key"
      },
      medical_license: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "doctors_medical_license_key"
      },
      specialty_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'specialties',
          key: 'id'
        }
      },
      doctor_type: {
        type: DataTypes.ENUM("internal", "external"),
        allowNull: false,
        defaultValue: "internal"
      },
      consultation_fee: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      surgery_fee: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      identification_number: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: "doctors_identification_number_key"
      },
      phone: {
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
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'doctors',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "doctors_identification_number_key",
          unique: true,
          fields: [
            { name: "identification_number" },
          ]
        },
        {
          name: "doctors_medical_license_key",
          unique: true,
          fields: [
            { name: "medical_license" },
          ]
        },
        {
          name: "doctors_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "doctors_user_id_key",
          unique: true,
          fields: [
            { name: "user_id" },
          ]
        },
      ]
    }) as typeof doctors;
  }
}
