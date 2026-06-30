import { Transaction, Op } from 'sequelize';
import { sequelize, models } from '../../../../database';
import { BillingSummaryResponse } from '../../dtos/medical-dtos/case-product.dto';

function txOpt(t?: Transaction): { transaction: Transaction } | Record<string, never> {
  return t !== undefined ? { transaction: t } : {};
}

export class CaseProductRepository {

  async findByCaseFile(caseFileId: string) {
    return models.case_products.findAll({
      where: { case_file_id: caseFileId },
      include: [
        {
          model: models.products,
          as: 'product',
          attributes: ['id', 'code', 'name', 'unit_of_measure', 'selling_price']
        },
        {
          model: models.warehouses,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ],
      order: [['applied_at', 'DESC']]
    });
  }

  async findById(id: string) {
    return models.case_products.findByPk(id, {
      include: [
        {
          model: models.products,
          as: 'product',
          attributes: ['id', 'code', 'name', 'unit_of_measure', 'selling_price']
        },
        {
          model: models.warehouses,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ]
    });
  }

  async applyProduct(data: {
    case_file_id: string;
    product_id: string;
    warehouse_id: string;
    quantity: number;
    applied_by?: string;
    notes?: string;
  }) {
    return sequelize.transaction(async (t) => {
      // Lock the stock row to prevent race conditions
      const stock = await models.warehouse_stock.findOne({
        where: { warehouse_id: data.warehouse_id, product_id: data.product_id },
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!stock) {
        throw new Error('Product not found in the specified warehouse');
      }

      const available = stock.available_quantity ?? stock.quantity - (stock.reserved_quantity ?? 0);
      if (available < data.quantity) {
        throw new Error(`Insufficient stock. Available: ${available}, requested: ${data.quantity}`);
      }

      // Fetch product to snapshot the price
      const product = await models.products.findByPk(data.product_id, txOpt(t));
      if (!product) throw new Error('Product not found');
      if (!product.is_active) throw new Error('Product is not active');

      const unitPrice = Number(product.selling_price ?? 0);
      const totalPrice = unitPrice * data.quantity;

      // Generate movement number
      const movementNumber = await this.generateMovementNumber(t);

      // Create stock movement — the existing DB trigger will deduct warehouse_stock
      const movement = await models.stock_movements.create({
        movement_number: movementNumber,
        movement_type: 'dispatch',
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
        quantity: data.quantity,
        unit_cost: unitPrice,
        reference_type: 'case_file',
        reference_id: data.case_file_id,
        notes: `Applied to case file`,
        ...(data.applied_by && { created_by: data.applied_by })
      }, txOpt(t));

      // Create the case_product charge record
      const caseProduct = await models.case_products.create({
        case_file_id: data.case_file_id,
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        quantity: data.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        stock_movement_id: movement.id,
        ...(data.applied_by && { applied_by: data.applied_by }),
        ...(data.notes && { notes: data.notes }),
        applied_at: new Date(),
        is_voided: false
      }, txOpt(t));

      // Recalculate and update total_cost on the case file
      await this.recalculateCaseTotalCost(data.case_file_id, t);

      return caseProduct;
    });
  }

  async voidProduct(id: string, voidedBy: string, voidReason: string) {
    return sequelize.transaction(async (t) => {
      const record = await models.case_products.findByPk(id, txOpt(t));
      if (!record) throw new Error('Case product charge not found');
      if (record.is_voided) throw new Error('This charge is already voided');

      // Reversal movement to restore stock
      const movementNumber = await this.generateMovementNumber(t);
      await models.stock_movements.create({
        movement_number: movementNumber,
        movement_type: 'return',
        warehouse_id: record.warehouse_id,
        product_id: record.product_id,
        quantity: record.quantity,
        unit_cost: record.unit_price,
        reference_type: 'case_product_void',
        reference_id: record.id,
        notes: `Void: ${voidReason}`,
        created_by: voidedBy
      }, txOpt(t));

      await record.update({
        is_voided: true,
        voided_by: voidedBy,
        voided_at: new Date(),
        void_reason: voidReason
      }, txOpt(t));

      await this.recalculateCaseTotalCost(record.case_file_id, t);

      return record;
    });
  }

  async getBillingSummary(caseFileId: string): Promise<BillingSummaryResponse> {
    const caseFile = await models.case_files.findByPk(caseFileId, {
      include: [
        { model: models.patients, as: 'patient', attributes: ['first_name', 'last_name'] },
        {
          model: models.case_package_assignments,
          as: 'case_package_assignments',
          include: [{ model: models.packages, as: 'package', attributes: ['name'] }]
        },
        {
          model: models.case_rooms,
          as: 'case_rooms',
          include: [{ model: models.rooms, as: 'room', attributes: ['room_number', 'room_type'] }]
        },
        { model: models.case_services, as: 'case_services',
          include: [{ model: models.services, as: 'service', attributes: ['name'] }]
        },
        {
          model: models.case_products,
          as: 'case_products',
          where: { is_voided: false },
          required: false,
          include: [{ model: models.products, as: 'product', attributes: ['name', 'unit_of_measure'] }]
        }
      ]
    });

    if (!caseFile) throw new Error('Case file not found');

    const patientName = caseFile.patient
      ? `${caseFile.patient.first_name} ${caseFile.patient.last_name}`.trim()
      : 'Unknown';

    // Packages
    const packageItems = (caseFile.case_package_assignments ?? []).map((pa) => ({
      id: pa.id,
      description: pa.package?.name ?? 'Package',
      quantity: 1,
      unit_price: Number(pa.price_applied),
      total_price: Number(pa.price_applied)
    }));
    const packagesSubtotal = packageItems.reduce((s, i) => s + i.total_price, 0);

    // Rooms — calculate by days of stay
    const now = new Date();
    const roomItems = (caseFile.case_rooms ?? []).map((cr) => {
      const checkOut = cr.check_out ?? now;
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(1, Math.ceil((checkOut.getTime() - cr.check_in.getTime()) / msPerDay));
      const dailyRate = Number(cr.daily_rate ?? 0);
      return {
        id: cr.id,
        description: cr.room ? `Room ${cr.room.room_number} (${cr.room.room_type})` : 'Room',
        quantity: days,
        unit_price: dailyRate,
        total_price: dailyRate * days
      };
    });
    const roomsSubtotal = roomItems.reduce((s, i) => s + i.total_price, 0);

    // Services
    const serviceItems = (caseFile.case_services ?? []).map((cs) => ({
      id: cs.id,
      description: cs.service?.name ?? 'Service',
      quantity: cs.quantity ?? 1,
      unit_price: Number(cs.unit_price),
      total_price: Number(cs.total_price)
    }));
    const servicesSubtotal = serviceItems.reduce((s, i) => s + i.total_price, 0);

    // Products (only non-voided, already filtered by Sequelize where clause)
    const productItems = (caseFile.case_products ?? []).map((cp) => ({
      id: cp.id,
      description: cp.product
        ? `${cp.product.name} (${cp.product.unit_of_measure})`
        : 'Product',
      quantity: cp.quantity,
      unit_price: Number(cp.unit_price),
      total_price: Number(cp.total_price)
    }));
    const productsSubtotal = productItems.reduce((s, i) => s + i.total_price, 0);

    const total = packagesSubtotal + roomsSubtotal + servicesSubtotal + productsSubtotal;

    return {
      case_id: caseFile.id,
      case_number: caseFile.case_number,
      patient_name: patientName,
      breakdown: {
        packages: { items: packageItems, subtotal: packagesSubtotal },
        rooms: { items: roomItems, subtotal: roomsSubtotal },
        services: { items: serviceItems, subtotal: servicesSubtotal },
        products: { items: productItems, subtotal: productsSubtotal }
      },
      total
    };
  }

  private async recalculateCaseTotalCost(caseFileId: string, t: Transaction) {
    const [result]: any[] = await sequelize.query(`
      SELECT
        COALESCE((SELECT SUM(price_applied) FROM medical.case_package_assignments WHERE case_file_id = :id), 0)
        + COALESCE((
            SELECT SUM(
              EXTRACT(DAY FROM (COALESCE(check_out, NOW()) - check_in)) * daily_rate
            )
            FROM medical.case_rooms WHERE case_file_id = :id
          ), 0)
        + COALESCE((SELECT SUM(total_price) FROM medical.case_services WHERE case_file_id = :id), 0)
        + COALESCE((SELECT SUM(total_price) FROM medical.case_products WHERE case_file_id = :id AND is_voided = false), 0)
        AS total_cost
    `, { replacements: { id: caseFileId }, transaction: t, type: 'SELECT' as any });

    await models.case_files.update(
      { total_cost: Number(result?.total_cost ?? 0) },
      { where: { id: caseFileId }, transaction: t }
    );
  }

  private async generateMovementNumber(t: Transaction): Promise<string> {
    const today = new Date();
    const prefix = `MED-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const last = await models.stock_movements.findOne({
      where: { movement_number: { [Op.like]: `${prefix}%` } },
      order: [['movement_number', 'DESC']],
      transaction: t
    });

    let seq = 1;
    if (last) {
      const parts = last.movement_number.split('-');
      seq = parseInt(parts[parts.length - 1] ?? '0') + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }
}
