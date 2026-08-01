/* ============================================================
   You shouldn't need to touch this file — all personalization
   happens in config.js.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderText();
  startCountdown();
  buildLetter();
  buildConstellation();
  drawSky();
});

/* ---------- fill in personal text ---------- */
function renderText(){
  document.getElementById('hero-name').textContent = CONFIG.herName;
  document.getElementById('hero-line').textContent = CONFIG.heroLine;
  document.getElementById('countdown-label').textContent = CONFIG.countdownLabel;
  document.getElementById('closing-line').textContent = CONFIG.closingLine;
  document.getElementById('signoff').textContent = `— ${CONFIG.yourName}`;
}

/* ---------- countdown ---------- */
function startCountdown(){
  const target = new Date(CONFIG.countdownDate).getTime();
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };

  function tick(){
    const now = Date.now();
    let diff = target - now;
    if (isNaN(target)) return;
    if (diff < 0) diff = 0;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    els.d.textContent = String(d).padStart(2,'0');
    els.h.textContent = String(h).padStart(2,'0');
    els.m.textContent = String(m).padStart(2,'0');
    els.s.textContent = String(s).padStart(2,'0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ---------- letter, fades in paragraph by paragraph on scroll ---------- */
function buildLetter(){
  const wrap = document.getElementById('letter-text');
  CONFIG.letter.forEach(paragraph => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    wrap.appendChild(p);
  });

  const paragraphs = wrap.querySelectorAll('p');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.4 });

  paragraphs.forEach(p => io.observe(p));
}

/* ---------- constellation of memories ---------- */
function buildConstellation(){
  const starsWrap = document.getElementById('stars');
  const svg = document.getElementById('lines');
  const titleEl = document.getElementById('memory-title');
  const textEl = document.getElementById('memory-text');

  // Loose, hand-placed layout so it reads as a constellation, not a grid.
  const positions = [
    { x: 12, y: 70 },
    { x: 28, y: 30 },
    { x: 46, y: 55 },
    { x: 62, y: 20 },
    { x: 78, y: 48 },
    { x: 90, y: 15 },
  ];

  const memories = CONFIG.memories.slice(0, positions.length);
  const clickOrder = [];
  const lineEls = [];

  memories.forEach((mem, i) => {
    const pos = positions[i];

    const btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.style.left = pos.x + '%';
    btn.style.top = pos.y + '%';
    btn.setAttribute('aria-label', mem.title);

    const dot = document.createElement('span');
    dot.className = 'dot';
    btn.appendChild(dot);

    const label = document.createElement('span');
    label.className = 'star-label';
    label.textContent = mem.title;
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      titleEl.style.opacity = 0;
      textEl.style.opacity = 0;
      setTimeout(() => {
        titleEl.textContent = mem.title;
        textEl.textContent = mem.text;
        titleEl.style.opacity = 1;
        textEl.style.opacity = 1;
      }, 200);

      if (clickOrder[clickOrder.length - 1] !== i) {
        clickOrder.push(i);
        updateLines();
      }
    });

    starsWrap.appendChild(btn);
  });

  function updateLines(){
    for (let k = 0; k < clickOrder.length - 1; k++){
      const a = clickOrder[k];
      const b = clickOrder[k+1];
      const key = `${a}-${b}`;
      if (lineEls.find(l => l.key === key)) continue;

      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', positions[a].x + '%');
      line.setAttribute('y1', positions[a].y + '%');
      line.setAttribute('x2', positions[b].x + '%');
      line.setAttribute('y2', positions[b].y + '%');
      svg.appendChild(line);
      requestAnimationFrame(() => line.classList.add('on'));
      lineEls.push({ key, line });
    }
  }
}

/* ---------- ambient twinkling starfield ---------- */
function drawSky(){
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.body.scrollHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
    }));
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frame(t){
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const twinkle = prefersReducedMotion ? 1 : (Math.sin(t * s.speed + s.phase) + 1) / 2;
      const alpha = 0.25 + twinkle * 0.65;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,241,230,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}
