import { UserRepository } from "../repositories/UserRepository";
import { Password } from "../utils/Password";
import { TokenService } from "../utils/TokenService";

export class ConflictError extends Error {status = 409}
export class UnauthorizedError extends Error {status = 401}

export class AuthService {
    
    constructor(private users = new UserRepository()) {}
    
    async register(input: {name: string; email: string; password: string}) {
        let { name, email, password } = input;
        name = name.trim();
        email = email.toLowerCase().trim();

        if (await this.users.findUserByEmail(email)) {
            throw new ConflictError('Email já cadastrado');
        }

        const password_hash = await Password.hash(password);
        return this.users.createUser(name, email, password_hash);
    }

    async login (input: {email: string; password: string}){
        let { email, password } = input;
        email = email.toLowerCase().trim();

        const user = await this.users.findUserByEmail(email);
        const ok = await Password.compare(password, user?.password_hash ?? Password.DUMMY_HASH);
        if (!user || !ok) {
            throw new UnauthorizedError('Email ou senha inválidos');
        }

        const token = TokenService.signAccessToken(user.id);
        return { token };
    }
}