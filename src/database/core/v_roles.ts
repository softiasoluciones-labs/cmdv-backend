import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface v_rolesAttributes {
    rol: string;
    display_name: string;
    description: string;
}

export type v_rolesCreationAttributes = Optional<v_rolesAttributes, never>;

export class v_roles extends Model<v_rolesAttributes, v_rolesCreationAttributes>
    implements v_rolesAttributes {
    public rol!: string;
    public display_name!: string;
    public description!: string;

    static initModel(sequelize: Sequelize): typeof v_roles {
        return v_roles.init(
            {
                rol: {
                    type: DataTypes.STRING,
                    primaryKey: true, // necesario aunque sea vista, Sequelize requiere PK
                },
                display_name: {
                    type: DataTypes.STRING,
                },
                description: {
                    type: DataTypes.TEXT,
                },
            },
            {
                sequelize,
                tableName: "v_roles",
                schema: "core",
                timestamps: false,
                freezeTableName: true,
            }
        );
    }
}