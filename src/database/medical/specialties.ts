import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { doctors, doctorsId } from './doctors';
import type { operation_types, operation_typesId } from './operation_types';

export interface specialtiesAttributes {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
}

export type specialtiesPk = "id";
export type specialtiesId = specialties[specialtiesPk];
export type specialtiesOptionalAttributes = "id" | "description" | "is_active" | "created_at";
export type specialtiesCreationAttributes = Optional<specialtiesAttributes, specialtiesOptionalAttributes>;

export class specialties extends Model<specialtiesAttributes, specialtiesCreationAttributes> implements specialtiesAttributes {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;

  // specialties hasMany doctors via specialty_id
  doctors!: doctors[];
  getDoctors!: Sequelize.HasManyGetAssociationsMixin<doctors>;
  setDoctors!: Sequelize.HasManySetAssociationsMixin<doctors, doctorsId>;
  addDoctor!: Sequelize.HasManyAddAssociationMixin<doctors, doctorsId>;
  addDoctors!: Sequelize.HasManyAddAssociationsMixin<doctors, doctorsId>;
  createDoctor!: Sequelize.HasManyCreateAssociationMixin<doctors>;
  removeDoctor!: Sequelize.HasManyRemoveAssociationMixin<doctors, doctorsId>;
  removeDoctors!: Sequelize.HasManyRemoveAssociationsMixin<doctors, doctorsId>;
  hasDoctor!: Sequelize.HasManyHasAssociationMixin<doctors, doctorsId>;
  hasDoctors!: Sequelize.HasManyHasAssociationsMixin<doctors, doctorsId>;
  countDoctors!: Sequelize.HasManyCountAssociationsMixin;
  // specialties hasMany operation_types via specialty_id
  operation_types!: operation_types[];
  getOperation_types!: Sequelize.HasManyGetAssociationsMixin<operation_types>;
  setOperation_types!: Sequelize.HasManySetAssociationsMixin<operation_types, operation_typesId>;
  addOperation_type!: Sequelize.HasManyAddAssociationMixin<operation_types, operation_typesId>;
  addOperation_types!: Sequelize.HasManyAddAssociationsMixin<operation_types, operation_typesId>;
  createOperation_type!: Sequelize.HasManyCreateAssociationMixin<operation_types>;
  removeOperation_type!: Sequelize.HasManyRemoveAssociationMixin<operation_types, operation_typesId>;
  removeOperation_types!: Sequelize.HasManyRemoveAssociationsMixin<operation_types, operation_typesId>;
  hasOperation_type!: Sequelize.HasManyHasAssociationMixin<operation_types, operation_typesId>;
  hasOperation_types!: Sequelize.HasManyHasAssociationsMixin<operation_types, operation_typesId>;
  countOperation_types!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof specialties {
    return sequelize.define('specialties', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: "specialties_code_key"
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
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
      tableName: 'specialties',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "specialties_code_key",
          unique: true,
          fields: [
            { name: "code" },
          ]
        },
        {
          name: "specialties_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof specialties;
  }
}
