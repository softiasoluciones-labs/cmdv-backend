import type { Sequelize } from "sequelize";
import { product_categories as _product_categories } from "./product_categories";
import type { product_categoriesAttributes, product_categoriesCreationAttributes } from "./product_categories";
import { products as _products } from "./products";
import type { productsAttributes, productsCreationAttributes } from "./products";
import { purchase_order_details as _purchase_order_details } from "./purchase_order_details";
import type { purchase_order_detailsAttributes, purchase_order_detailsCreationAttributes } from "./purchase_order_details";
import { purchase_orders as _purchase_orders } from "./purchase_orders";
import type { purchase_ordersAttributes, purchase_ordersCreationAttributes } from "./purchase_orders";
import { stock_movements as _stock_movements } from "./stock_movements";
import type { stock_movementsAttributes, stock_movementsCreationAttributes } from "./stock_movements";
import { suppliers as _suppliers } from "./suppliers";
import type { suppliersAttributes, suppliersCreationAttributes } from "./suppliers";
import { warehouse_stock as _warehouse_stock } from "./warehouse_stock";
import type { warehouse_stockAttributes, warehouse_stockCreationAttributes } from "./warehouse_stock";
import { warehouses as _warehouses } from "./warehouses";
import type { warehousesAttributes, warehousesCreationAttributes } from "./warehouses";
import { users as _users } from "../core/users";
import type { usersAttributes, usersCreationAttributes } from "../core/users";

export {
  _product_categories as product_categories,
  _products as products,
  _purchase_order_details as purchase_order_details,
  _purchase_orders as purchase_orders,
  _stock_movements as stock_movements,
  _suppliers as suppliers,
  _warehouse_stock as warehouse_stock,
  _warehouses as warehouses,
};

export type {
  product_categoriesAttributes,
  product_categoriesCreationAttributes,
  productsAttributes,
  productsCreationAttributes,
  purchase_order_detailsAttributes,
  purchase_order_detailsCreationAttributes,
  purchase_ordersAttributes,
  purchase_ordersCreationAttributes,
  stock_movementsAttributes,
  stock_movementsCreationAttributes,
  suppliersAttributes,
  suppliersCreationAttributes,
  warehouse_stockAttributes,
  warehouse_stockCreationAttributes,
  warehousesAttributes,
  warehousesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const product_categories = _product_categories.initModel(sequelize);
  const products = _products.initModel(sequelize);
  const purchase_order_details = _purchase_order_details.initModel(sequelize);
  const purchase_orders = _purchase_orders.initModel(sequelize);
  const stock_movements = _stock_movements.initModel(sequelize);
  const suppliers = _suppliers.initModel(sequelize);
  const warehouse_stock = _warehouse_stock.initModel(sequelize);
  const warehouses = _warehouses.initModel(sequelize);
  const users = _users.initModel(sequelize);

  product_categories.belongsTo(product_categories, { as: "parent_category", foreignKey: "parent_category_id" });
  product_categories.hasMany(product_categories, { as: "product_categories", foreignKey: "parent_category_id" });
  products.belongsTo(product_categories, { as: "category", foreignKey: "category_id" });
  product_categories.hasMany(products, { as: "products", foreignKey: "category_id" });
  purchase_order_details.belongsTo(products, { as: "product", foreignKey: "product_id" });
  products.hasMany(purchase_order_details, { as: "purchase_order_details", foreignKey: "product_id" });
  stock_movements.belongsTo(products, { as: "product", foreignKey: "product_id" });
  products.hasMany(stock_movements, { as: "stock_movements", foreignKey: "product_id" });
  warehouse_stock.belongsTo(products, { as: "product", foreignKey: "product_id" });
  products.hasMany(warehouse_stock, { as: "warehouse_stocks", foreignKey: "product_id" });
  purchase_order_details.belongsTo(purchase_orders, { as: "purchase_order", foreignKey: "purchase_order_id" });
  purchase_orders.hasMany(purchase_order_details, { as: "purchase_order_details", foreignKey: "purchase_order_id" });
  purchase_orders.belongsTo(suppliers, { as: "supplier", foreignKey: "supplier_id" });
  suppliers.hasMany(purchase_orders, { as: "purchase_orders", foreignKey: "supplier_id" });
  purchase_orders.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by" });
  users.hasMany(purchase_orders, { as: "purchase_orders", foreignKey: "approved_by" });
  purchase_orders.belongsTo(users, { as: "created_by_user", foreignKey: "created_by" });
  users.hasMany(purchase_orders, { as: "created_by_purchase_orders", foreignKey: "created_by" });
  stock_movements.belongsTo(users, { as: "created_by_user", foreignKey: "created_by" });
  users.hasMany(stock_movements, { as: "stock_movements", foreignKey: "created_by" });
  warehouses.belongsTo(users, { as: "manager", foreignKey: "manager_id" });
  users.hasMany(warehouses, { as: "warehouses", foreignKey: "manager_id" });
  purchase_orders.belongsTo(warehouses, { as: "warehouse", foreignKey: "warehouse_id" });
  warehouses.hasMany(purchase_orders, { as: "purchase_orders", foreignKey: "warehouse_id" });
  stock_movements.belongsTo(warehouses, { as: "warehouse", foreignKey: "warehouse_id" });
  warehouses.hasMany(stock_movements, { as: "stock_movements", foreignKey: "warehouse_id" });
  warehouse_stock.belongsTo(warehouses, { as: "warehouse", foreignKey: "warehouse_id" });
  warehouses.hasMany(warehouse_stock, { as: "warehouse_stocks", foreignKey: "warehouse_id" });

  return {
    product_categories: product_categories,
    products: products,
    purchase_order_details: purchase_order_details,
    purchase_orders: purchase_orders,
    stock_movements: stock_movements,
    suppliers: suppliers,
    warehouse_stock: warehouse_stock,
    warehouses: warehouses,
  };
}
