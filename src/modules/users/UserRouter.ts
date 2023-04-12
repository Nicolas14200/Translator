import {express, jwt} from '../../index';
import {isEmail} from './function';
import {hash, compare} from './PassCrypt';
import { jwt_key} from '../../DotenvVar';

interface User {
    email    : string;
    password : string;
    pseudo   : string;
}
const userMap : Map<string, User> = new Map();

// ENDPOINT
const UserRouter : express.Router = express.Router();

UserRouter.get('/', (req:express.Request,res:express.Response) => {
    const iter : IterableIterator<string> = userMap.keys();
    let arr :string[] = []
    for (const value of iter) {
        arr.push(value)
    }
    return res.status(200).send(arr);
});
UserRouter.delete('/', async (req:express.Request,res:express.Response) => {
    const email    : string         = req.body.email;
    const password : string         = req.body.password;
    const user     : User|undefined = userMap.get(email);
    if (user){
        await compare(password,user.password).then((r:boolean)=>{
            if (!r){
                return res.status(400).send("email or pass no valid");
            }
            userMap.delete(email);
            return res.status(200).send("delete ok");
        })
    }else{
        return res.status(400).send("user ?")
    }
});
UserRouter.post('/signup', async (req: express.Request,res: express.Response) => {
    const email    : string = req.body.email;
    const password : string = req.body.password;
    let passHash   : string = "";
    let pseudo     : string = req.body.pseudo;
    if (password.length >= 16){
        await hash(password).then((passH:string)=>{
            return passHash=passH;
        });
    }
    if (isEmail(email) && passHash ){
        const user : User = {
            email    : email,
            password : passHash,
            pseudo   : pseudo
        }
        const userExist : User|undefined = userMap.get(email);
        if (!userExist){
            userMap.set(req.body.email,user);
            //console.log(userMap);
            return res.status(200).send(user);
        }
    }
    return res.status(400).send("bad email or password")
    
});
UserRouter.post('/signin', async(req: express.Request,res: express.Response) => {
    const email    : string         = req.body.email;
    const password : string         = req.body.password;
    const user     : User|undefined = userMap.get(email);
    if (user){
        await compare(password,user.password).then((r:boolean)=>{
            if (!r){
                return res.status(400).send("email no valid");
            }
            const token = jwt.sign({ user }, jwt_key);
            return res.status(200).send({...user, token});
        })
    }else{
        return res.status(400).send("email no valid");
    }
});
UserRouter.post('/emailvalid', (req: express.Request,res: express.Response) => {
    const email : string = req.body.email;
    if (isEmail(email)){
        return  res.status(200).send("email valid");
    }
    return  res.status(400).send("email no valid");
});
UserRouter.put('/',async (req: express.Request,res: express.Response)=>{
    const email       : string         = req.body.email;
    const userActif   : User|undefined = userMap.get(email);
    const newPassword : string         = req.body.newPassword;
    const newPseudo   : string         = req.body.newPseudo;
    let passHash      : string         = "";
    let passVerify    : boolean        = false;
    try{
        if (userActif){
            await compare(req.body.password,userActif.password).then((result:boolean) => {
                if (!result){
                    return res.status(400).send("email or user no valid");
                }
                passVerify = true;
            })
            if (passVerify){
                if (newPassword.length >= 16){
                    await hash(newPassword).then((passH:string) => {
                        return passHash=passH;
                    });
                }
                const user : User = {
                    email    : email,
                    password : passHash,
                    pseudo   : newPseudo
                }
                userMap.set(req.body.email,user)
                return res.status(200).send(user);
            } 
        }else{
            return res.status(400).send("inconnu");
        }
        
    }catch(e){
        return res.status(400).send(e);
    }
});
export {UserRouter, userMap};