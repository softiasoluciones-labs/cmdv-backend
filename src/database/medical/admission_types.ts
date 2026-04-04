import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';

export interface admission_typesAttributes {
  id: string;
  code: string;
  name: string;
  requires_hospitalization: boolean;
  requires_package: boolean;
  allows_transfer: boolean;
  requires_immediate_payment: boolean;
  category?: "E" | "P" | "NULL";
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type admission_typesPk = "id";
export type admission_typesId = admission_types[admission_typesPk];
export type admission_typesOptionalAttributes = "id" | "category" | "description" | "is_active" | "created_at" | "updated_at";
export type admission_typesCreationAttributes = Optional<admission_typesAttributes, admission_typesOptionalAttributes>;

export class admission_types extends Model<admission_typesAttributes, admission_typesCreationAttributes> implements admission_typesAttributes {
  id!: string;
  code!: string;
  name!: string;
  requires_hospitalization!: boolean;
  requires_package!: boolean;
  allows_transfer!: boolean;
  requires_immediate_payment!: boolean;
  category?: "E" | "P" | "NULL";
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  // admission_types hasMany case_files via admission_type_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof admission_types {
    return sequelize.define('admission_types', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "admission_types_code_key"
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      requires_hospitalization: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If TRUE (S), case must have room assignment"
      },
      requires_package: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If TRUE (S), case must have package assigned"
      },
      allows_transfer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If TRUE (S), case can be transferred"
      },
      requires_immediate_payment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If TRUE (S), payment must be made before case creation\/closure"
      },
      category: {
        type: DataTypes.ENUM("E", "P", "NULL"),
        allowNull: true,
        comment: "E=Estudios\/Exámenes, P=Procedimientos"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'admission_types',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "admission_types_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "admission_types_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_admission_types_active",
          fields: [
            { name: "is_active" },
          ]
        },
        {
          name: "idx_admission_types_category",
          fields: [
            { name: "category" },
          ]
        },
        {
          name: "idx_admission_types_code",
          fields: [
            { name: "code" },
          ]
        },
      ]
    }) as typeof admission_types;
  }
}
