(() => {
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── INTRO: black screen + mark, once per visit ── */
  const intro = document.getElementById('intro');
  let seen = false;
  try { seen = sessionStorage.getItem('cp-intro') === '1'; } catch (e) {}

  const finishIntro = () => {
    if (!intro || intro.classList.contains('is-done')) return;
    intro.classList.add('is-done');
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    try { sessionStorage.setItem('cp-intro', '1'); } catch (e) {}
  };

  if (seen || reduced) {
    if (intro) intro.style.display = 'none';
    body.classList.remove('is-loading');
    requestAnimationFrame(() => body.classList.add('is-ready'));
  } else {
    setTimeout(finishIntro, 2900);
    intro && intro.addEventListener('click', finishIntro);
  }

  /* ── NAV ── */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ── HERO: real video if media/hero.mp4 exists, otherwise a slideshow "film" ── */
  const hero = document.getElementById('hero');
  const video = document.getElementById('heroVideo');
  if (video) {
    video.addEventListener('playing', () => hero.classList.add('has-video'));
  }
  const slides = Array.from(document.querySelectorAll('.reel-slide'));
  if (slides.length > 1 && !reduced) {
    let i = 0;
    setInterval(() => {
      if (hero.classList.contains('has-video')) return;
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5500);
  }

  /* ── STATEMENT: words light up as you scroll ── */
  const st = document.getElementById('statementText');
  if (st) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = st.querySelectorAll('.w');
    const section = document.getElementById('statement');
    const update = () => {
      const r = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.35) / total));
      const n = Math.round(p * spans.length);
      spans.forEach((s, k) => s.classList.toggle('on', k < n));
    };
    if (!reduced) {
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* ── REVEAL ON SCROLL ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── EFFECTS ── */
  // Photos (dish strip) reveal one by one as they come into view
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io2.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('.work-item.img-reveal').forEach((el) => io2.observe(el));
  document.querySelectorAll('.sep').forEach((el) => io2.observe(el));

  // Scroll progress line + hero drift
  const bar = document.getElementById('progress');
  const heroContent = document.querySelector('.hero-content');
  const heroScroll = document.querySelector('.hero-scroll');
  let ticking = false;
  const fx = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    if (!reduced && heroContent && body.classList.contains('is-ready')) {
      const h = window.innerHeight;
      const k = Math.min(1, window.scrollY / (h * 0.8));
      heroContent.style.transform = `translateY(${k * -60}px)`;
      heroContent.style.opacity = String(1 - k * 0.9);
      if (heroScroll) heroScroll.style.opacity = String(1 - k * 2);
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(fx); } }, { passive: true });
  fx();

  // Experience cards: gold light follows the cursor
  document.querySelectorAll('.exp-card').forEach((card) => {
    const bodyEl = card.querySelector('.exp-body');
    card.addEventListener('pointermove', (e) => {
      const r = bodyEl.getBoundingClientRect();
      bodyEl.style.setProperty('--mx', `${e.clientX - r.left}px`);
      bodyEl.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ── PRESS EFFECT: gold ripple from the point pressed ── */
  const pressables = document.querySelectorAll('.btn, .nav-cta, .exp-card, .book-form button');
  pressables.forEach((el) => {
    el.classList.add('ripple-host');
    el.addEventListener('pointerdown', (e) => {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      // big enough to cover the whole element from any point
      dot.style.setProperty('--rs', String(Math.ceil(Math.hypot(r.width, r.height) / 6) + 2));
      el.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
      if (navigator.vibrate && e.pointerType === 'touch') { try { navigator.vibrate(6); } catch (err) {} }
    });
  });

  /* ── BOOKING FORM → WhatsApp ── */
  const form = document.getElementById('bookForm');
  if (form) {
    // no past dates in the date picker
    const dateInput = document.getElementById('f-date');
    if (dateInput) {
      const t = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      dateInput.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const field = name.closest('.field');
      if (!name.value.trim()) {
        field.classList.add('invalid');
        name.focus();
        name.addEventListener('input', () => field.classList.remove('invalid'), { once: true });
        return;
      }
      const v = (k) => (form.elements[k].value || '').trim();
      // Visitors who arrived through the IE QR code (casapernia.com/ie)
      let fromIE = new URLSearchParams(location.search).get('src') === 'ie';
      try { if (fromIE) sessionStorage.setItem('cp-src', 'ie'); else fromIE = sessionStorage.getItem('cp-src') === 'ie'; } catch (e) {}
      const niceDate = (iso) => {
        if (!iso) return '';
        const [yy, mm, dd] = iso.split('-').map(Number);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${dd} ${months[mm - 1]} ${yy}`;
      };
      const lines = [
        `Hi Luis, I'd like to book with Casa Pernía.`,
        `Name: ${v('name')}`,
        `Experience: ${v('type')}`,
        v('guests') && `Guests: ${v('guests')}`,
        v('date') && `Date: ${niceDate(v('date'))}`,
        v('allergies') && `Allergies / dietary: ${v('allergies')}`,
        v('message') && `Notes: ${v('message')}`,
        fromIE && `(Found you through the QR at IE)`,
      ].filter(Boolean);
      const url = 'https://wa.me/34695863004?text=' + encodeURIComponent(lines.join('\n'));
      // Backup: a visible button with the same link, in case the browser blocks the automatic jump
      const wa = document.getElementById('waLink');
      if (wa) { wa.href = url; wa.hidden = false; }
      const note = document.getElementById('formNote');
      if (note) note.textContent = 'If WhatsApp did not open, tap the button above.';
      window.open(url, '_blank');
    });
  }

  /* ── FOOTER YEAR ── */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
