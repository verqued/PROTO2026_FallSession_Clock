import { NUMBER_WORDS } from './number-words.js';

// One representative capital per language; shared languages are not duplicated.
export function languageKey(language) {
  return new Intl.Locale(language.replaceAll('_', '-')).language;
}
export function uniqueLanguageClocks(cities) {
  const seen = new Set();
  return cities.flatMap(city => {
    const language = languageKey(city.language);
    if (seen.has(language)) return [];
    seen.add(language);
    return [{ ...city, language }];
  });
}
export const CITIES = uniqueLanguageClocks([
  { id: 'seoul', name: '서울', country: '대한민국', language: 'ko', timeZone: 'Asia/Seoul' },
  { id: 'washington', name: 'Washington D.C.', country: '미국', language: 'en', timeZone: 'America/New_York' },
  { id: 'new-delhi', name: 'नई दिल्ली', country: '인도', language: 'hi', timeZone: 'Asia/Kolkata' },
  { id: 'tokyo', name: '東京', country: '일본', language: 'ja', timeZone: 'Asia/Tokyo' },
  { id: 'beijing', name: '北京', country: '중국', language: 'zh', timeZone: 'Asia/Shanghai' },
  { id: 'moscow', name: 'Москва', country: '러시아', language: 'ru', timeZone: 'Europe/Moscow' },
  { id: 'riyadh', name: 'الرياض', country: '사우디아라비아', language: 'ar', direction: 'rtl', timeZone: 'Asia/Riyadh' },
  { id: 'paris', name: 'Paris', country: '프랑스', language: 'fr', timeZone: 'Europe/Paris' },
  { id: 'madrid', name: 'Madrid', country: '스페인', language: 'es', timeZone: 'Europe/Madrid' },
  { id: 'berlin', name: 'Berlin', country: '독일', language: 'de', timeZone: 'Europe/Berlin' },
  { id: 'rome', name: 'Roma', country: '이탈리아', language: 'it', timeZone: 'Europe/Rome' },
  { id: 'lisbon', name: 'Lisboa', country: '포르투갈', language: 'pt', timeZone: 'Europe/Lisbon' },
  { id: 'ankara', name: 'Ankara', country: '튀르키예', language: 'tr', timeZone: 'Europe/Istanbul' },
  { id: 'bangkok', name: 'กรุงเทพมหานคร', country: '태국', language: 'th', timeZone: 'Asia/Bangkok' },
  { id: 'athens', name: 'Αθήνα', country: '그리스', language: 'el', timeZone: 'Europe/Athens' },
  { id: 'hanoi', name: 'Hà Nội', country: '베트남', language: 'vi', timeZone: 'Asia/Ho_Chi_Minh' },
]);
const formatters = new Map(CITIES.map(city => [city.id, new Intl.DateTimeFormat('en-US', {
  timeZone: city.timeZone, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
})]));
const englishSmall = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const englishTens = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
const koreanHours = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
const koreanDigits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
export function englishNumber(number) {
  return number < 20 ? englishSmall[number]
    : englishTens[Math.floor(number / 10)] + (number % 10 ? `-${englishSmall[number % 10]}` : '');
}
export function koreanNumber(number) {
  const tens = Math.floor(number / 10);
  return (tens ? (tens === 1 ? '' : koreanDigits[tens]) + '십' : '') + koreanDigits[number % 10];
}
const word = (language, number) => NUMBER_WORDS[language][number];
const gendered = (language, number) => NUMBER_WORDS[language + 'Feminine'][number];
function russianUnit(number, forms) {
  return forms[number % 100 >= 11 && number % 100 <= 14 ? 2 : number % 10 === 1 ? 0 : number % 10 >= 2 && number % 10 <= 4 ? 1 : 2];
}
function arabicUnit(number, singular, dual, plural) {
  if (number === 1) return `${singular} واحدة`;
  if (number === 2) return dual;
  return `${gendered('ar', number)} ${number >= 3 && number <= 10 ? plural : singular}`;
}
export function formatClockParts(city, hour, minute, second) {
  const lang = city.language, twelveHour = hour % 12 || 12;
  const n = number => word(lang, number);
  const french = number => n(number).replace(/un$/u, 'une');
  const spanish = number => number === 21 ? 'veintiún' : n(number).replace(/\buno$/u, 'un');
  const greekHour = number => n(number).replace(/ένα$/u, 'μία').replace(/τρία$/u, 'τρεις').replace(/τέσσερα$/u, 'τέσσερις');
  switch (lang) {
    case 'ko': return [hour < 12 ? '오전' : '오후', `${koreanHours[twelveHour]} 시`, `${koreanNumber(minute) || '영'} 분`, `${koreanNumber(second) || '영'} 초`];
    case 'en': return [englishNumber(twelveHour), minute === 0 ? 'o’clock' : minute < 10 ? `oh ${englishNumber(minute)}` : englishNumber(minute), `and ${englishNumber(second)} ${second === 1 ? 'second' : 'seconds'}`, hour < 12 ? 'a.m.' : 'p.m.'];
    case 'hi': return [`${n(hour)} बजे`, `${n(minute)} मिनट`, `${n(second)} सेकंड`];
    case 'ja': return [`${hour ? n(hour) : '零'}時`, `${minute ? n(minute) : '零'}分`, `${second ? n(second) : '零'}秒`];
    case 'zh': return [`${hour === 2 ? '两' : hour ? n(hour) : '零'}点`, `${minute ? n(minute) : '零'}分`, `${second ? n(second) : '零'}秒`];
    case 'ru': return [`${n(hour)} ${russianUnit(hour, ['час', 'часа', 'часов'])}`, `${gendered(lang, minute)} ${russianUnit(minute, ['минута', 'минуты', 'минут'])}`, `${gendered(lang, second)} ${russianUnit(second, ['секунда', 'секунды', 'секунд'])}`];
    case 'ar': return [`الساعة ${NUMBER_WORDS.arHours[twelveHour]}`, `و${arabicUnit(minute, 'دقيقة', 'دقيقتان', 'دقائق')}`, `و${arabicUnit(second, 'ثانية', 'ثانيتان', 'ثوانٍ')}`, hour < 12 ? 'صباحًا' : 'مساءً'];
    case 'fr': return [`${french(hour)} heure${hour === 1 ? '' : 's'}`, `${french(minute)} minute${minute === 1 ? '' : 's'}`, `${french(second)} seconde${second === 1 ? '' : 's'}`];
    case 'es': return [`${gendered(lang, hour)} hora${hour === 1 ? '' : 's'}`, `${spanish(minute)} minuto${minute === 1 ? '' : 's'}`, `${spanish(second)} segundo${second === 1 ? '' : 's'}`];
    case 'de': return [`${hour === 1 ? 'ein' : n(hour)} Uhr`, `${minute === 1 ? 'eine' : n(minute)} Minute${minute === 1 ? '' : 'n'}`, `${second === 1 ? 'eine' : n(second)} Sekunde${second === 1 ? '' : 'n'}`];
    case 'it': return [`${hour === 1 ? 'un’ora' : n(hour) + ' ore'}`, `${n(minute)} minut${minute === 1 ? 'o' : 'i'}`, `${n(second)} second${second === 1 ? 'o' : 'i'}`];
    case 'pt': return [`${gendered(lang, hour)} hora${hour === 1 ? '' : 's'}`, `${n(minute)} minuto${minute === 1 ? '' : 's'}`, `${n(second)} segundo${second === 1 ? '' : 's'}`];
    case 'tr': return [`saat ${n(hour)}`, `${n(minute)} dakika`, `${n(second)} saniye`];
    case 'th': return [`${n(hour)} นาฬิกา`, `${n(minute)} นาที`, `${n(second)} วินาที`];
    case 'el': return [`${greekHour(hour)} ${hour === 1 ? 'ώρα' : 'ώρες'}`, `${n(minute)} ${minute === 1 ? 'λεπτό' : 'λεπτά'}`, `${n(second)} ${second === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα'}`];
    case 'vi': return [`${n(hour)} giờ`, `${n(minute)} phút`, `${n(second)} giây`];
    default: throw new Error(`Unsupported clock language: ${lang}`);
  }
}
export function readClock(city, now = new Date()) {
  const parts = Object.fromEntries(formatters.get(city.id).formatToParts(now).map(part => [part.type, part.value]));
  const hour = Number(parts.hour), minute = Number(parts.minute), second = Number(parts.second);
  const lines = formatClockParts(city, hour, minute, second);
  return { lines, key: `${hour}:${minute}:${second}`, label: `${city.name}: ${lines.join(' ')}` };
}
