(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modes = {
    company: {
      title: 'Одна инженерная школа',
      text: 'Очистка воды, нефтесервис и цифровые двойники: от лабораторных испытаний до сопровождения на объекте.',
      link: '/o-kompanii', label: 'О компании',
      image: '/assets/hero-company.jpg', alt: 'Промышленный технологический цех с трубопроводами и запорной арматурой',
      badge: 'Научно-производственная компания', detail: 'Пермь · с 2014 года', caption: 'Инженерия · Наука · Оборудование'
    },
    engineering: {
      title: 'Инжиниринг и исследования',
      text: 'Лабораторные исследования, расчёты и проектирование — основа надёжного технологического решения.',
      link: '/uslugi', label: 'Изучить инженерные услуги',
      image: '/assets/lab.jpg', alt: 'Лабораторное оборудование из материалов компании',
      badge: 'Научная основа', detail: 'Исследования и инжиниринг', caption: 'Лабораторная база · Инженерные исследования'
    },
    digital: {
      title: 'Цифровые двойники',
      text: 'Моделируем технологические процессы и проверяем сценарии до внедрения на реальном объекте.',
      link: '/it-resheniya', label: 'Изучить IT-решения',
      image: '/assets/innovation-core-web.jpg', alt: 'Концептуальная 3D-иллюстрация физического ядра и цифровой модели',
      badge: 'Концептуальная иллюстрация', detail: 'Физика + цифровая модель', caption: 'Концепция инженерной системы · ПрогнозРНМ'
    },
    water: {
      title: 'Очистка воды электролизом',
      text: 'Запатентованная электрохимическая технология: промышленные стоки, водоподготовка и фильтрат полигонов. Схема под состав воды и требования объекта.',
      link: '/ekologiya', label: 'Изучить очистку воды',
      image: '/assets/water-electro.jpg', alt: 'Электролизная ячейка очистки воды: электродные пластины и пузырьки газа',
      badge: 'Приоритетное направление', detail: 'Запатентованный электролиз', caption: 'Электрохимическая ячейка · Очистка воды'
    }
  };
  const modeButtons = [.../** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('[data-mode]'))];
  const modeTitle = document.querySelector('[data-mode-title]');
  const modeText = document.querySelector('[data-mode-text]');
  const modeLink = /** @type {HTMLAnchorElement|null} */ (document.querySelector('[data-mode-link]'));
  const view = /** @type {HTMLElement|null} */ (document.querySelector('.twin-view'));
  const image = /** @type {HTMLImageElement|null} */ (document.querySelector('[data-mode-image]'));
  const badge = document.querySelector('[data-mode-badge]');
  const caption = document.querySelector('[data-mode-caption]');
  modeButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', () => {
      const key = button.dataset.mode;
      const mode = key ? modes[key] : null;
      if (!mode || !modeTitle || !modeText || !(modeLink instanceof HTMLAnchorElement)) return;
      modeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      modeTitle.textContent = mode.title;
      modeText.textContent = mode.text;
      modeLink.href = mode.link;
      if (modeLink.firstChild) modeLink.firstChild.textContent = `${mode.label} `;
      if (view instanceof HTMLElement) view.dataset.currentMode = key || '';
      if (image instanceof HTMLImageElement) { image.src = mode.image; image.alt = mode.alt; }
      if (badge) {
        badge.replaceChildren(document.createTextNode(mode.badge), document.createElement('br'));
        const detail = document.createElement('b');
        detail.textContent = mode.detail;
        badge.append(detail);
      }
      if (caption) caption.textContent = mode.caption;
      if (!reduceMotion) {
        document.querySelector('[data-hero-panel]')?.animate(
          [{ opacity: .6, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 260, easing: 'ease-out' }
        );
      }
    });
  });

  const meter = /** @type {HTMLElement|null} */ (document.querySelector('[data-scroll-meter]'));
  let ticking = false;
  const updateMeter = () => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    if (meter instanceof HTMLElement) meter.style.transform = `scaleX(${scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateMeter); }
  }, { passive: true });
  window.addEventListener('resize', updateMeter);
  updateMeter();
})();

/* Reusable non-modal contact disclosure, clipboard and keyboard behavior. */
(() => {
  'use strict';
  const dock = document.querySelector('[data-contact-dock]');
  const toggle = /** @type {HTMLButtonElement|null} */ (dock?.querySelector('[data-contact-toggle]') || null);
  const panel = /** @type {HTMLElement|null} */ (dock?.querySelector('[data-contact-panel]') || null);
  if (dock && toggle instanceof HTMLButtonElement && panel instanceof HTMLElement) {
    const setOpen = (open, restoreFocus = true) => {
      const focusInside = panel.contains(document.activeElement);
      dock.classList.toggle('is-open', open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { const first = panel.querySelector('a, button'); if (first instanceof HTMLElement) first.focus({ preventScroll: true }); }
      else if (restoreFocus && focusInside) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    dock.querySelector('[data-contact-close]')?.addEventListener('click', () => setOpen(false));
    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false); }
    });
    document.addEventListener('click', (event) => {
      if (!panel.hidden && event.target instanceof Node && !dock.contains(event.target)) setOpen(false, false);
    });
    document.addEventListener('focusin', (event) => {
      if (!panel.hidden && event.target instanceof Node && !dock.contains(event.target)) setOpen(false, false);
    });
  }

  const copyButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('[data-copy]'));
  copyButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', async () => {
      const status = button.closest('.ch-hub')?.querySelector('[data-copy-status]');
      const label = button.querySelector('span');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy || '');
        if (status) status.textContent = 'Электронная почта скопирована.';
        if (label) {
          label.textContent = 'Скопировано';
          setTimeout(() => { label.textContent = 'Копировать'; }, 2500);
        }
      } catch (_) {
        if (status) status.textContent = `Не удалось скопировать автоматически. Почта: ${button.dataset.copy}`;
      }
    });
  });

  const menu = /** @type {HTMLElement|null} */ (document.querySelector('[data-mmenu]'));
  const burger = /** @type {HTMLButtonElement|null} */ (document.querySelector('[data-burger]'));
  if (menu instanceof HTMLElement && burger instanceof HTMLButtonElement) {
    menu.inert = !document.body.classList.contains('menu-open');
    const syncMenu = () => {
      const open = document.body.classList.contains('menu-open');
      const inside = menu.contains(document.activeElement);
      menu.inert = !open;
      if (open) { const first = menu.querySelector('a'); if (first instanceof HTMLElement) first.focus({ preventScroll: true }); }
      else if (inside) burger.focus({ preventScroll: true });
    };
    new MutationObserver(syncMenu).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab' || !document.body.classList.contains('menu-open')) return;
      const items = /** @type {NodeListOf<HTMLElement>} */ (menu.querySelectorAll('a, button, input'));
      const controls = [burger, ...items];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first && last instanceof HTMLElement) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last && first instanceof HTMLElement) { event.preventDefault(); first.focus(); }
    });
  }
})();
