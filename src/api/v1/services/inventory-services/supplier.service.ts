import { SupplierRepository } from '../../repositories/inventory-repositories/supplier.repository';
import { SupplierResponse, CreateSupplierRequest, UpdateSupplierRequest } from '../../dtos/inventory-dtos/supplier-dto';
import { suppliers } from '../../../../database/inventory/suppliers';

export class SupplierService {
    private static toSupplierResponse(supplier: suppliers): SupplierResponse {
        return {
            id: supplier.id,
            code: supplier.code,
            name: supplier.business_name,
            ...(supplier.contact_name !== undefined && { contactName: supplier.contact_name }),
            ...(supplier.email !== undefined && { email: supplier.email }),
            ...(supplier.phone !== undefined && { phone: supplier.phone }),
            ...(supplier.address !== undefined && { address: supplier.address }),
            ...(supplier.city !== undefined && { city: supplier.city }),
            ...(supplier.state !== undefined && { state: supplier.state }),
            ...(supplier.tax_id !== undefined && { taxId: supplier.tax_id }),
            ...(supplier.payment_terms !== undefined && { paymentTerms: supplier.payment_terms }),
            ...(supplier.credit_limit !== undefined && { creditLimit: parseFloat(supplier.credit_limit.toString()) }),
            ...(supplier.is_active !== undefined && { isActive: supplier.is_active }),
            ...(supplier.created_at !== undefined && { createdAt: supplier.created_at })
        };
    }

    static async getAllSuppliers(activeOnly: boolean = true): Promise<SupplierResponse[]> {
        const suppliers = await SupplierRepository.findAll(activeOnly);
        return suppliers.map(s => this.toSupplierResponse(s));
    }

    static async getSupplierById(id: string): Promise<SupplierResponse> {
        const supplier = await SupplierRepository.findById(id);
        if (!supplier) throw new Error('Supplier not found');
        return this.toSupplierResponse(supplier);
    }

    static async createSupplier(data: CreateSupplierRequest): Promise<SupplierResponse> {
        const existing = await SupplierRepository.findByCode(data.code);
        if (existing) throw new Error('Supplier code already exists');

        const supplier = await SupplierRepository.create({
            code: data.code,
            business_name: data.name,
            payment_terms: data.paymentTerms,
            ...(data.contactName !== undefined && { contact_name: data.contactName }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.city !== undefined && { city: data.city }),
            ...(data.country !== undefined && { country: data.country }),
            ...(data.taxId !== undefined && { tax_id: data.taxId }),
            ...(data.creditLimit !== undefined && { credit_limit: data.creditLimit })
        });
        return this.toSupplierResponse(supplier);
    }

    static async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<SupplierResponse> {
        const supplier = await SupplierRepository.findById(id);
        if (!supplier) throw new Error('Supplier not found');

        const updateData: any = {};
        if (data.code) updateData.code = data.code;
        if (data.name) updateData.business_name = data.name;
        if (data.contactName !== undefined) updateData.contact_name = data.contactName;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.country !== undefined) updateData.country = data.country;
        if (data.taxId !== undefined) updateData.tax_id = data.taxId;
        if (data.paymentTerms !== undefined) updateData.payment_terms = data.paymentTerms;
        if (data.creditLimit !== undefined) updateData.credit_limit = data.creditLimit;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        await SupplierRepository.update(id, updateData);
        const updated = await SupplierRepository.findById(id);
        return this.toSupplierResponse(updated!);
    }

    static async deleteSupplier(id: string): Promise<void> {
        const supplier = await SupplierRepository.findById(id);
        if (!supplier) throw new Error('Supplier not found');
        await SupplierRepository.delete(id);
    }
}
