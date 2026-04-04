import { CaseFileRepository } from '../../repositories/medical-repositories/case-file-repository';
import { AdmissionTypeRepository } from '../../repositories/medical-repositories/admission-type-repository';
import { CaseFileResponse, CaseFileListResponse, CreateCaseFileRequest, UpdateCaseFileRequest, UpdateCaseStatusRequest, CaseValidationResponse, CaseStatus, CaseStatusFlow, ShiftType } from '../../dtos/medical-dtos/case-file.dto';
import { CaseFileValidator } from '../../validators/medical-validators/case-file.validator';
import { case_files } from '../../../../database/medical/case_files';
import { models } from '../../../../database';
import { PatientRepository } from '../../repositories/medical-repositories/patient-repository';

/**
 * Service for case files business logic
 */
export class CaseFileService {
    /*private repository: CaseFileRepository;
    private admissionTypeRepository: AdmissionTypeRepository;

    constructor() {
        this.repository = new CaseFileRepository();
        this.admissionTypeRepository = new AdmissionTypeRepository();
    }
    */

    /**
     * Get all case files with pagination and filtering
     */
    static async getAllCaseFiles(options?: {
        page?: number;
        limit?: number;
        patient_id?: string;
        admission_type_id?: string;
        case_status?: CaseStatus;
        status_flow?: CaseStatusFlow;
        from_date?: Date;
        to_date?: Date;
    }): Promise<{ cases: CaseFileListResponse[]; total: number; page: number; totalPages: number }> {
        const result = await CaseFileRepository.findAll(options);
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const totalPages = Math.ceil(result.total / limit);

        return {
            cases: result.cases.map(caseFile => CaseFileService.toListResponse(caseFile)),
            total: result.total,
            page,
            totalPages
        };
    }

    /**
     * Get case file by ID
     */
    static async getCaseFileById(id: string): Promise<CaseFileResponse> {
        const caseFile = await CaseFileRepository.findById(id);

        if (!caseFile) {
            throw new Error(`Case file with ID ${id} not found`);
        }

        return CaseFileService.toResponse(caseFile);
    }

    /**
     * Get case file by case number
     */
    static async getCaseFileByCaseNumber(caseNumber: string): Promise<CaseFileResponse> {
        const caseFile = await CaseFileRepository.findByCaseNumber(caseNumber);

        if (!caseFile) {
            throw new Error(`Case file with case number ${caseNumber} not found`);
        }

        return CaseFileService.toResponse(caseFile);
    }

    /**
     * Create new case file with business rules validation
     */
    static async createCaseFile(data: CreateCaseFileRequest, createdBy?: string): Promise<CaseFileResponse> {
        // 1. Validate patient exists
        const patient = await PatientRepository.findById(data.patient_id);
        if (!patient) {
            throw new Error(`Patient with ID ${data.patient_id} not found`);
        }

        // 2. Load admission type rules
        const admissionType = await AdmissionTypeRepository.findById(data.admission_type_id);
        if (!admissionType) {
            throw new Error(`Admission type with ID ${data.admission_type_id} not found`);
        }

        if (!admissionType.is_active) {
            throw new Error(`Admission type "${admissionType.name}" is not active`);
        }

        // 3. Validate business rules
        const validationResults = CaseFileValidator.validateCaseCreation(data, admissionType);
        console.log("Validation results:", validationResults);

        if (CaseFileValidator.hasErrors(validationResults)) {
            const errors = CaseFileValidator.getErrorMessages(validationResults);
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        // Log warnings if any
        const warnings = CaseFileValidator.getWarningMessages(validationResults);
        if (warnings.length > 0) {
            console.warn('Case creation warnings:', warnings);
        }

        // 4. Generate unique case number
        const caseNumber = await CaseFileRepository.generateCaseNumber(data.admission_type_id);

        // 5. Create case file record
        const caseFile = await CaseFileRepository.create({
            patient_id: data.patient_id,
            admission_type_id: data.admission_type_id,
            case_number: caseNumber,
            chief_complaint: data.chief_complaint,
            ...(data.initial_diagnosis !== undefined && { initial_diagnosis: data.initial_diagnosis }),
            ...(data.shift_type !== undefined && { shift_type: data.shift_type }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.is_transfer !== undefined && { is_transfer: data.is_transfer }),
            ...(data.transfer_from_case_id !== undefined && { transfer_from_case_id: data.transfer_from_case_id }),
            ...(createdBy !== undefined && { created_by: createdBy })
        });

        // 6. Create related records if needed
        try {
            // Create room assignment if provided
            if (data.room_id) {
                await models.case_rooms.create({
                    case_file_id: caseFile.id,
                    room_id: data.room_id,
                    check_in: new Date(),
                    daily_rate: 0
                });
            }

            // Create package assignment if provided
            if (data.package_id && data.doctor_id) {
                // Get package details to determine price
                const pkg = await CaseFileService.getPackageDetails(data.package_id, data.doctor_id);

                await models.case_package_assignments.create({
                    case_file_id: caseFile.id,
                    package_id: data.package_id,
                    doctor_id: data.doctor_id,
                    doctor_type_used: pkg.doctor_type,
                    price_applied: pkg.price,
                    assigned_date: new Date()
                });
            }

            // 7. Create initial timeline entry
            await models.case_timeline.create({
                case_file_id: caseFile.id,
                stage: 'Case Created',
                started_at: new Date(),
                status_flow: CaseStatusFlow.C1_CREACION,
                notes: `Case created with admission type: ${admissionType.name}`,
                shift_type: caseFile.shift_type,
                ...(createdBy !== undefined && { created_by: createdBy })
            });

            // 8. Create initial status history entry
            await models.case_status_history.create({
                case_file_id: caseFile.id,
                from_status: CaseStatusFlow.C1_CREACION,
                to_status: CaseStatusFlow.C1_CREACION,
                transition_date: new Date(),
                reason: 'Initial case creation',
                ...(createdBy !== undefined && { performed_by: createdBy })
            });

        } catch (error) {
            // If related records fail, we should rollback the case file creation
            // TODO: Implement transaction support
            console.error('Error creating related records:', error);
            throw new Error(`Failed to create case file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // 9. Return complete case file with relations
        const createdCase = await CaseFileRepository.findById(caseFile.id);
        if (!createdCase) {
            throw new Error('Failed to retrieve created case file');
        }

        return CaseFileService.toResponse(createdCase);
    }

    /**
     * Update case file
     */
    static async updateCaseFile(id: string, data: UpdateCaseFileRequest): Promise<CaseFileResponse> {
        // Load existing case
        const existingCase = await CaseFileRepository.findById(id);
        if (!existingCase) {
            throw new Error(`Case file with ID ${id} not found`);
        }

        // If status is being changed, validate transition
        if (data.current_status_flow && data.current_status_flow !== existingCase.current_status_flow) {
            if (!existingCase.admissionType) {
                throw new Error('Cannot validate status transition: admission type not loaded');
            }

            const validation = CaseFileValidator.validateStatusTransition(
                existingCase.admissionType,
                existingCase.current_status_flow as CaseStatusFlow,
                data.current_status_flow,
                false // TODO: Check payment status
            );

            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Create status history entry
            await models.case_status_history.create({
                case_file_id: id,
                from_status: existingCase.current_status_flow as CaseStatusFlow,
                to_status: data.current_status_flow,
                transition_date: new Date(),
                reason: 'Status updated via API'
            });
        }

        // Update case file
        await CaseFileRepository.update(id, data);

        // Return updated case
        const updatedCase = await CaseFileRepository.findById(id);
        if (!updatedCase) {
            throw new Error('Failed to retrieve updated case file');
        }

        return CaseFileService.toResponse(updatedCase);
    }

    /**
     * Update case status only
     */
    static async updateCaseStatus(id: string, data: UpdateCaseStatusRequest, performedBy?: string): Promise<CaseFileResponse> {
        // Load existing case
        const existingCase = await CaseFileRepository.findById(id);
        if (!existingCase) {
            throw new Error(`Case file with ID ${id} not found`);
        }

        if (!existingCase.admissionType) {
            throw new Error('Cannot validate status transition: admission type not loaded');
        }

        // Validate status transition
        const validation = CaseFileValidator.validateStatusTransition(
            existingCase.admissionType,
            existingCase.current_status_flow as CaseStatusFlow,
            data.status,
            false // TODO: Check payment status
        );

        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Log warnings
        if (validation.message) {
            console.warn('Status transition warning:', validation.message);
        }

        // Update status
        await CaseFileRepository.update(id, {
            current_status_flow: data.status
        });

        // Create status history entry
        await models.case_status_history.create({
            case_file_id: id,
            from_status: existingCase.current_status_flow as CaseStatusFlow,
            to_status: data.status,
            transition_date: new Date(),
            reason: data.reason || 'Status updated',
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(performedBy !== undefined && { performed_by: performedBy })
        });

        // Create timeline entry for significant status changes
        if (CaseFileService.isSignificantStatusChange(data.status)) {
            await models.case_timeline.create({
                case_file_id: id,
                stage: CaseFileService.getStageNameForStatus(data.status),
                started_at: new Date(),
                status_flow: data.status,
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(performedBy !== undefined && { created_by: performedBy })
            });
        }

        // Return updated case
        const updatedCase = await CaseFileRepository.findById(id);
        if (!updatedCase) {
            throw new Error('Failed to retrieve updated case file');
        }

        return this.toResponse(updatedCase);
    }

    /**
     * Delete case file
     */
    static async deleteCaseFile(id: string): Promise<void> {
        try {
            await CaseFileRepository.delete(id);
        } catch (error) {
            throw new Error(`Failed to delete case file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate case compliance
     */
    static async validateCaseCompliance(id: string): Promise<CaseValidationResponse> {
        const validation = await CaseFileRepository.validateCompliance(id);

        if (!validation) {
            throw new Error(`Case file with ID ${id} not found`);
        }

        return validation;
    }

    /**
     * Check if case can be transferred
     */
    static async canTransferCase(id: string): Promise<{ allowed: boolean; reason?: string }> {
        const caseFile = await CaseFileRepository.findById(id);

        if (!caseFile) {
            return { allowed: false, reason: 'Case file not found' };
        }

        if (!caseFile.admissionType) {
            return { allowed: false, reason: 'Admission type not loaded' };
        }

        if (!caseFile.admissionType.allows_transfer) {
            return {
                allowed: false,
                reason: `Admission type "${caseFile.admissionType.name}" does not allow transfers`
            };
        }

        // Check if case is in a transferable status
        const transferableStatuses = [
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

    /**
     * Check if case can be closed
     */
    static async canCloseCase(id: string): Promise<{ allowed: boolean; reason?: string }> {
        const caseFile = await CaseFileRepository.findById(id);

        if (!caseFile) {
            return { allowed: false, reason: 'Case file not found' };
        }

        if (!caseFile.admissionType) {
            return { allowed: false, reason: 'Admission type not loaded' };
        }

        // Check payment requirement
        if (caseFile.admissionType.requires_immediate_payment) {
            // TODO: Check billing.invoices when available
            console.warn('Payment validation skipped: billing module not integrated');
            return {
                allowed: true,
                reason: 'Payment validation pending (billing module not integrated)'
            };
        }

        return { allowed: true };
    }

    /**
     * Helper: Get package details including price based on doctor type
     */
    static async getPackageDetails(packageId: string, doctorId: string): Promise<{
        doctor_type: 'internal' | 'external';
        price: number;
    }> {
        // TODO: Implement proper package and doctor lookup
        // For now, return default values
        return {
            doctor_type: 'internal',
            price: 0
        };
    }

    /**
     * Helper: Check if status change is significant enough for timeline entry
     */
    private static isSignificantStatusChange(status: CaseStatusFlow): boolean {
        const significantStatuses = [
            CaseStatusFlow.C3_CERRADO,
            CaseStatusFlow.C2_CANCELACION,
            CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO,
            CaseStatusFlow.RA_REAPERTURA
        ];

        return significantStatuses.includes(status);
    }

    /**
     * Helper: Get human-readable stage name for status
     */
    private static getStageNameForStatus(status: CaseStatusFlow): string {
        const stageNames: Record<CaseStatusFlow, string> = {
            [CaseStatusFlow.C1_CREACION]: 'Case Created',
            [CaseStatusFlow.C2_CANCELACION]: 'Case Cancelled',
            [CaseStatusFlow.C3_CERRADO]: 'Case Closed',
            [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]: 'Charges Applied',
            [CaseStatusFlow.CC_CONFIRMACION_CARGOS]: 'Charges Confirmed',
            [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]: 'Case Transferred',
            [CaseStatusFlow.RA_REAPERTURA]: 'Case Reopened',
            [CaseStatusFlow.EX_EXTORNO]: 'Case Reversed'
        };

        return stageNames[status] || status;
    }

    /**
     * Convert database model to list response DTO
     */
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
            ...(caseFile.total_cost !== null && caseFile.total_cost !== undefined && {
                total_cost: parseFloat(caseFile.total_cost.toString())
            })
        };
    }

    /**
     * Convert database model to response DTO
     */
    private static toResponse(caseFile: case_files): CaseFileResponse {
        return {
            id: caseFile.id,
            case_number: caseFile.case_number,
            patient_id: caseFile.patient_id,
            admission_date: caseFile.admission_date,
            ...(caseFile.discharge_date ? { discharge_date: caseFile.discharge_date } : {}),
            admission_type: caseFile.admission_type,
            chief_complaint: caseFile.chief_complaint,
            ...(caseFile.initial_diagnosis ? { initial_diagnosis: caseFile.initial_diagnosis } : {}),
            ...(caseFile.final_diagnosis ? { final_diagnosis: caseFile.final_diagnosis } : {}),
            case_status: caseFile.case_status as CaseStatus,
            ...(caseFile.total_cost !== null && caseFile.total_cost !== undefined && { total_cost: parseFloat(caseFile.total_cost.toString()) }),
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
                    room_number: cr.room?.room_number || 'Unknown',
                    room_type: cr.room?.room_type || 'Unknown',
                    check_in_date: cr.check_in,
                    ...(cr.check_out ? { check_out_date: cr.check_out } : {})
                }))
            }),
            ...(caseFile.case_package_assignments && {
                packages: caseFile.case_package_assignments.map((pa) => ({
                    id: pa.id,
                    package_name: pa.package?.name || 'Unknown',
                    doctor_name: 'Doctor', // TODO: Get doctor name from relation
                    price_applied: parseFloat(pa.price_applied.toString())
                }))
            })
        };
    }
}
