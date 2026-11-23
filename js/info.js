import { CITIES } from './clock.js';
import { FONT_FAMILIES, FONT_WEIGHTS } from './fonts.js';

const copy = {
  ko: [
    '영화 컨택트(2016)를 보며 언어가 다르면 서로 생각하는 방식 자체가 달라진다는 내용이 인상적이었다.',
    '숫자라는 공통 기호가 아닌 각각 나라의 문자로 시간을 표현했을때의 시각적 차이를 직관적으로 보여주는 웹이다.',
    '29초에서 30초로 넘어가는 순간, 독일어 ‘neunundzwanzig Sekunden’은 ‘dreißig Sekunden’으로 바뀐다. ‘초’를 뜻하는 ‘Sekunden’은 그대로지만, 그 앞의 숫자를 풀어 쓴 부분은 14글자에서 7글자로 줄어든다.',
    '이렇게 시간이 흐르면서 문구가 얼마나 길어지고 짧아지는지는 언어마다 다르다.',
    '이 세계시계는 16개 수도의 현지 시각을 각 언어의 글자로 보여 준다.',
    '숫자로 시간을 볼 때는 시각을 빠르게 확인한다. 시간을 각 언어로 풀어 쓰면 평소 지나쳤던 글자의 모양과 문구의 길이가 보인다.',
    '흩어진 시계가 하나의 원으로 보일 때에는 똑같이 1초가 흘러도 각 언어의 문구는 서로 다른 길이와 모양으로 바뀐다는 점이 한눈에 보인다.',
  ],
  en: ['The film Arrival (2016) made me think about how language can shape the way we think. This website makes the visual differences apparent when time is written out in different languages in place of shared numeric symbols.', 'In German, ‘neunundzwanzig Sekunden’ becomes ‘dreißig Sekunden’ as 29 seconds turns to 30. The word for seconds stays the same, while the spelled-out number shrinks from 14 letters to 7. Each language changes length differently as time passes.', 'This world clock shows the local time in 16 capitals in their respective languages. Digits let us check the time quickly. Words reveal shapes and lengths we usually overlook. As the clocks form a single circle, one second produces visibly different changes across languages.'],
  hi: ['फ़िल्म अराइवल (2016) में यह विचार प्रभावशाली लगा कि भाषा बदलने से सोचने का ढंग भी बदल सकता है। यह वेबसाइट दिखाती है कि अंकों की जगह अलग-अलग भाषाओं में समय लिखने पर वह कैसा दिखता है।', '29 से 30 सेकंड होते ही जर्मन में ‘neunundzwanzig Sekunden’ बदलकर ‘dreißig Sekunden’ हो जाता है। Sekunden वही रहता है, पर संख्या के अक्षर 14 से घटकर 7 हो जाते हैं। समय के साथ हर भाषा में लिखावट की लंबाई अलग तरह से बदलती है।', 'यह विश्व घड़ी 16 राजधानियों का स्थानीय समय उनकी भाषाओं में दिखाती है। अंक जल्दी पढ़े जाते हैं, जबकि शब्दों में अक्षरों का आकार और लंबाई दिखाई देती है। घड़ियाँ एक वृत्त में मिलें तो एक ही सेकंड से पैदा हुए अलग-अलग बदलाव साथ दिखते हैं।'],
  ja: ['映画『メッセージ』（2016）を見て、言語が違えば考え方も変わりうるという設定が印象に残った。このウェブ作品は、共通の記号である数字の代わりに、各言語で時刻を書くとどう見えるかを示す。', '29秒から30秒になると、ドイツ語の「neunundzwanzig Sekunden」は「dreißig Sekunden」に変わる。「Sekunden」はそのままだが、数を表す部分は14文字から7文字に減る。時間とともに文の長さが変わる様子は言語ごとに異なる。', '16の首都の現地時刻をそれぞれの言語で表示する世界時計。数字ならすぐに時刻が分かり、言葉で書くと文字の形と文の長さが見えてくる。時計が一つの円に集まると、同じ1秒が各言語にもたらす変化を見比べられる。'],
  zh: ['看电影《降临》（2016）时，语言可能改变思维方式的设定给我留下了深刻印象。这个网页用不同语言的文字写出时间，让人直观地看到它们与通用数字符号之间的视觉差异。', '从29秒到30秒，德语的“neunundzwanzig Sekunden”变为“dreißig Sekunden”。Sekunden 保持不变，前面拼写数字的部分却从14个字母缩短到7个。时间流逝时，各种语言中的文字长度会以不同的方式变化。', '这座世界时钟用各自的语言显示16个首都的当地时间。数字让人迅速读出时间，文字则显露出平常被忽略的形状与长度。分散的时钟合成一个圆时，同一秒在不同语言里造成的变化便一目了然。'],
  ru: ['В фильме «Прибытие» (2016) меня впечатлила мысль о том, что язык может менять способ мышления. Этот сайт показывает, как по-разному выглядит время, записанное словами на разных языках.', 'При переходе от 29 к 30 секундам немецкое «neunundzwanzig Sekunden» сменяется на «dreißig Sekunden». Слово Sekunden остаётся прежним, а число сокращается с 14 букв до 7. В каждом языке длина фразы меняется по-своему.', 'Эти часы показывают местное время 16 столиц на их языках. Цифры позволяют узнать время быстро, а слова обнаруживают форму и длину надписи. Когда часы складываются в один круг, видно, как одна секунда по-разному меняет каждую надпись.'],
  ar: ['أثّرت فيّ فكرة فيلم «الوصول» (2016) بأن اختلاف اللغة قد يغيّر طريقة التفكير. يعرض هذا الموقع الفروق البصرية التي تظهر حين نكتب الوقت بكلمات لغات مختلفة بدلاً من الأرقام المشتركة.', 'عند الانتقال من 29 إلى 30 ثانية، تتحول العبارة الألمانية «neunundzwanzig Sekunden» إلى «dreißig Sekunden». تبقى كلمة Sekunden كما هي، بينما يقصر العدد المكتوب من 14 حرفاً إلى 7. يتغير طول العبارة مع مرور الوقت بصورة مختلفة في كل لغة.', 'تعرض هذه الساعة العالمية التوقيت المحلي في 16 عاصمة بلغاتها. تتيح الأرقام قراءة الوقت بسرعة، بينما تكشف الكلمات أشكال الحروف وأطوال العبارات. وعندما تجتمع الساعات في دائرة واحدة، تظهر آثار مرور الثانية نفسها في كل لغة.'],
  fr: ['Le film Premier Contact (2016) m’a marqué par son idée que la langue peut modifier notre manière de penser. Ce site montre les différences visuelles qui apparaissent quand on écrit l’heure en toutes lettres dans plusieurs langues.', 'De 29 à 30 secondes, « neunundzwanzig Sekunden » devient « dreißig Sekunden » en allemand. Le mot Sekunden reste identique, mais le nombre écrit passe de 14 à 7 lettres. La longueur du texte évolue différemment dans chaque langue.', 'Cette horloge mondiale affiche l’heure locale de 16 capitales dans leurs langues respectives. Les chiffres donnent l’heure rapidement ; les mots révèlent la forme et la longueur du texte. Quand les horloges se réunissent en un cercle, les changements produits par une même seconde deviennent visibles ensemble.'],
  es: ['Me impresionó la idea de la película La llegada (2016) de que la lengua puede cambiar nuestra forma de pensar. Esta web hace visibles las diferencias que aparecen al escribir la hora con palabras de distintas lenguas.', 'Al pasar de 29 a 30 segundos, «neunundzwanzig Sekunden» se convierte en «dreißig Sekunden» en alemán. Sekunden sigue igual, pero el número escrito pasa de 14 letras a 7. La longitud del texto cambia de forma distinta en cada lengua.', 'Este reloj mundial muestra la hora local de 16 capitales en sus respectivas lenguas. Las cifras permiten leerla deprisa; las palabras muestran formas y longitudes que solemos pasar por alto. Al reunirse los relojes en un círculo, se pueden comparar los cambios que produce un mismo segundo.'],
  de: ['Am Film Arrival (2016) beeindruckte mich die Idee, dass verschiedene Sprachen unsere Denkweise verändern können. Diese Website macht sichtbar, wie unterschiedlich Zeit aussieht, wenn sie in verschiedenen Sprachen ausgeschrieben wird.', 'Beim Wechsel von 29 auf 30 Sekunden wird aus „neunundzwanzig Sekunden“ „dreißig Sekunden“. Sekunden bleibt gleich, doch die ausgeschriebene Zahl schrumpft von 14 auf 7 Buchstaben. Die Länge der Zeitanzeige verändert sich in jeder Sprache anders.', 'Diese Weltuhr zeigt die Ortszeit von 16 Hauptstädten in ihren jeweiligen Sprachen. Ziffern lassen sich schnell ablesen, Wörter machen Form und Länge sichtbar. Wenn die Uhren einen Kreis bilden, sieht man die unterschiedlichen Veränderungen derselben Sekunde auf einen Blick.'],
  it: ['Del film Arrival (2016) mi ha colpito l’idea che la lingua possa cambiare il modo di pensare. Questo sito rende visibili le differenze che emergono scrivendo l’ora in lettere in più lingue.', 'Da 29 a 30 secondi, il tedesco «neunundzwanzig Sekunden» diventa «dreißig Sekunden». Sekunden rimane uguale, mentre il numero scritto passa da 14 a 7 lettere. La lunghezza della frase cambia in modo diverso in ogni lingua.', 'Questo orologio mondiale indica l’ora locale di 16 capitali nelle rispettive lingue. Le cifre si leggono rapidamente, mentre le parole rivelano forme e lunghezze. Quando gli orologi si raccolgono in un cerchio, si vedono insieme i diversi effetti dello stesso secondo.'],
  pt: ['Impressionou-me a ideia do filme O Primeiro Encontro (2016) de que a língua pode mudar a nossa maneira de pensar. Este sítio mostra as diferenças visuais que surgem ao escrever a hora por extenso em várias línguas.', 'Ao passar de 29 para 30 segundos, o alemão «neunundzwanzig Sekunden» torna-se «dreißig Sekunden». Sekunden mantém-se, mas o número por extenso passa de 14 para 7 letras. O comprimento da expressão muda de forma diferente em cada língua.', 'Este relógio mundial apresenta a hora local de 16 capitais nas respetivas línguas. Os algarismos permitem ler rapidamente a hora; as palavras revelam formas e comprimentos. Quando os relógios formam um círculo, veem-se em conjunto as mudanças provocadas pelo mesmo segundo.'],
  tr: ['Arrival (2016) filminde dilin düşünme biçimini değiştirebileceği fikri beni etkiledi. Bu site, zamanı rakamlar yerine farklı dillerde sözcüklerle yazmanın görsel farklarını gösteriyor.', '29 saniyeden 30 saniyeye geçerken Almanca “neunundzwanzig Sekunden”, “dreißig Sekunden” olur. Sekunden aynı kalır, ancak yazıyla belirtilen sayı 14 harften 7 harfe iner. İfadenin uzunluğu her dilde farklı biçimde değişir.', 'Bu dünya saati 16 başkentin yerel saatini kendi dillerinde gösterir. Rakamlar saati çabucak okumayı sağlar; sözcükler ise biçim ve uzunluğu ortaya çıkarır. Saatler tek çemberde birleşince aynı saniyenin farklı etkileri birlikte görülür.'],
  th: ['ภาพยนตร์ Arrival (2016) ทำให้ประทับใจกับแนวคิดที่ว่าภาษาที่ต่างกันอาจเปลี่ยนวิธีคิด เว็บไซต์นี้แสดงให้เห็นว่าเมื่อเขียนเวลาเป็นคำในภาษาต่าง ๆ แทนตัวเลข รูปลักษณ์จะต่างกันอย่างไร', 'เมื่อ 29 วินาทีเปลี่ยนเป็น 30 วินาที ภาษาเยอรมันเปลี่ยนจาก “neunundzwanzig Sekunden” เป็น “dreißig Sekunden” คำว่า Sekunden ยังเหมือนเดิม แต่คำที่เขียนแทนตัวเลขสั้นลงจาก 14 เหลือ 7 ตัวอักษร แต่ละภาษามีความยาวเปลี่ยนไปต่างกันตามเวลา', 'นาฬิกาโลกนี้แสดงเวลาท้องถิ่นของ 16 เมืองหลวงด้วยภาษาของแต่ละแห่ง ตัวเลขช่วยให้อ่านเวลาได้เร็ว ส่วนคำเผยให้เห็นรูปทรงและความยาวของข้อความ เมื่อนาฬิกามารวมเป็นวงเดียว จะเห็นความเปลี่ยนแปลงที่ต่างกันในหนึ่งวินาทีเดียวกัน'],
  el: ['Στην ταινία Arrival (2016) με εντυπωσίασε η ιδέα ότι η γλώσσα μπορεί να αλλάξει τον τρόπο σκέψης. Ο ιστότοπος δείχνει πώς αλλάζει η όψη της ώρας όταν γράφεται με λέξεις σε διαφορετικές γλώσσες.', 'Από τα 29 στα 30 δευτερόλεπτα, το γερμανικό «neunundzwanzig Sekunden» γίνεται «dreißig Sekunden». Η λέξη Sekunden μένει ίδια, αλλά ο αριθμός μικραίνει από 14 σε 7 γράμματα. Το μήκος της φράσης αλλάζει διαφορετικά σε κάθε γλώσσα.', 'Το παγκόσμιο ρολόι δείχνει την τοπική ώρα 16 πρωτευουσών στις αντίστοιχες γλώσσες. Με ψηφία διαβάζουμε γρήγορα την ώρα, ενώ οι λέξεις αποκαλύπτουν σχήματα και μήκη. Όταν τα ρολόγια σχηματίζουν έναν κύκλο, οι διαφορετικές αλλαγές του ίδιου δευτερολέπτου φαίνονται μαζί.'],
  vi: ['Khi xem phim Arrival (2016), tôi ấn tượng với ý tưởng rằng ngôn ngữ có thể thay đổi cách suy nghĩ. Trang web cho thấy sự khác biệt về hình thức khi viết thời gian bằng chữ trong nhiều ngôn ngữ.', 'Khi 29 giây chuyển sang 30 giây, tiếng Đức đổi từ “neunundzwanzig Sekunden” thành “dreißig Sekunden”. Sekunden giữ nguyên, còn phần viết số giảm từ 14 xuống 7 chữ cái. Độ dài của cụm từ thay đổi theo cách riêng trong từng ngôn ngữ.', 'Đồng hồ thế giới này hiển thị giờ địa phương của 16 thủ đô bằng các ngôn ngữ tương ứng. Chữ số giúp xem giờ nhanh, còn chữ viết làm lộ rõ hình dáng và độ dài. Khi các đồng hồ tụ lại thành một vòng tròn, ta thấy cùng một giây tạo ra những thay đổi khác nhau.'],
};

const names = ['한국어','English','हिन्दी','日本語','简体中文','Русский','العربية','Français','Español','Deutsch','Italiano','Português','Türkçe','ไทย','Ελληνικά','Tiếng Việt'];
const button = document.getElementById('info-open');
const dialog = document.getElementById('clock-info');
const picker = document.getElementById('info-language');
const choices = document.getElementById('info-languages');
const prose = document.getElementById('info-copy');
const scroll = document.getElementById('info-scroll');
const close = document.getElementById('info-close');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let shown;
let typeFrame;
let caretTimer;

function setTypeface(node, language) {
  node.style.fontFamily = FONT_FAMILIES[language];
  node.style.fontWeight = FONT_WEIGHTS[language];
}

function stopTyping() {
  cancelAnimationFrame(typeFrame);
  clearTimeout(caretTimer);
}

function showLanguage(city, name, typing = false) {
  stopTyping();
  shown = city.language;
  picker.textContent = name;
  setTypeface(picker, shown);
  setTypeface(prose, shown);
  picker.lang = shown;
  prose.lang = shown;
  prose.dir = city.direction || 'ltr';
  const paragraphs = copy[shown].map(line => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    return paragraph;
  });
  prose.replaceChildren(...paragraphs);
  scroll.scrollTop = 0;
  for (const option of choices.children) {
    option.setAttribute('aria-pressed', String(option.dataset.language === shown));
  }
  if (typing && !reducedMotion.matches) typeParagraphs(paragraphs);
}

function typeParagraphs(paragraphs) {
  const segmenter = new Intl.Segmenter(shown, { granularity: 'grapheme' });
  const lines = paragraphs.map(paragraph => {
    const text = paragraph.textContent;
    const ends = [0, ...Array.from(segmenter.segment(text), part => part.index + part.segment.length)];
    const prefix = document.createElement('span');
    const suffix = document.createElement('span');
    suffix.className = 'info-untyped';
    suffix.textContent = text;
    paragraph.setAttribute('aria-label', text);
    prefix.setAttribute('aria-hidden', 'true');
    suffix.setAttribute('aria-hidden', 'true');
    paragraph.replaceChildren(prefix, suffix);
    return { paragraph, text, ends, prefix, suffix, count: -1 };
  });
  const total = lines.reduce((sum, line) => sum + line.ends.length - 1, 0);
  const duration = Math.min(3300, Math.max(1350, total * 4));
  let start;
  function tick(now) {
    start ??= now;
    let remaining = Math.min(total, Math.floor((now - start) / duration * total));
    const complete = remaining === total;
    let active = lines[0];
    for (const line of lines) {
      const count = Math.min(remaining, line.ends.length - 1);
      if (count !== line.count) {
        line.prefix.textContent = line.text.slice(0, line.ends[count]);
        line.suffix.textContent = line.text.slice(line.ends[count]);
        line.count = count;
      }
      if (count > 0) active = line;
      remaining -= count;
    }
    for (const line of lines) line.prefix.classList.toggle('info-caret', line === active);
    if (!complete) typeFrame = requestAnimationFrame(tick);
    else caretTimer = setTimeout(finishTyping, 850);
  }
  typeFrame = requestAnimationFrame(tick);
}

function finishTyping() {
  stopTyping();
  for (const paragraph of prose.children) {
    const full = paragraph.getAttribute('aria-label');
    if (full === null) continue;
    paragraph.textContent = full;
    paragraph.removeAttribute('aria-label');
  }
}

function setChoices(open) {
  choices.hidden = !open;
  picker.setAttribute('aria-expanded', String(open));
}

function changeLanguage(city, name) {
  setChoices(false);
  picker.focus();
  if (shown !== city.language) showLanguage(city, name, true);
}

for (const [i, city] of CITIES.entries()) {
  const option = document.createElement('button');
  option.type = 'button';
  option.textContent = names[i];
  setTypeface(option, city.language);
  option.lang = city.language;
  option.dataset.language = city.language;
  option.addEventListener('click', () => changeLanguage(city, names[i]));
  choices.append(option);
}

button.addEventListener('click', () => dialog.showModal());
close.addEventListener('click', () => dialog.close());
picker.addEventListener('click', () => {
  setChoices(choices.hidden);
  if (!choices.hidden) (choices.querySelector('[aria-pressed="true"]') || choices.firstElementChild).focus();
});
dialog.addEventListener('cancel', event => {
  if (choices.hidden) return;
  event.preventDefault();
  setChoices(false);
  picker.focus();
});
dialog.addEventListener('click', event => {
  if (!event.target.closest('.info-dock')) setChoices(false);
});
dialog.addEventListener('close', () => {
  finishTyping();
  setChoices(false);
  button.focus();
});
showLanguage(CITIES[0], names[0]);
