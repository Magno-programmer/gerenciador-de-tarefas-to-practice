import jwt from 'jsonwebtoken';
import { config } from '../config';

export const TokenService = {
    signAccessToken(userId: number) {
        return jwt.sign(
            { sub: String(userId) },
            config.jwtSecret,
            { expiresIn: '15m', issuer: 'task-api', audience: 'task-dashboard' }
        );
    }
};
