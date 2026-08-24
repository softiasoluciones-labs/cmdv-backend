import { CasePackageAssignmentRepository } from '../../repositories/medical-repositories/case-package-assignment.repository';
import {
  ApplyCasePackageAssignmentRequest,
  VoidCasePackageAssignmentRequest,
  CasePackageAssignmentResponse
} from '../../dtos/medical-dtos/case-package-assignment.dto';
import { case_package_assignments } from '../../../../database/medical/case_package_assignments';

export class CasePackageAssignmentService {
  constructor(private readonly repo: CasePackageAssignmentRepository) {}

  async getPackageAssignmentsByCaseFile(caseFileId: string): Promise<CasePackageAssignmentResponse[]> {
    const records = await this.repo.findByCaseFile(caseFileId);
    return records.map(CasePackageAssignmentService.toResponse);
  }

  async applyPackageAssignment(
    caseFileId: string,
    data: ApplyCasePackageAssignmentRequest,
    assignedBy?: string
  ): Promise<CasePackageAssignmentResponse> {
    const record = await this.repo.applyPackageAssignment({
      case_file_id: caseFileId,
      package_id: data.package_id,
      doctor_id: data.doctor_id,
      doctor_type_used: data.doctor_type_used,
      ...(assignedBy !== undefined && { assigned_by: assignedBy }),
      ...(data.notes !== undefined && { notes: data.notes })
    });

    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve applied package');
    return CasePackageAssignmentService.toResponse(full);
  }

  async voidPackageAssignment(
    id: string,
    data: VoidCasePackageAssignmentRequest,
    voidedBy: string
  ): Promise<CasePackageAssignmentResponse> {
    if (!data.void_reason?.trim()) throw new Error('A void reason is required');

    const record = await this.repo.voidPackageAssignment(id, voidedBy, data.void_reason);
    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve voided package assignment');
    return CasePackageAssignmentService.toResponse(full);
  }

  private static toResponse(pa: case_package_assignments): CasePackageAssignmentResponse {
    return {
      id: pa.id,
      case_file_id: pa.case_file_id,
      package_id: pa.package_id,
      package_name: (pa as any).package?.name ?? 'Unknown',
      doctor_id: pa.doctor_id,
      ...((pa as any).doctor?.user?.full_name && { doctor_name: (pa as any).doctor.user.full_name }),
      doctor_type_used: pa.doctor_type_used,
      price_applied: Number(pa.price_applied),
      assigned_date: pa.assigned_date!,
      ...(pa.assigned_by !== undefined && { assigned_by: pa.assigned_by }),
      ...(pa.notes !== undefined && { notes: pa.notes }),
      is_voided: pa.is_voided ?? false,
      ...(pa.voided_by !== undefined && { voided_by: pa.voided_by }),
      ...(pa.voided_at !== undefined && { voided_at: pa.voided_at }),
      ...(pa.void_reason !== undefined && { void_reason: pa.void_reason })
    };
  }
}
