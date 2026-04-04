import type { Sequelize } from "sequelize";
import { audit_logs as _audit_logs } from "./audit_logs";
import type { audit_logsAttributes, audit_logsCreationAttributes } from "./audit_logs";
import { jwt_tokens as _jwt_tokens } from "./jwt_tokens";
import type { jwt_tokensAttributes, jwt_tokensCreationAttributes } from "./jwt_tokens";
import { permissions as _permissions } from "./permissions";
import type { permissionsAttributes, permissionsCreationAttributes } from "./permissions";
import { role_permissions as _role_permissions } from "./role_permissions";
import type { role_permissionsAttributes, role_permissionsCreationAttributes } from "./role_permissions";
import { user_permissions as _user_permissions } from "./user_permissions";
import type { user_permissionsAttributes, user_permissionsCreationAttributes } from "./user_permissions";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";

export {
  _audit_logs as audit_logs,
  _jwt_tokens as jwt_tokens,
  _permissions as permissions,
  _role_permissions as role_permissions,
  _user_permissions as user_permissions,
  _users as users,
};

export type {
  audit_logsAttributes,
  audit_logsCreationAttributes,
  jwt_tokensAttributes,
  jwt_tokensCreationAttributes,
  permissionsAttributes,
  permissionsCreationAttributes,
  role_permissionsAttributes,
  role_permissionsCreationAttributes,
  user_permissionsAttributes,
  user_permissionsCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const audit_logs = _audit_logs.initModel(sequelize);
  const jwt_tokens = _jwt_tokens.initModel(sequelize);
  const permissions = _permissions.initModel(sequelize);
  const role_permissions = _role_permissions.initModel(sequelize);
  const user_permissions = _user_permissions.initModel(sequelize);
  const users = _users.initModel(sequelize);

  role_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id"});
  permissions.hasMany(role_permissions, { as: "role_permissions", foreignKey: "permission_id"});
  user_permissions.belongsTo(permissions, { as: "permission", foreignKey: "permission_id"});
  permissions.hasMany(user_permissions, { as: "user_permissions", foreignKey: "permission_id"});
  audit_logs.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(audit_logs, { as: "audit_logs", foreignKey: "user_id"});
  jwt_tokens.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(jwt_tokens, { as: "jwt_tokens", foreignKey: "user_id"});
  role_permissions.belongsTo(users, { as: "granted_by_user", foreignKey: "granted_by"});
  users.hasMany(role_permissions, { as: "role_permissions", foreignKey: "granted_by"});
  user_permissions.belongsTo(users, { as: "granted_by_user", foreignKey: "granted_by"});
  users.hasMany(user_permissions, { as: "user_permissions", foreignKey: "granted_by"});
  user_permissions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(user_permissions, { as: "user_user_permissions", foreignKey: "user_id"});

  return {
    audit_logs: audit_logs,
    jwt_tokens: jwt_tokens,
    permissions: permissions,
    role_permissions: role_permissions,
    user_permissions: user_permissions,
    users: users,
  };
}
