import { PackageRepository } from '../../repositories/medical-repositories/package-repository';
import { packages } from '../../../../database/medical/packages';
import { PackageResponse, PackageListResponse, PackageDetailDto } from '../../dtos/medical-dtos/package-dto';
import { PackageListFilters } from '../../dtos/medical-dtos/package-dto';
import { CreatePackageDto, CopyPackageDto, UpdatePackageDto } from '../../dtos/medical-dtos/package-dto';
import { package_details } from '../../../../database/medical/package_details';

export class PackageService {
    private static toPackageResponse(type: packages): PackageResponse {
        return {
            id: type.id,
            code: type.code,
            name: type.name,
            description: type.description ?? '',
            doctor_type: type.doctor_type ?? 'internal',
            internal_doctor_price: type.internal_doctor_price ?? 0,
            external_doctor_price: type.external_doctor_price ?? 0,
            validity_days: type.validity_days ?? 0,
            is_active: type.is_active ?? true,
            created_at: type.created_at!,
            updated_at: type.updated_at!,
            package_details: type.package_details
        };
    }

    static async getAll(filters: PackageListFilters, page: number = 1, limit: number = 50) {
        const result = await PackageRepository.findAll(page, limit, filters);

        return {
            packages: result.packages.map(PackageService.toPackageResponse),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    static async getPackageById(id: string) {
        return await PackageRepository.getPackageById(id);
    }
    static async getPackageDetails(id: string) {
        return await PackageRepository.getPackageDetails(id);
    }

    static async removeItemPackageDetail (id: string) { 
        return await PackageRepository.removeItemPackageDetail(id); 
    }

    static async addItemToPackage(data: PackageDetailDto) {
        return await PackageRepository.createPackageDetail(data); 
    } 

    static async create(data: CreatePackageDto, userId: string) {
        return await PackageRepository.create(data, userId);
    }

    static async deactivate(packageId: string, userId: string) {
        return await PackageRepository.deactivate(packageId, userId);
    }

    static async copyPackage(sourcePackageId: string, data: CopyPackageDto, userId: string) {
        return await PackageRepository.copyPackage(sourcePackageId, data, userId);
    }

    static async update(packageId: string, data: UpdatePackageDto, userId: string) {
        return await PackageRepository.update(packageId, data, userId);
    }
}
