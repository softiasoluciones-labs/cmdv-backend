import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_files, case_filesId } from './case_files';
import type { rooms, roomsId } from './rooms';

export interface case_roomsAttributes {
  id: string;
  case_file_id: string;
  room_id: string;
  check_in: Date;
  check_out?: Date;
  daily_rate: number;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;
}

export type case_roomsPk = "id";
export type case_roomsId = case_rooms[case_roomsPk];
export type case_roomsOptionalAttributes = "id" | "check_in" | "check_out" | "notes" | "is_voided" | "voided_by" | "voided_at" | "void_reason";
export type case_roomsCreationAttributes = Optional<case_roomsAttributes, case_roomsOptionalAttributes>;

export class case_rooms extends Model<case_roomsAttributes, case_roomsCreationAttributes> implements case_roomsAttributes {
  id!: string;
  case_file_id!: string;
  room_id!: string;
  check_in!: Date;
  check_out?: Date;
  daily_rate!: number;
  notes?: string;
  is_voided?: boolean;
  voided_by?: string;
  voided_at?: Date;
  void_reason?: string;

  // case_rooms belongsTo case_files via case_file_id
  case_file!: case_files;
  getCase_file!: Sequelize.BelongsToGetAssociationMixin<case_files>;
  setCase_file!: Sequelize.BelongsToSetAssociationMixin<case_files, case_filesId>;
  createCase_file!: Sequelize.BelongsToCreateAssociationMixin<case_files>;
  // case_rooms belongsTo rooms via room_id
  room!: rooms;
  getRoom!: Sequelize.BelongsToGetAssociationMixin<rooms>;
  setRoom!: Sequelize.BelongsToSetAssociationMixin<rooms, roomsId>;
  createRoom!: Sequelize.BelongsToCreateAssociationMixin<rooms>;

  static initModel(sequelize: Sequelize.Sequelize): typeof case_rooms {
    return sequelize.define('case_rooms', {
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
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    check_in: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull: true
    },
    daily_rate: {
      type: DataTypes.DECIMAL,
      allowNull: false
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
    tableName: 'case_rooms',
    schema: 'medical',
    timestamps: false,
    indexes: [
      {
        name: "case_rooms_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof case_rooms;
  }
}
