import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { invoices, invoicesId } from './invoices';

export type InvoiceItemType = 'package' | 'room' | 'service' | 'product';

export interface invoice_itemsAttributes {
  id: string;
  invoice_id: string;
  item_type: InvoiceItemType;
  reference_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  // NOTE: All items are IVA-exempt by default (Guatemala medical services, Decreto 27-92).
  // Set to false for non-medical taxable items when applicable.
  is_iva_exempt: boolean;
  sort_order: number;
}

export type invoice_itemsPk = 'id';
export type invoice_itemsId = invoice_items[invoice_itemsPk];
export type invoice_itemsOptionalAttributes = 'id' | 'reference_id' | 'discount_amount' | 'is_iva_exempt' | 'sort_order';
export type invoice_itemsCreationAttributes = Optional<invoice_itemsAttributes, invoice_itemsOptionalAttributes>;

export class invoice_items extends Model<invoice_itemsAttributes, invoice_itemsCreationAttributes> implements invoice_itemsAttributes {
  id!: string;
  invoice_id!: string;
  item_type!: InvoiceItemType;
  reference_id?: string;
  description!: string;
  quantity!: number;
  unit_price!: number;
  subtotal!: number;
  discount_amount!: number;
  total!: number;
  is_iva_exempt!: boolean;
  sort_order!: number;

  invoice!: invoices;
  getInvoice!: Sequelize.BelongsToGetAssociationMixin<invoices>;
  setInvoice!: Sequelize.BelongsToSetAssociationMixin<invoices, invoicesId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof invoice_items {
    return sequelize.define('invoice_items', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      invoice_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'invoices', key: 'id' } },
      item_type: {
        type: DataTypes.ENUM('package', 'room', 'service', 'product'),
        allowNull: false
      },
      reference_id: { type: DataTypes.UUID, allowNull: true },
      description: { type: DataTypes.STRING(300), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      is_iva_exempt: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    }, {
      tableName: 'invoice_items',
      schema: 'billing',
      timestamps: false,
      indexes: [
        { name: 'invoice_items_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'idx_invoice_items_invoice', fields: [{ name: 'invoice_id' }] }
      ]
    }) as typeof invoice_items;
  }
}
