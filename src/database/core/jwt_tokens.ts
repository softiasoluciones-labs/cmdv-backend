import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from '../core/users';

export interface jwt_tokensAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  refresh_token_hash?: string;
  expires_at: Date;
  refresh_expires_at?: Date;
  is_revoked?: boolean;
  revoked_at?: Date;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export type jwt_tokensPk = "id";
export type jwt_tokensId = jwt_tokens[jwt_tokensPk];
export type jwt_tokensOptionalAttributes = "id" | "refresh_token_hash" | "refresh_expires_at" | "is_revoked" | "revoked_at" | "ip_address" | "user_agent" | "created_at";
export type jwt_tokensCreationAttributes = Optional<jwt_tokensAttributes, jwt_tokensOptionalAttributes>;

export class jwt_tokens extends Model<jwt_tokensAttributes, jwt_tokensCreationAttributes> implements jwt_tokensAttributes {
  id!: string;
  user_id!: string;
  token_hash!: string;
  refresh_token_hash?: string;
  expires_at!: Date;
  refresh_expires_at?: Date;
  is_revoked?: boolean;
  revoked_at?: Date;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;

  // jwt_tokens belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof jwt_tokens {
    return sequelize.define('jwt_tokens', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      token_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      refresh_token_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      refresh_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.INET,
        allowNull: true
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'jwt_tokens',
      schema: 'core',
      timestamps: true,
      indexes: [
        {
          name: "idx_jwt_tokens_expires",
          fields: [
            { name: "expires_at" },
          ]
        },
        {
          name: "idx_jwt_tokens_user",
          fields: [
            { name: "user_id" },
          ]
        },
        {
          name: "jwt_tokens_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    }) as typeof jwt_tokens;
  }
}
