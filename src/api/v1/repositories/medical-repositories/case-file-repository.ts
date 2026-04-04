import { case_files } from '../../../../database/medical/case_files';

import { CaseStatus, CaseStatusFlow, ShiftType, ValidationStatus, CaseValidationResponse } from '../../dtos/medical-dtos/case-file.dto';
import { Op } from 'sequelize';
import { models } from '../../../../database';
import { secureLogger } from "../../../../utils/secure-logger.utils";

/**
 * Repository for case files data access
 */
export class CaseFileRepository {
    /**
     * Find all case files with pagination and filtering
     */
    static async findAll(options?: {
        page?: number;
        limit?: number;
        patient_id?: string;
        admission_type_id?: string;
        case_status?: CaseStatus;
        status_flow?: CaseStatusFlow;
        shift_type?: ShiftType;
        from_date?: Date;
        to_date?: Date;
    }): Promise<{ cases: case_files[]; total: number }> {


        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;

        const where: any = {};

        if (options?.patient_id) where.patient_id = options.patient_id;
        if (options?.admission_type_id) where.admission_type_id = options.admission_type_id;
        if (options?.case_status) where.case_status = options.case_status;
        if (options?.status_flow) where.current_status_flow = options.status_flow;
        if (options?.shift_type) where.shift_type = options.shift_type;

        if (options?.from_date || options?.to_date) {
            where.admission_date = {};
            if (options.from_date) where.admission_date[Op.gte] = options.from_date;
            if (options.to_date) where.admission_date[Op.lte] = options.to_date;
        }

        try {
            const { rows, count } = await models.case_files.findAndCountAll({
                where,
                include: [
                    {
                        model: models.patients,
                        as: 'patient',
                        attributes: ['id', 'first_name', 'last_name']
                    },
                    {
                        model: models.admission_types,
                        as: 'admissionType',
                        attributes: ['id', 'code', 'name']
                    }
                ],
                limit,
                offset,
                order: [['admission_date', 'DESC']]
            });

            return { cases: rows, total: count };
        }
        catch (error: any) {
            secureLogger.error('Error finding case files: ' + error);
            throw new Error('Failed to retrieve case files');
        }
    }

    /**
     * Find case file by ID with all relations
     */
    static async findById(id: string): Promise<case_files | null> {
        const caseFile = await models.case_files.findByPk(id, {
            include: [
                {
                    model: models.patients,
                    as: 'patient',
                    attributes: ['id', 'file_number', 'first_name', 'last_name']
                },
                {
                    model: models.admission_types,
                    as: 'admissionType',
                    attributes: ['id', 'code', 'name', 'requires_hospitalization', 'requires_package', 'allows_transfer', 'requires_immediate_payment', 'category']
                },
                {
                    model: models.case_rooms,
                    as: 'case_rooms',
                    include: [{
                        model: models.rooms,
                        as: 'room',
                        attributes: ['room_number', 'room_type']
                    }]
                },
                {
                    model: models.case_package_assignments,
                    as: 'case_package_assignments',
                    include: [
                        {
                            model: models.packages,
                            as: 'package',
                            attributes: ['name']
                        },
                        {
                            model: models.doctors,
                            as: 'doctor',
                            attributes: ['id']
                        }
                    ]
                }
            ]
        });

        return caseFile;
    }

    /**
     * Find case file by case number
     */
    static async findByCaseNumber(caseNumber: string): Promise<case_files | null> {
        return await models.case_files.findOne({
            where: { case_number: caseNumber },
            include: [
                {
                    model: models.patients,
                    as: 'patient',
                    attributes: ['id', 'file_number', 'first_name', 'last_name']
                },
                {
                    model: models.admission_types,
                    as: 'admissionType'
                },
                {
                    model: models.case_rooms,
                    as: 'case_rooms',
                    include: [{
                        model: models.rooms,
                        as: 'room',
                        attributes: ['room_number', 'room_type']
                    }]
                },
                {
                    model: models.case_package_assignments,
                    as: 'case_package_assignments',
                    include: [
                        {
                            model: models.packages,
                            as: 'package',
                            attributes: ['name']
                        },
                        {
                            model: models.doctors,
                            as: 'doctor',
                            attributes: ['id']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Create new case file
     */
    static async create(data: {
        patient_id: string;
        admission_type_id: string;
        case_number: string;
        chief_complaint: string;
        initial_diagnosis?: string;
        shift_type?: ShiftType;
        notes?: string;
        is_transfer?: boolean;
        transfer_from_case_id?: string;
        created_by?: string;
    }): Promise<case_files> {
        const admission_type = await models.admission_types.findByPk(data.admission_type_id);

        return await models.case_files.create({
            patient_id: data.patient_id,
            admission_type_id: data.admission_type_id,
            case_number: data.case_number,
            admission_type: admission_type?.code || '',
            chief_complaint: data.chief_complaint,
            ...(data.initial_diagnosis !== undefined && { initial_diagnosis: data.initial_diagnosis }),
            case_status: CaseStatus.ACTIVE,
            shift_type: data.shift_type || ShiftType.DAYTIME,
            current_status_flow: CaseStatusFlow.C1_CREACION,
            is_transfer: data.is_transfer || false,
            ...(data.transfer_from_case_id !== undefined && { transfer_from_case_id: data.transfer_from_case_id }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.created_by !== undefined && { created_by: data.created_by }),
            admission_date: new Date()
        });
    }

    /**
     * Update case file
     */
    static async update(id: string, data: {
        discharge_date?: Date;
        initial_diagnosis?: string;
        final_diagnosis?: string;
        case_status?: CaseStatus;
        current_status_flow?: CaseStatusFlow;
        notes?: string;
    }): Promise<case_files | null> {
        const caseFile = await models.case_files.findByPk(id);

        if (!caseFile) {
            return null;
        }

        await caseFile.update(data);
        return caseFile;
    }

    /**
     * Delete case file (soft delete if possible)
     */
    static async delete(id: string): Promise<boolean> {
        const caseFile = await models.case_files.findByPk(id);

        if (!caseFile) {
            return false;
        }

        // Only allow deletion if case is in creation status
        if (caseFile.current_status_flow !== CaseStatusFlow.C1_CREACION) {
            throw new Error('Cannot delete case file that has progressed beyond creation status');
        }

        await caseFile.destroy();
        return true;
    }

    /**
     * Generate unique case number
     */
    static async generateCaseNumber(admission_type_id: string): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Get admission type code 
        const admissionType = await models.admission_types.findByPk(admission_type_id);
        if (!admissionType) {
            throw new Error('Admission type not found');
        }

        const prefix = `${admissionType.code}-${year}${month}${day}`;

        // Find the last case number for today
        const lastCase = await models.case_files.findOne({
            where: {
                case_number: {
                    [Op.like]: `${prefix}%`
                },
                admission_type_id: {
                    [Op.eq]: admission_type_id
                }
            },
            order: [['case_number', 'DESC']]
        });

        let sequence = 1;
        if (lastCase) {
            const parts = lastCase.case_number.split('-');
            const lastSequence = parseInt(parts.pop() || '0');
            sequence = lastSequence + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    /**
     * Validate case compliance with admission type requirements
     */
    static async validateCompliance(caseId: string): Promise<CaseValidationResponse | null> {
        const caseFile = await models.case_files.findByPk(caseId, {
            include: [
                {
                    model: models.admission_types,
                    as: 'admissionType'
                },
                {
                    model: models.case_rooms,
                    as: 'case_rooms'
                },
                {
                    model: models.case_package_assignments,
                    as: 'case_package_assignments'
                }
            ]
        });

        if (!caseFile || !caseFile.admissionType) {
            return null;
        }

        const admType = caseFile.admissionType;
        const hasRoom = (caseFile.case_rooms?.length || 0) > 0;
        const hasPackage = (caseFile.case_package_assignments?.length || 0) > 0;
        const hasPayment = false; // TODO: Check billing.invoices when available

        const messages: string[] = [];
        let status: ValidationStatus = ValidationStatus.COMPLIANT;

        // Check room requirement
        if (admType.requires_hospitalization && !hasRoom) {
            status = ValidationStatus.MISSING_ROOM;
            messages.push('Room assignment is required but missing');
        }

        // Check package requirement
        if (admType.requires_package && !hasPackage) {
            status = ValidationStatus.MISSING_PACKAGE;
            messages.push('Package assignment is required but missing');
        }

        // Check transfer allowance
        if (caseFile.is_transfer && !admType.allows_transfer) {
            status = ValidationStatus.TRANSFER_NOT_ALLOWED;
            messages.push('This admission type does not allow transfers');
        }

        // Check payment requirement
        if (admType.requires_immediate_payment && !hasPayment) {
            // TODO: Implement when billing module is available
            messages.push('Payment required (validation pending billing integration)');
        }

        return {
            case_id: caseFile.id,
            case_number: caseFile.case_number,
            admission_type_code: admType.code,
            admission_type_name: admType.name,
            requires_hospitalization: admType.requires_hospitalization,
            has_room_assigned: hasRoom,
            requires_package: admType.requires_package,
            has_package_assigned: hasPackage,
            allows_transfer: admType.allows_transfer,
            is_transfer: caseFile.is_transfer || false,
            requires_immediate_payment: admType.requires_immediate_payment,
            has_payment: hasPayment,
            validation_status: status,
            validation_messages: messages
        };
    }
}
