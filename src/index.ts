import * as express from 'express';
import {port, jwt_key} from './DotenvVar';
import * as jwt from 'jsonwebtoken';
import {UserRouter} from './modules/users/UserRouter';
import {WeatherRouter} from './modules/weather/WeatherRouter';
import {TranslateRouter} from './modules/translate/TranslateRouter';

const app : express.Application = express();

// ENDPOINT
app.use(express.json());

app.get( "/", ( req:express.Request, res:express.Response ) => {
    return res.status(200).send( "Hello world!" );
} );
// USER
app.use('/user', UserRouter);
// MIDDLE WARE
app.use(function (req:express.Request, res:express.Response, next:any): void {
    const token: string = req.header('access_key')!;
    jwt.verify(token, jwt_key, (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if (err) {
            return res.status(404).send(err);
        }
        return next();
    });
});
// WEATHER
app.use('/weather', WeatherRouter);
// TRANSLATE
app.use('/translate',TranslateRouter);
// LISTEN
app.listen( port, ():void => {
    console.log( `server started at http://localhost:${ port }` );
});
// EXPORT
export {express, jwt};