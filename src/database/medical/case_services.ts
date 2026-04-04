import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { services, servicesId } from './services';
import type { users, usersId } from '../core/users';

export interface case_servicesAttributes {
  id: string;
  case_file_id: string;
  service_id: string;
  quantity?: number;
  unit_price: number;
  total_price: number;
  applied_at?: Date;
  notes?: string;
  applied_by?: string;
}

export type case_servicesPk = "id";
export type case_servicesId = case_services[case_servicesPk];
export type case_servicesOptionalAttributes = "id" | "quantity" | "applied_at" | "notes" | "applied_by";
export type case_servicesCreationAttributes = Optional<case_servicesAttributes, case_servicesOptionalAttributes>;

export class case_services extends Model<case_servicesAttributes, case_servicesCreationAttributes> implements case_servicesAttributes {
  id!: string;
  case_file_id!: string;
  service_id!: string;
  quantity?: number;
  unit_price!: number;
  total_price!: number;
  applied_at?: Date;
  notes?: string;
  applied_by?: string;

  // case_services belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_services belongsTo services via service_id
  service!: services;
  getService!: Sequelize.BelongsToGetAssociationMixin<services>;
  setService!: Sequelize.BelongsToSetAssociationMixin<services, servicesId>;
  createService!: Sequelize.BelongsToCreateAssociationMixin<services>;
  // case_services belongsTo users via applied_by
  applied_by_user!: users;
  getApplied_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApplied_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createApplied_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_services {
    return sequelize.define('case_services', {
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
        }
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      unit_price: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      applied_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      applied_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      tableName: 'case_services',
      schema: 'medical',
      timestamps: false,
      indexes: [
        {
          name: "case_services_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof case_services;
  }
}
