import * as deepl from 'deepl-node';
import { express,dotenv } from '../../index';
import * as jwt from 'jsonwebtoken';
// .ENV
const env = dotenv.load({
  DEEPL_KEY:String,
  JWT_KEY:String
})
const deepl_authKey : string = env.DEEPL_KEY;
const jwt_key :string = env.JWT_KEY;
const translator = new deepl.Translator(deepl_authKey);

interface SentenceStat {
  user:string;
  textToTranslate:string;
  lang : string;
  sentence : string;
}
const sentenceMap : Map<string, SentenceStat> =  new Map();

const TranslateRouter : express.Router = express.Router();

TranslateRouter.post('/',async (req: express.Request, res: express.Response)=>{
  try{
    const token = <string> req.headers["access_key"];
    const decoded = <jwt.JwtPayload> jwt.verify(token,jwt_key);
    const mailActive : string = decoded.user.email;

    const textToTranslate : string = req.body.text;
    const langTo = req.body.lang; 

    const targetSentence : SentenceStat|undefined = sentenceMap.get(textToTranslate);

    if (!targetSentence){
      const result = await translator.translateText(textToTranslate, 'fr', langTo);
      const sentence : SentenceStat = {
        user:mailActive,
        textToTranslate:textToTranslate,
        lang:langTo,
        sentence : result.text
    }
      sentenceMap.set(textToTranslate,sentence);
      return res.status(200).send(result.text);
    }
    console.log(sentenceMap);
    return res.status(200).send(targetSentence);
  }catch(e){
    return res.status(404).send(e)
  }
})
TranslateRouter.get('/languages', async (req: express.Request, res: express.Response)=>{
  const arrLang : string[] = [];
  const sourceLanguages = await translator.getSourceLanguages();
  for (let i = 0; i < sourceLanguages.length; i++) {
    const lang = sourceLanguages[i];
    arrLang.push(`${lang.name} (${lang.code})`);
  }
  return res.status(200).send(arrLang);
})
TranslateRouter.get('/', (req: express.Request, res: express.Response)=>{
  const iter : IterableIterator<string> = sentenceMap.keys();
  let arr :string[] = []
  for (const value of iter) {
      arr.push(value)
  }
  return res.status(200).send(arr);
})

export {TranslateRouter};




