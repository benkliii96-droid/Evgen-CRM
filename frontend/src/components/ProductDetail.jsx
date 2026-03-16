import { useState, useEffect } from 'react';
import { Link, useNavigate } from '../router';

const API_URL = '';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Фильтр нецензурной речи
const badWords = [
  // Корень "хуй" и производные
  "хуй", "хуя", "хуёвый", "хуёво", "хуевый", "хуево", "хуем", "хуями", "хуило", 
  "хуйлан", "хуиня", "хуйня", "хуеплет", "хуйнуть", "нахуй", "на хуй", "похуй", 
  "по хую", "охуеть", "охуенно", "охуительно", "охуел", "охуевать", "заебись", 
  "заебца", "распиздяй", "пиздатый", "ахуеть", "охренеть", "офигеть", "нафиг", 
  "на фиг", "нафига", "на фига", "ни хуя", "нифига", "ни хера", "ни хрена",
  "хули", "пох", "похуизм", "понахер", "понахуй", "схуячить", "хуевертеть",
  "хуеглот", "хуегрыз", "хуедёр", "хуеплёт", "хуерга", "хуета", "хуетень",
  "хуец", "хуист", "хуишко", "хуйло", "хуйнятина", "хуйовать", "хуйово",
  "хуйнуть", "хуйнуться", "хуйняк", "хуяк", "хуярить", "хуячить",
  
  // Корень "пизда" и производные
  "пизда", "пизды", "пиздец", "пиздой", "пиздатый", "пиздато", "пиздеть", 
  "пиздел", "пиздит", "пиздишь", "пиздят", "пизди", "пиздить", "пиздюк", 
  "пиздюлина", "пиздюлька", "пиздобратия", "пиздовоз", "пиздоглазый", 
  "пиздогон", "пиздодёр", "пиздолиз", "пиздопляс", "пиздосос", "пиздострадатель",
  "пиздос", "пиздаболия", "пиздануть", "пиздануться", "пиздарез", "пиздатый",
  "пиздёж", "пиздеж", "распиздяй", "распиздяйка", "распиздон", "пиздобрат",
  "пиздобратия", "пиздовозка", "пиздоглазый", "пиздогонка", "пиздодёр",
  "пиздолизка", "пиздопляска", "пиздосрань", "пиздострадалка", "пиздун",
  "пиздунья", "пиздышка", "пиздяка", "пиздятина", "пиздячить", "пиздячка",
  "подпизднуть", "припизднуть", "припиздок", "припиздень", "припизднутый",
  "разпиздяй", "спиздить", "уебать", "уебище", "уебищный",
  
  // Корень "еб" и производные
  "еб", "ебать", "ебал", "ебали", "ебало", "ебануть", "ебануться", "ебанутый", 
  "ебаный", "ебля", "ебучий", "заебать", "заебись", "заебца", "наебать", 
  "наебнуть", "наебнуться", "отъебать", "отъебаться", "отъебись", "отъеби", 
  "отъебли", "поебать", "поебень", "проебать", "разъебай", "разъебать", 
  "разъебайка", "разъебошить", "съебать", "съебаться", "уебать", "уебище", 
  "уебищный", "выебать", "ебануть", "ебануться", "ебарь", "ебаторий", "ебень",
  "ебеня", "ебёна", "ебёна-вошь", "ёбнутый", "ёбнуть", "ёбнуться", "ёбошить",
  "ебун", "ебунья", "ебучий", "ебучесть", "ебучий-преебучий", "заёб", "заёба",
  "заёбистый", "заёбка", "наёбка", "наёбщик", "недоёб", "недоёбыш", "неёбысь",
  "объебать", "объебалово", "отёб", "переёб", "переёбок", "подъёб", "подъёбка",
  "подъёбщик", "приёб", "проёб", "проёбище", "разъёб", "разъёбище", "съёб",
  "съёбывать", "уёбище", "уёбищный", "уёбок", "хер", "херня", "херь", "херовина",
  "херово", "херовый", "похерить", "похеру", "нахер", "нах", "на хер",
  
  // Корень "бля" и производные
  "бля", "блядь", "блять", "блядки", "блядство", "блядовать", "блядовоз", 
  "блядюга", "блядюха", "блядюшка", "блядёныш", "блядец", "блядища", "блядка",
  "блядня", "блядовитый", "блядовство", "блядогон", "блядоеб", "блядолиз",
  "блядолюб", "блядоман", "блядон", "блядота", "блядота-то", "блядоха",
  "блядочка", "блядун", "блядунья", "блядьё", "блядь-морковь", "заблядовать",
  "заблядь", "наблядовать", "поблядовать", "поблядушка", "проблядовать",
  
  // Другие матерные слова
  "мудак", "мудила", "мудило", "мудозвон", "мудачина", "мудачок", "мудозвонить",
  "мудень", "муди", "мудня", "мудоеб", "мудоклюй", "мудолиз", "мудосос",
  "гандон", "гондон", "гавно", "говно", "говнюк", "говняный", "говнище",
  "дерьмо", "дерьмовый", "залупа", "залупаться", "залупинец", "залупка",
  "залупник", "залупон", "залупонь", "залупус", "залупушка", "залупщик",
  "залупыш", "залупеть", "залупиться", "залупленный", "залупочный",
  "манда", "мандавошка", "мандовошка", "мандовщина", "манда-манда",
  "сиськи", "сися", "сиська", "сосал", "сосать", "сосет", "сосёт", "соси",
  "сосите", "сосут", "отсоси", "отсасывать", "хер", "херня", "хрен", "хреново",
  "хреновый", "пенис", "писюн", "писька", "писька", "попа", "жопа", "жопе",
  "жопу", "жопой", "жопы", "жопка", "жопочка", "жополиз", "жопошник",
  "гол", "голый", "голыш", "педик", "педераст", "пидар", "пидор", "пидорас",
  "пидорасы", "пидоры", "пидары", "педерасты", "педики", "пидорашка",
  "пидорок", "пидорина", "пидрила", "пидрилка", "гомосек", "гомосексуалист",
  "гей", "голубой", "рудик", "редиска", "козел", "козлина", "баран", "овца",
  "свинья", "собака", "пёс", "сука", "суки", "сучка", "сучонок", "сучёныш",
  "сучье", "сучий", "сученок", "сучёнок", "сучоночек",
  "тварь", "твари", "тварюга", "тварина", "тварюка", "тварюшка", "тварешка",
  "тварюшечка", "тварюшечка", "тварюшина", "тварюшища",
  "урод", "уроды", "уродина", "уродец", "уродка", "уродливый", "уродство",
  "уродовать", "уродующий", "изуродовать", "обуродовать",
  "дебил", "дебилы", "дебилка", "дебилизм", "дебильный", "дебилический",
  "дебилоид", "дибил", "дибилы", "дибилка", "дибилоид", "дибильный",
  "идиот", "идиоты", "идиотка", "идиотизм", "идиотский", "идиотия",
  "лох", "лохи", "лошок", "лошара", "лошарка", "лоховоз", "лоходром",
  "лохопед", "лохотрон", "лохотронщик", "лохушка", "лошадник", "лошадиный",
  "чмо", "чмошник", "чмошница", "чмырь", "чмырёнок", "чмыриха", "чмырить",
  "чмыркать", "очмырить", "чмырнутый", "чмырёныш", "чмошный", "чмуха",
  
  // Оскорбления
  "тупой", "тупая", "тупое", "тупые", "тупица", "тупоголовый", "туполобый",
  "тупоумный", "тупорылый", "тупорылая", "тупорылое", "тупорылые",
  "глупый", "глупая", "глупое", "глупые", "глупец", "глупыш", "глупышка",
  "дурак", "дура", "дурочка", "дуралей", "дурачина", "дурачок", "дурачье",
  "дурацкий", "дурить", "дурной", "дурная", "дурное", "дурные", "дурость",
  "придурок", "придурки", "придурковатый", "придурочный", "придурында",
  "придурь", "придуреха", "придурень", "придурковатость", "придурочность",
  
  // Слова связанные с наркотиками и запрещёнными веществами [citation:1]
  "наркотик", "наркота", "наркоман", "наркомания", "наркопритон",
  "героин", "кокаин", "марихуана", "гашиш", "анаша", "мефедрон", "соль",
  "спайс", "экстази", "ЛСД", "ширево", "ширка", "дурь", "травка", "план",
  "анаболики", "стероиды", "аптекарь", "аптечный", "аптека", "фарма",
  "аптечная", "аптечный", "аптекарский", "аптекарша", "аптечный-наркотик",
  
  // Слова связанные с нелегальными услугами [citation:1]
  "эскорт", "эскортница", "эскорт-услуги", "проститутка", "проституция",
  "путана", "шлюха", "шлюшка", "шлюхин", "шлюхинский", "шлюхинство",
  "шлюхинствовать", "шлюхиниться", "шлюхинище", "шлюхиня", "шлюхино",
  "шлюхинский", "шлюхинство", "шлюхинствовать",
  "интим", "интимка", "интимник", "интимница", "интимничать", "интимность",
  "интимный", "интимный-услуги", "интимный-досуг",
  "гадалка", "гадальщица", "гадальщик", "гадание", "гадательный", "гадалка-магия",
  "магия", "магический", "магиня", "магический-ритуал", "магический-обряд",
  "колдун", "колдунья", "колдовство", "колдовской", "колдовать",
  "экстрасенс", "экстрасенсорика", "экстрасенсорный", "экстрасенсорные-способности",
  
  // Слова связанные с кредитами и финансами (негативный контекст) [citation:1]
  "кредит", "кредитный", "кредитная", "кредитное", "кредитные", "кредитование",
  "кредитоваться", "кредитованный", "кредитованный-счёт", "кредитованный-банк",
  "кредитованный-заём", "кредитованный-долг", "кредитованный-кредит",
  "займ", "заём", "займы", "займовый", "займодатель", "займодавец", "займодательница",
  "микрозайм", "микрофинансирование", "микрофинансовый", "микрофинансовая-организация",
  "МФО", "МФО-организация", "МФО-кредит", "МФО-займ", "МФО-долг", "МФО-задолженность",
  "долг", "долги", "должник", "должница", "долговой", "долговая-яма", "долговая-кабала",
  "коллектор", "коллекторы", "коллекторский", "коллекторское-агентство", "коллекторство",
  
  // Оскорбления по национальному признаку [citation:4]
  "чурка", "чурки", "чурбан", "чурбаны", "хач", "хачик", "хачики",
  "жид", "жиды", "жидовин", "жидовка", "жидовский", "жидовство",
  "хохол", "хохлы", "хохлушка", "хохляцкий", "хохляндия",
  "москаль", "москали", "москальский", "москальня", "москальство",
  "кацап", "кацапы", "кацапский", "кацапетовка", "кацапура",
  "бульбаш", "бульбаши", "бульбашский", "бульбашня", "бульбашевка",
  "нерусь", "нерусский", "нерусская", "нерусские", "нерусье",
  "черножопый", "чернозадый", "черномазый", "чернота", "чернотень",
  "узкоглазый", "узкоглазка", "узкоглазые", "узкоглазие",
  
  // Экстремистские и политически окрашенные [citation:1]
  "экстремизм", "экстремист", "экстремистский", "террор", "терроризм",
  "террорист", "террористический", "радикал", "радикальный", "радикализм",
  "фашист", "фашизм", "фашистский", "нацист", "нацизм", "нацистский",
  "националист", "национализм", "националистический", "скинхед",
  "бомба", "взрывчатка", "взрывное-устройство", "самопал", "оружие",
  
  // Старинные русские ругательства (альтернативы мату) [citation:5]
  "шелупонь", "толпёга", "заморыш", "ерпыль", "баляба", "огуряла", "облуд",
  "шушера", "шваль", "швальба", "шельма", "шельмец", "шельмовка",
  "шантрапа", "шаромыжник", "шаромыжница", "шаромыжный",
  "прощелыга", "прощелыжник", "прощелыжница", "прощелыжный",
  "беспутник", "беспутница", "беспутный", "беспутство",
  "вертихвостка", "вертихвост", "вертихвостый",
  "гулящая", "гулящий", "гулящая-девица", "гулящий-народ",
  "ерник", "ерница", "ернический", "ерничество", "ерничать",
  "охальник", "охальница", "охальный", "охальничать", "охальство",
  "потаскун", "потаскунья", "потаскушка", "потаскной", "потаскные-дела",
  "срамник", "срамница", "срамной", "срамословие", "срамословить",
  "стыдоба", "стыдобушка", "стыдный", "стыдливость", "стыдливый",
  "хам", "хамка", "хамло", "хамовитый", "хамский", "хамство", "хамствовать",
  
  // Вульгаризмы и сленг
  "жрать", "жрачка", "жрательный", "жратово", "жрать-хотеть",
  "срать", "срачка", "сральный", "сральня", "сратотека", "срать-хотеть",
  "ссать", "ссака", "ссательный", "ссать-хотеть", "ссыкун", "ссыкуха",
  "блевать", "блёва", "блёвка", "блевотина", "блевотный", "блевануть",
  "пердеть", "пердёж", "пердун", "пердунья", "пердячий", "пердолить",
  "засранец", "засранка", "засранный", "засратый", "засрать", "засраться",
  "обосранец", "обосранка", "обосранный", "обосратый", "обосрать", "обосраться",
  "просрать", "просраться", "просранный", "просратый", "просрать-деньги",
  
  // Слова из словаря бранных слов [citation:4][citation:6]
  "анал", "бздёнок", "бздюх", "бздюха", "бздюшка", "бздюшечка",
  "блуд", "блудить", "блудливый", "блудница", "блудный", "блудо",
  "бляха-муха", "бляха-мушка", "бляха-мушечка",
  "быдло", "быдловатый", "быдловатость", "быдловато", "быдловатый-человек",
  "вонючий", "вонючка", "вонять", "вонь", "вонючесть", "вонючее-дерьмо",
  "выблядок", "выблядки", "выблядочек", "выблядыш", "выбляд-бастард",
  "выкипидар", "выкипидары", "выкипидор", "выкипидоры", "выкипидаренный",
  "гад", "гадина", "гадёныш", "гадюка", "гадючий", "гадство", "гадствовать",
  "гнида", "гнидка", "гнидочка", "гнидушка", "гнидушечка", "гнида-человек",
  "гнус", "гнусный", "гнусность", "гнусить", "гнусавить", "гнусняк",
  "грязнуть", "грязный", "грязно", "грязнота", "грязнуля", "грязнуха",
  "дрянь", "дрянной", "дрянность", "дрянцо", "дрянцо-человек",
  "зараз", "зараза", "заразный", "заразность", "заразно", "заразить",
  "змея", "змеёныш", "змеиный", "змеиться", "змеиное-отродье",
  "какашка", "какашечка", "какашечный", "какашкать", "какашки-пипишки",
  "мерзавец", "мерзавка", "мерзавчик", "мерзкий", "мерзость", "мерзотно",
  "мразь", "мрази", "мразота", "мразотный", "мразотень", "мразотство",
  "негодяй", "негодяйка", "негодяйчик", "негодный", "негодность", "негодовать",
  "падла", "падлюка", "падлючка", "падлюшник", "падлюшный", "падлюшество",
  "паскуда", "паскудник", "паскудница", "паскудный", "паскудство", "паскудничать",
  "подлец", "подлица", "подлый", "подлость", "подличать", "подлый-человек",
  "сволочь", "сволочной", "сволочизм", "сволочить", "сволочной-поступок",
  "стерва", "стервозный", "стервозность", "стервозить", "стервозная-баба",
  "стервец", "стервятник", "стервятница", "стервячий", "стервячество",
  "супостат", "супостатка", "супостатный", "супостатство", "супостатить",
  "тварюка", "тварюшечка", "тварюшина", "тварюшища", "тварюшечный",
  "ублюдок", "ублюдочный", "ублюдочность", "ублюдок-человек", "ублюдское-отродье",
  "ханыга", "ханыжка", "ханыжить", "ханыжный", "ханыжество",
  "хмырь", "хмырёнок", "хмыриха", "хмырить", "хмыркать", "хмырнутый",
  "цыпа", "цыпочка", "цыпаться", "цыпа-цыпа", "цыпа-цыпочка",
  "чертила", "чертилка", "чертилово", "чертильщик", "чертильщица",
  "чушка", "чушко", "чушка-свинья", "чушка-грязнуля", "чушка-неряха",
  "шельма", "шельмец", "шельмовка", "шельмовской", "шельмовство", "шельмовать",
  "шкода", "шкодник", "шкодница", "шкодный", "шкодить", "шкодливость",
  "шпана", "шпанка", "шпанистый", "шпанистость", "шпанская-мушка"
];
function filterBadWords(text) {
  if (!text) return '';
  let filtered = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

function formatPrice(price, hasDiscount, discountPercent) {
  if (hasDiscount && discountPercent > 0) {
    return (parseFloat(price) * (1 - discountPercent / 100)).toFixed(2);
  }
  return parseFloat(price).toFixed(2);
}

export function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Получаем ID товара из URL
  const productId = window.location.pathname.split('/product/')[1]?.replace('/', '');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Синхронизация темы при изменении в localStorage (для вкладок и переходов)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('theme');
      const isDark = saved === 'dark';
      if (isDark !== darkMode) {
        setDarkMode(isDark);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [darkMode]);

  // Синхронизация темы при монтировании компонента
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    if (isDark !== darkMode) {
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setError('Товар не найден');
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/products/${productId}/`)
      .then(res => {
        if (!res.ok) throw new Error('Товар не найден');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] flex items-center justify-center">
        <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-8 text-center">
          <h2 className="font-['Inter'] font-bold text-[24px] text-[#25213b] dark:text-white mb-4">
            Ошибка
          </h2>
          <p className="font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4] mb-6">
            {error || 'Товар не найден'}
          </p>
          <Link
            to="/"
            className="bg-[#6d5bd0] px-6 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0] inline-block"
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = formatPrice(product.price, product.has_discount, product.discount_percent);

  return (
    <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-[#25213b] shadow-sm border-b border-[#e8e4ff] dark:border-[#3d3860]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-[#6e6893] dark:text-[#b8b3d4] hover:text-[#6d5bd0] dark:hover:text-[#6d5bd0] transition-colors"
            >
              <img src="/chevron-left.svg" alt="Назад" className="w-5 h-5" />
              <span className="font-['Inter'] text-[14px]">Назад</span>
            </Link>
            <h1 className="font-['Inter'] font-bold text-[20px] md:text-[24px] text-[#25213b] dark:text-white">
              Информация о товаре
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
            >
              {darkMode ? (
                <img src="/sun.svg" alt="Солнце" className="w-5 h-5" />
              ) : (
                <img src="/moon.svg" alt="Луна" className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white dark:bg-[#25213b] rounded-2xl overflow-hidden shadow-sm border border-[#e8e4ff] dark:border-[#3d3860]">
          {/* Image */}
          <div className="h-64 md:h-96 bg-[#f8f7ff] dark:bg-[#2d2847] flex items-center justify-center">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain md:object-cover"
              />
            ) : (
              <div className="text-center">
                <img src="/nothas_image.svg" alt="Нет изображения" className="w-24 h-24 opacity-50 mx-auto mb-4 text-[#6e6893]" />
                <p className="font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">Нет изображения</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1">
                  {capitalize(product.category_name)}
                </p>
                <h2 className="font-['Inter'] font-bold text-[24px] md:text-[32px] text-[#25213b] dark:text-white mb-2">
                  {filterBadWords(product.name)}
                </h2>
                <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4]">
                  Артикул: <span className="font-semibold text-[#25213b] dark:text-white">{product.id.toString().padStart(3, '0')}</span>
                </p>
              </div>
              
              <div className="text-left md:text-right">
                {product.has_discount && product.discount_percent > 0 ? (
                  <div className="flex flex-col md:items-end gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-['Inter'] font-bold text-[32px] md:text-[40px] text-[#6d5bd0]">
                        ${finalPrice}
                      </span>
                      <span className="font-['Inter'] text-[18px] text-[#6e6893] line-through">
                        ${product.price}
                      </span>
                    </div>
                    <span className="bg-[#6d5bd0] text-white text-sm px-3 py-1 rounded-full font-['Inter'] font-medium">
                      Скидка {product.discount_percent}%
                    </span>
                  </div>
                ) : (
                  <span className="font-['Inter'] font-bold text-[32px] md:text-[40px] text-[#6d5bd0]">
                    ${product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-[#e8e4ff] dark:border-[#3d3860]">
                <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white mb-2">
                  Описание
                </h3>
                <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] leading-relaxed">
                  {filterBadWords(product.description)}
                </p>
              </div>
            )}

            {/* Dynamic Fields */}
            {product.field_values && product.field_values.length > 0 && (
              <div className="mb-6 pb-6 border-b border-[#e8e4ff] dark:border-[#3d3860]">
                <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white mb-4">
                  Характеристики
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.field_values.map((fv, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-3">
                      <span className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                        {fv.field?.name || fv.field?.slug}
                      </span>
                      <span className="font-['Inter'] text-[14px] text-[#25213b] dark:text-white font-medium">
                        <FieldValueDisplay value={fv.value} field={fv.field} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.user_username && (
                <div className="bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-4">
                  <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4] mb-1">
                    Добавил
                  </p>
                  <div className="flex items-center gap-2">
                    {product.user_avatar ? (
                      <img src={product.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#e8e4ff] dark:bg-[#3d3860] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <p className="font-['Inter'] font-semibold text-[14px] text-[#25213b] dark:text-white">
                      {product.user_username}
                    </p>
                  </div>
                </div>
              )}
              <div className="bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-4">
                <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4] mb-1">
                  Количество
                </p>
                <p className="font-['Inter'] font-semibold text-[18px] text-[#25213b] dark:text-white">
                  {product.quantity} {product.unit}
                </p>
              </div>
              <div className="bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-4">
                <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4] mb-1">
                  Единица
                </p>
                <p className="font-['Inter'] font-semibold text-[18px] text-[#25213b] dark:text-white">
                  {product.unit === 'шт' ? 'Штук' : 
                   product.unit === 'кг' ? 'Килограмм' :
                   product.unit === 'л' ? 'Литр' :
                   product.unit === 'м' ? 'Метр' : 'Упаковка'}
                </p>
              </div>
              <div className="bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-4">
                <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4] mb-1">
                  Итого
                </p>
                <p className="font-['Inter'] font-semibold text-[18px] text-[#6d5bd0]">
                  ${product.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения значения поля
function FieldValueDisplay({ value, field }) {
  if (value === null || value === undefined) return '—';
  
  const fieldType = field?.field_type;
  
  switch (fieldType) {
    case 'boolean':
      return value ? 'Да' : 'Нет';
    
    case 'image':
      return value ? (
        <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover" />
      ) : '—';
    
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded border border-[#e8e4ff] dark:border-[#3d3860]" 
            style={{ backgroundColor: value }}
          />
          <span>{value}</span>
        </div>
      );
    
    case 'multiselect':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    
    case 'range':
      return `${value} ${field?.unit || ''}`.trim();
    
    case 'select':
    case 'text':
    case 'textarea':
    case 'number':
    case 'decimal':
    case 'date':
    case 'datetime':
    case 'email':
    case 'phone':
    case 'url':
      return String(value);
    
    default:
      return String(value);
  }
}
