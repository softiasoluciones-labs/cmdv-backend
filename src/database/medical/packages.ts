import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_package_assignments, case_package_assignmentsId } from './case_package_assignments';
import type { package_details, package_detailsId } from './package_details';
import type { services, servicesId } from './services';
import type { users, usersId } from '../core/users';

export interface packagesAttributes {
  id: string;
  code: string;
  service_id: string;
  name: string;
  description?: string;
  doctor_type: "internal" | "external";
  internal_doctor_price?: number;
  external_doctor_price?: number;
  validity_days?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export type packagesPk = "id";
export type packagesId = packages[packagesPk];
export type packagesOptionalAttributes = "id" | "description" | "internal_doctor_price" | "external_doctor_price" | "validity_days" | "is_active" | "created_at" | "updated_at" | "created_by" | "updated_by";
export type packagesCreationAttributes = Optional<packagesAttributes, packagesOptionalAttributes>;

export class packages extends Model<packagesAttributes, packagesCreationAttributes> implements packagesAttributes {
  id!: string;
  code!: string;
  service_id!: string;
  name!: string;
  description?: string;
  doctor_type!: "internal" | "external";
  internal_doctor_price?: number;
  external_doctor_price?: number;
  validity_days?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;

  // packages hasMany case_package_assignments via package_id
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
  // packages hasMany package_details via package_id
  package_details!: package_details[];
  getPackage_details!: Sequelize.HasManyGetAssociationsMixin<package_details>;
  setPackage_details!: Sequelize.HasManySetAssociationsMixin<package_details, package_detailsId>;
  addPackage_detail!: Sequelize.HasManyAddAssociationMixin<package_details, package_detailsId>;
  addPackage_details!: Sequelize.HasManyAddAssociationsMixin<package_details, package_detailsId>;
  createPackage_detail!: Sequelize.HasManyCreateAssociationMixin<package_details>;
  removePackage_detail!: Sequelize.HasManyRemoveAssociationMixin<package_details, package_detailsId>;
  removePackage_details!: Sequelize.HasManyRemoveAssociationsMixin<package_details, package_detailsId>;
  hasPackage_detail!: Sequelize.HasManyHasAssociationMixin<package_details, package_detailsId>;
  hasPackage_details!: Sequelize.HasManyHasAssociationsMixin<package_details, package_detailsId>;
  countPackage_details!: Sequelize.HasManyCountAssociationsMixin;
  // packages belongsTo services via service_id
  service!: services;
  getService!: Sequelize.BelongsToGetAssociationMixin<services>;
  setService!: Sequelize.BelongsToSetAssociationMixin<services, servicesId>;
  createService!: Sequelize.BelongsToCreateAssociationMixin<services>;
  // packages belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // packages belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof packages {
    return sequelize.define('packages', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "packages_code_key"
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      doctor_type: {
        type: DataTypes.ENUM("internal", "external"),
        allowNull: false
      },
      internal_doctor_price: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      external_doctor_price: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      validity_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'packages',
      schema: 'medical',
      timestamps: true,

      underscored: true,
      indexes: [
        {
          name: "idx_packages_active",
          fields: [
            { name: "is_active" },
          ]
        },
        {
          name: "idx_packages_doctor_type",
          fields: [
            { name: "doctor_type" },
          ]
        },
        {
          name: "idx_packages_service",
          fields: [
            { name: "service_id" },
          ]
        },
        {
          name: "packages_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "packages_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof packages;
  }
}
