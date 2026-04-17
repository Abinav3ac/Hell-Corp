/**
 * HELLCORP — SHARED CORE LOGIC
 * Session, API, Toasts, Counters
 */
const HC = {
  token: () => localStorage.getItem('hc_token'),
  setToken: t => localStorage.setItem('hc_token', t),
  clear: () => localStorage.removeItem('hc_token'),

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'hc-toast';
    t.textContent = '⬛ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },

  async api(url, opts = {}) {
    const tk = HC.token();
    const h = { 'Content-Type': 'application/json', ...(tk && { Authorization: 'Bearer ' + tk }), ...opts.headers };
    const r = await fetch(url, { ...opts, headers: h });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'HGE_ERROR');
    return d;
  },

  counter(el, target, dur = 1400) {
    const s = performance.now();
    const u = t => {
      const p = Math.min((t - s) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target).toLocaleString();
      if (p < 1) requestAnimationFrame(u); else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(u);
  }
};

// Random card glitch effect
setInterval(() => {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;
  const c = cards[Math.floor(Math.random() * cards.length)];
  c.style.transform = `skewX(${(Math.random() - .5) * 1.5}deg)`;
  c.style.filter = 'brightness(1.08)';
  setTimeout(() => { c.style.transform = ''; c.style.filter = ''; }, 75);
}, 2800);
