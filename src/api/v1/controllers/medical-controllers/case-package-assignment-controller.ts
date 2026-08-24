import { Request, Response } from 'express';
import { CasePackageAssignmentService } from '../../services/medical-services/case-package-assignment.service';

export class CasePackageAssignmentController {
  constructor(private readonly service: CasePackageAssignmentService) {}

  getPackageAssignmentsByCaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.getPackageAssignmentsByCaseFile(caseFileId);
      res.json({ success: true, code: 200, message: 'Case package assignments retrieved successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  applyPackageAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const assignedBy = (req as any).user?.userId;
      const data = await this.service.applyPackageAssignment(caseFileId, req.body, assignedBy);
      res.status(201).json({ success: true, code: 201, message: 'Package assigned to case file successfully', data });
    } catch (error) {
      const code = error instanceof Error &&
        (error.message.includes('not found') || error.message.includes('not active') || error.message.includes('already been assigned'))
        ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  voidPackageAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const voidedBy = (req as any).user?.userId;
      if (!voidedBy) {
        res.status(401).json({ success: false, code: 401, message: 'Authentication required' });
        return;
      }
      const data = await this.service.voidPackageAssignment(id, req.body, voidedBy);
      res.json({ success: true, code: 200, message: 'Package assignment voided successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 :
        error instanceof Error && error.message.includes('already voided') ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };
}
