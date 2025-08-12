import { body } from 'express-validator';

export const registerRules = [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 8, max: 128 })
];

export const loginRules = [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 8, max: 128 })
];