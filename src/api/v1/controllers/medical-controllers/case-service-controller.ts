import { Request, Response } from 'express';
import { CaseServiceService } from '../../services/medical-services/case-service.service';

export class CaseServiceController {
  constructor(private readonly service: CaseServiceService) {}

  getServicesByCaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.getServicesByCaseFile(caseFileId);
      res.json({ success: true, code: 200, message: 'Case services retrieved successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  applyService = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const appliedBy = (req as any).user?.userId;
      const data = await this.service.applyService(caseFileId, req.body, appliedBy);
      res.status(201).json({ success: true, code: 201, message: 'Service applied to case file successfully', data });
    } catch (error) {
      const code = error instanceof Error &&
        (error.message.includes('not found') || error.message.includes('not active') || error.message.includes('is required') || error.message.includes('greater than zero'))
        ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  voidService = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const voidedBy = (req as any).user?.userId;
      if (!voidedBy) {
        res.status(401).json({ success: false, code: 401, message: 'Authentication required' });
        return;
      }
      const data = await this.service.voidService(id, req.body, voidedBy);
      res.json({ success: true, code: 200, message: 'Service charge voided successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 :
        error instanceof Error && error.message.includes('already voided') ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };
}
