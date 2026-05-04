import { PackageService } from "../../services/medical-services/package-service";
import { Request, Response } from "express";
import { PackageListFilters } from "../../dtos/medical-dtos/package-dto";
import {
  CreatePackageDto,
  CopyPackageDto,
  UpdatePackageDto,
} from "../../dtos/medical-dtos/package-dto";

export class PackageController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters with defaults
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;
      const search = req.query.search as string | undefined;

      // Parse filters
      const filters: PackageListFilters = {};

      // Boolean filter with proper parsing
      if (req.query.is_active !== undefined) {
        filters.is_active =
          req.query.is_active === "true" || req.query.is_active === "1";
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
        message: "Packages retrieved successfully",
        data: packages,
      });
    } catch (error) {
      console.error("Error retrieving packages:", error);
      res.status(500).json({
        success: false,
        code: 500,
        error: "Internal server error",
        message: "Failed to retrieve packages",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error("Package ID is required");
      }

      const results = await PackageService.getPackageById(id);

      res.status(200).json({
        success: true,
        code: 200,
        message: "Package retrieved successfully",
        data: results,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", code: 500, success: false });
    }
  }

  static async getPackageDetails(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error("Package id is required");
      }

      const result = await PackageService.getPackageDetails(id);
      res.status(200).json({
        success: true,
        code: 200,
        message: "Package retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", code: 500, success: false });
    }
  }

  static async removeItemDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error("Package id is required");
      }

      const result = await PackageService.removeItemPackageDetail(id);

      const statusCode = result.success ? 200 : 404;

      res.status(statusCode).json({
        success: result.success,
        code: statusCode,
        message: result.response,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", code: 500, success: false });
    }
  }

  static async addPackageItemDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id: packageId } = req.params;
      const { product_id, quantity, notes } = req.body;

      if (!packageId) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "Package id is required",
        });
        return;
      }

      if (!product_id || !quantity) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "product_id and quantity are required",
        });
        return;
      }

      const result = await PackageService.addItemToPackage({
        package_id: packageId,
        product_id,
        quantity,
        notes,
      });

      res.status(201).json({
        success: result.success,
        code: 201,
        message: result.response,
        data: result.item,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        code: 500,
        message: "Internal server error",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const {
        code,
        service_id,
        name,
        description,
        doctor_type,
        internal_doctor_price,
        external_doctor_price,
        validity_days,
      } = req.body;

      if (!code || !service_id || !name || !doctor_type) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "code, service_id, name, and doctor_type are required",
        });
        return;
      }

      const packageData: CreatePackageDto = {
        code,
        service_id,
        name,
        description,
        doctor_type,
        internal_doctor_price,
        external_doctor_price,
        validity_days,
      };

      const result = await PackageService.create(packageData, userId);

      res.status(201).json({
        success: true,
        code: 201,
        message: "Package created successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        code: 500,
        message: "Internal server error",
      });
    }
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id: packageId } = req.params;

      if (!packageId) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "Package id is required",
        });
        return;
      }

      const result = await PackageService.deactivate(packageId, userId);

      if (!result) {
        res.status(404).json({
          success: false,
          code: 404,
          message: "Package not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        code: 200,
        message: "Package deactivated successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        code: 500,
        message: "Internal server error",
      });
    }
  }

  static async copyPackage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id: sourcePackageId } = req.params;
      const {
        name,
        description,
        external_doctor_price,
        internal_doctor_price,
      } = req.body;

      if (!sourcePackageId) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "Source package id is required",
        });
        return;
      }

      if (!name) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "name is required",
        });
        return;
      }

      const copyData: CopyPackageDto = {
        name,
        description,
        external_doctor_price,
        internal_doctor_price,
      };

      const result = await PackageService.copyPackage(
        sourcePackageId,
        copyData,
        userId,
      );

      res.status(201).json({
        success: true,
        code: 201,
        message: "Package copied successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);
      const statusCode =
        error.message === "Source package not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: error.message || "Internal server error",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id: packageId } = req.params;
      const { description, external_doctor_price, internal_doctor_price } = req.body;

      if (!packageId) {
        res.status(400).json({
          success: false,
          code: 400,
          message: "Package id is required",
        });
        return;
      }

      const updateData: UpdatePackageDto = {
        description,
        external_doctor_price,
        internal_doctor_price,
      };

      const result = await PackageService.update(packageId, updateData, userId);

      if (!result) {
        res.status(404).json({
          success: false,
          code: 404,
          message: "Package not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        code: 200,
        message: "Package updated successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        code: 500,
        message: "Internal server error",
      });
    }
  }
}
