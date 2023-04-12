import * as deepl from "deepl-node";
import { express, jwt } from "../../index";
import { deepl_authKey, jwt_key } from "../../DotenvVar";
import { SentenceStat } from "../../interface";
import { tokenGetMail } from "../../function";
const translator: deepl.Translator = new deepl.Translator(deepl_authKey);

const sentenceArr: SentenceStat[] = [];
const sentenceMap: Map<string, SentenceStat[]> = new Map();

const TranslateRouter: express.Router = express.Router();

TranslateRouter.post(
  "/",
  async (req: express.Request, res: express.Response) => {
    try {
      const mailActive = tokenGetMail(
        <string>req.headers["access_key"],
        jwt_key
      );

      const textToTranslate: string = req.body.text;
      const langTo = req.body.lang;

      const targetSentence: SentenceStat[] | undefined =
        sentenceMap.get(mailActive);
      if (targetSentence) {
        for (let i = 0; i < targetSentence.length; i++) {
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
      sentenceArr.push(sentence);
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
  const mailActive: string = tokenGetMail(
    <string>req.headers["access_key"],
    jwt_key
  );
  const history = <SentenceStat[]>sentenceMap.get(mailActive);
  return res.status(200).send(history);
});

export { TranslateRouter };
