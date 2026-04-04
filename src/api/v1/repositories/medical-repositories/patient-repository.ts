import { models } from '../../../../database';
import { patients, patientsCreationAttributes } from '../../../../database/medical/patients';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Op } from 'sequelize';

/**
 * Patient Repository
 * Handles all database operations for patients
 */
export class PatientRepository {
    /**
     * Generate unique file number for patient
     */
    static async generateFileNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `PAT-${year}-`;

        const lastPatient = await models.patients.findOne({
            where: {
                file_number: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['created_at', 'DESC']]
        });

        let sequence = 1;
        if (lastPatient) {
            const lastNumber = lastPatient.file_number.split('-').pop();
            sequence = parseInt(lastNumber || '0') + 1;
        }

        return `${prefix}${sequence.toString().padStart(4, '0')}`;
    }

    /**
     * Find all patients with optional filters
     */
    static async findAll(filters: any = {}, page: number = 1, limit: number = 50): Promise<{ patients: patients[], total: number }> {
        try {
            const where: any = {};

            // Search filter (name, file number, identification)
            if (filters.search) {
                where[Op.or] = [
                    { first_name: { [Op.iLike]: `%${filters.search}%` } },
                    { last_name: { [Op.iLike]: `%${filters.search}%` } },
                    { file_number: { [Op.iLike]: `%${filters.search}%` } },
                    { identification_number: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.gender) {
                where.gender = filters.gender;
            }

            if (filters.isActive !== undefined) {
                where.is_active = filters.isActive;
            }

            if (filters.city) {
                where.city = { [Op.iLike]: `%${filters.city}%` };
            }

            if (filters.state) {
                where.state = { [Op.iLike]: `%${filters.state}%` };
            }

            const offset = (page - 1) * limit;

            const { rows, count } = await models.patients.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                attributes: {
                    exclude: ['created_by']
                }
            });

            return { patients: rows, total: count };
        } catch (error) {
            secureLogger.error('Error finding patients: ' + error);
            throw new Error('Failed to retrieve patients');
        }
    }

    /**
     * Find patient by ID
     */
    static async findById(id: string): Promise<patients | null> {
        try {
            const patient = await models.patients.findByPk(id, {
                attributes: {
                    exclude: ['created_by']
                }
            });
            return patient;
        } catch (error) {
            secureLogger.error('Error finding patient by ID: ' + error);
            return null;
        }
    }

    /**
     * Find patient by file number
     */
    static async findByFileNumber(fileNumber: string): Promise<patients | null> {
        try {
            const patient = await models.patients.findOne({
                where: { file_number: fileNumber }
            });
            return patient;
        } catch (error) {
            secureLogger.error('Error finding patient by file number: ' + error);
            return null;
        }
    }

    /**
     * Find patient by identification number
     */
    static async findByIdentification(identificationNumber: string): Promise<patients | null> {
        try {
            const patient = await models.patients.findOne({
                where: { identification_number: identificationNumber }
            });
            return patient;
        } catch (error) {
            secureLogger.error('Error finding patient by identification: ' + error);
            return null;
        }
    }

    /**
     * Create new patient
     */
    static async create(patientData: Omit<patientsCreationAttributes, 'file_number'>, userId?: string): Promise<patients> {
        try {
            const fileNumber = await this.generateFileNumber();

            const patient = await models.patients.create({
                ...patientData,
                file_number: fileNumber,
                ...(userId && { created_by: userId })
            });

            return patient;
        } catch (error) {
            secureLogger.error('Error creating patient: ' + error);
            throw new Error('Failed to create patient');
        }
    }

    /**
     * Update patient
     */
    static async update(id: string, patientData: Partial<patientsCreationAttributes>): Promise<boolean> {
        try {
            const [updatedCount] = await models.patients.update(
                patientData,
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error updating patient: ' + error);
            throw new Error('Failed to update patient');
        }
    }

    /**
     * Delete patient (soft delete by setting is_active to false)
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const [updatedCount] = await models.patients.update(
                { is_active: false },
                { where: { id } }
            );
            return updatedCount > 0;
        } catch (error) {
            secureLogger.error('Error deleting patient: ' + error);
            throw new Error('Failed to delete patient');
        }
    }

    /**
     * Hard delete patient (use with caution)
     */
    static async hardDelete(id: string): Promise<boolean> {
        try {
            const deletedCount = await models.patients.destroy({
                where: { id }
            });
            return deletedCount > 0;
        } catch (error) {
            secureLogger.error('Error hard deleting patient: ' + error);
            throw new Error('Failed to delete patient');
        }
    }
}
