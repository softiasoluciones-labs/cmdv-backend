import type { Sequelize } from "sequelize";
import { global_parameters as _global_parameters } from "./global_parameters";
import type { global_parametersAttributes, global_parametersCreationAttributes } from "./global_parameters";
import { hospital_info as _hospital_info } from "./hospital_info";
import type { hospital_infoAttributes, hospital_infoCreationAttributes } from "./hospital_info";
import { notification_templates as _notification_templates } from "./notification_templates";
import type { notification_templatesAttributes, notification_templatesCreationAttributes } from "./notification_templates";
import { notifications as _notifications } from "./notifications";
import type { notificationsAttributes, notificationsCreationAttributes } from "./notifications";
import { security_parameters as _security_parameters } from "./security_parameters";
import type { security_parametersAttributes, security_parametersCreationAttributes } from "./security_parameters";
import { system_features as _system_features } from "./system_features";
import type { system_featuresAttributes, system_featuresCreationAttributes } from "./system_features";
import { users as _users } from "../core/users";

export {
  _global_parameters as global_parameters,
  _hospital_info as hospital_info,
  _notification_templates as notification_templates,
  _notifications as notifications,
  _security_parameters as security_parameters,
  _system_features as system_features
};

export type {
  global_parametersAttributes,
  global_parametersCreationAttributes,
  hospital_infoAttributes,
  hospital_infoCreationAttributes,
  notification_templatesAttributes,
  notification_templatesCreationAttributes,
  notificationsAttributes,
  notificationsCreationAttributes,
  security_parametersAttributes,
  security_parametersCreationAttributes,
  system_featuresAttributes,
  system_featuresCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const global_parameters = _global_parameters.initModel(sequelize);
  const hospital_info = _hospital_info.initModel(sequelize);
  const notification_templates = _notification_templates.initModel(sequelize);
  const notifications = _notifications.initModel(sequelize);
  const security_parameters = _security_parameters.initModel(sequelize);
  const system_features = _system_features.initModel(sequelize);
  const users = _users.initModel(sequelize);

  notifications.belongsTo(notification_templates, { as: "template_code_notification_template", foreignKey: "template_code" });
  notification_templates.hasMany(notifications, { as: "notifications", foreignKey: "template_code" });
  global_parameters.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by" });
  users.hasMany(global_parameters, { as: "global_parameters", foreignKey: "updated_by" });
  hospital_info.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by" });
  users.hasMany(hospital_info, { as: "hospital_infos", foreignKey: "updated_by" });
  notification_templates.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by" });
  users.hasMany(notification_templates, { as: "notification_templates", foreignKey: "updated_by" });
  notifications.belongsTo(users, { as: "recipient_user", foreignKey: "recipient_user_id" });
  users.hasMany(notifications, { as: "notifications", foreignKey: "recipient_user_id" });
  security_parameters.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by" });
  users.hasMany(security_parameters, { as: "security_parameters", foreignKey: "updated_by" });
  system_features.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by" });
  users.hasMany(system_features, { as: "system_features", foreignKey: "updated_by" });

  return {
    global_parameters: global_parameters,
    hospital_info: hospital_info,
    notification_templates: notification_templates,
    notifications: notifications,
    security_parameters: security_parameters,
    system_features: system_features,
  };
}
