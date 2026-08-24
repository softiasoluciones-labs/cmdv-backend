import { CaseServiceRepository } from '../../repositories/medical-repositories/case-service.repository';
import {
  ApplyCaseServiceRequest,
  VoidCaseServiceRequest,
  CaseServiceResponse
} from '../../dtos/medical-dtos/case-service.dto';
import { case_services } from '../../../../database/medical/case_services';

export class CaseServiceService {
  constructor(private readonly repo: CaseServiceRepository) {}

  async getServicesByCaseFile(caseFileId: string): Promise<CaseServiceResponse[]> {
    const records = await this.repo.findByCaseFile(caseFileId);
    return records.map(CaseServiceService.toResponse);
  }

  async applyService(
    caseFileId: string,
    data: ApplyCaseServiceRequest,
    appliedBy?: string
  ): Promise<CaseServiceResponse> {
    if (data.quantity !== undefined && data.quantity <= 0) throw new Error('Quantity must be greater than zero');

    const record = await this.repo.applyService({
      case_file_id: caseFileId,
      service_id: data.service_id,
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.doctor_id !== undefined && { doctor_id: data.doctor_id }),
      ...(appliedBy !== undefined && { applied_by: appliedBy }),
      ...(data.notes !== undefined && { notes: data.notes })
    });

    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve applied service');
    return CaseServiceService.toResponse(full);
  }

  async voidService(
    id: string,
    data: VoidCaseServiceRequest,
    voidedBy: string
  ): Promise<CaseServiceResponse> {
    if (!data.void_reason?.trim()) throw new Error('A void reason is required');

    const record = await this.repo.voidService(id, voidedBy, data.void_reason);
    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve voided service');
    return CaseServiceService.toResponse(full);
  }

  private static toResponse(cs: case_services): CaseServiceResponse {
    return {
      id: cs.id,
      case_file_id: cs.case_file_id,
      service_id: cs.service_id,
      service_name: (cs as any).service?.name ?? 'Unknown',
      service_code: (cs as any).service?.code ?? '',
      is_consultation: (cs as any).service?.use_doctor_consultation_fee ?? false,
      ...(cs.doctor_id !== undefined && { doctor_id: cs.doctor_id }),
      ...((cs as any).doctor?.user?.full_name && { doctor_name: (cs as any).doctor.user.full_name }),
      quantity: cs.quantity ?? 1,
      unit_price: Number(cs.unit_price),
      total_price: Number(cs.total_price),
      applied_at: cs.applied_at!,
      is_voided: cs.is_voided ?? false,
      ...(cs.applied_by !== undefined && { applied_by: cs.applied_by }),
      ...(cs.notes !== undefined && { notes: cs.notes }),
      ...(cs.voided_by !== undefined && { voided_by: cs.voided_by }),
      ...(cs.voided_at !== undefined && { voided_at: cs.voided_at }),
      ...(cs.void_reason !== undefined && { void_reason: cs.void_reason })
    };
  }
}
