import { PackageService } from "../../services/medical-services/package-service";
import { Request, Response } from "express";
import { PackageListFilters } from "../../dtos/medical-dtos/package-dto";

export class PackageController {

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            // Parse query parameters with defaults
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
            const search = req.query.search as string | undefined;

            // Parse filters
            const filters: PackageListFilters = {};

            // Boolean filter with proper parsing
            if (req.query.is_active !== undefined) {
                filters.is_active = req.query.is_active === 'true' || req.query.is_active === '1';
            }

            // String filters
            if (req.query.doctor_type) {
                filters.doctor_type = req.query.doctor_type as "internal" | "external";
            }

            if (req.query.code) {
                filters.code = req.query.code as string;
            }

            if (req.query.service_id) {
                filters.service_id = req.query.service_id as string;
            }

            // Numeric filter with parsing
            if (req.query.year) {
                filters.year = parseInt(req.query.year as string, 10);
            }

            // Search parameter (if you want to add it to filters interface)
            if (search) {
                // If you want to use search, you'll need to update PackageListFilters interface
                // For now, we can use it as code search
                filters.code = search;
            }

            // Call service with proper parameters
            const packages = await PackageService.getAll(filters, page, limit);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Packages retrieved successfully',
                data: packages
            });
        } catch (error) {
            console.error('Error retrieving packages:', error);
            res.status(500).json({
                success: false,
                code: 500,
                error: 'Internal server error',
                message: 'Failed to retrieve packages'
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new Error('Package ID is required');
            }

            const results = await PackageService.getPackageById(id);

            res.status(200).json({
                success: true,
                code: 200,
                message: 'Package retrieved successfully',
                data: results
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error', code: 500, success: false });
        }
    }

}
