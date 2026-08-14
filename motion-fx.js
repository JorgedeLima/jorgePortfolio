// Micro-animation wiring built on Motion (motion.dev). Loaded from DC logic classes.
const EASE = [0.16, 1, 0.3, 1];

async function M() {
  let n = 0;
  while (!window.Motion && n < 200) { await new Promise(r => setTimeout(r, 40)); n++; }
  return window.Motion || null;
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function reveal(root) {
  const m = await M();
  const els = [...root.querySelectorAll('[data-reveal]')];
  if (reduced()) { els.forEach(e => { e.style.opacity = '1'; }); return; }

  // The end state is written to inline style and the movement is a CSS
  // transition, so a reveal can never depend on the animation library
  // committing styles — if anything fails, the element still ends visible.
  const EASE_CSS = 'cubic-bezier(0.16,1,0.3,1)';
  const show = el => {
    if (el.dataset.revealed) return;
    el.dataset.revealed = '1';
    const d = parseFloat(el.dataset.revealDelay || 0);
    el.style.transition = `opacity 0.7s ${EASE_CSS} ${d}s, transform 0.7s ${EASE_CSS} ${d}s`;
    el.style.opacity = '1';
    el.style.transform = 'none';
    setTimeout(() => { el.style.willChange = 'auto'; }, (d + 0.8) * 1000);
  };
  const showNow = el => {
    if (el.dataset.revealed) return;
    el.dataset.revealed = '1';
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.willChange = 'auto';
  };

  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.willChange = 'opacity, transform';
  });

  const inViewport = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.9 && r.bottom > 0;
  };
  const sweep = () => els.forEach(el => {
    if (el.dataset.revealed) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0) showNow(el);      // already scrolled past
    else if (inViewport(el)) show(el);
  });

  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => io.observe(el));
  }

  let queued = false;
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; sweep(); }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', onScroll);
  window.addEventListener('resize', onScroll, { passive: true });
  requestAnimationFrame(sweep);
  // Last resort: nothing stays hidden, whatever went wrong.
  setTimeout(() => els.forEach(el => { if (!el.dataset.revealed) showNow(el); }), 3000);
}

export async function heroStagger(root) {
  const els = [...root.querySelectorAll('[data-hero]')];
  if (reduced()) { els.forEach(e => { e.style.opacity = '1'; }); return; }
  const EASE_CSS = 'cubic-bezier(0.16,1,0.3,1)';
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
  });
  requestAnimationFrame(() => els.forEach((el, i) => {
    const d = 0.05 + i * 0.06;
    el.style.transition = `opacity 0.8s ${EASE_CSS} ${d}s, transform 0.8s ${EASE_CSS} ${d}s`;
    el.style.opacity = '1';
    el.style.transform = 'none';
  }));
  // Guarantee: hero copy is never left hidden.
  setTimeout(() => els.forEach(el => {
    if (getComputedStyle(el).opacity !== '1') { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; }
  }), 2500);
}

// Cursor-follow highlight + subtle lift on work cards.
export async function cardHover(root) {
  const m = await M();
  const cards = [...root.querySelectorAll('[data-card]')];
  cards.forEach(card => {
    const glow = card.querySelector('[data-glow]');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      if (glow) {
        glow.style.setProperty('--mx', `${e.clientX - r.left}px`);
        glow.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    });
    if (!m || reduced()) return;
    const media = card.querySelector('[data-card-media]');
    card.addEventListener('pointerenter', () => {
      if (glow) m.animate(glow, { opacity: 1 }, { duration: 0.3 });
      m.animate(card, { y: -3 }, { type: 'spring', stiffness: 320, damping: 26 });
      if (media) m.animate(media, { scale: 1.02 }, { duration: 0.5, ease: EASE });
    });
    card.addEventListener('pointerleave', () => {
      if (glow) m.animate(glow, { opacity: 0 }, { duration: 0.4 });
      m.animate(card, { y: 0 }, { type: 'spring', stiffness: 320, damping: 26 });
      if (media) m.animate(media, { scale: 1 }, { duration: 0.5, ease: EASE });
    });
  });
}

export async function countUp(root) {
  const m = await M();
  const els = [...root.querySelectorAll('[data-count]')];
  if (!m || reduced()) return;
  els.forEach(el => {
    const to = parseFloat(el.dataset.count);
    const dec = (el.dataset.countDec | 0);
    const pre = el.dataset.countPre || '';
    const suf = el.dataset.countSuf || '';
    const group = el.dataset.countGroup !== undefined;
    const fmt = v => group
      ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : v.toFixed(dec);
    let done = false;
    m.inView(el, () => {
      if (done) return;
      done = true;
      m.animate(0, to, {
        duration: 1.1, ease: EASE,
        onUpdate: v => { el.textContent = pre + fmt(v) + suf; }
      });
    });
  });
}

// Sticky rail: scroll-driven progress line + active section marking.
export async function scrollProgress(root) {
  const m = await M();
  const bar = root.querySelector('[data-progress]');
  const article = root.querySelector('[data-article]');
  const links = [...root.querySelectorAll('[data-rail-link]')];
  const sections = links.map(l => root.querySelector(`#${l.dataset.railLink}`)).filter(Boolean);

  const paint = i => links.forEach((l, n) => {
    const on = n === i;
    l.style.color = on ? '#16181C' : '#6E6A64';
    const tick = l.querySelector('[data-tick]');
    if (tick) {
      tick.style.background = on ? '#B8430F' : '#D8D3CA';
      tick.style.width = on ? '20px' : '10px';
    }
  });
  paint(0);

  if (!m) return;
  if (bar && article) {
    bar.style.transformOrigin = 'left';
    m.scroll(m.animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }),
      { target: article, offset: ['start center', 'end end'] });
  }
  sections.forEach((s, i) => {
    m.inView(s, () => { paint(i); return () => {}; }, { margin: '-45% 0px -50% 0px' });
  });
  links.forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    const t = root.querySelector(`#${l.dataset.railLink}`);
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 110, behavior: reduced() ? 'auto' : 'smooth' });
  }));
}
