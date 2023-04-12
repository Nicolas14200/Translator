import {express} from '../../index';
import * as axios from 'axios';
import {weather_key} from '../../DotenvVar';
const WeatherMap : Map<any, any> = new Map();
// ENDPOINT
const WeatherRouter : express.Router = express.Router();
WeatherRouter.get('/',async (req: express.Request, res: express.Response)=>{
    const weatherTown = WeatherMap.get(req.body.town);
    if (!weatherTown){
        const url : string = `http://api.weatherapi.com/v1/current.json?key=${weather_key}&q=${req.body.town}&aqi=no`;
        await axios.get(url).then((r)=>{
            WeatherMap.set(req.body.town,r.data);
            return res.status(200).send(r.data);
        }).catch((e)=>{
            return res.status(400).send(e);
        })
    }
    return res.status(200).send(weatherTown)
});
export {WeatherRouter};