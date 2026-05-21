/* ── NAVBAR: scroll effect + mobile toggle ── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── GALLERY FILTER ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.display = match ? '' : 'none';
      item.classList.toggle('hidden', !match);
    });
  });
});

/* ── CONTACT FORM ── */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = 'rgba(201, 90, 90, 0.5)';
      field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
    }
  });
  if (!valid) {
    e.preventDefault();
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Preparing message…';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = 'Send Inquiry';
    submitBtn.disabled = false;
  }, 3000);
});

/* ── FOOTER YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── HERO PARALLAX (subtle) ── */
const heroGlow = document.querySelector('.hero-glow');
if (heroGlow) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroGlow.style.transform = `translate(-50%, calc(-50% + ${y * 0.2}px))`;
  }, { passive: true });
}

/* ── SMOOTH ANCHOR SCROLL (handles nav offset) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
