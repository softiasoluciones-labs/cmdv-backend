import { Request, Response } from 'express';
import { CaseProductService } from '../../services/medical-services/case-product.service';

export class CaseProductController {
  constructor(private readonly service: CaseProductService) {}

  getProductsByCaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.getProductsByCaseFile(caseFileId);
      res.json({ success: true, code: 200, message: 'Case products retrieved successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  applyProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const appliedBy = (req as any).user?.userId;
      const data = await this.service.applyProduct(caseFileId, req.body, appliedBy);
      res.status(201).json({ success: true, code: 201, message: 'Product applied to case file successfully', data });
    } catch (error) {
      const code = error instanceof Error &&
        (error.message.includes('not found') || error.message.includes('Insufficient') || error.message.includes('not active'))
        ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  voidProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const voidedBy = (req as any).user?.userId;
      if (!voidedBy) {
        res.status(401).json({ success: false, code: 401, message: 'Authentication required' });
        return;
      }
      const data = await this.service.voidProduct(id, req.body, voidedBy);
      res.json({ success: true, code: 200, message: 'Product charge voided successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 :
        error instanceof Error && error.message.includes('already voided') ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  getBillingSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.getBillingSummary(caseFileId);
      res.json({ success: true, code: 200, message: 'Billing summary retrieved successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };
}
