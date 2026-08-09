document.addEventListener('DOMContentLoaded', () => {

  const navFab = document.getElementById('navFab');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuLinks = document.querySelectorAll('.menu-link');
  const vitalsBar = document.getElementById('vitalsBar');
  const heroVideo = document.querySelector('.hero-video');
  const heroFallback = document.querySelector('.hero-fallback');

  // Floating nav control opens/closes the full-screen menu
  const closeMenu = () => {
    menuOverlay.classList.remove('active');
    navFab.setAttribute('aria-expanded', 'false');
    navFab.setAttribute('aria-label', 'Open menu');
  };

  navFab.addEventListener('click', () => {
    const isOpen = menuOverlay.classList.toggle('active');
    navFab.setAttribute('aria-expanded', String(isOpen));
    navFab.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menuLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Scroll-triggered reveal
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => revealObserver.observe(el));

  // Vitals scroll progress bar
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    vitalsBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

 
  if (heroVideo) {
    const showFallback = () => { if (heroFallback) heroFallback.style.opacity = '1'; };
    const hideFallback = () => { if (heroFallback) heroFallback.style.opacity = '0'; };

    heroVideo.addEventListener('error', showFallback, true);
    heroVideo.addEventListener('loadeddata', hideFallback);

    // No usable source yet -> show fallback immediately
    if (heroVideo.readyState === 0) {
      setTimeout(() => {
        if (heroVideo.readyState === 0) showFallback();
      }, 400);
    }
  }

  // Contact form -> submits to Netlify Forms via AJAX so the page never reloads.
  // Requires the site to be deployed on Netlify (the static <form data-netlify="true">
  // in index.html is what Netlify's build step detects and wires up).
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const statusEl = document.getElementById('cfStatus');
    const submitBtn = document.getElementById('cfSubmit');

    const encode = (data) =>
      Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const payload = {};
      formData.forEach((value, key) => { payload[key] = value; });

      submitBtn.setAttribute('disabled', 'true');
      submitBtn.textContent = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload),
      })
        .then(() => {
          statusEl.textContent = "Thank you — your message has been sent. I'll get back to you soon.";
          statusEl.className = 'form-status success';
          contactForm.reset();
          submitBtn.textContent = 'Send a Message';
          submitBtn.removeAttribute('disabled');
        })
        .catch(() => {
          statusEl.textContent = "Something went wrong. Please email directly, or try again in a moment.";
          statusEl.className = 'form-status error';
          submitBtn.textContent = 'Send a Message';
          submitBtn.removeAttribute('disabled');
        });
    });
  }
});