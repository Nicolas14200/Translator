import * as dotenv from "ts-dotenv";
const env = dotenv.load({
  PORT: String,
  JWT_KEY: String,
  WEATHER_KEY: String,
  DEEPL_KEY: String,
});
const deepl_authKey: string = env.DEEPL_KEY;
const jwt_key: string = env.JWT_KEY;
const port: string = env.PORT;
const weather_key: string = env.WEATHER_KEY;

export {deepl_authKey, jwt_key, port, weather_key} 