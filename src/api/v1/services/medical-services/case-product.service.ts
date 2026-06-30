import { CaseProductRepository } from '../../repositories/medical-repositories/case-product.repository';
import {
  ApplyCaseProductRequest,
  VoidCaseProductRequest,
  CaseProductResponse,
  BillingSummaryResponse
} from '../../dtos/medical-dtos/case-product.dto';
import { case_products } from '../../../../database/medical/case_products';

export class CaseProductService {
  constructor(private readonly repo: CaseProductRepository) {}

  async getProductsByCaseFile(caseFileId: string): Promise<CaseProductResponse[]> {
    const records = await this.repo.findByCaseFile(caseFileId);
    return records.map(CaseProductService.toResponse);
  }

  async applyProduct(
    caseFileId: string,
    data: ApplyCaseProductRequest,
    appliedBy?: string
  ): Promise<CaseProductResponse> {
    if (data.quantity <= 0) throw new Error('Quantity must be greater than zero');

    const record = await this.repo.applyProduct({
      case_file_id: caseFileId,
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      quantity: data.quantity,
      ...(appliedBy !== undefined && { applied_by: appliedBy }),
      ...(data.notes !== undefined && { notes: data.notes })
    });

    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve applied product');
    return CaseProductService.toResponse(full);
  }

  async voidProduct(
    id: string,
    data: VoidCaseProductRequest,
    voidedBy: string
  ): Promise<CaseProductResponse> {
    if (!data.void_reason?.trim()) throw new Error('A void reason is required');

    const record = await this.repo.voidProduct(id, voidedBy, data.void_reason);
    const full = await this.repo.findById(record.id);
    if (!full) throw new Error('Failed to retrieve voided product');
    return CaseProductService.toResponse(full);
  }

  async getBillingSummary(caseFileId: string): Promise<BillingSummaryResponse> {
    return this.repo.getBillingSummary(caseFileId);
  }

  private static toResponse(cp: case_products): CaseProductResponse {
    return {
      id: cp.id,
      case_file_id: cp.case_file_id,
      product_id: cp.product_id,
      product_name: (cp as any).product?.name ?? 'Unknown',
      product_code: (cp as any).product?.code ?? '',
      unit_of_measure: (cp as any).product?.unit_of_measure ?? '',
      warehouse_id: cp.warehouse_id,
      warehouse_name: (cp as any).warehouse?.name ?? 'Unknown',
      quantity: cp.quantity,
      unit_price: Number(cp.unit_price),
      total_price: Number(cp.total_price),
      applied_at: cp.applied_at!,
      is_voided: cp.is_voided ?? false,
      ...(cp.applied_by !== undefined && { applied_by: cp.applied_by }),
      ...(cp.notes !== undefined && { notes: cp.notes }),
      ...(cp.voided_by !== undefined && { voided_by: cp.voided_by }),
      ...(cp.voided_at !== undefined && { voided_at: cp.voided_at }),
      ...(cp.void_reason !== undefined && { void_reason: cp.void_reason })
    };
  }
}
