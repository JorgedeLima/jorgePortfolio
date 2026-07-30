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
  if (!m || reduced()) { els.forEach(e => (e.style.opacity = '1')); return; }
  const state = new WeakSet();
  const show = (el, animated) => {
    if (state.has(el)) return;
    state.add(el);
    if (animated) {
      const d = parseFloat(el.dataset.revealDelay || 0);
      m.animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, delay: d, ease: EASE });
    } else {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  };
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.willChange = 'opacity, transform';
    m.inView(el, () => show(el, true), { margin: '0px 0px -10% 0px' });
  });
  // Sweep: anything already scrolled past (or into view) after a jump/fling
  // must never be left hidden, even if the observer missed it.
  let queued = false;
  const sweep = () => {
    queued = false;
    els.forEach(el => {
      if (state.has(el)) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0) show(el, false);
      else if (r.top < window.innerHeight) show(el, true);
    });
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', onScroll);
  window.addEventListener('resize', onScroll, { passive: true });
  setTimeout(sweep, 1200);
}

export async function heroStagger(root) {
  const m = await M();
  const els = [...root.querySelectorAll('[data-hero]')];
  if (!m || reduced()) { els.forEach(e => (e.style.opacity = '1')); return; }
  els.forEach(e => { e.style.opacity = '0'; });
  m.animate(els, { opacity: [0, 1], y: [18, 0] },
    { duration: 0.8, delay: m.stagger(0.06, { startDelay: 0.05 }), ease: EASE });
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
    let done = false;
    m.inView(el, () => {
      if (done) return;
      done = true;
      m.animate(0, to, {
        duration: 1.1, ease: EASE,
        onUpdate: v => { el.textContent = pre + v.toFixed(dec) + suf; }
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
    l.style.color = on ? '#16181C' : '#8A857D';
    const tick = l.querySelector('[data-tick]');
    if (tick) {
      tick.style.background = on ? '#F15A22' : '#D8D3CA';
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
