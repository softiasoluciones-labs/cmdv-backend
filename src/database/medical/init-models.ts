import type { Sequelize } from "sequelize";
import { admission_types as _admission_types } from "./admission_types";
import type { admission_typesAttributes, admission_typesCreationAttributes } from "./admission_types";
import { case_doctors as _case_doctors } from "./case_doctors";
import type { case_doctorsAttributes, case_doctorsCreationAttributes } from "./case_doctors";
import { case_files as _case_files } from "./case_files";
import type { case_filesAttributes, case_filesCreationAttributes } from "./case_files";
import { case_package_assignments as _case_package_assignments } from "./case_package_assignments";
import type { case_package_assignmentsAttributes, case_package_assignmentsCreationAttributes } from "./case_package_assignments";
import { case_rooms as _case_rooms } from "./case_rooms";
import type { case_roomsAttributes, case_roomsCreationAttributes } from "./case_rooms";
import { case_products as _case_products } from "./case_products";
import type { case_productsAttributes, case_productsCreationAttributes } from "./case_products";
import { case_services as _case_services } from "./case_services";
import type { case_servicesAttributes, case_servicesCreationAttributes } from "./case_services";
import { case_status_history as _case_status_history } from "./case_status_history";
import type { case_status_historyAttributes, case_status_historyCreationAttributes } from "./case_status_history";
import { case_timeline as _case_timeline } from "./case_timeline";
import type { case_timelineAttributes, case_timelineCreationAttributes } from "./case_timeline";
import { case_transfers as _case_transfers } from "./case_transfers";
import type { case_transfersAttributes, case_transfersCreationAttributes } from "./case_transfers";
import { consultations as _consultations } from "./consultations";
import type { consultationsAttributes, consultationsCreationAttributes } from "./consultations";
import { doctors as _doctors } from "./doctors";
import type { doctorsAttributes, doctorsCreationAttributes } from "./doctors";
import { lab_tests as _lab_tests } from "./lab_tests";
import type { lab_testsAttributes, lab_testsCreationAttributes } from "./lab_tests";
import { operation_records as _operation_records } from "./operation_records";
import type { operation_recordsAttributes, operation_recordsCreationAttributes } from "./operation_records";
import { operation_team as _operation_team } from "./operation_team";
import type { operation_teamAttributes, operation_teamCreationAttributes } from "./operation_team";
import { operation_types as _operation_types } from "./operation_types";
import type { operation_typesAttributes, operation_typesCreationAttributes } from "./operation_types";
import { package_details as _package_details } from "./package_details";
import type { package_detailsAttributes, package_detailsCreationAttributes } from "./package_details";
import { packages as _packages } from "./packages";
import type { packagesAttributes, packagesCreationAttributes } from "./packages";
import { patients as _patients } from "./patients";
import type { patientsAttributes, patientsCreationAttributes } from "./patients";
import { rooms as _rooms } from "./rooms";
import type { roomsAttributes, roomsCreationAttributes } from "./rooms";
import { scheduled_operations as _scheduled_operations } from "./scheduled_operations";
import type { scheduled_operationsAttributes, scheduled_operationsCreationAttributes } from "./scheduled_operations";
import { service_types as _service_types } from "./service_types";
import type { service_typesAttributes, service_typesCreationAttributes } from "./service_types";
import { services as _services } from "./services";
import type { servicesAttributes, servicesCreationAttributes } from "./services";
import { specialties as _specialties } from "./specialties";
import type { specialtiesAttributes, specialtiesCreationAttributes } from "./specialties";
import { users } from "../core/users";
import { products } from "../inventory/products";
import { warehouses } from "../inventory/warehouses";
import { stock_movements } from "../inventory/stock_movements";

export {
  _admission_types as admission_types,
  _case_doctors as case_doctors,
  _case_files as case_files,
  _case_package_assignments as case_package_assignments,
  _case_products as case_products,
  _case_rooms as case_rooms,
  _case_services as case_services,
  _case_status_history as case_status_history,
  _case_timeline as case_timeline,
  _case_transfers as case_transfers,
  _consultations as consultations,
  _doctors as doctors,
  _lab_tests as lab_tests,
  _operation_records as operation_records,
  _operation_team as operation_team,
  _operation_types as operation_types,
  _package_details as package_details,
  _packages as packages,
  _patients as patients,
  _rooms as rooms,
  _scheduled_operations as scheduled_operations,
  _service_types as service_types,
  _services as services,
  _specialties as specialties,
};

export type {
  admission_typesAttributes,
  admission_typesCreationAttributes,
  case_doctorsAttributes,
  case_doctorsCreationAttributes,
  case_filesAttributes,
  case_filesCreationAttributes,
  case_package_assignmentsAttributes,
  case_package_assignmentsCreationAttributes,
  case_productsAttributes,
  case_productsCreationAttributes,
  case_roomsAttributes,
  case_roomsCreationAttributes,
  case_servicesAttributes,
  case_servicesCreationAttributes,
  case_status_historyAttributes,
  case_status_historyCreationAttributes,
  case_timelineAttributes,
  case_timelineCreationAttributes,
  case_transfersAttributes,
  case_transfersCreationAttributes,
  consultationsAttributes,
  consultationsCreationAttributes,
  doctorsAttributes,
  doctorsCreationAttributes,
  lab_testsAttributes,
  lab_testsCreationAttributes,
  operation_recordsAttributes,
  operation_recordsCreationAttributes,
  operation_teamAttributes,
  operation_teamCreationAttributes,
  operation_typesAttributes,
  operation_typesCreationAttributes,
  package_detailsAttributes,
  package_detailsCreationAttributes,
  packagesAttributes,
  packagesCreationAttributes,
  patientsAttributes,
  patientsCreationAttributes,
  roomsAttributes,
  roomsCreationAttributes,
  scheduled_operationsAttributes,
  scheduled_operationsCreationAttributes,
  service_typesAttributes,
  service_typesCreationAttributes,
  servicesAttributes,
  servicesCreationAttributes,
  specialtiesAttributes,
  specialtiesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  // Initialize external models first
  const usersModel = users.initModel(sequelize);
  const productsModel = products.initModel(sequelize);
  const warehousesModel = warehouses.initModel(sequelize);
  const stockMovementsModel = stock_movements.initModel(sequelize);

  // Initialize medical schema models
  const admission_types = _admission_types.initModel(sequelize);
  const case_doctors = _case_doctors.initModel(sequelize);
  const case_files = _case_files.initModel(sequelize);
  const case_package_assignments = _case_package_assignments.initModel(sequelize);
  const case_products = _case_products.initModel(sequelize);
  const case_rooms = _case_rooms.initModel(sequelize);
  const case_services = _case_services.initModel(sequelize);
  const case_status_history = _case_status_history.initModel(sequelize);
  const case_timeline = _case_timeline.initModel(sequelize);
  const case_transfers = _case_transfers.initModel(sequelize);
  const consultations = _consultations.initModel(sequelize);
  const doctors = _doctors.initModel(sequelize);
  const lab_tests = _lab_tests.initModel(sequelize);
  const operation_records = _operation_records.initModel(sequelize);
  const operation_team = _operation_team.initModel(sequelize);
  const operation_types = _operation_types.initModel(sequelize);
  const package_details = _package_details.initModel(sequelize);
  const packages = _packages.initModel(sequelize);
  const patients = _patients.initModel(sequelize);
  const rooms = _rooms.initModel(sequelize);
  const scheduled_operations = _scheduled_operations.initModel(sequelize);
  const service_types = _service_types.initModel(sequelize);
  const services = _services.initModel(sequelize);
  const specialties = _specialties.initModel(sequelize);

  case_files.belongsTo(admission_types, { as: "admissionType", foreignKey: "admission_type_id" });
  admission_types.hasMany(case_files, { as: "case_files", foreignKey: "admission_type_id" });
  case_doctors.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_doctors, { as: "case_doctors", foreignKey: "case_file_id" });
  case_files.belongsTo(case_files, { as: "transfer_from_case", foreignKey: "transfer_from_case_id" });
  case_files.hasMany(case_files, { as: "case_files", foreignKey: "transfer_from_case_id" });
  case_package_assignments.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_package_assignments, { as: "case_package_assignments", foreignKey: "case_file_id" });
  case_rooms.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_rooms, { as: "case_rooms", foreignKey: "case_file_id" });
  case_services.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_services, { as: "case_services", foreignKey: "case_file_id" });
  case_status_history.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_status_history, { as: "case_status_histories", foreignKey: "case_file_id" });
  case_timeline.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_timeline, { as: "case_timelines", foreignKey: "case_file_id" });
  case_transfers.belongsTo(case_files, { as: "original_case", foreignKey: "original_case_id" });
  case_files.hasMany(case_transfers, { as: "case_transfers", foreignKey: "original_case_id" });
  case_transfers.belongsTo(case_files, { as: "transferred_case", foreignKey: "transferred_case_id" });
  case_files.hasMany(case_transfers, { as: "transferred_case_case_transfers", foreignKey: "transferred_case_id" });
  consultations.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(consultations, { as: "consultations", foreignKey: "case_file_id" });
  lab_tests.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(lab_tests, { as: "lab_tests", foreignKey: "case_file_id" });
  scheduled_operations.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(scheduled_operations, { as: "scheduled_operations", foreignKey: "case_file_id" });
  case_doctors.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id" });
  doctors.hasMany(case_doctors, { as: "case_doctors", foreignKey: "doctor_id" });
  case_package_assignments.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id" });
  doctors.hasMany(case_package_assignments, { as: "case_package_assignments", foreignKey: "doctor_id" });
  consultations.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id" });
  doctors.hasMany(consultations, { as: "consultations", foreignKey: "doctor_id" });
  lab_tests.belongsTo(doctors, { as: "ordered_by_doctor", foreignKey: "ordered_by" });
  doctors.hasMany(lab_tests, { as: "lab_tests", foreignKey: "ordered_by" });
  operation_team.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id" });
  doctors.hasMany(operation_team, { as: "operation_teams", foreignKey: "doctor_id" });
  scheduled_operations.belongsTo(doctors, { as: "anesthesiologist", foreignKey: "anesthesiologist_id" });
  doctors.hasMany(scheduled_operations, { as: "scheduled_operations", foreignKey: "anesthesiologist_id" });
  scheduled_operations.belongsTo(doctors, { as: "primary_surgeon", foreignKey: "primary_surgeon_id" });
  doctors.hasMany(scheduled_operations, { as: "primary_surgeon_scheduled_operations", foreignKey: "primary_surgeon_id" });
  scheduled_operations.belongsTo(operation_types, { as: "operation_type", foreignKey: "operation_type_id" });
  operation_types.hasMany(scheduled_operations, { as: "scheduled_operations", foreignKey: "operation_type_id" });
  case_package_assignments.belongsTo(packages, { as: "package", foreignKey: "package_id" });
  packages.hasMany(case_package_assignments, { as: "case_package_assignments", foreignKey: "package_id" });
  package_details.belongsTo(packages, { as: "package", foreignKey: "package_id" });
  packages.hasMany(package_details, { as: "package_details", foreignKey: "package_id" });
  case_files.belongsTo(patients, { as: "patient", foreignKey: "patient_id" });
  patients.hasMany(case_files, { as: "case_files", foreignKey: "patient_id" });
  consultations.belongsTo(patients, { as: "patient", foreignKey: "patient_id" });
  patients.hasMany(consultations, { as: "consultations", foreignKey: "patient_id" });
  lab_tests.belongsTo(patients, { as: "patient", foreignKey: "patient_id" });
  patients.hasMany(lab_tests, { as: "lab_tests", foreignKey: "patient_id" });
  package_details.belongsTo(productsModel, { as: "product", foreignKey: "product_id" });
  productsModel.hasMany(package_details, { as: "package_details", foreignKey: "product_id" });
  case_rooms.belongsTo(rooms, { as: "room", foreignKey: "room_id" });
  rooms.hasMany(case_rooms, { as: "case_rooms", foreignKey: "room_id" });
  operation_records.belongsTo(scheduled_operations, { as: "scheduled_operation", foreignKey: "scheduled_operation_id" });
  scheduled_operations.hasOne(operation_records, { as: "operation_record", foreignKey: "scheduled_operation_id" });
  operation_team.belongsTo(scheduled_operations, { as: "scheduled_operation", foreignKey: "scheduled_operation_id" });
  scheduled_operations.hasMany(operation_team, { as: "operation_teams", foreignKey: "scheduled_operation_id" });
  case_timeline.belongsTo(service_types, { as: "service_type", foreignKey: "service_type_id" });
  service_types.hasMany(case_timeline, { as: "case_timelines", foreignKey: "service_type_id" });
  services.belongsTo(service_types, { as: "service_type", foreignKey: "service_type_id" });
  service_types.hasMany(services, { as: "services", foreignKey: "service_type_id" });
  case_services.belongsTo(services, { as: "service", foreignKey: "service_id" });
  services.hasMany(case_services, { as: "case_services", foreignKey: "service_id" });
  lab_tests.belongsTo(services, { as: "service", foreignKey: "service_id" });
  services.hasMany(lab_tests, { as: "lab_tests", foreignKey: "service_id" });
  packages.belongsTo(services, { as: "service", foreignKey: "service_id" });
  services.hasMany(packages, { as: "packages", foreignKey: "service_id" });
  doctors.belongsTo(specialties, { as: "specialty", foreignKey: "specialty_id" });
  specialties.hasMany(doctors, { as: "doctors", foreignKey: "specialty_id" });
  operation_types.belongsTo(specialties, { as: "specialty", foreignKey: "specialty_id" });
  specialties.hasMany(operation_types, { as: "operation_types", foreignKey: "specialty_id" });
  case_files.belongsTo(usersModel, { as: "created_by_user", foreignKey: "created_by" });
  usersModel.hasMany(case_files, { as: "case_files", foreignKey: "created_by" });
  case_package_assignments.belongsTo(usersModel, { as: "assigned_by_user", foreignKey: "assigned_by" });
  usersModel.hasMany(case_package_assignments, { as: "case_package_assignments", foreignKey: "assigned_by" });
  case_services.belongsTo(usersModel, { as: "applied_by_user", foreignKey: "applied_by" });
  usersModel.hasMany(case_services, { as: "case_services", foreignKey: "applied_by" });
  case_status_history.belongsTo(usersModel, { as: "performed_by_user", foreignKey: "performed_by" });
  usersModel.hasMany(case_status_history, { as: "case_status_histories", foreignKey: "performed_by" });
  case_timeline.belongsTo(usersModel, { as: "created_by_user", foreignKey: "created_by" });
  usersModel.hasMany(case_timeline, { as: "case_timelines", foreignKey: "created_by" });
  case_transfers.belongsTo(usersModel, { as: "approved_by_user", foreignKey: "approved_by" });
  usersModel.hasMany(case_transfers, { as: "case_transfers", foreignKey: "approved_by" });
  doctors.belongsTo(usersModel, { as: "user", foreignKey: "user_id" });
  usersModel.hasOne(doctors, { as: "doctor", foreignKey: "user_id" });
  operation_records.belongsTo(usersModel, { as: "created_by_user", foreignKey: "created_by" });
  usersModel.hasMany(operation_records, { as: "operation_records", foreignKey: "created_by" });
  packages.belongsTo(usersModel, { as: "created_by_user", foreignKey: "created_by" });
  usersModel.hasMany(packages, { as: "packages", foreignKey: "created_by" });
  packages.belongsTo(usersModel, { as: "updated_by_user", foreignKey: "updated_by" });
  usersModel.hasMany(packages, { as: "updated_by_packages", foreignKey: "updated_by" });
  patients.belongsTo(usersModel, { as: "created_by_user", foreignKey: "created_by" });
  usersModel.hasMany(patients, { as: "patients", foreignKey: "created_by" });

  // case_products associations
  case_products.belongsTo(case_files, { as: "case_file", foreignKey: "case_file_id" });
  case_files.hasMany(case_products, { as: "case_products", foreignKey: "case_file_id" });
  case_products.belongsTo(productsModel, { as: "product", foreignKey: "product_id" });
  productsModel.hasMany(case_products, { as: "case_products", foreignKey: "product_id" });
  case_products.belongsTo(warehousesModel, { as: "warehouse", foreignKey: "warehouse_id" });
  warehousesModel.hasMany(case_products, { as: "case_products", foreignKey: "warehouse_id" });
  case_products.belongsTo(stockMovementsModel, { as: "stock_movement", foreignKey: "stock_movement_id" });
  case_products.belongsTo(usersModel, { as: "applied_by_user", foreignKey: "applied_by" });
  case_products.belongsTo(usersModel, { as: "voided_by_user", foreignKey: "voided_by" });

  return {
    admission_types: admission_types,
    case_doctors: case_doctors,
    case_files: case_files,
    case_package_assignments: case_package_assignments,
    case_products: case_products,
    case_rooms: case_rooms,
    case_services: case_services,
    case_status_history: case_status_history,
    case_timeline: case_timeline,
    case_transfers: case_transfers,
    consultations: consultations,
    doctors: doctors,
    lab_tests: lab_tests,
    operation_records: operation_records,
    operation_team: operation_team,
    operation_types: operation_types,
    package_details: package_details,
    packages: packages,
    patients: patients,
    rooms: rooms,
    scheduled_operations: scheduled_operations,
    service_types: service_types,
    services: services,
    specialties: specialties,
  };
}
