import * as deepl from "deepl-node";
import { express } from "../../index";
import { deepl_authKey, jwt_key } from "../../DotenvVar";
import { SentenceStat } from "../../interface";
import { tokenGetMail } from "../../function";
const translator: deepl.Translator = new deepl.Translator(deepl_authKey);


const sentenceMap: Map<string, SentenceStat[]> = new Map();

const TranslateRouter: express.Router = express.Router();
 
TranslateRouter.post(
  ///////////////////// POST //////////////////
  "/",
  async (req: express.Request, res: express.Response) => {
    try {
      const sentenceArr: SentenceStat[] = []; //sentenceArr est une liste de SentenceStat
      const emailReq = <string>req.headers["access_key"];
      const mailActive = tokenGetMail(emailReq, jwt_key);

      const textToTranslateReq: string = req.body.text;
      const langTo = req.body.lang;

      const userexist: SentenceStat[] | undefined =
        sentenceMap.get(mailActive);
        console.log(userexist);
      if (userexist) {
        //user a t'il deja demander un truc ?
        for (let i = 0; i < userexist.length; i++) {
          //on boucle sur toute les phrases de l'utilisateur
          if (userexist[i].textToTranslate === textToTranslateReq) {
            //a t'il deja demander cette phrase ?
            if (userexist[i].lang === langTo) {
              //dans cette lang ?
              return res.status(200).send(userexist);
            }
          }
        }
      }
      const resultTranslate = await translator.translateText(
        //on traduit la phrase
        textToTranslateReq,
        "fr",
        langTo
      );
      //console.log("result ===>",result)
      const sentenceStat: SentenceStat = {
        textToTranslate: textToTranslateReq,
        lang: langTo,
        sentence: resultTranslate.text,
      };
      sentenceArr.push(sentenceStat);
      sentenceMap.set(mailActive, sentenceArr);

      //console.log("sentenceMap======>",sentenceMap);
      return res.status(200).send(resultTranslate.text);
    } catch (e) {
      return res.status(404).send(e);
    }
  }
);
TranslateRouter.get(
  ////////////  AFFICHAGE DES LANGUES ////////////////////
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
/////   HISTORIQUE   ////////////////////
TranslateRouter.get("/", (req: express.Request, res: express.Response) => {
  const mailActive: string = tokenGetMail(
    <string>req.headers["access_key"],
    jwt_key
  );
  console.log(sentenceMap);
  const history = <SentenceStat[]>sentenceMap.get(mailActive);
  //console.log(mailActive);
  //console.log(history);
  return res.status(200).send(history);
});

export { TranslateRouter };
