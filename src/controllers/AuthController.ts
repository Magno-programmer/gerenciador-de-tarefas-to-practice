import { Request, Response } from 'express';
import { validate } from '../validators/Validate';
import { AuthService, ConflictError, UnauthorizedError } from '../service/AuthService';

export class AuthController {
    constructor(private service = new AuthService()) {}


    register = async (request: Request, response: Response) => {
        try {
            const { name, email, password } = request.body ?? {};
            const user = await this.service.register({ name, email, password });
            return response.status(201).json(user);
        } catch (err: any) {
            if (err instanceof ConflictError) return response.status(err.status).json({ error: err.message});
            console.error('register error', err)
            return response.status(500).json({ error: 'erro interno'});
        }
    }

    login = async (request: Request, response: Response) => {
        try{
            const { email, password } = request.body ?? {};
            const { token } = await this.service.login ({ email, password });
            return response.json({ token });
        } catch (err: any) {
            if (err instanceof UnauthorizedError)
                return response.status(err.status).json({ error: err.message });
            console.error('login error', err);
            return response.status(500).json({ error: 'erro interno' });
        }
    }
}