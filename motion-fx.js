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
// Deliberately native: driven by scroll position + getBoundingClientRect rather
// than the animation library, because a silent failure here breaks reading
// orientation on long case studies (the library's scroll/inView helpers have
// failed to apply on some pages in production).
export async function scrollProgress(root) {
  const bar = root.querySelector('[data-progress]');
  const article = root.querySelector('[data-article]');
  const links = [...root.querySelectorAll('[data-rail-link]')];
  // Resolved lazily, not at mount: the article's sections are streamed in after
  // componentDidMount runs, so caching them here captures nulls forever.
  const sections = new Array(links.length).fill(null);
  const secFor = i => sections[i] || (sections[i] = root.querySelector('#' + links[i].dataset.railLink));

  // Click-to-jump first, so navigation works even if anything below throws.
  links.forEach(l => l.addEventListener('click', e => {
    const t = root.querySelector('#' + l.dataset.railLink);
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 110, behavior: reduced() ? 'auto' : 'smooth' });
  }));

  if (!links.length) return;

  let current = -1;
  const paint = i => {
    if (i === current) return;
    current = i;
    links.forEach((l, n) => {
      const on = n === i;
      l.style.color = on ? '#16181C' : '#6E6A64';
      l.style.transition = 'color 0.25s ease';
      const tick = l.querySelector('[data-tick]');
      if (tick) {
        tick.style.transition = 'background 0.25s ease, width 0.25s ease';
        tick.style.background = on ? '#B8430F' : '#D8D3CA';
        tick.style.width = on ? '20px' : '10px';
      }
    });
  };

  if (bar) {
    bar.style.transformOrigin = 'left';
    bar.style.transform = 'scaleX(0)';
    bar.style.willChange = 'transform';
  }

  const update = () => {
    if (bar && article) {
      const r = article.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the article top reaches mid-viewport, 1 when its end reaches the bottom.
      const total = r.height - vh * 0.5;
      const done = vh * 0.5 - r.top;
      const p = total > 0 ? Math.min(1, Math.max(0, done / total)) : (r.top <= vh * 0.5 ? 1 : 0);
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    // Active section = the last one whose top has passed the reading line.
    const line = window.innerHeight * 0.45;
    let active = 0;
    links.forEach((l, i) => { const sec = secFor(i); if (sec && sec.getBoundingClientRect().top <= line) active = i; });
    // At the end of the page the final section may be too short to ever cross
    // the reading line, so clamp to the last item once we're at the bottom.
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) active = links.length - 1;
    paint(active);
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  // Capture phase on document: scroll events don't bubble, so this is the only
  // way to catch pages whose scrolling happens in a wrapper rather than window.
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Late-loading images and embeds change section offsets.
  window.addEventListener('load', onScroll);
  // Reconciliation tick: a scroll event missed while the pointer is over an
  // embedded iframe would otherwise leave the rail stale. update() is pure
  // measurement and paint() no-ops when nothing changed, so this is cheap.
  setInterval(() => { if (!document.hidden) update(); }, 400);
  update();
}
