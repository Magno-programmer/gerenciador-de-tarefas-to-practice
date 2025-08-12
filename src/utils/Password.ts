import bcrypt from 'bcryptjs';

const COST = 12; //custo recomendado 

export const Password = {
    hash(plain: string) {
        return bcrypt.hash(plain, COST);
    },
    compare(plain: string, hash: string) {
        return bcrypt.compare(plain, hash);
    },
    // mitica timing/user-enumeration quando não existencia do usuário
    DUMMY_HASH: bcrypt.hashSync('dummy-password', COST),

} as const;
