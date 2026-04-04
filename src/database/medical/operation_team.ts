import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { doctors, doctorsId } from './doctors';
import type { scheduled_operations, scheduled_operationsId } from './scheduled_operations';

export interface operation_teamAttributes {
  id: string;
  scheduled_operation_id: string;
  doctor_id?: string;
  role: string;
  assigned_at?: Date;
}

export type operation_teamPk = "id";
export type operation_teamId = operation_team[operation_teamPk];
export type operation_teamOptionalAttributes = "id" | "doctor_id" | "assigned_at";
export type operation_teamCreationAttributes = Optional<operation_teamAttributes, operation_teamOptionalAttributes>;

export class operation_team extends Model<operation_teamAttributes, operation_teamCreationAttributes> implements operation_teamAttributes {
  id!: string;
  scheduled_operation_id!: string;
  doctor_id?: string;
  role!: string;
  assigned_at?: Date;

  // operation_team belongsTo doctors via doctor_id
  doctor!: doctors;
  getDoctor!: Sequelize.BelongsToGetAssociationMixin<doctors>;
  setDoctor!: Sequelize.BelongsToSetAssociationMixin<doctors, doctorsId>;
  createDoctor!: Sequelize.BelongsToCreateAssociationMixin<doctors>;
  // operation_team belongsTo scheduled_operations via scheduled_operation_id
  scheduled_operation!: scheduled_operations;
  getScheduled_operation!: Sequelize.BelongsToGetAssociationMixin<scheduled_operations>;
  setScheduled_operation!: Sequelize.BelongsToSetAssociationMixin<scheduled_operations, scheduled_operationsId>;
  createScheduled_operation!: Sequelize.BelongsToCreateAssociationMixin<scheduled_operations>;

  static initModel(sequelize: Sequelize.Sequelize): typeof operation_team {
    return sequelize.define('operation_team', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    scheduled_operation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'scheduled_operations',
        key: 'id'
      }
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'operation_team',
    schema: 'medical',
    timestamps: false,
    indexes: [
      {
        name: "operation_team_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof operation_team;
  }
}
