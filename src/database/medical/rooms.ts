import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { case_rooms, case_roomsId } from './case_rooms';

export interface roomsAttributes {
  id: string;
  room_number: string;
  room_type: string;
  floor?: number;
  capacity: number;
  daily_rate: number;
  has_bathroom?: boolean;
  has_oxygen?: boolean;
  has_monitor?: boolean;
  equipment?: object;
  status?: "available" | "occupied" | "maintenance" | "cleaning" | "reserved";
  is_active?: boolean;
  created_at?: Date;
}

export type roomsPk = "id";
export type roomsId = rooms[roomsPk];
export type roomsOptionalAttributes = "id" | "floor" | "capacity" | "has_bathroom" | "has_oxygen" | "has_monitor" | "equipment" | "status" | "is_active" | "created_at";
export type roomsCreationAttributes = Optional<roomsAttributes, roomsOptionalAttributes>;

export class rooms extends Model<roomsAttributes, roomsCreationAttributes> implements roomsAttributes {
  id!: string;
  room_number!: string;
  room_type!: string;
  floor?: number;
  capacity!: number;
  daily_rate!: number;
  has_bathroom?: boolean;
  has_oxygen?: boolean;
  has_monitor?: boolean;
  equipment?: object;
  status?: "available" | "occupied" | "maintenance" | "cleaning" | "reserved";
  is_active?: boolean;
  created_at?: Date;

  // rooms hasMany case_rooms via room_id
  case_rooms!: case_rooms[];
  getCase_rooms!: Sequelize.HasManyGetAssociationsMixin<case_rooms>;
  setCase_rooms!: Sequelize.HasManySetAssociationsMixin<case_rooms, case_roomsId>;
  addCase_room!: Sequelize.HasManyAddAssociationMixin<case_rooms, case_roomsId>;
  addCase_rooms!: Sequelize.HasManyAddAssociationsMixin<case_rooms, case_roomsId>;
  createCase_room!: Sequelize.HasManyCreateAssociationMixin<case_rooms>;
  removeCase_room!: Sequelize.HasManyRemoveAssociationMixin<case_rooms, case_roomsId>;
  removeCase_rooms!: Sequelize.HasManyRemoveAssociationsMixin<case_rooms, case_roomsId>;
  hasCase_room!: Sequelize.HasManyHasAssociationMixin<case_rooms, case_roomsId>;
  hasCase_rooms!: Sequelize.HasManyHasAssociationsMixin<case_rooms, case_roomsId>;
  countCase_rooms!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof rooms {
    return sequelize.define('rooms', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: "rooms_room_number_key"
      },
      room_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      daily_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      has_bathroom: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      has_oxygen: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      has_monitor: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      equipment: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("available", "occupied", "maintenance", "cleaning", "reserved"),
        allowNull: true,
        defaultValue: "available"
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      tableName: 'rooms',
      schema: 'medical',
      timestamps: true,
      underscored: true,
      updatedAt: false,
      indexes: [
        {
          name: "rooms_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "rooms_room_number_key",
          unique: true,
          fields: [
            { name: "room_number" },
          ]
        },
      ]
    }) as typeof rooms;
  }
}
