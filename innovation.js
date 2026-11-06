(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modes = {
    engineering: {
      title: 'Инжиниринг и исследования',
      text: 'Лабораторные исследования, расчёты и проектирование — основа надёжного технологического решения.',
      link: '/uslugi', label: 'Изучить инженерные услуги'
    },
    digital: {
      title: 'Цифровые двойники',
      text: 'Моделируем технологические процессы и проверяем сценарии до внедрения на реальном объекте.',
      link: '/it-resheniya', label: 'Изучить IT-решения'
    },
    water: {
      title: 'Электрохимическая очистка',
      text: 'Очистка промышленных стоков и подготовка воды. Подбираем технологию под состав загрязнений.',
      link: '/ekologiya', label: 'Изучить технологию очистки'
    }
  };
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const modeTitle = document.querySelector('[data-mode-title]');
  const modeText = document.querySelector('[data-mode-text]');
  const modeLink = document.querySelector('[data-mode-link]');
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = modes[button.dataset.mode];
      if (!mode || !modeTitle || !modeText || !modeLink) return;
      modeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      modeTitle.textContent = mode.title;
      modeText.textContent = mode.text;
      modeLink.href = mode.link;
      modeLink.firstChild.textContent = `${mode.label} `;
      if (!reduceMotion) {
        document.querySelector('[data-hero-panel]')?.animate(
          [{ opacity: .6, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 260, easing: 'ease-out' }
        );
      }
    });
  });

  const meter = document.querySelector('[data-scroll-meter]');
  let ticking = false;
  const updateMeter = () => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    if (meter) meter.style.transform = `scaleX(${scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0})`;
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
  const toggle = dock?.querySelector('[data-contact-toggle]');
  const panel = dock?.querySelector('[data-contact-panel]');
  if (dock && toggle && panel) {
    const setOpen = (open, restoreFocus = true) => {
      const focusInside = panel.contains(document.activeElement);
      dock.classList.toggle('is-open', open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('a, button')?.focus({ preventScroll: true });
      else if (restoreFocus && focusInside) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    dock.querySelector('[data-contact-close]')?.addEventListener('click', () => setOpen(false));
    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false); }
    });
    document.addEventListener('click', (event) => {
      if (!panel.hidden && !dock.contains(event.target)) setOpen(false, false);
    });
    document.addEventListener('focusin', (event) => {
      if (!panel.hidden && !dock.contains(event.target)) setOpen(false, false);
    });
  }

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.closest('.ch-hub')?.querySelector('[data-copy-status]');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy || '');
        if (status) status.textContent = 'Электронная почта скопирована.';
        button.querySelector('span').textContent = 'Скопировано';
        setTimeout(() => { button.querySelector('span').textContent = 'Копировать'; }, 2500);
      } catch (_) {
        if (status) status.textContent = `Не удалось скопировать автоматически. Почта: ${button.dataset.copy}`;
      }
    });
  });

  /* Keep hidden navigation out of keyboard order; focus stays in the open menu. */
  const menu = document.querySelector('[data-mmenu]');
  const burger = document.querySelector('[data-burger]');
  if (menu && burger) {
    menu.inert = !document.body.classList.contains('menu-open');
    const syncMenu = () => {
      const open = document.body.classList.contains('menu-open');
      const inside = menu.contains(document.activeElement);
      menu.inert = !open;
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      else if (inside) burger.focus({ preventScroll: true });
    };
    new MutationObserver(syncMenu).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab' || !document.body.classList.contains('menu-open')) return;
      const controls = [burger, ...menu.querySelectorAll('a, button, input')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
})();
