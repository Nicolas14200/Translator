import * as jwt from 'jsonwebtoken';
function isEmail(email:string):boolean {
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailFormat.test(email);
}
function whoIsToken(token : string, key: string){
    jwt.verify(token, key, function(err, decoded) {
        return decoded;
    });
};
function tokenGetMail(token: string, jwt_key:string): string {
    const decoded = <jwt.JwtPayload>jwt.verify(token, jwt_key);
    return decoded.user.email;
  }
export {isEmail, whoIsToken, tokenGetMail};