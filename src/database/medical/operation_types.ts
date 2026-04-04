import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { scheduled_operations, scheduled_operationsId } from './scheduled_operations';
import type { specialties, specialtiesId } from './specialties';

export interface operation_typesAttributes {
  id: string;
  code: string;
  name: string;
  description?: string;
  specialty_id?: string;
  complexity: "minor" | "intermediate" | "major" | "critical";
  estimated_duration_minutes?: number;
  base_cost: number;
  anesthesia_required?: boolean;
  pre_operative_requirements?: string[];
  post_operative_care?: string[];
  is_active?: boolean;
  created_at?: Date;
}

export type operation_typesPk = "id";
export type operation_typesId = operation_types[operation_typesPk];
export type operation_typesOptionalAttributes = "id" | "description" | "specialty_id" | "estimated_duration_minutes" | "anesthesia_required" | "pre_operative_requirements" | "post_operative_care" | "is_active" | "created_at";
export type operation_typesCreationAttributes = Optional<operation_typesAttributes, operation_typesOptionalAttributes>;

export class operation_types extends Model<operation_typesAttributes, operation_typesCreationAttributes> implements operation_typesAttributes {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  specialty_id?: string;
  complexity!: "minor" | "intermediate" | "major" | "critical";
  estimated_duration_minutes?: number;
  base_cost!: number;
  anesthesia_required?: boolean;
  pre_operative_requirements?: string[];
  post_operative_care?: string[];
  is_active?: boolean;
  created_at?: Date;

  // operation_types hasMany scheduled_operations via operation_type_id
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
  // operation_types belongsTo specialties via specialty_id
  specialty!: specialties;
  getSpecialty!: Sequelize.BelongsToGetAssociationMixin<specialties>;
  setSpecialty!: Sequelize.BelongsToSetAssociationMixin<specialties, specialtiesId>;
  createSpecialty!: Sequelize.BelongsToCreateAssociationMixin<specialties>;

  static initModel(sequelize: Sequelize.Sequelize): typeof operation_types {
    return sequelize.define('operation_types', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: "operation_types_code_key"
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specialty_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'specialties',
        key: 'id'
      }
    },
    complexity: {
      type: DataTypes.ENUM("minor","intermediate","major","critical"),
      allowNull: false
    },
    estimated_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    base_cost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    anesthesia_required: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    pre_operative_requirements: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    post_operative_care: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'operation_types',
    schema: 'medical',
    timestamps: true,
    indexes: [
      {
        name: "operation_types_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "operation_types_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof operation_types;
  }
}
