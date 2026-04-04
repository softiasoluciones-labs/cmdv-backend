import { sequelize } from '../config/sequelize';
import { initModels as initCoreModels } from './core/init-models';
import { initModels as initInventoryModels } from './inventory/init-models';
import { initModels as initMedicalModels } from './medical/init-models';
import { initModels as initConfigModels } from './config/init-models';

// Initialize all models
const models = {
    ...initCoreModels(sequelize),
    ...initInventoryModels(sequelize),
    ...initMedicalModels(sequelize),
    ...initConfigModels(sequelize),
};

export { sequelize, models };

// Export individual model groups for easier access
export * as coreModels from './core/init-models';
export * as inventoryModels from './inventory/init-models';
export * as medicalModels from './medical/init-models';
export * as configModels from './config/init-models';
