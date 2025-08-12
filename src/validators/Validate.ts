import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationError} from 'express-validator';

type Out = { field: string, msg: string };

function formatTask(err: ValidationError): { field: string; msg: string }[] {
  if ('nestedErrors' in err) return (err.nestedErrors as ValidationError[]).flatMap(formatTask);
  const field = ('path' in err && err.path) || (('param' in err && (err as any).param) as string) || err.type || 'unknown';
  return [{ field, msg: String(err.msg) }];
}

export function validateTask(req: any, res: any, next: any) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().flatMap(formatTask);
  return res.status(400).json({ error: 'validation', details });
}

function format(erro: ValidationError): Out[] {
    if ('nestedErrors' in erro) {
        return (erro.nestedErrors as ValidationError[]).flatMap(format);
    }
    const field = ('path' in erro && erro.path) || (('param' in erro && (erro as any).param) as string | undefined) || erro.type || 'unknown';
    return [{ field, msg: String(erro.msg) }]; 
}

export function validate(request: Request, response: Response, next: NextFunction) {
    const result = validationResult(request);
    if (result.isEmpty()) return next();

    const details = result.array().flatMap(format);
    return response.status(400).json({ error: 'validation', details})
}
