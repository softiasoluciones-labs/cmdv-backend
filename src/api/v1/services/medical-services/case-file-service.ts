import { sequelize, models } from '../../../../database';
import { CaseFileRepository } from '../../repositories/medical-repositories/case-file-repository';
import { AdmissionTypeRepository } from '../../repositories/medical-repositories/admission-type-repository';
import { PatientRepository } from '../../repositories/medical-repositories/patient-repository';
import {
    CaseFileResponse,
    CaseFileListResponse,
    CreateCaseFileRequest,
    UpdateCaseFileRequest,
    UpdateCaseStatusRequest,
    CaseValidationResponse,
    CaseStatus,
    CaseStatusFlow,
    ShiftType
} from '../../dtos/medical-dtos/case-file.dto';
import { CaseFileValidator, STATUS_FLOW_TO_CASE_STATUS } from '../../validators/medical-validators/case-file.validator';
import { case_files } from '../../../../database/medical/case_files';
import { secureLogger } from '../../../../utils/secure-logger.utils';

export class CaseFileService {
    constructor(private readonly caseFileRepo: CaseFileRepository) {}

    async getAllCaseFiles(options?: {
        page?: number;
        limit?: number;
        patient_id?: string;
        admission_type_id?: string;
        case_status?: CaseStatus;
        status_flow?: CaseStatusFlow;
        shift_type?: ShiftType;
        from_date?: Date;
        to_date?: Date;
    }): Promise<{ cases: CaseFileListResponse[]; total: number; page: number; totalPages: number }> {
        const result = await this.caseFileRepo.findAll(options);
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;

        return {
            cases: result.cases.map(CaseFileService.toListResponse),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    async getCaseFileById(id: string): Promise<CaseFileResponse> {
        const caseFile = await this.caseFileRepo.findById(id);
        if (!caseFile) throw new Error(`Case file with ID ${id} not found`);
        return CaseFileService.toResponse(caseFile);
    }

    async getCaseFileByCaseNumber(caseNumber: string): Promise<CaseFileResponse> {
        const caseFile = await this.caseFileRepo.findByCaseNumber(caseNumber);
        if (!caseFile) throw new Error(`Case file with case number ${caseNumber} not found`);
        return CaseFileService.toResponse(caseFile);
    }

    async createCaseFile(data: CreateCaseFileRequest, createdBy?: string): Promise<CaseFileResponse> {
        // Pre-transaction read-only validations
        const patient = await PatientRepository.findById(data.patient_id);
        if (!patient) throw new Error(`Patient with ID ${data.patient_id} not found`);

        const admissionType = await AdmissionTypeRepository.findById(data.admission_type_id);
        if (!admissionType) throw new Error(`Admission type with ID ${data.admission_type_id} not found`);
        if (!admissionType.is_active) throw new Error(`Admission type "${admissionType.name}" is not active`);

        const validationResults = CaseFileValidator.validateCaseCreation(data, admissionType);
        if (CaseFileValidator.hasErrors(validationResults)) {
            throw new Error(`Validation failed: ${CaseFileValidator.getErrorMessages(validationResults).join(', ')}`);
        }

        const warnings = CaseFileValidator.getWarningMessages(validationResults);
        if (warnings.length > 0) {
            secureLogger.error('Case creation warnings: ' + warnings.join(', '));
        }

        const newCase = await sequelize.transaction(async (t) => {
            const caseNumber = await this.caseFileRepo.generateCaseNumber(data.admission_type_id, t);

            const caseFile = await this.caseFileRepo.create({
                patient_id: data.patient_id,
                admission_type_id: data.admission_type_id,
                admission_type_code: admissionType.code,
                case_number: caseNumber,
                chief_complaint: data.chief_complaint,
                ...(data.initial_diagnosis !== undefined && { initial_diagnosis: data.initial_diagnosis }),
                ...(data.shift_type !== undefined && { shift_type: data.shift_type }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.is_transfer !== undefined && { is_transfer: data.is_transfer }),
                ...(data.transfer_from_case_id !== undefined && { transfer_from_case_id: data.transfer_from_case_id }),
                ...(createdBy !== undefined && { created_by: createdBy })
            }, t);

            if (data.room_id) {
                await models.case_rooms.create({
                    case_file_id: caseFile.id,
                    room_id: data.room_id,
                    check_in: new Date(),
                    daily_rate: 0
                }, { transaction: t });
            }

            if (data.package_id && data.doctor_id) {
                await models.case_package_assignments.create({
                    case_file_id: caseFile.id,
                    package_id: data.package_id,
                    doctor_id: data.doctor_id,
                    doctor_type_used: 'internal',
                    price_applied: 0,
                    assigned_date: new Date()
                }, { transaction: t });
            }

            await models.case_timeline.create({
                case_file_id: caseFile.id,
                stage: 'Case Created',
                started_at: new Date(),
                status_flow: CaseStatusFlow.C1_CREACION,
                notes: `Case created with admission type: ${admissionType.name}`,
                shift_type: caseFile.shift_type,
                ...(createdBy !== undefined && { created_by: createdBy })
            }, { transaction: t });

            await models.case_status_history.create({
                case_file_id: caseFile.id,
                from_status: CaseStatusFlow.C1_CREACION,
                to_status: CaseStatusFlow.C1_CREACION,
                transition_date: new Date(),
                reason: 'Initial case creation',
                ...(createdBy !== undefined && { performed_by: createdBy })
            }, { transaction: t });

            return caseFile;
        });

        const createdCase = await this.caseFileRepo.findById(newCase.id);
        if (!createdCase) throw new Error('Failed to retrieve created case file');

        return CaseFileService.toResponse(createdCase);
    }

    async updateCaseFile(id: string, data: UpdateCaseFileRequest): Promise<CaseFileResponse> {
        const existingCase = await this.caseFileRepo.findById(id);
        if (!existingCase) throw new Error(`Case file with ID ${id} not found`);

        const flowChanged = data.current_status_flow !== undefined &&
            data.current_status_flow !== existingCase.current_status_flow;

        if (flowChanged) {
            if (!existingCase.admissionType) {
                throw new Error('Cannot validate status transition: admission type not loaded');
            }

            const validation = CaseFileValidator.validateStatusTransition(
                existingCase.admissionType,
                existingCase.current_status_flow as CaseStatusFlow,
                data.current_status_flow!,
                false // TODO: Check payment status when billing module is integrated
            );

            if (!validation.valid) throw new Error(validation.message);
        }

        await sequelize.transaction(async (t) => {
            const updatePayload: Parameters<CaseFileRepository['update']>[1] = {
                ...(data.discharge_date !== undefined && { discharge_date: data.discharge_date }),
                ...(data.initial_diagnosis !== undefined && { initial_diagnosis: data.initial_diagnosis }),
                ...(data.final_diagnosis !== undefined && { final_diagnosis: data.final_diagnosis }),
                ...(data.notes !== undefined && { notes: data.notes }),
            };

            if (flowChanged) {
                const newFlow = data.current_status_flow!;
                updatePayload.current_status_flow = newFlow;
                updatePayload.case_status = STATUS_FLOW_TO_CASE_STATUS[newFlow];

                if (CaseFileValidator.isClosingStatus(newFlow) && !data.discharge_date) {
                    updatePayload.discharge_date = new Date();
                }

                await models.case_status_history.create({
                    case_file_id: id,
                    from_status: existingCase.current_status_flow as CaseStatusFlow,
                    to_status: newFlow,
                    transition_date: new Date(),
                    reason: 'Status updated via API'
                }, { transaction: t });

                if (CaseFileValidator.isSignificantStatusChange(newFlow)) {
                    await models.case_timeline.create({
                        case_file_id: id,
                        stage: CaseFileValidator.getStageNameForStatus(newFlow),
                        started_at: new Date(),
                        status_flow: newFlow
                    }, { transaction: t });
                }
            } else if (data.case_status !== undefined) {
                updatePayload.case_status = data.case_status;
            }

            await this.caseFileRepo.update(id, updatePayload, t);
        });

        const updatedCase = await this.caseFileRepo.findById(id);
        if (!updatedCase) throw new Error('Failed to retrieve updated case file');

        return CaseFileService.toResponse(updatedCase);
    }

    async updateCaseStatus(id: string, data: UpdateCaseStatusRequest, performedBy?: string): Promise<CaseFileResponse> {
        const existingCase = await this.caseFileRepo.findById(id);
        if (!existingCase) throw new Error(`Case file with ID ${id} not found`);

        if (!existingCase.admissionType) {
            throw new Error('Cannot validate status transition: admission type not loaded');
        }

        const validation = CaseFileValidator.validateStatusTransition(
            existingCase.admissionType,
            existingCase.current_status_flow as CaseStatusFlow,
            data.status,
            false // TODO: Check payment status when billing module is integrated
        );

        if (!validation.valid) throw new Error(validation.message);

        if (validation.message) {
            secureLogger.error('Status transition warning: ' + validation.message);
        }

        await sequelize.transaction(async (t) => {
            const updatePayload: Parameters<CaseFileRepository['update']>[1] = {
                current_status_flow: data.status,
                case_status: STATUS_FLOW_TO_CASE_STATUS[data.status],
                ...(CaseFileValidator.isClosingStatus(data.status) && { discharge_date: new Date() })
            };

            await this.caseFileRepo.update(id, updatePayload, t);

            await models.case_status_history.create({
                case_file_id: id,
                from_status: existingCase.current_status_flow as CaseStatusFlow,
                to_status: data.status,
                transition_date: new Date(),
                reason: data.reason ?? 'Status updated',
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(performedBy !== undefined && { performed_by: performedBy })
            }, { transaction: t });

            if (CaseFileValidator.isSignificantStatusChange(data.status)) {
                await models.case_timeline.create({
                    case_file_id: id,
                    stage: CaseFileValidator.getStageNameForStatus(data.status),
                    started_at: new Date(),
                    status_flow: data.status,
                    ...(data.notes !== undefined && { notes: data.notes }),
                    ...(performedBy !== undefined && { created_by: performedBy })
                }, { transaction: t });
            }
        });

        const updatedCase = await this.caseFileRepo.findById(id);
        if (!updatedCase) throw new Error('Failed to retrieve updated case file');

        return CaseFileService.toResponse(updatedCase);
    }

    async deleteCaseFile(id: string): Promise<void> {
        const deleted = await this.caseFileRepo.delete(id);
        if (!deleted) throw new Error(`Case file with ID ${id} not found`);
    }

    async validateCaseCompliance(id: string): Promise<CaseValidationResponse> {
        const validation = await this.caseFileRepo.validateCompliance(id);
        if (!validation) throw new Error(`Case file with ID ${id} not found`);
        return validation;
    }

    async canTransferCase(id: string): Promise<{ allowed: boolean; reason?: string }> {
        const caseFile = await this.caseFileRepo.findById(id);
        if (!caseFile) return { allowed: false, reason: 'Case file not found' };
        if (!caseFile.admissionType) return { allowed: false, reason: 'Admission type not loaded' };

        if (!caseFile.admissionType.allows_transfer) {
            return {
                allowed: false,
                reason: `Admission type "${caseFile.admissionType.name}" does not allow transfers`
            };
        }

        const transferableStatuses: CaseStatusFlow[] = [
            CaseStatusFlow.CE_CARGOS_EXPEDIENTE,
            CaseStatusFlow.CC_CONFIRMACION_CARGOS
        ];

        if (!transferableStatuses.includes(caseFile.current_status_flow as CaseStatusFlow)) {
            return {
                allowed: false,
                reason: `Case cannot be transferred in current status: ${caseFile.current_status_flow}`
            };
        }

        return { allowed: true };
    }

    async canCloseCase(id: string): Promise<{ allowed: boolean; reason?: string }> {
        const caseFile = await this.caseFileRepo.findById(id);
        if (!caseFile) return { allowed: false, reason: 'Case file not found' };
        if (!caseFile.admissionType) return { allowed: false, reason: 'Admission type not loaded' };

        if (caseFile.admissionType.requires_immediate_payment) {
            // TODO: Check billing.invoices when billing module is integrated
            return {
                allowed: true,
                reason: 'Payment validation pending (billing module not integrated)'
            };
        }

        return { allowed: true };
    }

    private static toListResponse(caseFile: case_files): CaseFileListResponse {
        const patientName = caseFile.patient
            ? `${caseFile.patient.first_name} ${caseFile.patient.last_name}`.trim()
            : 'Unknown Patient';

        return {
            id: caseFile.id,
            case_number: caseFile.case_number,
            patient_name: patientName,
            admission_type_name: caseFile.admissionType?.name,
            admission_date: caseFile.admission_date,
            case_status: caseFile.case_status as CaseStatus,
            current_status_flow: caseFile.current_status_flow as CaseStatusFlow,
            ...(caseFile.shift_type && { shift_type: caseFile.shift_type as ShiftType }),
            ...(caseFile.total_cost != null && { total_cost: parseFloat(caseFile.total_cost.toString()) })
        };
    }

    private static toResponse(caseFile: case_files): CaseFileResponse {
        return {
            id: caseFile.id,
            case_number: caseFile.case_number,
            patient_id: caseFile.patient_id,
            admission_date: caseFile.admission_date,
            ...(caseFile.discharge_date && { discharge_date: caseFile.discharge_date }),
            admission_type: caseFile.admission_type,
            chief_complaint: caseFile.chief_complaint,
            ...(caseFile.initial_diagnosis && { initial_diagnosis: caseFile.initial_diagnosis }),
            ...(caseFile.final_diagnosis && { final_diagnosis: caseFile.final_diagnosis }),
            case_status: caseFile.case_status as CaseStatus,
            ...(caseFile.total_cost != null && { total_cost: parseFloat(caseFile.total_cost.toString()) }),
            shift_type: caseFile.shift_type as ShiftType,
            current_status_flow: caseFile.current_status_flow as CaseStatusFlow,
            ...(caseFile.is_transfer !== undefined && { is_transfer: caseFile.is_transfer }),
            ...(caseFile.transfer_from_case_id && { transfer_from_case_id: caseFile.transfer_from_case_id }),
            ...(caseFile.notes && { notes: caseFile.notes }),
            created_at: caseFile.created_at!,
            updated_at: caseFile.updated_at!,
            ...(caseFile.created_by && { created_by: caseFile.created_by }),
            ...(caseFile.admission_type_id && { admission_type_id: caseFile.admission_type_id }),
            ...(caseFile.patient && {
                patient: {
                    id: caseFile.patient.id,
                    file_number: caseFile.patient.file_number,
                    first_name: caseFile.patient.first_name,
                    last_name: caseFile.patient.last_name
                }
            }),
            ...(caseFile.admissionType && {
                admissionType: {
                    id: caseFile.admissionType.id,
                    code: caseFile.admissionType.code,
                    name: caseFile.admissionType.name,
                    requires_hospitalization: caseFile.admissionType.requires_hospitalization,
                    requires_package: caseFile.admissionType.requires_package,
                    allows_transfer: caseFile.admissionType.allows_transfer,
                    requires_immediate_payment: caseFile.admissionType.requires_immediate_payment,
                    ...(caseFile.admissionType.category !== undefined && { category: caseFile.admissionType.category })
                }
            }),
            ...(caseFile.case_rooms && {
                rooms: caseFile.case_rooms.map((cr) => ({
                    id: cr.id,
                    room_number: cr.room?.room_number ?? 'Unknown',
                    room_type: cr.room?.room_type ?? 'Unknown',
                    check_in_date: cr.check_in,
                    ...(cr.check_out && { check_out_date: cr.check_out })
                }))
            }),
            ...(caseFile.case_package_assignments && {
                packages: caseFile.case_package_assignments.map((pa) => ({
                    id: pa.id,
                    package_name: pa.package?.name ?? 'Unknown',
                    doctor_name: 'Doctor', // TODO: expand doctor relation when needed
                    price_applied: parseFloat(pa.price_applied.toString())
                }))
            })
        };
    }
}
