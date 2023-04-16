interface User {
    email    : string;
    password : string;
    pseudo   : string;
}
interface SentenceStat {
    textToTranslate: string;
    lang: string;
    sentence: string;
  }
export { User, SentenceStat };
  