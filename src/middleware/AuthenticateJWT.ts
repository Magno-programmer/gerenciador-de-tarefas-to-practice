import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

declare global {
    namespace Express{
        interface Request { user?: { id: number }; }
    }
}

export function authenticateJWT(request: Request, response: Response, next: NextFunction) {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) return response.status(401).json({ error: 'Token ausente' });

    const token = header.slice(7);
    try { 
        const payload = jwt.verify(token, config. jwtSecret) as { sub?: string};
        const id= Number(payload.sub);
        if (!id) return response.status(401).json({ error: 'Token inválido'});
        request.user = { id };
        next();
    } catch {
        return response.status(401).json({ error: 'Token inválido' });
    }
}
