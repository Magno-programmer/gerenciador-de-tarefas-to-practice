import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationError} from 'express-validator';

type Out = { field: string, msg: string };

function format(erro: ValidationError): Out[] {
    if ('nestedErrors' in erro) {
        return erro.nestedErrors.flatMap(this.format);
    }
    const field = ('path' in erro && erro.path) || (('param' in erro && (erro as any).param) as string | undefined) || erro.type || 'unknown';
    return [{ field, msg: String(erro.msg) }]; 
}

export function validate(request: Request, response: Response, next: NextFunction) {
    const result = validationResult(request);
    if (result.isEmpty()) return next();

    const details = result.array().flatMap(format);
    return response.status(400).json({ error: validationResult, details})
}
