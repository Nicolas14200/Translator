import * as deepl from "deepl-node";
import { express, dotenv } from "../../index";
import * as jwt from "jsonwebtoken";
// .ENV
const env = dotenv.load({
  DEEPL_KEY: String,
  JWT_KEY: String,
});
const deepl_authKey: string = env.DEEPL_KEY;
const jwt_key: string = env.JWT_KEY;
const translator: deepl.Translator = new deepl.Translator(deepl_authKey);

interface SentenceStat {
  textToTranslate: string;
  lang: string;
  sentence: string;
}
const sentenceArr:SentenceStat[] = [];
const sentenceMap: Map<string, SentenceStat[]> = new Map();

const TranslateRouter: express.Router = express.Router();

//FUNCTION
function tokenGetMail (token:string):string{
  const decoded = <jwt.JwtPayload>jwt.verify(token, jwt_key);
  return decoded.user.email;
}
TranslateRouter.post(
  "/",
  async (req: express.Request, res: express.Response) => {
    try {
      const mailActive = tokenGetMail (<string>req.headers["access_key"]);

      const textToTranslate: string = req.body.text;
      const langTo = req.body.lang;
      
      const targetSentence:SentenceStat[] | undefined =sentenceMap.get(mailActive);
      if (targetSentence){
        for(let i = 0 ; i<targetSentence.length;i++){
          if (targetSentence[i].textToTranslate === textToTranslate) {
            console.log(sentenceMap);
            return res.status(200).send(targetSentence);
          }
        }
      }
      const result = await translator.translateText(
        textToTranslate,
        "fr",
        langTo
      );
      const sentence: SentenceStat = {
        textToTranslate: textToTranslate,
        lang: langTo,
        sentence: result.text,
      };
      sentenceArr.push(sentence)
      sentenceMap.set(mailActive, sentenceArr);
      console.log(sentenceMap);
      return res.status(200).send(result.text);

    } catch (e) {
      return res.status(404).send(e);
    }
  }
);
TranslateRouter.get(
  "/languages",
  async (req: express.Request, res: express.Response) => {
    const arrLang: string[] = [];
    const sourceLanguages = await translator.getSourceLanguages();
    for (let i = 0; i < sourceLanguages.length; i++) {
      const lang = sourceLanguages[i];
      arrLang.push(`${lang.name} (${lang.code})`);
    }
    return res.status(200).send(arrLang);
  }
);
TranslateRouter.get("/", (req: express.Request, res: express.Response) => {
  const mailActive: string = tokenGetMail (<string>req.headers["access_key"]);
  console.log(mailActive);
  console.log(sentenceMap.get(mailActive))
  const history :  SentenceStat[]|undefined= sentenceMap.get(mailActive);
  console.log(history);
  return res.status(200).send(history);
});

export { TranslateRouter };
