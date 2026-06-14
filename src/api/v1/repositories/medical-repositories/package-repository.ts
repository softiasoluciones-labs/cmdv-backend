import { models, sequelize } from "../../../../database";
import { Op } from "sequelize";
import { packages } from "../../../../database/medical/packages";
import {
  PackageListFilters,
  PackageDetailDto,
  CreatePackageDto,
  CopyPackageDto,
  UpdatePackageDto,
} from "../../dtos/medical-dtos/package-dto";
import { secureLogger } from "../../../../utils/secure-logger.utils";
import { package_details } from "../../../../database/medical/package_details";
import { v4 as uuidv4 } from "uuid";

export class PackageRepository {
  /**
   * Find all packages with optional filters
   */
  static async findAll(
    page: number = 1,
    limit: number = 50,
    filters?: PackageListFilters,
  ): Promise<{ packages: packages[]; total: number }> {
    try {
      const where: any = {};

      // Apply filters if provided
      if (filters?.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      if (filters?.doctor_type) {
        where.doctor_type = filters.doctor_type;
      }

      if (filters?.code) {
        where.code = { [Op.iLike]: `%${filters.code}%` };
      }

      if (filters?.service_id) {
        where.service_id = filters.service_id;
      }

      if (filters?.year) {
        where.year = filters.year;
      }

      const offset = (page - 1) * limit;

      const { rows, count } = await models.packages.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        attributes: {
          exclude: ["created_by"],
        },
        include: [
          {
            model: models.package_details,
            as: "package_details",
            attributes: [
              "id",
              "package_id",
              "product_id",
              "quantity",
              "notes",
              "created_at",
            ],
            include: [
{
                            model: models.products,
                            as: "product",
                            attributes: ["id", "code", "name", "unit_cost"],
                        },
            ],
          },
        ],
      });

      return { packages: rows, total: count };
    } catch (error) {
      secureLogger.error("Error finding packages: " + error);
      throw new Error("Failed to retrieve packages");
    }
  }

static async getPackageById(packageId: string): Promise<packages> {
        const pkg = await models.packages.findOne({
            where: {
                id: packageId,
            },
            include: [
                {
                    model: models.users,
                    as: "created_by_user",
                    attributes: ["username"],
                },
                {
                    model: models.users,
                    as: "updated_by_user",
                    attributes: ["username"],
                },
                {
                    model: models.package_details,
                    as: "package_details",
                    attributes: [
                        "id",
                        "package_id",
                        "product_id",
                        "quantity",
                        "notes",
                        "created_at",
                    ],
                    include: [
                        {
                            model: models.products,
                            as: "product",
                            attributes: ["id", "code", "name"],
                        },
                    ],
                },
            ],
        });
        if (!pkg) {
            throw new Error('Package not found');
        }
        return pkg;
    }

    static async getPackageDetails(packageId: string): Promise<packages> {
        const pkg = await models.packages.findOne({
            where: {
                id: packageId,
            },
            include: [
                {
                    model: models.users,
                    as: "created_by_user",
                    attributes: ["username"],
                },
                {
                    model: models.users,
                    as: "updated_by_user",
                    attributes: ["username"],
                },
                {
                    model: models.package_details,
                    as: "package_details",
                    attributes: [
                        "id",
                        "package_id",
                        "product_id",
                        "quantity",
                        "notes",
                        "created_at",
                    ],
                    include: [
                        {
                            model: models.products,
                            as: "product",
                            attributes: ["id", "code", "name"],
                        },
                    ],
                },
            ],
        });
        if (!pkg) {
            throw new Error('Package not found');
        }
        return pkg;
    }

  static async removeItemPackageDetail(
    idItem: string,
  ): Promise<{ success: boolean; id: string; response: string }> {
    try {
      const deleted = await models.package_details.destroy({
        where: { id: idItem },
      });

      if (!deleted) {
        return {
          success: false,
          id: idItem,
          response: "Package detail not found",
        };
      }

      return {
        success: true,
        id: idItem,
        response: "Package item removed",
      };
    } catch (error) {
      secureLogger.error("Error removing package detail: " + error);

      return {
        success: false,
        id: idItem,
        response: "Error trying to remove the product from the package",
      };
    }
  }

  static async createPackageDetail(
    data: PackageDetailDto,
  ): Promise<{
    success: boolean;
    id: string;
    response: string;
    item: package_details | undefined;
  }> {
    const { package_id, product_id, quantity, notes } = data;

    const item = await models.package_details.findOne({
      where: { package_id, product_id },
    });

    if (item) {
      await item.update({
        quantity: item.quantity + quantity,
        notes: [item.notes, notes].filter(Boolean).join(" "),
      });

      item.reload();

      return {
        success: true,
        id: item.id,
        response: "Item already existed, quantity updated",
        item,
      };
    }

    const newItem = await models.package_details.create({
      package_id,
      product_id,
      quantity,
      notes: notes || "",
      created_at: new Date(),
    });

    if (!newItem) {
      return {
        success: false,
        id: "",
        response: "Item not added",
        item: undefined,
      };
    }

    return {
      success: true,
      id: newItem.id,
      response: "Item added to package",
      item: newItem,
    };
  }

  static async create(
    data: CreatePackageDto,
    userId: string,
  ): Promise<packages> {
    const desc = data.description;
    const internalPrice = data.internal_doctor_price;
    const externalPrice = data.external_doctor_price;
    const validity = data.validity_days;

    const newPackage = await models.packages.create({
      id: uuidv4(),
      code: data.code,
      service_id: data.service_id,
      name: data.name,
      description: desc,
      doctor_type: data.doctor_type,
      internal_doctor_price: internalPrice,
      external_doctor_price: externalPrice,
      validity_days: validity,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    } as any);
    return newPackage;
  }

  static async deactivate(
    packageId: string,
    userId: string,
  ): Promise<packages> {
    const pkg = await models.packages.findOne({
      where: { id: packageId },
    });
    if (!pkg) {
      throw new Error('Package not found');
    }
    await pkg.update({
      is_active: false,
      updated_at: new Date(),
      updated_by: userId,
    });
    await pkg.reload();
    return pkg;
  }

  static async copyPackage(
    sourcePackageId: string,
    data: CopyPackageDto,
    userId: string,
  ): Promise<{ package: packages; details: package_details[] }> {
    const sourcePackage = await models.packages.findOne({
      where: { id: sourcePackageId },
    });
    if (!sourcePackage) {
      throw new Error("Source package not found");
    }

    const sourceDetails = await models.package_details.findAll({
      where: { package_id: sourcePackageId },
    });

    const MAX_CODE_LENGTH = 30;

    const generateCopyCode = (originalCode: string): string => {
      const timestamp = Date.now().toString().slice(-6);
      const baseCode = `${originalCode}_CPY`;
      if (baseCode.length + timestamp.length > MAX_CODE_LENGTH) {
        return `${baseCode.slice(0, MAX_CODE_LENGTH - timestamp.length - 1)}_${timestamp}`;
      }
      return `${baseCode}_${timestamp}`;
    };

    const newPackage = await models.packages.create({
      id: uuidv4(),
      code: generateCopyCode(sourcePackage.code),
      service_id: sourcePackage.service_id,
      name: data.name,
      description: data.description ?? sourcePackage.description,
      doctor_type: sourcePackage.doctor_type,
      internal_doctor_price:
        data.internal_doctor_price ?? sourcePackage.internal_doctor_price,
      external_doctor_price:
        data.external_doctor_price ?? sourcePackage.external_doctor_price,
      validity_days: sourcePackage.validity_days,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    } as any);

    const newDetails: package_details[] = [];
    for (const detail of sourceDetails) {
      const newDetail = await models.package_details.create({
        id: uuidv4(),
        package_id: newPackage.id,
        product_id: detail.product_id,
        quantity: detail.quantity,
        notes: detail.notes,
        created_at: new Date(),
      } as any);
      newDetails.push(newDetail);
    }

    return { package: newPackage, details: newDetails };
  }

static async update(packageId: string, data: UpdatePackageDto, userId: string): Promise<packages> {
        const pkg = await models.packages.findOne({
            where: { id: packageId },
        });

        if (!pkg) {
            throw new Error('Package not found');
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date(),
            updated_by: userId,
        };

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        if (data.external_doctor_price !== undefined) {
            updateData.external_doctor_price = data.external_doctor_price;
        }

        if (data.internal_doctor_price !== undefined) {
            updateData.internal_doctor_price = data.internal_doctor_price;
        }

        await pkg.update(updateData);
        await pkg.reload();
        return pkg;
    }
}
