import {compareSync, genSaltSync, hashSync} from 'bcrypt';


const SALT_ROUNDS = 10;

export const bcryptAdapter = {

    hash: (password: string) => {
        const salt = genSaltSync(SALT_ROUNDS);
        return hashSync(password, salt);
    },

    compare: (password: string, hashed: string) => {
        return compareSync(password, hashed);
    }

}