import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_timeline, case_timelineId } from './case_timeline';
import type { services, servicesId } from './services';

export interface service_typesAttributes {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  is_active?: boolean;
  created_at?: Date;
}

export type service_typesPk = "id";
export type service_typesId = service_types[service_typesPk];
export type service_typesOptionalAttributes = "id" | "description" | "is_active" | "created_at";
export type service_typesCreationAttributes = Optional<service_typesAttributes, service_typesOptionalAttributes>;

export class service_types extends Model<service_typesAttributes, service_typesCreationAttributes> implements service_typesAttributes {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  category!: string;
  is_active?: boolean;
  created_at?: Date;

  // service_types hasMany case_timeline via service_type_id
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
  // service_types hasMany services via service_type_id
  services!: services[];
  getServices!: Sequelize.HasManyGetAssociationsMixin<services>;
  setServices!: Sequelize.HasManySetAssociationsMixin<services, servicesId>;
  addService!: Sequelize.HasManyAddAssociationMixin<services, servicesId>;
  addServices!: Sequelize.HasManyAddAssociationsMixin<services, servicesId>;
  createService!: Sequelize.HasManyCreateAssociationMixin<services>;
  removeService!: Sequelize.HasManyRemoveAssociationMixin<services, servicesId>;
  removeServices!: Sequelize.HasManyRemoveAssociationsMixin<services, servicesId>;
  hasService!: Sequelize.HasManyHasAssociationMixin<services, servicesId>;
  hasServices!: Sequelize.HasManyHasAssociationsMixin<services, servicesId>;
  countServices!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof service_types {
    return sequelize.define('service_types', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "service_types_code_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'service_types',
    schema: 'medical',
    timestamps: true,
    indexes: [
      {
        name: "service_types_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "service_types_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof service_types;
  }
}
