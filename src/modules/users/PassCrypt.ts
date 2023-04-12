import { PasswordCrypt } from "password-crypt";

const pCrypt  = new PasswordCrypt();
const hash    = (pwd: string) => pCrypt.hash(pwd);
const compare = (pwd: string, hash: string) => pCrypt.compare(pwd, hash);

export{hash, compare};