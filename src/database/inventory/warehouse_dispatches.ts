import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';
import type { warehouses, warehousesId } from './warehouses';
import type { warehouse_dispatch_details, warehouse_dispatch_detailsId } from './warehouse_dispatch_details';

export interface warehouse_dispatchesAttributes {
  id: string;
  dispatch_number: string;
  source_warehouse_id: string;
  destination_warehouse_id: string;
  requester_name: string;
  requester_user_id?: string;
  status: 'pending' | 'approved' | 'dispatched' | 'completed' | 'cancelled';
  dispatch_date?: string;
  requested_date?: Date;
  completed_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  dispatched_by?: string;
  dispatched_at?: Date;
}

export type warehouse_dispatchesPk = "id";
export type warehouse_dispatchesId = warehouse_dispatches[warehouse_dispatchesPk];
export type warehouse_dispatchesOptionalAttributes = "id" | "dispatch_date" | "requested_date" | "completed_date" | "notes" | "created_at" | "updated_at" | "created_by" | "dispatched_by" | "dispatched_at";
export type warehouse_dispatchesCreationAttributes = Optional<warehouse_dispatchesAttributes, warehouse_dispatchesOptionalAttributes>;

export class warehouse_dispatches extends Model<warehouse_dispatchesAttributes, warehouse_dispatchesCreationAttributes> implements warehouse_dispatchesAttributes {
  id!: string;
  dispatch_number!: string;
  source_warehouse_id!: string;
  destination_warehouse_id!: string;
  requester_name!: string;
  requester_user_id?: string;
  status!: 'pending' | 'approved' | 'dispatched' | 'completed' | 'cancelled';
  dispatch_date?: string;
  requested_date?: Date;
  completed_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  dispatched_by?: string;
  dispatched_at?: Date;

  // warehouse_dispatches hasMany warehouse_dispatch_details via dispatch_id
  warehouse_dispatch_details!: warehouse_dispatch_details[];
  getWarehouse_dispatch_details!: Sequelize.HasManyGetAssociationsMixin<warehouse_dispatch_details>;
  setWarehouse_dispatch_details!: Sequelize.HasManySetAssociationsMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  addWarehouse_dispatch_detail!: Sequelize.HasManyAddAssociationMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  addWarehouse_dispatch_details!: Sequelize.HasManyAddAssociationsMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  createWarehouse_dispatch_detail!: Sequelize.HasManyCreateAssociationMixin<warehouse_dispatch_details>;
  removeWarehouse_dispatch_detail!: Sequelize.HasManyRemoveAssociationMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  removeWarehouse_dispatch_details!: Sequelize.HasManyRemoveAssociationsMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  hasWarehouse_dispatch_detail!: Sequelize.HasManyHasAssociationMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  hasWarehouse_dispatch_details!: Sequelize.HasManyHasAssociationsMixin<warehouse_dispatch_details, warehouse_dispatch_detailsId>;
  countWarehouse_dispatch_details!: Sequelize.HasManyCountAssociationsMixin;
  // warehouse_dispatches belongsTo users via requester_user_id
  requester!: users;
  getRequester!: Sequelize.BelongsToGetAssociationMixin<users>;
  setRequester!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createRequester!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // warehouse_dispatches belongsTo users via created_by
  created_by_user!: users;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // warehouse_dispatches belongsTo users via dispatched_by
  dispatched_by_user!: users;
  getDispatched_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setDispatched_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createDispatched_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;
  // warehouse_dispatches belongsTo warehouses via source_warehouse_id
  source_warehouse!: warehouses;
  getSource_warehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setSource_warehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createSource_warehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;
  // warehouse_dispatches belongsTo warehouses via destination_warehouse_id
  destination_warehouse!: warehouses;
  getDestination_warehouse!: Sequelize.BelongsToGetAssociationMixin<warehouses>;
  setDestination_warehouse!: Sequelize.BelongsToSetAssociationMixin<warehouses, warehousesId>;
  createDestination_warehouse!: Sequelize.BelongsToCreateAssociationMixin<warehouses>;

  static initModel(sequelize: Sequelize.Sequelize): typeof warehouse_dispatches {
    return sequelize.define('warehouse_dispatches', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      dispatch_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: "warehouse_dispatches_dispatch_number_key"
      },
      source_warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        }
      },
      destination_warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        }
      },
      requester_name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      requester_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "dispatched", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
      },
      dispatch_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      requested_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      completed_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      dispatched_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      dispatched_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'warehouse_dispatches',
      schema: 'inventory',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "idx_warehouse_dispatches_status",
          fields: [
            { name: "status" },
          ]
        },
        {
          name: "idx_warehouse_dispatches_source",
          fields: [
            { name: "source_warehouse_id" },
          ]
        },
        {
          name: "idx_warehouse_dispatches_destination",
          fields: [
            { name: "destination_warehouse_id" },
          ]
        },
        {
          name: "warehouse_dispatches_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "warehouse_dispatches_dispatch_number_key",
          unique: true,
          fields: [
            { name: "dispatch_number" },
          ]
        },
      ]
    }) as typeof warehouse_dispatches;
  }
}