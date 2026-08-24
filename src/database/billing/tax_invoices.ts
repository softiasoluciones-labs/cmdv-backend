import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { invoices, invoicesId } from './invoices';

export type FelStatus = 'pending' | 'issued' | 'cancelled';

export interface tax_invoicesAttributes {
  id: string;
  invoice_id: string;
  // NIT del cliente o "CF" (Consumidor Final) cuando no se proporciona NIT
  nit: string;
  tax_name: string;
  tax_address?: string;
  // FACT = Factura, FCAM = Factura Cambiaria
  document_type: string;
  fel_status: FelStatus;
  // Campos completados por el certificador SAT (INFILE, G4S, Digifact, etc.)
  // Se quedan en null hasta que se implemente la integración FEL
  fel_uuid?: string;
  fel_series?: string;
  fel_number?: string;
  fel_issued_at?: Date;
  fel_issuer?: string;
  fel_raw_response?: object;
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at?: Date;
}

export type tax_invoicesPk = 'id';
export type tax_invoicesId = tax_invoices[tax_invoicesPk];
export type tax_invoicesOptionalAttributes = 'id' | 'tax_address' | 'document_type' | 'fel_status' | 'fel_uuid' | 'fel_series' | 'fel_number' | 'fel_issued_at' | 'fel_issuer' | 'fel_raw_response' | 'cancelled_at' | 'cancellation_reason' | 'created_at';
export type tax_invoicesCreationAttributes = Optional<tax_invoicesAttributes, tax_invoicesOptionalAttributes>;

export class tax_invoices extends Model<tax_invoicesAttributes, tax_invoicesCreationAttributes> implements tax_invoicesAttributes {
  id!: string;
  invoice_id!: string;
  nit!: string;
  tax_name!: string;
  tax_address?: string;
  document_type!: string;
  fel_status!: FelStatus;
  fel_uuid?: string;
  fel_series?: string;
  fel_number?: string;
  fel_issued_at?: Date;
  fel_issuer?: string;
  fel_raw_response?: object;
  cancelled_at?: Date;
  cancellation_reason?: string;
  created_at?: Date;

  invoice!: invoices;
  getInvoice!: Sequelize.BelongsToGetAssociationMixin<invoices>;
  setInvoice!: Sequelize.BelongsToSetAssociationMixin<invoices, invoicesId>;

  static initModel(sequelize: Sequelize.Sequelize): typeof tax_invoices {
    return sequelize.define('tax_invoices', {
      id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      invoice_id: { type: DataTypes.UUID, allowNull: false, unique: 'tax_invoices_invoice_key', references: { model: 'invoices', key: 'id' } },
      nit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'CF' },
      tax_name: { type: DataTypes.STRING(200), allowNull: false },
      tax_address: { type: DataTypes.TEXT, allowNull: true },
      document_type: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'FACT' },
      fel_status: {
        type: DataTypes.ENUM('pending', 'issued', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      fel_uuid: { type: DataTypes.UUID, allowNull: true },
      fel_series: { type: DataTypes.STRING(20), allowNull: true },
      fel_number: { type: DataTypes.STRING(20), allowNull: true },
      fel_issued_at: { type: DataTypes.DATE, allowNull: true },
      fel_issuer: { type: DataTypes.STRING(100), allowNull: true },
      fel_raw_response: { type: DataTypes.JSONB, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
      cancellation_reason: { type: DataTypes.TEXT, allowNull: true }
    }, {
      tableName: 'tax_invoices',
      schema: 'billing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        { name: 'tax_invoices_pkey', unique: true, fields: [{ name: 'id' }] },
        { name: 'tax_invoices_invoice_key', unique: true, fields: [{ name: 'invoice_id' }] }
      ]
    }) as typeof tax_invoices;
  }
}
