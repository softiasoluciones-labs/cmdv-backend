import { Request, Response } from 'express';
import { CaseRoomService } from '../../services/medical-services/case-room.service';

export class CaseRoomController {
  constructor(private readonly service: CaseRoomService) {}

  getRoomsByCaseFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.getRoomsByCaseFile(caseFileId);
      res.json({ success: true, code: 200, message: 'Case rooms retrieved successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  applyRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const caseFileId = req.params['caseFileId'] as string;
      const data = await this.service.applyRoom(caseFileId, req.body);
      res.status(201).json({ success: true, code: 201, message: 'Room applied to case file successfully', data });
    } catch (error) {
      const code = error instanceof Error && (error.message.includes('not found') || error.message.includes('not active'))
        ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  voidRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const voidedBy = (req as any).user?.userId;
      if (!voidedBy) {
        res.status(401).json({ success: false, code: 401, message: 'Authentication required' });
        return;
      }
      const data = await this.service.voidRoom(id, req.body, voidedBy);
      res.json({ success: true, code: 200, message: 'Room charge voided successfully', data });
    } catch (error) {
      const code = error instanceof Error && error.message.includes('not found') ? 404 :
        error instanceof Error && error.message.includes('already voided') ? 422 : 500;
      res.status(code).json({ success: false, code, message: error instanceof Error ? error.message : 'Internal server error' });
    }
  };
}
