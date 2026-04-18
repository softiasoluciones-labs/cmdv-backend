import { NextFunction } from 'express';
import { UserRepository } from '../api/v1/repositories/core-repositories/user.repository';

export const requireRole = (...roles: string[]) => {
    return async (req: any, res: any, next: NextFunction) => {
        const user = await UserRepository.findById(req.user!.userId);
        if (!user || !roles.includes(user.role)) { 
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next(); 
    };
};
