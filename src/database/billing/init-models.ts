import type { Sequelize } from 'sequelize';
import { discount_catalog as _discount_catalog } from './discount_catalog';
import type { discount_catalogAttributes, discount_catalogCreationAttributes } from './discount_catalog';
import { cash_sessions as _cash_sessions } from './cash_sessions';
import type { cash_sessionsAttributes, cash_sessionsCreationAttributes } from './cash_sessions';
import { invoices as _invoices } from './invoices';
import type { invoicesAttributes, invoicesCreationAttributes } from './invoices';
import { invoice_items as _invoice_items } from './invoice_items';
import type { invoice_itemsAttributes, invoice_itemsCreationAttributes } from './invoice_items';
import { invoice_discounts as _invoice_discounts } from './invoice_discounts';
import type { invoice_discountsAttributes, invoice_discountsCreationAttributes } from './invoice_discounts';
import { payments as _payments } from './payments';
import type { paymentsAttributes, paymentsCreationAttributes } from './payments';
import { tax_invoices as _tax_invoices } from './tax_invoices';
import type { tax_invoicesAttributes, tax_invoicesCreationAttributes } from './tax_invoices';
import { insurance_coverages as _insurance_coverages } from './insurance_coverages';
import type { insurance_coveragesAttributes, insurance_coveragesCreationAttributes } from './insurance_coverages';

// Cross-schema imports
import { users } from '../core/users';
import { case_files } from '../medical/case_files';
import { patients } from '../medical/patients';

export {
  _discount_catalog as discount_catalog,
  _cash_sessions as cash_sessions,
  _invoices as invoices,
  _invoice_items as invoice_items,
  _invoice_discounts as invoice_discounts,
  _payments as payments,
  _tax_invoices as tax_invoices,
  _insurance_coverages as insurance_coverages,
};

export type {
  discount_catalogAttributes,
  discount_catalogCreationAttributes,
  cash_sessionsAttributes,
  cash_sessionsCreationAttributes,
  invoicesAttributes,
  invoicesCreationAttributes,
  invoice_itemsAttributes,
  invoice_itemsCreationAttributes,
  invoice_discountsAttributes,
  invoice_discountsCreationAttributes,
  paymentsAttributes,
  paymentsCreationAttributes,
  tax_invoicesAttributes,
  tax_invoicesCreationAttributes,
  insurance_coveragesAttributes,
  insurance_coveragesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  // External models (initialized in their own schema modules — just reference here)
  const usersModel = users.initModel(sequelize);
  const caseFilesModel = case_files.initModel(sequelize);
  const patientsModel = patients.initModel(sequelize);

  // Billing models
  const discount_catalog = _discount_catalog.initModel(sequelize);
  const cash_sessions = _cash_sessions.initModel(sequelize);
  const invoices = _invoices.initModel(sequelize);
  const invoice_items = _invoice_items.initModel(sequelize);
  const invoice_discounts = _invoice_discounts.initModel(sequelize);
  const payments = _payments.initModel(sequelize);
  const tax_invoices = _tax_invoices.initModel(sequelize);
  const insurance_coverages = _insurance_coverages.initModel(sequelize);

  // invoices associations
  invoices.belongsTo(caseFilesModel, { as: 'case_file', foreignKey: 'case_file_id' });
  caseFilesModel.hasOne(invoices, { as: 'invoice', foreignKey: 'case_file_id' });
  invoices.belongsTo(patientsModel, { as: 'patient', foreignKey: 'patient_id' });
  patientsModel.hasMany(invoices, { as: 'invoices', foreignKey: 'patient_id' });
  invoices.belongsTo(usersModel, { as: 'created_by_user', foreignKey: 'created_by' });
  usersModel.hasMany(invoices, { as: 'invoices', foreignKey: 'created_by' });

  // invoice_items associations
  invoice_items.belongsTo(invoices, { as: 'invoice', foreignKey: 'invoice_id' });
  invoices.hasMany(invoice_items, { as: 'invoice_items', foreignKey: 'invoice_id' });

  // invoice_discounts associations
  invoice_discounts.belongsTo(invoices, { as: 'invoice', foreignKey: 'invoice_id' });
  invoices.hasMany(invoice_discounts, { as: 'invoice_discounts', foreignKey: 'invoice_id' });
  invoice_discounts.belongsTo(discount_catalog, { as: 'discount_catalog_item', foreignKey: 'discount_id' });
  discount_catalog.hasMany(invoice_discounts, { as: 'invoice_discounts', foreignKey: 'discount_id' });
  invoice_discounts.belongsTo(usersModel, { as: 'applied_by_user', foreignKey: 'applied_by' });
  invoice_discounts.belongsTo(usersModel, { as: 'approved_by_user', foreignKey: 'approved_by' });

  // cash_sessions associations
  cash_sessions.belongsTo(usersModel, { as: 'cashier', foreignKey: 'cashier_id' });
  usersModel.hasMany(cash_sessions, { as: 'cash_sessions', foreignKey: 'cashier_id' });
  cash_sessions.belongsTo(usersModel, { as: 'closed_by_user', foreignKey: 'closed_by' });

  // payments associations
  payments.belongsTo(invoices, { as: 'invoice', foreignKey: 'invoice_id' });
  invoices.hasMany(payments, { as: 'payments', foreignKey: 'invoice_id' });
  payments.belongsTo(cash_sessions, { as: 'cash_session', foreignKey: 'cash_session_id' });
  cash_sessions.hasMany(payments, { as: 'payments', foreignKey: 'cash_session_id' });
  payments.belongsTo(usersModel, { as: 'received_by_user', foreignKey: 'received_by' });
  payments.belongsTo(usersModel, { as: 'voided_by_user', foreignKey: 'voided_by' });

  // tax_invoices associations
  tax_invoices.belongsTo(invoices, { as: 'invoice', foreignKey: 'invoice_id' });
  invoices.hasOne(tax_invoices, { as: 'tax_invoice', foreignKey: 'invoice_id' });

  // insurance_coverages associations
  insurance_coverages.belongsTo(invoices, { as: 'invoice', foreignKey: 'invoice_id' });
  invoices.hasMany(insurance_coverages, { as: 'insurance_coverages', foreignKey: 'invoice_id' });

  return {
    discount_catalog,
    cash_sessions,
    invoices,
    invoice_items,
    invoice_discounts,
    payments,
    tax_invoices,
    insurance_coverages,
  };
}
