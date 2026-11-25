/* ==========================================================================
   Peachy Tiny Studio — Interactive Motion & Diorama Experience
   ========================================================================== */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ------------------------------------------------------------------------
     1. Dual-Theme Controller: Daylight Cottage ↔ Night Glow
     ------------------------------------------------------------------------ */
  const headerToggle = document.getElementById('header-theme-toggle');
  const headerIcon = document.getElementById('header-switch-icon');
  const headerLabel = document.getElementById('header-switch-label');
  const heroLightToggle = document.getElementById('hero-light-toggle');
  const heroLightLabel = document.getElementById('hero-light-label');
  const heroCaption = document.getElementById('hero-mode-caption');
  const drawerThemeToggle = document.getElementById('drawer-theme-toggle');

  function applyTheme(theme) {
    const isNight = theme === 'night';
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('peachy-theme', theme);
    } catch (_) {}

    if (headerIcon) headerIcon.textContent = isNight ? '☀️' : '🌙';
    if (headerLabel) headerLabel.textContent = isNight ? 'Daylight' : 'Night Glow';
    if (heroLightLabel) heroLightLabel.textContent = isNight ? 'Switch to Daylight' : 'Flip the Lights On';
    if (heroCaption) {
      heroCaption.textContent = isNight
        ? 'VIEWING: GLOWING CLAY LANTERN SCENE (NIGHT GLOW)'
        : 'VIEWING: SUNLIT WOODLAND TEA ROOM (DAYLIGHT)';
    }
    if (drawerThemeToggle) {
      drawerThemeToggle.innerHTML = isNight
        ? '<span>☀️ Switch to Daylight</span>'
        : '<span>🌙 Switch to Night Glow</span>';
    }
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'day';
    applyTheme(current === 'day' ? 'night' : 'day');
  }

  const savedTheme = (() => {
    try { return localStorage.getItem('peachy-theme'); } catch (_) { return null; }
  })();
  applyTheme(savedTheme === 'night' ? 'night' : 'day');

  [headerToggle, heroLightToggle, drawerThemeToggle].forEach((btn) => {
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  /* ------------------------------------------------------------------------
     2. Mobile Drawer Toggle
     ------------------------------------------------------------------------ */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', String(open));
      mobileDrawer.setAttribute('aria-hidden', String(!open));
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. Live Scroll Percentage Readout (Beauty Studio Inspiration)
     ------------------------------------------------------------------------ */
  const scrollPctEl = document.getElementById('scroll-pct');
  function updateScrollPct() {
    if (!scrollPctEl) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100))) : 0;
    scrollPctEl.textContent = `${pct}%`;
  }
  window.addEventListener('scroll', updateScrollPct, { passive: true });
  updateScrollPct();

  /* ------------------------------------------------------------------------
     4. Subtle Golden Firefly Particles (Night Glow Mode)
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('fireflies-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.1,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.00012 - Math.random() * 0.00022,
      phase: Math.random() * Math.PI * 2,
    }));

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawFireflies(time) {
      if (root.getAttribute('data-theme') === 'night') {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
          p.x = (p.x + p.vx + 1) % 1;
          p.y = (p.y + p.vy + 1) % 1;
          const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 0.0018 + p.phase));
          const px = p.x * width;
          const py = p.y * height;

          const grad = ctx.createRadialGradient(px, py, 0, px, py, p.r * 5);
          grad.addColorStop(0, `rgba(255, 219, 138, ${alpha})`);
          grad.addColorStop(1, 'rgba(244, 185, 90, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(drawFireflies);
    }
    requestAnimationFrame(drawFireflies);
  }

  /* ------------------------------------------------------------------------
     5. Interactive Shoppable Diorama Gallery + Hotspot Pins
     ------------------------------------------------------------------------ */
  const DIORAMAS = {
    shrine: {
      name: 'The Moonlit Cat Shrine',
      edition: 'EDITION 1 OF 1',
      story:
        'Under the glow of midnight lanterns, a tiny guardian watches over the stars. Sculpted with an ornate golden archway, hand-painted drifting lantern backdrop, and a curious clay black cat wearing a crescent moon collar.',
      specs: [
        { label: 'MEDIUM', value: 'Soft Clay & Gilded Wood' },
        { label: 'LIGHTING', value: 'Built-in Warm LED Switch' },
        { label: 'PERSONALIZATION', value: 'Optional Gold Back Plaque' },
        { label: 'ORIGIN', value: 'Handmade in Vietnam' },
      ],
      etsyUrl: 'https://www.etsy.com/shop/PeachyByGiang',
      angles: [
        { src: './assets/shrine-main.webp', label: 'Night Glow' },
        { src: './assets/shrine-blue.webp', label: 'Blue Moon' },
        { src: './assets/shrine-gold.webp', label: 'Golden Arch' },
      ],
      hotspots: [
        {
          id: '01',
          x: 52,
          y: 23,
          title: 'Crescent Moon & Star Charm',
          desc: 'A tiny golden moon and star suspended gently beneath the hand-carved shrine arch.',
        },
        {
          id: '02',
          x: 50,
          y: 59,
          title: 'Hand-Sculpted Midnight Cat',
          desc: 'Shaped entirely by hand from soft clay, painted with expressive golden eyes and a miniature crescent moon collar.',
        },
        {
          id: '03',
          x: 34,
          y: 42,
          title: 'Floating Lantern Sky',
          desc: 'Deep blue midnight backdrop painted in layered acrylic strokes with warm glowing miniature lanterns.',
        },
        {
          id: '04',
          x: 72,
          y: 44,
          title: 'Gilded Ancient Pillars',
          desc: 'Individually carved and brushed with antique metallic gold leaf accents.',
        },
      ],
    },
    cottage: {
      name: 'Secret Garden Cottage Tea Room',
      edition: 'EDITION 1 OF 1',
      story:
        'A palm-sized vintage woodland room where afternoon tea never ends. Complete with tiny sculpted pastries, a green floral teapot, a microscopic hand-painted copy of “The Secret Garden”, and a glowing fairy-light tree.',
      specs: [
        { label: 'MEDIUM', value: 'Clay, Felt & Miniature Wood' },
        { label: 'LIGHTING', value: 'Glowing Tree & Heart Lantern' },
        { label: 'HIGHLIGHT', value: 'Micro “Secret Garden” Book' },
        { label: 'ORIGIN', value: 'Handmade in Vietnam' },
      ],
      etsyUrl: 'https://www.etsy.com/shop/PeachyByGiang',
      angles: [
        { src: './assets/cottage-full.webp', label: 'Full Room' },
        { src: './assets/cottage-tea.webp', label: 'Tea Table' },
        { src: './assets/cottage-window.webp', label: 'Moonlit View' },
      ],
      hotspots: [
        {
          id: '01',
          x: 73,
          y: 46,
          title: 'Glowing Heart Clay Lantern',
          desc: 'Hanging from the enchanted tree branch—flip the switch and warm golden light shines through the tiny heart cutout.',
        },
        {
          id: '02',
          x: 54,
          y: 58,
          title: 'Miniature Woodland Tea Table',
          desc: 'Freshly sculpted pastries, wild berries, and a hand-painted sage green floral teapot.',
        },
        {
          id: '03',
          x: 41,
          y: 49,
          title: 'Handcrafted Cottage Companion',
          desc: 'Softly sculpted woodland girl with textured braids and a delicate floral dress.',
        },
        {
          id: '04',
          x: 26,
          y: 27,
          title: 'Tiny Bookshelf & Classics',
          desc: 'Hand-bound miniature books resting above a vintage framed wildflower painting.',
        },
      ],
    },
  };

  let activePieceKey = 'shrine';
  let activeAngleIndex = 0;

  const mainImg = document.getElementById('gallery-main-img');
  const hotspotsLayer = document.getElementById('hotspots-layer');
  const hotspotCard = document.getElementById('hotspot-card');
  const hotspotTag = document.getElementById('hotspot-tag');
  const hotspotTitle = document.getElementById('hotspot-title');
  const hotspotDesc = document.getElementById('hotspot-desc');
  const hotspotClose = document.getElementById('hotspot-close');
  const thumbStrip = document.getElementById('thumb-strip');
  const pieceEdition = document.getElementById('piece-edition');
  const pieceName = document.getElementById('piece-name');
  const pieceStory = document.getElementById('piece-story');
  const pieceSpecs = document.getElementById('piece-specs');
  const pieceEtsyBtn = document.getElementById('piece-etsy-btn');

  function showHotspot(spot) {
    if (!hotspotCard) return;
    hotspotTag.textContent = `DETAIL ${spot.id}`;
    hotspotTitle.textContent = spot.title;
    hotspotDesc.textContent = spot.desc;
    hotspotCard.classList.remove('is-hidden');

    hotspotsLayer.querySelectorAll('.hotspot-pin').forEach((pin) => {
      pin.classList.toggle('is-active', pin.dataset.id === spot.id);
    });
  }

  function renderGallery(pieceKey, angleIdx = 0) {
    activePieceKey = pieceKey;
    activeAngleIndex = angleIdx;
    const piece = DIORAMAS[pieceKey];
    if (!piece) return;

    // Update image
    const angle = piece.angles[angleIdx] || piece.angles[0];
    mainImg.style.opacity = '0.35';
    setTimeout(() => {
      mainImg.src = angle.src;
      mainImg.alt = `${piece.name} — ${angle.label}`;
      mainImg.style.opacity = '1';
    }, 140);

    // Update info
    pieceEdition.textContent = piece.edition;
    pieceName.textContent = piece.name;
    pieceStory.textContent = piece.story;
    pieceEtsyBtn.href = piece.etsyUrl;
    pieceSpecs.innerHTML = piece.specs
      .map((s) => `<li><small>${s.label}</small><strong>${s.value}</strong></li>`)
      .join('');

    // Render thumbnails
    thumbStrip.innerHTML = '';
    piece.angles.forEach((ang, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `thumb-btn${idx === angleIdx ? ' is-active' : ''}`;
      btn.innerHTML = `<img src="${ang.src}" alt="${ang.label}" loading="lazy" /><span class="mono">${ang.label}</span>`;
      btn.addEventListener('click', () => renderGallery(pieceKey, idx));
      thumbStrip.appendChild(btn);
    });

    // Render hotspots only on primary overview angle (idx === 0)
    hotspotsLayer.innerHTML = '';
    if (angleIdx === 0) {
      piece.hotspots.forEach((spot, i) => {
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = `hotspot-pin${i === 0 ? ' is-active' : ''}`;
        pin.dataset.id = spot.id;
        pin.style.left = `${spot.x}%`;
        pin.style.top = `${spot.y}%`;
        pin.setAttribute('aria-label', `Inspect ${spot.title}`);
        pin.textContent = spot.id;
        pin.addEventListener('click', () => showHotspot(spot));
        hotspotsLayer.appendChild(pin);
      });
      showHotspot(piece.hotspots[0]);
    } else {
      hotspotCard.classList.add('is-hidden');
    }
  }

  document.querySelectorAll('.piece-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.piece-tab').forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      renderGallery(tab.dataset.piece, 0);
    });
  });

  if (hotspotClose) {
    hotspotClose.addEventListener('click', () => {
      hotspotCard.classList.add('is-hidden');
      hotspotsLayer.querySelectorAll('.hotspot-pin').forEach((p) => p.classList.remove('is-active'));
    });
  }

  renderGallery('shrine', 0);

  /* ------------------------------------------------------------------------
     6. Live Golden Plaque Preview + Custom Commission Modal
     ------------------------------------------------------------------------ */
  const customNameInput = document.getElementById('custom-name-input');
  const plaqueLiveText = document.getElementById('plaque-live-text');
  const customModal = document.getElementById('custom-modal');
  const openModalBtn = document.getElementById('open-custom-modal');
  const closeModalBtn = document.getElementById('close-custom-modal');
  const inqPlaque = document.getElementById('inq-plaque');

  if (customNameInput && plaqueLiveText) {
    customNameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      plaqueLiveText.textContent = val || 'Your Name';
    });
  }

  if (openModalBtn && customModal) {
    openModalBtn.addEventListener('click', () => {
      if (inqPlaque && customNameInput) {
        inqPlaque.value = customNameInput.value.trim();
      }
      customModal.showModal();
    });
  }

  if (closeModalBtn && customModal) {
    closeModalBtn.addEventListener('click', () => customModal.close());
    customModal.addEventListener('click', (e) => {
      if (e.target === customModal) customModal.close();
    });
  }

  const customInquiryForm = document.getElementById('custom-inquiry-form');
  const customFeedback = document.getElementById('custom-feedback');
  if (customInquiryForm) {
    customInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      customFeedback.textContent = '✨ Thank you! Your custom request has been noted. Giang will reply within 24–48 hours.';
      customInquiryForm.reset();
      setTimeout(() => {
        if (customModal.open) customModal.close();
        customFeedback.textContent = '';
      }, 2400);
    });
  }

  /* ------------------------------------------------------------------------
     7. Upcoming Dragon Drop Waitlist Form
     ------------------------------------------------------------------------ */
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistEmail = document.getElementById('waitlist-email');
  const waitlistFeedback = document.getElementById('waitlist-feedback');

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = waitlistEmail.value.trim();
      if (!email) return;
      waitlistFeedback.textContent = `🐉 You’re on the early-access list (${email})! We’ll notify you 24h before the White Dragon goes live on Etsy.`;
      waitlistForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     8. GSAP ScrollTrigger Choreography (Word Reveal & Smooth Reveals)
     ------------------------------------------------------------------------ */
  function initMotion() {
    const manifestoEl = document.getElementById('manifesto-text');
    if (manifestoEl) {
      const words = manifestoEl.textContent.trim().split(/\s+/);
      manifestoEl.innerHTML = words
        .map((w) => `<span class="manifesto-word">${w}</span>`)
        .join(' ');
    }

    if (prefersReducedMotion || typeof window.gsap === 'undefined') {
      document.querySelectorAll('.manifesto-word').forEach((el) => (el.style.opacity = '1'));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.from('.hero-eyebrow, .hero-title, .hero-subtitle, .hero-cta-row', {
      y: 26,
      opacity: 0,
      duration: 0.9,
      stagger: 0.11,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });

    // Scroll-scrubbed word-by-word reveal (Mindloop / Orvante inspiration)
    const manifestoWords = document.querySelectorAll('.manifesto-word');
    if (manifestoWords.length) {
      gsap.to(manifestoWords, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto-section',
          start: 'top 78%',
          end: 'center 35%',
          scrub: 0.6,
        },
      });
    }

    // Subtle section reveals
    gsap.utils.toArray('.gallery-stage-col, .gallery-info-col, .custom-panel, .waitlist-card, .maker-grid').forEach((el) => {
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          once: true,
        },
      });
    });
  }

  window.addEventListener('DOMContentLoaded', initMotion);
})();
