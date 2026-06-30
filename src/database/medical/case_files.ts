import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { admission_types, admission_typesId } from './admission_types';
import type { case_doctors, case_doctorsId } from './case_doctors';
import type { case_package_assignments, case_package_assignmentsId } from './case_package_assignments';
import type { case_rooms, case_roomsId } from './case_rooms';
import type { case_products, case_productsId } from './case_products';
import type { case_services, case_servicesId } from './case_services';
import type { case_status_history, case_status_historyId } from './case_status_history';
import type { case_timeline, case_timelineId } from './case_timeline';
import type { case_transfers, case_transfersId } from './case_transfers';
import type { consultations, consultationsId } from './consultations';
import type { lab_tests, lab_testsId } from './lab_tests';
import type { patients, patientsId } from './patients';
import type { scheduled_operations, scheduled_operationsId } from './scheduled_operations';
import type { users, usersId } from '../core/users';

export interface case_filesAttributes {
  id: string;
  case_number: string;
  patient_id: string;
  admission_date: Date;
  discharge_date?: Date;
  admission_type: string;
  chief_complaint: string;
  initial_diagnosis?: string;
  final_diagnosis?: string;
  case_status: "active" | "in_treatment" | "hospitalized" | "surgery_scheduled" | "recovering" | "discharged" | "transferred" | "deceased";
  total_cost?: number;
  shift_type: "daytime" | "nighttime";
  current_status_flow: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  is_transfer?: boolean;
  transfer_from_case_id?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  admission_type_id?: string;
}

export type case_filesPk = "id";
export type case_filesId = case_files[case_filesPk];
export type case_filesOptionalAttributes = "id" | "admission_date" | "discharge_date" | "initial_diagnosis" | "final_diagnosis" | "case_status" | "total_cost" | "shift_type" | "current_status_flow" | "is_transfer" | "transfer_from_case_id" | "notes" | "created_at" | "updated_at" | "created_by" | "admission_type_id";
export type case_filesCreationAttributes = Optional<case_filesAttributes, case_filesOptionalAttributes>;

export class case_files extends Model<case_filesAttributes, case_filesCreationAttributes> implements case_filesAttributes {
  id!: string;
  case_number!: string;
  patient_id!: string;
  admission_date!: Date;
  discharge_date?: Date;
  admission_type!: string;
  chief_complaint!: string;
  initial_diagnosis?: string;
  final_diagnosis?: string;
  case_status!: "active" | "in_treatment" | "hospitalized" | "surgery_scheduled" | "recovering" | "discharged" | "transferred" | "deceased";
  total_cost?: number;
  shift_type!: "daytime" | "nighttime";
  current_status_flow!: "C1_CREACION" | "C2_CANCELACION" | "C3_CERRADO" | "CE_CARGOS_EXPEDIENTE" | "CC_CONFIRMACION_CARGOS" | "TR_TRASLADO_PROCEDIMIENTO" | "RA_REAPERTURA" | "EX_EXTORNO";
  is_transfer?: boolean;
  transfer_from_case_id?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  admission_type_id?: string;

  // case_files belongsTo admission_types via admission_type_id
  admissionType!: admission_types;
  getAdmissionType!: Sequelize.BelongsToGetAssociationMixin<admission_types>;
  setAdmissionType!: Sequelize.BelongsToSetAssociationMixin<admission_types, admission_typesId>;
  createAdmissionType!: Sequelize.BelongsToCreateAssociationMixin<admission_types>;
  // case_files hasMany case_doctors via case_file_id
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
  // case_files belongsTo case_files via transfer_from_case_id
  transfer_from_case!: case_files;
  getTransfer_from_case!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setTransfer_from_case!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createTransfer_from_case!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_files hasMany case_package_assignments via case_file_id
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
  // case_files hasMany case_rooms via case_file_id
  case_rooms!: case_rooms[];
  getCase_rooms!: Sequelize.HasManyGetAssociationsMixin<case_rooms>;
  setCase_rooms!: Sequelize.HasManySetAssociationsMixin<case_rooms, case_roomsId>;
  addCase_room!: Sequelize.HasManyAddAssociationMixin<case_rooms, case_roomsId>;
  addCase_rooms!: Sequelize.HasManyAddAssociationsMixin<case_rooms, case_roomsId>;
  createCase_room!: Sequelize.HasManyCreateAssociationMixin<case_rooms>;
  removeCase_room!: Sequelize.HasManyRemoveAssociationMixin<case_rooms, case_roomsId>;
  removeCase_rooms!: Sequelize.HasManyRemoveAssociationsMixin<case_rooms, case_roomsId>;
  hasCase_room!: Sequelize.HasManyHasAssociationMixin<case_rooms, case_roomsId>;
  hasCase_rooms!: Sequelize.HasManyHasAssociationsMixin<case_rooms, case_roomsId>;
  countCase_rooms!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_products via case_file_id
  case_products!: case_products[];
  getCase_products!: Sequelize.HasManyGetAssociationsMixin<case_products>;
  setCase_products!: Sequelize.HasManySetAssociationsMixin<case_products, case_productsId>;
  addCase_product!: Sequelize.HasManyAddAssociationMixin<case_products, case_productsId>;
  addCase_products!: Sequelize.HasManyAddAssociationsMixin<case_products, case_productsId>;
  createCase_product!: Sequelize.HasManyCreateAssociationMixin<case_products>;
  removeCase_product!: Sequelize.HasManyRemoveAssociationMixin<case_products, case_productsId>;
  removeCase_products!: Sequelize.HasManyRemoveAssociationsMixin<case_products, case_productsId>;
  hasCase_product!: Sequelize.HasManyHasAssociationMixin<case_products, case_productsId>;
  hasCase_products!: Sequelize.HasManyHasAssociationsMixin<case_products, case_productsId>;
  countCase_products!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_services via case_file_id
  case_services!: case_services[];
  getCase_services!: Sequelize.HasManyGetAssociationsMixin<case_services>;
  setCase_services!: Sequelize.HasManySetAssociationsMixin<case_services, case_servicesId>;
  addCase_service!: Sequelize.HasManyAddAssociationMixin<case_services, case_servicesId>;
  addCase_services!: Sequelize.HasManyAddAssociationsMixin<case_services, case_servicesId>;
  createCase_service!: Sequelize.HasManyCreateAssociationMixin<case_services>;
  removeCase_service!: Sequelize.HasManyRemoveAssociationMixin<case_services, case_servicesId>;
  removeCase_services!: Sequelize.HasManyRemoveAssociationsMixin<case_services, case_servicesId>;
  hasCase_service!: Sequelize.HasManyHasAssociationMixin<case_services, case_servicesId>;
  hasCase_services!: Sequelize.HasManyHasAssociationsMixin<case_services, case_servicesId>;
  countCase_services!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_status_history via case_file_id
  case_status_histories!: case_status_history[];
  getCase_status_histories!: Sequelize.HasManyGetAssociationsMixin<case_status_history>;
  setCase_status_histories!: Sequelize.HasManySetAssociationsMixin<case_status_history, case_status_historyId>;
  addCase_status_history!: Sequelize.HasManyAddAssociationMixin<case_status_history, case_status_historyId>;
  addCase_status_histories!: Sequelize.HasManyAddAssociationsMixin<case_status_history, case_status_historyId>;
  createCase_status_history!: Sequelize.HasManyCreateAssociationMixin<case_status_history>;
  removeCase_status_history!: Sequelize.HasManyRemoveAssociationMixin<case_status_history, case_status_historyId>;
  removeCase_status_histories!: Sequelize.HasManyRemoveAssociationsMixin<case_status_history, case_status_historyId>;
  hasCase_status_history!: Sequelize.HasManyHasAssociationMixin<case_status_history, case_status_historyId>;
  hasCase_status_histories!: Sequelize.HasManyHasAssociationsMixin<case_status_history, case_status_historyId>;
  countCase_status_histories!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_timeline via case_file_id
  case_timelines!: case_timeline[];
  getCase_timelines!: Sequelize.HasManyGetAssociationsMixin<case_timeline>;
  setCase_timelines!: Sequelize.HasManySetAssociationsMixin<case_timeline, case_timelineId>;
  addCase_timeline!: Sequelize.HasManyAddAssociationMixin<case_timeline, case_timelineId>;
  addCase_timelines!: Sequelize.HasManyAddAssociationsMixin<case_timeline, case_timelineId>;
  createCase_timeline!: Sequelize.HasManyCreateAssociationMixin<case_timeline>;
  removeCase_timeline!: Sequelize.HasManyRemoveAssociationMixin<case_timeline, case_timelineId>;
  removeCase_timelines!: Sequelize.HasManyRemoveAssociationsMixin<case_timeline, case_timelineId>;
  hasCase_timeline!: Sequelize.HasManyHasAssociationMixin<case_timeline, case_timelineId>;
  hasCase_timelines!: Sequelize.HasManyHasAssociationsMixin<case_timeline, case_timelineId>;
  countCase_timelines!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_transfers via original_case_id
  case_transfers!: case_transfers[];
  getCase_transfers!: Sequelize.HasManyGetAssociationsMixin<case_transfers>;
  setCase_transfers!: Sequelize.HasManySetAssociationsMixin<case_transfers, case_transfersId>;
  addCase_transfer!: Sequelize.HasManyAddAssociationMixin<case_transfers, case_transfersId>;
  addCase_transfers!: Sequelize.HasManyAddAssociationsMixin<case_transfers, case_transfersId>;
  createCase_transfer!: Sequelize.HasManyCreateAssociationMixin<case_transfers>;
  removeCase_transfer!: Sequelize.HasManyRemoveAssociationMixin<case_transfers, case_transfersId>;
  removeCase_transfers!: Sequelize.HasManyRemoveAssociationsMixin<case_transfers, case_transfersId>;
  hasCase_transfer!: Sequelize.HasManyHasAssociationMixin<case_transfers, case_transfersId>;
  hasCase_transfers!: Sequelize.HasManyHasAssociationsMixin<case_transfers, case_transfersId>;
  countCase_transfers!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany case_transfers via transferred_case_id
  transferred_case_case_transfers!: case_transfers[];
  getTransferred_case_case_transfers!: Sequelize.HasManyGetAssociationsMixin<case_transfers>;
  setTransferred_case_case_transfers!: Sequelize.HasManySetAssociationsMixin<case_transfers, case_transfersId>;
  addTransferred_case_case_transfer!: Sequelize.HasManyAddAssociationMixin<case_transfers, case_transfersId>;
  addTransferred_case_case_transfers!: Sequelize.HasManyAddAssociationsMixin<case_transfers, case_transfersId>;
  createTransferred_case_case_transfer!: Sequelize.HasManyCreateAssociationMixin<case_transfers>;
  removeTransferred_case_case_transfer!: Sequelize.HasManyRemoveAssociationMixin<case_transfers, case_transfersId>;
  removeTransferred_case_case_transfers!: Sequelize.HasManyRemoveAssociationsMixin<case_transfers, case_transfersId>;
  hasTransferred_case_case_transfer!: Sequelize.HasManyHasAssociationMixin<case_transfers, case_transfersId>;
  hasTransferred_case_case_transfers!: Sequelize.HasManyHasAssociationsMixin<case_transfers, case_transfersId>;
  countTransferred_case_case_transfers!: Sequelize.HasManyCountAssociationsMixin;
  // case_files hasMany consultations via case_file_id
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
  // case_files hasMany lab_tests via case_file_id
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
  // case_files hasMany scheduled_operations via case_file_id
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
  // case_files belongsTo patients via patient_id
  patient!: patients;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patients>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patients, patientsId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<patients>;
  // case_files belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_files {
    return sequelize.define('case_files', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      case_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "case_files_case_number_key"
      },
      patient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id'
        }
      },
      admission_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      discharge_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      admission_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      chief_complaint: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      initial_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      final_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      case_status: {
        type: DataTypes.ENUM("active", "in_treatment", "hospitalized", "surgery_scheduled", "recovering", "discharged", "transferred", "deceased"),
        allowNull: false,
        defaultValue: "active"
      },
      total_cost: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
      },
      shift_type: {
        type: DataTypes.ENUM("daytime", "nighttime"),
        allowNull: false,
        defaultValue: "daytime"
      },
      current_status_flow: {
        type: DataTypes.ENUM("C1_CREACION", "C2_CANCELACION", "C3_CERRADO", "CE_CARGOS_EXPEDIENTE", "CC_CONFIRMACION_CARGOS", "TR_TRASLADO_PROCEDIMIENTO", "RA_REAPERTURA", "EX_EXTORNO"),
        allowNull: false,
        defaultValue: "C1_CREACION"
      },
      is_transfer: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      transfer_from_case_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'case_files',
          key: 'id'
        }
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
      admission_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "🆕 NEW: Reference to admission type catalog (replaces old admission_type field)",
        references: {
          model: 'admission_types',
          key: 'id'
        }
      }
    }, {
      tableName: 'case_files',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "case_files_case_number_key",
          unique: true,
          fields: [
            { name: "case_number" },
          ]
        },
        {
          name: "case_files_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof case_files;
  }
}
