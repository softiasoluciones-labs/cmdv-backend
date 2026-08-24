import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { doctors, doctorsId } from './doctors';
import type { packages, packagesId } from './packages';
import type { users, usersId } from '../core/users';

export interface case_package_assignmentsAttributes {
  id: string;
  case_file_id: string;
  package_id: string;
  doctor_id: string;
  doctor_type_used: "internal" | "external";
  price_applied: number;
  assigned_date?: Date;
  assigned_by?: string;
  inventory_deducted?: boolean;
  inventory_deducted_at?: Date;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}

export type case_package_assignmentsPk = "id";
export type case_package_assignmentsId = case_package_assignments[case_package_assignmentsPk];
export type case_package_assignmentsOptionalAttributes = "id" | "assigned_date" | "assigned_by" | "inventory_deducted" | "inventory_deducted_at" | "notes" | "is_voided" | "voided_by" | "voided_at" | "void_reason";
export type case_package_assignmentsCreationAttributes = Optional<case_package_assignmentsAttributes, case_package_assignmentsOptionalAttributes>;

export class case_package_assignments extends Model<case_package_assignmentsAttributes, case_package_assignmentsCreationAttributes> implements case_package_assignmentsAttributes {
  id!: string;
  case_file_id!: string;
  package_id!: string;
  doctor_id!: string;
  doctor_type_used!: "internal" | "external";
  price_applied!: number;
  assigned_date?: Date;
  assigned_by?: string;
  inventory_deducted?: boolean;
  inventory_deducted_at?: Date;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;

  // case_package_assignments belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_package_assignments belongsTo doctors via doctor_id
  doctor!: doctors;
  getDoctor!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setDoctor!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createDoctor!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // case_package_assignments belongsTo packages via package_id
  package!: packages;
  getPackage!: Sequelize.BelongsToGetAssociationMixin<packages>;
  setPackage!: Sequelize.BelongsToSetAssociationMixin<packages, packagesId>;
  createPackage!: Sequelize.BelongsToCreateAssociationMixin<packages>;
  // case_package_assignments belongsTo users via assigned_by
  assigned_by_user!: users;
  getAssigned_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setAssigned_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createAssigned_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_package_assignments {
    return sequelize.define('case_package_assignments', {
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
        unique: "case_package_assignments_case_file_id_package_id_key"
      },
      package_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'packages',
          key: 'id'
        },
        unique: "case_package_assignments_case_file_id_package_id_key"
      },
      doctor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id'
        }
      },
      doctor_type_used: {
        type: DataTypes.ENUM("internal", "external"),
        allowNull: false,
        comment: "Doctor type used (internal\/external) determines which price was applied"
      },
      price_applied: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        comment: "Actual price charged based on doctor type"
      },
      assigned_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      inventory_deducted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: "Flag indicating if products were deducted from inventory"
      },
      inventory_deducted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_voided: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      voided_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      voided_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      void_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'case_package_assignments',
      schema: 'medical',
      timestamps: false,
      indexes: [
        {
          name: "case_package_assignments_case_file_id_package_id_key",
          unique: true,
          fields: [
            { name: "case_file_id" },
            { name: "package_id" },
          ]
        },
        {
          name: "case_package_assignments_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_case_package_assignments_case",
          fields: [
            { name: "case_file_id" },
          ]
        },
        {
          name: "idx_case_package_assignments_doctor",
          fields: [
            { name: "doctor_id" },
          ]
        },
        {
          name: "idx_case_package_assignments_package",
          fields: [
            { name: "package_id" },
          ]
        },
      ]
    }) as typeof case_package_assignments;
  }
}
