import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface hospital_infoAttributes {
  id: string;
  name: string;
  legal_name?: string;
  nit?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  phone?: string;
  emergency_phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  is_active?: boolean;
  updated_at?: Date;
  updated_by?: string;
}

export type hospital_infoPk = "id";
export type hospital_infoId = hospital_info[hospital_infoPk];
export type hospital_infoOptionalAttributes = "id" | "legal_name" | "nit" | "city" | "state" | "country" | "zip_code" | "phone" | "emergency_phone" | "email" | "website" | "logo_url" | "timezone" | "currency" | "language" | "is_active" | "updated_at" | "updated_by";
export type hospital_infoCreationAttributes = Optional<hospital_infoAttributes, hospital_infoOptionalAttributes>;

export class hospital_info extends Model<hospital_infoAttributes, hospital_infoCreationAttributes> implements hospital_infoAttributes {
  id!: string;
  name!: string;
  legal_name?: string;
  nit?: string;
  address!: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  phone?: string;
  emergency_phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  is_active?: boolean;
  updated_at?: Date;
  updated_by?: string;

  // hospital_info belongsTo users via updated_by
  updated_by_user!: users;
  getUpdated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUpdated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUpdated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof hospital_info {
    return sequelize.define('hospital_info', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      legal_name: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      nit: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "Guatemala"
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      emergency_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      website: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "America\/Guatemala"
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        defaultValue: "GTQ"
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "es"
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
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
      tableName: 'hospital_info',
      schema: 'config',
      timestamps: true,
      indexes: [
        {
          name: "hospital_info_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof hospital_info;
  }
}
