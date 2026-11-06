(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header state */
  const hdr = document.querySelector('.hdr');
  const onScroll = () => {
    if (!hdr) return;
    hdr.classList.toggle('is-scrolled', window.scrollY > 12);
    const top = document.querySelector('[data-totop]');
    if (top) top.classList.toggle('is-on', window.scrollY > 900);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const burger = document.querySelector('[data-burger]');
  const mmenu = document.querySelector('[data-mmenu]');
  if (burger && mmenu) {
    const close = () => {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      mmenu.setAttribute('aria-hidden', 'true');
    };
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', String(open));
      mmenu.setAttribute('aria-hidden', String(!open));
    });
    mmenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* to top */
  const totop = document.querySelector('[data-totop]');
  if (totop) {
    totop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* reveal on scroll */
  const revealTargets = document.querySelectorAll(
    '.shead, .dir, .numbers__item, .feat__card, .split__text, .split__media, .itgrid__media, .itgrid__list, .eco__text, .eco__media, .flow__step, .case, .partners__item, .value, .timeline__item, .team__item, .sciblock, .two__media, .two__text, .reqs, .svc__item, .lab, .lab__media, .edu > *, .noteband, .prow, .results__item, .pdetail__head > *, .pdetail__content, .effects, .specs, .sim__col, .sim__media, .featlist, .system, .integrated > *, .challenge, .stage, .eco2 > *, .tabs__bar, .tabs__panel.is-active, .adapt__item, .landfill > *, .partners__note > *, .pcard, .plist__item, .sci__text, .sci__facts, .collab article, .contacts__info, .contacts__map, .policy h2, .intro > *, .fact'
  );

  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 40}ms`;
      io.observe(el);
    });
  }

  /* accordion */
  document.querySelectorAll('[data-acc]').forEach((acc) => {
    const buttons = [...acc.querySelectorAll('.acc__btn')];
    const setPanel = (btn, open) => {
      const panel = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', String(open));
      if (panel) panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
    };
    buttons.forEach((btn) => {
      setPanel(btn, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach((b) => setPanel(b, false));
        if (!open) setPanel(btn, true);
      });
    });
    window.addEventListener('resize', () => {
      buttons.forEach((b) => {
        if (b.getAttribute('aria-expanded') === 'true') setPanel(b, true);
      });
    });
  });

  /* tabs */
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[data-tab]')];
    const panels = [...tabs.querySelectorAll('[data-panel]')];
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        panels.forEach((p) => {
          const on = p.dataset.panel === id;
          p.classList.toggle('is-active', on);
          if (on) {
            p.classList.remove('reveal', 'is-in');
          }
        });
      });
    });
  });

  /* filters */
  document.querySelectorAll('[data-filter-bar]').forEach((bar) => {
    const buttons = [...bar.querySelectorAll('[data-filter]')];
    const grid = bar.parentElement.querySelector('[data-catalog]');
    if (!grid) return;
    const items = [...grid.querySelectorAll('[data-cat]')];
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.filter;
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        items.forEach((item) => {
          const show = value === 'all' || item.dataset.cat === value;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });
  });

  /* form → mailto */
  document.querySelectorAll('[data-form]').forEach((form) => {
    const status = form.querySelector('.form__status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const consent = data.get('consent');

      form.querySelectorAll('.is-error').forEach((el) => el.classList.remove('is-error'));

      if (!name) {
        form.querySelector('[name="name"]').classList.add('is-error');
        if (status) status.textContent = 'Укажите, пожалуйста, имя.';
        return;
      }
      if (!phone && !email) {
        form.querySelector('[name="phone"]').classList.add('is-error');
        if (status) status.textContent = 'Оставьте телефон или e-mail для ответа.';
        return;
      }
      if (!consent) {
        if (status) status.textContent = 'Нужно согласие на обработку персональных данных.';
        return;
      }

      const lines = [
        `Имя: ${name}`,
        phone ? `Телефон: ${phone}` : '',
        email ? `E-mail: ${email}` : '',
        company ? `Компания: ${company}` : '',
        message ? `\nЗадача:\n${message}` : ''
      ].filter(Boolean);

      const subject = encodeURIComponent(`Заявка с сайта ПрогнозРНМ — ${name}`);
      const bodyText = encodeURIComponent(`${lines.join('\n')}\n\n—\nСформировано на сайте ПрогнозРНМ`);
      if (status) status.textContent = 'Открываем почтовый клиент…';
      window.location.href = `mailto:prognozrnm@mail.ru?subject=${subject}&body=${bodyText}`;
      setTimeout(() => {
        if (status) status.textContent = 'Если письмо не открылось — напишите нам на prognozrnm@mail.ru или позвоните.';
      }, 1200);
    });

    form.querySelectorAll('input, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('is-error'));
    });
  });

  /* phone mask (light) */
  document.querySelectorAll('input[name="phone"]').forEach((input) => {
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
      if (digits.startsWith('7')) digits = digits.slice(1);
      digits = digits.slice(0, 10);
      let out = '+7';
      if (digits.length) out += ` (${digits.slice(0, 3)}`;
      if (digits.length >= 3) out += ')';
      if (digits.length > 3) out += ` ${digits.slice(3, 6)}`;
      if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
      if (digits.length > 8) out += `-${digits.slice(8, 10)}`;
      input.value = digits.length ? out : '';
    });
  });
})();
