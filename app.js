document.documentElement.classList.add('js');

const dayparts = {
  morning: {
    title: 'Morning counter',
    time: '09:00 - 12:00',
    pace: 'Doors open',
    copy: "The day starts here — ask in-store for what's fresh on the board this morning.",
  },
  midday: {
    title: 'Midday counter',
    time: '12:00 - 15:00',
    pace: 'Busiest stretch',
    copy: 'Lunch at the park — the counter runs at its steadiest through the middle of the day.',
  },
  evening: {
    title: 'Evening counter',
    time: '15:00 - 18:00',
    pace: 'Wind-down',
    copy: 'A quieter close to the day as the rest of the centre winds down alongside us.',
  },
};

const pulses = {
  open: {
    kicker: 'Doors open',
    title: '09:00, Monday to Saturday.',
    copy: "The centre's own restaurant opens with the rest of Pacific Business Park — Sunday hours run shorter, 09:00 to 13:00.",
  },
  midday: {
    kicker: 'Lunch at the park',
    title: 'The middle of the day is the busiest stretch.',
    copy: 'Tenants and shoppers from across the centre pass through around midday.',
  },
  afternoon: {
    kicker: 'Steady trade',
    title: 'A calmer pocket before the close.',
    copy: 'The afternoon settles into a steadier pace ahead of closing time.',
  },
  close: {
    kicker: 'Doors close',
    title: '18:00, Monday to Saturday.',
    copy: 'Sundays close earlier, at 13:00, matching the rest of Pacific Business Park.',
  },
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pointerX = 0.5;
let pointerY = 0.5;

function refreshIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
  }
}

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    document.body.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    toggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    refreshIcons();
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      toggle.innerHTML = '<i data-lucide="menu"></i>';
      refreshIcons();
    });
  });
}

function initScrollState() {
  const progress = document.getElementById('scroll-progress-bar');
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const links = Array.from(document.querySelectorAll('.desktop-nav a'));

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;

    const active = sections
      .slice()
      .reverse()
      .find((section) => section.getBoundingClientRect().top <= 120);
    if (!active) return;

    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${active.id}`);
    });
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  items.forEach((item) => observer.observe(item));
}

function capeTownTimeParts() {
  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return {
    weekday: parts.weekday,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function updateTradingStatus() {
  const time = capeTownTimeParts();
  const isSunday = time.weekday === 'Sunday';
  const opensAt = 9 * 60;
  const closesAt = (isSunday ? 13 : 18) * 60;
  const current = time.hour * 60 + time.minute;
  const isOpen = current >= opensAt && current < closesAt;
  const closeLabel = isSunday ? '13:00' : '18:00';
  const timeLabel = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;

  let statusLabel;
  if (isOpen) {
    statusLabel = `Open until ${closeLabel}`;
  } else if (current < opensAt) {
    statusLabel = 'Opens today at 09:00';
  } else if (time.weekday === 'Saturday') {
    statusLabel = 'Opens Sunday at 09:00';
  } else if (time.weekday === 'Sunday') {
    statusLabel = 'Opens Monday at 09:00';
  } else {
    statusLabel = 'Opens tomorrow at 09:00';
  }

  const clock = document.getElementById('live-clock');
  if (clock) clock.textContent = timeLabel;

  const statusLabelEl = document.getElementById('status-label');
  if (statusLabelEl) statusLabelEl.textContent = statusLabel;

  const statusPill = document.getElementById('status-pill');
  if (statusPill) statusPill.classList.toggle('is-open', isOpen);

  const routeStamp = document.getElementById('route-stamp');
  if (routeStamp) routeStamp.textContent = isOpen ? 'Open now' : 'Closed';
}

function initDayparts() {
  const buttons = Array.from(document.querySelectorAll('.special-ticket'));
  const title = document.getElementById('special-title');
  const time = document.getElementById('special-time');
  const pace = document.getElementById('special-pace');
  const copy = document.getElementById('special-copy');

  function selectDaypart(id) {
    const daypart = dayparts[id];
    if (!daypart) return;

    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.special === id);
    });

    title.textContent = daypart.title;
    time.textContent = daypart.time;
    pace.textContent = daypart.pace;
    copy.textContent = daypart.copy;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => selectDaypart(button.dataset.special));
  });
}

function initPulse() {
  const slots = Array.from(document.querySelectorAll('.time-slot'));
  const kicker = document.getElementById('pulse-kicker');
  const title = document.getElementById('pulse-title');
  const copy = document.getElementById('pulse-copy');

  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      const pulse = pulses[slot.dataset.pulse];
      if (!pulse) return;

      slots.forEach((item) => item.classList.toggle('active', item === slot));
      kicker.textContent = pulse.kicker;
      title.textContent = pulse.title;
      copy.textContent = pulse.copy;
    });
  });
}

function initEventMode() {
  const button = document.getElementById('event-mode-button');

  button.addEventListener('click', () => {
    const active = document.body.classList.toggle('event-mode');
    button.setAttribute('aria-pressed', String(active));
  });
}

function initPointer() {
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX / window.innerWidth;
      pointerY = event.clientY / window.innerHeight;
    },
    { passive: true },
  );
}

function setupCanvas(canvas, draw) {
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(box.width));
    height = Math.max(1, Math.floor(box.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function frame(time = 0) {
    draw(context, width, height, time);
    if (!reducedMotion) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  frame();
}

function drawHeroScene(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  const drift = reducedMotion ? 0 : time * 0.001;
  const px = (pointerX - 0.5) * 26;
  const py = (pointerY - 0.5) * 18;

  ctx.save();
  ctx.translate(px, py);

  ctx.fillStyle = '#151515';
  ctx.fillRect(width * 0.06, height * 0.16, width * 0.88, height * 0.28);

  for (let i = 0; i < 5; i += 1) {
    const x = width * 0.09 + i * width * 0.17;
    ctx.fillStyle = i % 2 === 0 ? '#242424' : '#1b1b1b';
    ctx.fillRect(x, height * 0.19, width * 0.13, height * 0.2);
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(x + 14, height * 0.22, width * 0.07, 6);
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(x + 14, height * 0.26, width * 0.09, 4);
    ctx.fillRect(x + 14, height * 0.3, width * 0.06, 4);
  }

  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.54);
  ctx.lineTo(width * 0.9, height * 0.49);
  ctx.lineTo(width, height * 0.72);
  ctx.lineTo(0, height * 0.76);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i += 1) {
    const x = width * (i / 13);
    ctx.beginPath();
    ctx.moveTo(width * 0.48, height * 0.5);
    ctx.lineTo(x, height * 0.82);
    ctx.stroke();
  }

  for (let i = 0; i < 8; i += 1) {
    const y = height * 0.58 + i * 34;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y - 20);
    ctx.stroke();
  }

  const ticketCount = 12;
  for (let i = 0; i < ticketCount; i += 1) {
    const lane = i % 3;
    const speed = 52 + lane * 16;
    const start = ((drift * speed + i * 130) % (width + 180)) - 120;
    const y = height * 0.13 + lane * 38;
    ctx.fillStyle = i % 2 === 0 ? '#f2f2f2' : '#bcbcbc';
    ctx.fillRect(start, y, 72, 22);
    ctx.fillStyle = '#111111';
    ctx.fillRect(start + 9, y + 8, 38, 3);
  }

  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 97 + drift * 32) % width) - 30;
    const y = height * 0.78 + Math.sin(drift + i) * 12;
    ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#8d8d8d';
    ctx.globalAlpha = i % 3 === 0 ? 0.8 : 0.38;
    ctx.fillRect(x, y, 38, 2);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRoute(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  for (let x = -40; x < width + 60; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + width * 0.26, height);
    ctx.stroke();
  }

  ctx.strokeStyle = '#f4f4f4';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(width * 0.12, height * 0.68);
  ctx.bezierCurveTo(width * 0.33, height * 0.36, width * 0.58, height * 0.82, width * 0.82, height * 0.28);
  ctx.stroke();

  const pulse = reducedMotion ? 0.72 : 0.55 + Math.sin(time * 0.004) * 0.17;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.28, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.28, 6, 0, Math.PI * 2);
  ctx.fill();
}

function initCanvases() {
  setupCanvas(document.getElementById('hero-canvas'), drawHeroScene);
  setupCanvas(document.getElementById('route-canvas'), drawRoute);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshIcons();
  initNav();
  initScrollState();
  initReveal();
  updateTradingStatus();
  window.setInterval(updateTradingStatus, 15000);
  initDayparts();
  initPulse();
  initEventMode();
  initPointer();
  initCanvases();
});
