import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_services, case_servicesId } from './case_services';
import type { lab_tests, lab_testsId } from './lab_tests';
import type { packages, packagesId } from './packages';
import type { service_types, service_typesId } from './service_types';

export interface servicesAttributes {
  id: string;
  code: string;
  name: string;
  service_type_id: string;
  description?: string;
  base_price: number;
  estimated_duration_minutes?: number;
  requires_preparation?: boolean;
  preparation_instructions?: string;
  is_active?: boolean;
  created_at?: Date;
}

export type servicesPk = "id";
export type servicesId = services[servicesPk];
export type servicesOptionalAttributes = "id" | "description" | "estimated_duration_minutes" | "requires_preparation" | "preparation_instructions" | "is_active" | "created_at";
export type servicesCreationAttributes = Optional<servicesAttributes, servicesOptionalAttributes>;

export class services extends Model<servicesAttributes, servicesCreationAttributes> implements servicesAttributes {
  id!: string;
  code!: string;
  name!: string;
  service_type_id!: string;
  description?: string;
  base_price!: number;
  estimated_duration_minutes?: number;
  requires_preparation?: boolean;
  preparation_instructions?: string;
  is_active?: boolean;
  created_at?: Date;

  // services belongsTo service_types via service_type_id
  service_type!: service_types;
  getService_type!: Sequelize.BelongsToGetAssociationMixin<service_types>;
  setService_type!: Sequelize.BelongsToSetAssociationMixin<service_types, service_typesId>;
  createService_type!: Sequelize.BelongsToCreateAssociationMixin<service_types>;
  // services hasMany case_services via service_id
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
  // services hasMany lab_tests via service_id
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
  // services hasMany packages via service_id
  packages!: packages[];
  getPackages!: Sequelize.HasManyGetAssociationsMixin<packages>;
  setPackages!: Sequelize.HasManySetAssociationsMixin<packages, packagesId>;
  addPackage!: Sequelize.HasManyAddAssociationMixin<packages, packagesId>;
  addPackages!: Sequelize.HasManyAddAssociationsMixin<packages, packagesId>;
  createPackage!: Sequelize.HasManyCreateAssociationMixin<packages>;
  removePackage!: Sequelize.HasManyRemoveAssociationMixin<packages, packagesId>;
  removePackages!: Sequelize.HasManyRemoveAssociationsMixin<packages, packagesId>;
  hasPackage!: Sequelize.HasManyHasAssociationMixin<packages, packagesId>;
  hasPackages!: Sequelize.HasManyHasAssociationsMixin<packages, packagesId>;
  countPackages!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof services {
    return sequelize.define('services', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "services_code_key"
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      service_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'service_types',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      base_price: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      estimated_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      requires_preparation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      preparation_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'services',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "services_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "services_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof services;
  }
}
