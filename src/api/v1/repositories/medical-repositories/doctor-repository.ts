import { models } from "../../../../database";
import { Op } from "sequelize";
import { secureLogger } from "../../../../utils/secure-logger.utils";
import { doctors } from "../../../../database/medical/doctors";

/**
 * Doctor Repository
 * Handles all database operations for doctors
 */
export class DoctorRepository {
    /**
     * Find all doctors with optional filters
     */
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ doctors: doctors[], total: number }> {
        try {
            const where: any = {};

            // Search filter (medical_license, identification_number, phone, email)
            if (filters.search) {
                where[Op.or] = [
                    { medical_license: { [Op.iLike]: `%${filters.search}%` } },
                    { identification_number: { [Op.iLike]: `%${filters.search}%` } },
                    { phone: { [Op.iLike]: `%${filters.search}%` } },
                    { email: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.doctor_type !== undefined) {
                where.doctor_type = filters.doctor_type;
            }

            if (filters.specialty_id !== undefined) {
                where.specialty_id = filters.specialty_id;
            }

            const offset = (page - 1) * limit;

            const { rows, count } = await models.doctors.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: models.users,
                        as: 'user',
                        attributes: ['id', 'full_name', 'email'],
                        required: false
                    },
                    {
                        model: models.specialties,
                        as: 'specialty',
                        attributes: ['id', 'name'],
                        required: false
                    }
                ]
            });

            return { doctors: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding doctors: ' + error);
            throw new Error('Failed to retrieve doctors');
        }
    }

    /**
     * Find doctor by ID
     */
    static async findById(id: string): Promise<doctors> {
        try {
            const doctor = await models.doctors.findByPk(id, {
                include: [
                    {
                        model: models.users,
                        as: 'user',
                        attributes: ['id', 'full_name', 'email'],
                        required: false
                    },
                    {
                        model: models.specialties,
                        as: 'specialty',
                        attributes: ['id', 'name'],
                        required: false
                    }
                ]
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        } catch (error) {
            secureLogger.error('Error finding doctor by ID: ' + error);
            throw new Error('Error finding doctor by ID');
        }
    }

    /**
     * Find doctor by medical license
     */
    static async findByMedicalLicense(medicalLicense: string): Promise<doctors> {
        try {
            const doctor = await models.doctors.findOne({
                where: { medical_license: medicalLicense }
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        } catch (error) {
            secureLogger.error('Error finding doctor by medical license: ' + error);
            throw new Error('Error finding doctor by medical license');
        }
    }

    /**
     * Find doctor by identification number
     */
    static async findByIdentification(identificationNumber: string): Promise<doctors> {
        try {
            const doctor = await models.doctors.findOne({
                where: { identification_number: identificationNumber }
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        } catch (error) {
            secureLogger.error('Error finding doctor by identification: ' + error);
            throw new Error('Error finding doctor by identification');
        }
    }

    /**
     * Create a new doctor
     */
    static async create(data: Record<string, unknown>): Promise<doctors> {
        try {
            const doctor = await models.doctors.create(data as any);
            return doctor;
        } catch (error) {
            secureLogger.error('Error creating doctor: ' + error);
            throw new Error('Failed to create doctor');
        }
    }

    /**
     * Update a doctor by ID
     */
    static async update(id: string, data: Record<string, unknown>): Promise<doctors> {
        try {
            const [affectedCount] = await models.doctors.update(data, {
                where: { id }
            });

            if (affectedCount === 0) {
                throw new Error('Doctor not found');
            }

            return await this.findById(id);
        } catch (error) {
            secureLogger.error('Error updating doctor: ' + error);
            throw new Error('Error updating doctor');
        }
    }

    /**
     * Delete a doctor by ID (hard delete)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const affectedCount = await models.doctors.destroy({
                where: { id }
            });
            return affectedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting doctor: ' + error);
            return false;
        }
    }
}