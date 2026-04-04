import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { users, usersId } from '../core/users';

export interface case_transfersAttributes {
  id: string;
  original_case_id: string;
  transferred_case_id: string;
  transfer_date: Date;
  transfer_reason: string;
  from_department?: string;
  to_department?: string;
  approved_by?: string;
  notes?: string;
  created_at?: Date;
}

export type case_transfersPk = "id";
export type case_transfersId = case_transfers[case_transfersPk];
export type case_transfersOptionalAttributes = "id" | "transfer_date" | "from_department" | "to_department" | "approved_by" | "notes" | "created_at";
export type case_transfersCreationAttributes = Optional<case_transfersAttributes, case_transfersOptionalAttributes>;

export class case_transfers extends Model<case_transfersAttributes, case_transfersCreationAttributes> implements case_transfersAttributes {
  id!: string;
  original_case_id!: string;
  transferred_case_id!: string;
  transfer_date!: Date;
  transfer_reason!: string;
  from_department?: string;
  to_department?: string;
  approved_by?: string;
  notes?: string;
  created_at?: Date;

  // case_transfers belongsTo case_files via original_case_id
  original_case!: case_files;
  getOriginal_case!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setOriginal_case!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createOriginal_case!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_transfers belongsTo case_files via transferred_case_id
  transferred_case!: case_files;
  getTransferred_case!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setTransferred_case!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createTransferred_case!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_transfers belongsTo users via approved_by
  approved_by_user!: users;
  getApproved_by_user!: Sequelize.BelongsToGetAssociationMixin<users>;
  setApproved_by_user!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createApproved_by_user!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_transfers {
    return sequelize.define('case_transfers', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      original_case_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Original case file",
        references: {
          model: 'case_files',
          key: 'id'
        }
      },
      transferred_case_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "New case file created from transfer",
        references: {
          model: 'case_files',
          key: 'id'
        }
      },
      transfer_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      transfer_reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      from_department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      to_department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'case_transfers',
      schema: 'medical',
      timestamps: true,
      indexes: [
        {
          name: "case_transfers_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_case_transfers_original",
          fields: [
            { name: "original_case_id" },
          ]
        },
        {
          name: "idx_case_transfers_transferred",
          fields: [
            { name: "transferred_case_id" },
          ]
        },
      ]
    }) as typeof case_transfers;
  }
}
