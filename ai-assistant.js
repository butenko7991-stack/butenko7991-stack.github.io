/* Assistent: offline knowledge base + optional LLM endpoint. */
(() => {
  const root = document.querySelector('[data-ai]');
  if (!root) return;

  const log = root.querySelector('[data-ai-log]');
  const form = root.querySelector('[data-ai-form]');
  const input = root.querySelector('[data-ai-input]');
  const openBtn = root.querySelector('[data-ai-open]');
  const closeBtn = root.querySelector('[data-ai-close]');
  const panel = root.querySelector('[data-ai-panel]');
  const chips = root.querySelector('[data-ai-chips]');
  const endpoint = (root.dataset.aiEndpoint || '').trim();

  /* knowledge base: answers are limited to published site content */
  const KB = [
    {
      id: 'company',
      q: 'Чем занимается компания',
      keys: ['компания', 'прогнозрнм', 'чем занимаетесь', 'о вас', 'направления', 'деятельность'],
      a: 'МИП «ПрогнозРНМ» — пермское инженерное предприятие при ПНИПУ, работает с 2014 года. Четыре направления: инжиниринг и нефтесервис, оборудование и химия, цифровизация, очистка и подготовка воды (приоритет).',
      link: ['/o-kompanii', 'О компании']
    },
    {
      id: 'water',
      q: 'Как работает очистка воды',
      keys: ['очистка', 'вода', 'технология', 'электрохимия', 'электрокоагуляция', 'стадии', 'как устроена'],
      a: 'Семь стадий в одном блоке: химводоподготовка, вакуумная эжекция, электрокоагуляция, флотация, фильтрация, осветление, стерилизация. Состав и порядок подбираются под конкретный сток, коагулянт вырабатывается на месте.',
      link: ['/ekologiya#technology', 'Технология очистки']
    },
    {
      id: 'streams',
      q: 'Какие стоки вы очищаете',
      keys: ['стоки', 'какие воды', 'шахтные', 'кислые', 'нефтесодержащие', 'фильтрат', 'бытовые', 'применение'],
      a: 'Кислые шахтные воды, нефтесодержащие стоки, стоки химических и пищевых производств, воды с тяжёлыми металлами, коммунально-бытовые стоки, фильтрат полигонов ТКО и подготовка питьевой воды.',
      link: ['/ekologiya#execution', 'Области применения']
    },
    {
      id: 'landfill',
      q: 'Фильтрат полигонов',
      keys: ['фильтрат', 'полигон', 'тко', 'свалка', 'концентрат', 'осмос'],
      a: 'Для фильтрата полигонов два сценария: очистка всего объёма в проточном блоке или обработка концентрата после обратного осмоса — снижение объёма жидких отходов. Схема выбирается по анализу и требуемому сбросу.',
      link: ['/ekologiya#landfill', 'Фильтрат полигонов']
    },
    {
      id: 'numbers',
      q: 'Какие показатели очистки',
      keys: ['показатели', 'эффективность', 'результат', 'испытания', 'пробы', 'протокол'],
      a: 'Эффективность зависит от состава воды и режима обработки, поэтому универсальных цифр мы не приводим: показатели подтверждаются испытанием вашей пробы. По запросу показываем протоколы по аналогичным стокам.',
      link: ['/ekologiya#tests', 'Опыт по типам стоков']
    },
    {
      id: 'capacity',
      q: 'Расход и производительность',
      keys: ['расход', 'производительность', 'м3', 'кубометр', 'объём', 'литров', 'мощность'],
      a: 'Блок-бокс собирается под расход объекта: от нескольких кубометров в час до промышленных объёмов. Ограничение — не производительность, а состав воды и требуемое качество на выходе.',
      link: ['/ekologiya#raschet', 'Этапы и расчёт']
    },
    {
      id: 'price',
      q: 'Сроки и стоимость',
      keys: ['стоимость', 'цена', 'сколько стоит', 'срок', 'сроки', 'бюджет', 'кп', 'коммерческое'],
      a: 'Стоимость зависит от расхода, состава стока и комплектации: насосы, автоматика, система химводоподготовки. Срок изготовления обсуждается после расчёта. Пришлите анализ воды и расход — подготовим предложение.',
      link: ['/ekologiya#raschet', 'Этапы и расчёт']
    },
    {
      id: 'start',
      q: 'Как начать проект',
      keys: ['начать', 'старт', 'первый шаг', 'как заказать', 'процесс', 'этапы', 'пилот'],
      a: 'Пять шагов: анализ стока и требований, технологический расчёт, пилотные испытания при необходимости, изготовление и пусконаладка, сервис. Начать можно с письма или звонка.',
      link: ['/ekologiya#raschet', 'Этапы проекта']
    },
    {
      id: 'docs',
      q: 'Документы и сертификаты',
      keys: ['документы', 'какие документы', 'сертификат', 'сертификаты', 'декларация', 'тр тс', 'паспорт', 'паспорта', 'разрешение', 'лицензия', 'соответствие'],
      a: 'Оборудование поставляется с паспортами, инструкциями по эксплуатации и декларациями соответствия ТР ТС. ПО «Инженерный симулятор» соответствует приказу Минкомсвязи № 96 об импортозамещении.',
      link: ['/oborudovanie', 'Каталог и документы']
    },
    {
      id: 'equipment',
      q: 'Какое оборудование выпускаете',
      keys: ['оборудование', 'установка', 'каталог', 'производите', 'выпускаете', 'мупсп', 'букс', 'пакер', 'сепаратор', 'центрифуга'],
      a: 'Девять позиций: блочные установки подготовки нефти и воды (МУПСП, БУКС), гидравлический привод ШГН, устройство ввода реагентов RDI, клапан с точечным обогревом, сепараторы, пакер ЗПД-Г, осадительная центрифуга, реагентная химия.',
      link: ['/oborudovanie', 'Каталог оборудования']
    },
    {
      id: 'rdi',
      q: 'Устройство ввода реагентов RDI',
      keys: ['rdi', 'реагент', 'ввод химии', 'дозирование', 'ингибитор'],
      a: 'RDI — устройство ввода химических реагентов в трубопровод без остановки перекачки. Более 200 систем на месторождениях; на четырёх АГЗУ расход деэмульгатора снизился на 25–60%.',
      link: ['/oborudovanie/ustrojstvo-vvoda-himicheskih-reagentov-rdi', 'RDI']
    },
    {
      id: 'it',
      q: 'Цифровые решения и симулятор',
      keys: ['it', 'цифров', 'симулятор', 'по', 'программное', 'двойник', 'диспетчеризация', 'утечек', 'vr'],
      a: 'Флагман — «Инженерный симулятор технологических процессов»: 3D-модель промысла, расчёт режимов, подбор ГНО, тренажёры. Также мобильные обходы, СУПС, АСПБ, SCADA, локация утечек, VR-тренажёры.',
      link: ['/it-resheniya', 'IT-решения']
    },
    {
      id: 'regions',
      q: 'География и регионы',
      keys: ['регион', 'регионы', 'география', 'работаете', 'где вы работаете', 'пермь', 'россия', 'выезд', 'край'],
      a: 'База — Пермь, научная база ПНИПУ. Проекты и поставки выполняются на объектах нефтегазодобычи в разных регионах России, сервис — в Пермском крае и на выезде.',
      link: ['/proekty', 'Проекты']
    },
    {
      id: 'experience',
      q: 'Опыт и внедрения',
      keys: ['опыт', 'внедрения', 'опр', 'кейсы', 'проекты', 'сколько', 'клиенты'],
      a: 'В портфеле 12 успешных опытно-промышленных работ по блочно-модульным установкам, более 200 систем RDI на месторождениях, суммарная экономия заказчиков более 2 млн долларов.',
      link: ['/proekty', 'Проекты и внедрения']
    },
    {
      id: 'partners',
      q: 'Партнёры и научная база',
      keys: ['партнёр', 'партнер', 'пнипу', 'наука', 'вуз', 'сотрудничество', 'лаборатория'],
      a: 'Работаем с ПНИПУ и НОЦ «Рациональное недропользование», нефтегазовыми компаниями, производителями оборудования и телеком-операторами. Это даёт доступ к лабораторной базе и независимым испытаниям.',
      link: ['/partnery', 'Партнёры']
    },
    {
      id: 'contacts',
      q: 'Контакты',
      keys: ['контакт', 'телефон', 'почта', 'email', 'адрес', 'связаться', 'написать', 'позвонить', 'офис'],
      a: 'Телефон +7 342 258-38-00, почта office@prognozrnm.ru. Офис: Пермь, ул. Тимирязева, 24А, этаж 12, офис 1209. Работаем по будням, 9:00–18:00 (МСК+2).',
      link: ['/kontakty', 'Контакты']
    },
    {
      id: 'requisites',
      q: 'Реквизиты компании',
      keys: ['инн', 'огрн', 'реквизиты', 'юридическое', 'наименование', 'директор', 'учредитель'],
      a: 'ООО «Малое инновационное предприятие «ПрогнозРНМ». Директор — Бутенко Дмитрий Анатольевич, учредитель — Илюшин Павел Юрьевич. Полные реквизиты — на странице «О компании».',
      link: ['/o-kompanii', 'Реквизиты']
    }
  ];

  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const stem = (w) => (w.length > 5 ? w.slice(0, 5) : w);

  const STOP = new Set([
    'какие', 'какой', 'какая', 'каких', 'что', 'чем', 'как', 'где', 'когда', 'почему', 'зачем',
    'вы', 'вас', 'вам', 'ваш', 'ваши', 'мы', 'нам', 'нас', 'мне', 'это', 'этот', 'эта', 'есть',
    'для', 'или', 'при', 'про', 'под', 'над', 'без', 'так', 'все', 'ещё', 'еще', 'можно',
    'нужно', 'надо', 'ли', 'бы', 'же', 'то', 'не', 'да', 'нет', 'они', 'она', 'оно', 'если',
    'хочу', 'хотим', 'нужен', 'нужна', 'нужны', 'интересует', 'расскажите', 'подскажите'
  ]);

  const scoreEntry = (entry, tokens, phrase) => {
    const hay = {
      keys: entry.keys.map(normalize).join(' '),
      q: normalize(entry.q),
      a: normalize(entry.a)
    };
    let score = 0;
    tokens.forEach((t) => {
      const s = stem(t);
      if (s.length < 3) return;
      if (hay.keys.includes(s)) score += 6;
      if (hay.q.includes(s)) score += 4;
      if (hay.a.includes(s)) score += 2;
    });
    /* a key phrase inside the question counts more than single words */
    entry.keys.forEach((k) => {
      const key = normalize(k);
      if (key.length >= 9 && phrase.includes(key)) score += 9;
      else if (key.length >= 5 && phrase.includes(key)) score += 2;
    });
    return score;
  };

  const search = (text) => {
    const phrase = normalize(text);
    const tokens = phrase.split(' ').filter((t) => t.length > 2 && !STOP.has(t));
    if (!tokens.length) return null;
    const scored = KB.map((e, i) => ({ e, i, s: scoreEntry(e, tokens, phrase) })).sort((x, y) => y.s - x.s || x.i - y.i);
    return scored[0] && scored[0].s >= 8 ? scored[0].e : null;
  };

  /* water selection flow */
  const flow = { step: 0, stream: '', flowRate: '', goal: '' };
  const STREAMS = ['Кислые шахтные воды', 'Нефтесодержащие стоки', 'Фильтрат полигона', 'Стоки производства', 'Питьевая вода'];
  const RATES = ['до 5 м³/ч', '5–25 м³/ч', '25–100 м³/ч', 'больше 100 м³/ч', 'пока не знаю'];
  const GOALS = ['Сброс в водоём по нормативам', 'Повторное использование', 'Сократить объём отходов', 'Пилот перед покупкой'];

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  const scrollLog = () => {
    log.scrollTop = log.scrollHeight;
  };

  const addBot = (nodes) => {
    const wrap = el('div', 'ai__msg ai__msg--bot');
    nodes.forEach((n) => wrap.appendChild(n));
    log.appendChild(wrap);
    scrollLog();
  };

  const addUser = (text) => {
    const wrap = el('div', 'ai__msg ai__msg--user');
    wrap.appendChild(el('p', '', text));
    log.appendChild(wrap);
    scrollLog();
  };

  const answerNode = (entry) => {
    const frag = document.createDocumentFragment();
    frag.appendChild(el('p', '', entry.a));
    if (entry.link) {
      const a = el('a', 'ai__link', entry.link[1]);
      a.href = entry.link[0];
      frag.appendChild(a);
    }
    return frag;
  };

  const chipsFor = (options) => {
    const box = el('div', 'ai__quick');
    options.forEach((opt) => {
      const b = el('button', '', opt);
      b.type = 'button';
      b.addEventListener('click', () => handleQuick(opt));
      box.appendChild(b);
    });
    return box;
  };

  const askFlow = () => {
    flow.step = 1;
    addBot([
      el('p', '', 'Подберём решение по воде за три вопроса. Что за вода или сток?'),
      chipsFor(STREAMS)
    ]);
  };

  const flowAnswer = (value) => {
    if (flow.step === 1) {
      flow.stream = value;
      flow.step = 2;
      addBot([el('p', '', 'Какой расход? Ориентировочно достаточно.'), chipsFor(RATES)]);
      return true;
    }
    if (flow.step === 2) {
      flow.flowRate = value;
      flow.step = 3;
      addBot([el('p', '', 'Что важно получить в результате?'), chipsFor(GOALS)]);
      return true;
    }
    if (flow.step === 3) {
      flow.goal = value;
      flow.step = 0;
      const params = new URLSearchParams({ stream: flow.stream, flow: flow.flowRate, goal: flow.goal });
      const text =
        `По вашему описанию подходит блочно-модульная установка с электрокоагуляцией: ` +
        `${flow.stream.toLowerCase()}, ${flow.flowRate.toLowerCase()}, задача — ${flow.goal.toLowerCase()}. ` +
        `Точную схему подтверждает технологический расчёт по анализу воды.`;
      const frag = document.createDocumentFragment();
      frag.appendChild(el('p', '', text));
      const cta = el('div', 'ai__quick');
      const a1 = el('a', 'ai__cta', 'Запросить расчёт');
      a1.href = `/ekologiya?${params.toString()}#raschet`;
      const b2 = el('button', '', 'Другой сток');
      b2.type = 'button';
      b2.addEventListener('click', askFlow);
      cta.appendChild(a1);
      cta.appendChild(b2);
      frag.appendChild(cta);
      addBot([frag]);
      return true;
    }
    return false;
  };

  const reply = (text) => {
    addUser(text);
    const entry = search(text);
    if (!entry) {
      addBot([
        el('p', '', 'Пока не нашёл точного ответа в материалах сайта. Уточните, пожалуйста: тип стока или оборудование, расход. Либо задайте вопрос инженеру — ответим в рабочий день.'),
        (() => {
          const box = el('div', 'ai__quick');
          const a = el('a', 'ai__cta', 'Написать инженеру');
          a.href = '/kontakty#zayavka';
          const b = el('button', '', 'Подобрать решение по воде');
          b.type = 'button';
          b.addEventListener('click', askFlow);
          box.appendChild(a);
          box.appendChild(b);
          return box;
        })()
      ]);
      return;
    }
    addBot([answerNode(entry)]);
  };

  const handleQuick = (value) => {
    if (flow.step > 0 && flowAnswer(value)) return;
    if (/подобрать решение/i.test(value)) {
      addUser(value);
      askFlow();
      return;
    }
    reply(value);
  };

  /* optional LLM endpoint: same UX, answers from a server-side model */
  const askModel = async (question) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, page: location.pathname })
    });
    if (!res.ok) throw new Error('endpoint');
    const data = await res.json();
    return data.answer || '';
  };

  const open = () => {
    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => input.focus(), 180);
  };
  const close = () => {
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  };

  openBtn.addEventListener('click', open);
  document.querySelectorAll('[data-ai-start]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
      window.setTimeout(() => {
        addUser('Подобрать решение по воде');
        askFlow();
      }, 220);
    });
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-q]');
    if (btn) handleQuick(btn.dataset.q);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    if (flow.step > 0) {
      addUser(text);
      flowAnswer(text);
      return;
    }
    if (endpoint) {
      addUser(text);
      const pending = el('div', 'ai__msg ai__msg--bot');
      pending.appendChild(el('p', 'ai__typing', 'Печатает…'));
      log.appendChild(pending);
      scrollLog();
      try {
        const answer = await askModel(text);
        pending.remove();
        addBot([el('p', '', answer || 'Не удалось получить ответ. Попробуйте ещё раз или напишите инженеру.')]);
      } catch (err) {
        pending.remove();
        reply(text);
      }
      return;
    }
    reply(text);
  });
})();
