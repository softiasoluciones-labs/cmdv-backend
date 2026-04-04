import { WarehouseRepository } from '../../repositories/inventory-repositories/warehouse.repository';
import { WarehouseResponse, CreateWarehouseRequest, UpdateWarehouseRequest, StockStatusResponse } from '../../dtos/inventory-dtos/warehouse-dto';
import { warehouses } from '../../../../database/inventory/warehouses';

export class WarehouseService {
    private static toWarehouseResponse(warehouse: warehouses): WarehouseResponse {
        return {
            id: warehouse.id,
            code: warehouse.code,
            name: warehouse.name,
            location: warehouse.location || undefined,
            managerId: warehouse.manager_id || '',
            managerName: (warehouse as any).manager?.full_name,
            capacityM3: warehouse.capacity_m3 ? parseFloat(warehouse.capacity_m3.toString()) : undefined,
            temperatureControlled: warehouse.temperature_controlled || false,
            isActive: warehouse.is_active || false,
            createdAt: warehouse.created_at || new Date(),
            productCount: (warehouse as any).getDataValue ? parseInt((warehouse as any).getDataValue('product_count')) : 0
        };
    }

    static async getAllWarehouses(): Promise<WarehouseResponse[]> {
        const warehouses = await WarehouseRepository.findAll();
        return warehouses.map(w => this.toWarehouseResponse(w));
    }

    static async getWarehouseById(id: string): Promise<WarehouseResponse> {
        const warehouse = await WarehouseRepository.findById(id);
        if (!warehouse) throw new Error('Warehouse not found');
        return this.toWarehouseResponse(warehouse);
    }

    static async createWarehouse(data: CreateWarehouseRequest): Promise<WarehouseResponse> {
        const existing = await WarehouseRepository.findByCode(data.code);
        if (existing) throw new Error('Warehouse code already exists');

        const warehouse = await WarehouseRepository.create({
            code: data.code,
            name: data.name,
            ...(data.location !== undefined && { location: data.location }),
            ...(data.managerId !== undefined && { manager_id: data.managerId }),
            ...(data.capacityM3 !== undefined && { capacity_m3: data.capacityM3 }),
            ...(data.temperatureControlled !== undefined && { temperature_controlled: data.temperatureControlled })
        });
        return this.toWarehouseResponse(warehouse);
    }

    static async updateWarehouse(id: string, data: UpdateWarehouseRequest): Promise<WarehouseResponse> {
        const warehouse = await WarehouseRepository.findById(id);
        if (!warehouse) throw new Error('Warehouse not found');

        const updateData: any = {};
        if (data.code) updateData.code = data.code;
        if (data.name) updateData.name = data.name;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.managerId !== undefined) updateData.manager_id = data.managerId;
        if (data.capacityM3 !== undefined) updateData.capacity_m3 = data.capacityM3;
        if (data.temperatureControlled !== undefined) updateData.temperature_controlled = data.temperatureControlled;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        await WarehouseRepository.update(id, updateData);
        const updated = await WarehouseRepository.findById(id);
        return this.toWarehouseResponse(updated!);
    }

    static async deleteWarehouse(id: string): Promise<void> {
        const warehouse = await WarehouseRepository.findById(id);
        if (!warehouse) throw new Error('Warehouse not found');
        await WarehouseRepository.delete(id);
    }

    static async getStockStatus(warehouseId?: string): Promise<StockStatusResponse[]> {
        return await WarehouseRepository.getStockStatus(warehouseId);
    }
}
