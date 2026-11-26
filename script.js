/* ==========================================================================
   Peachy Tiny Studio — Interactive Motion & Diorama Experience
   ========================================================================== */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  let currentLang = (() => {
    try {
      return localStorage.getItem('peachy-lang') === 'vi' ? 'vi' : 'en';
    } catch (_) {
      return 'en';
    }
  })();

  function getDict() {
    const dict = window.PEACHY_I18N || {};
    return dict[currentLang] || dict.en || null;
  }

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
    const d = getDict();
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('peachy-theme', theme);
    } catch (_) {}

    if (headerToggle) headerToggle.setAttribute('aria-checked', String(isNight));
    if (headerIcon) headerIcon.textContent = isNight ? '🌙' : '☀️';
    if (headerLabel) headerLabel.textContent = d ? (isNight ? d.theme.toDay : d.theme.toNight) : (isNight ? 'Daylight' : 'Night Glow');
    if (heroLightLabel) heroLightLabel.textContent = d ? (isNight ? d.theme.heroToDay : d.theme.heroToNight) : (isNight ? 'Switch to Daylight' : 'Flip the Lights On');
    if (heroCaption) {
      heroCaption.textContent = d
        ? (isNight ? d.theme.captionNight : d.theme.captionDay)
        : (isNight ? 'VIEWING: GLOWING CLAY LANTERN SCENE (NIGHT GLOW)' : 'VIEWING: SUNLIT WOODLAND TEA ROOM (DAYLIGHT)');
    }
    if (drawerThemeToggle) {
      drawerThemeToggle.innerHTML = d
        ? `<span>${isNight ? d.theme.drawerToDay : d.theme.drawerToNight}</span>`
        : (isNight ? '<span>☀️ Switch to Daylight</span>' : '<span>🌙 Switch to Night Glow</span>');
    }
  }

  const themeRippleEl = document.getElementById('theme-ripple');
  function triggerThemeRipple(ev, nextTheme) {
    if (!themeRippleEl || prefersReducedMotion) return;
    const rect = ev && ev.currentTarget ? ev.currentTarget.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 80;
    const y = rect ? rect.top + rect.height / 2 : 36;
    themeRippleEl.style.left = `${x}px`;
    themeRippleEl.style.top = `${y}px`;
    themeRippleEl.style.background =
      nextTheme === 'night'
        ? 'radial-gradient(circle, rgba(244, 185, 90, 0.45) 0%, rgba(16, 26, 54, 0.3) 55%, transparent 72%)'
        : 'radial-gradient(circle, rgba(255, 232, 182, 0.55) 0%, rgba(250, 245, 238, 0.3) 55%, transparent 72%)';
    themeRippleEl.classList.remove('is-rippling');
    void themeRippleEl.offsetWidth;
    themeRippleEl.classList.add('is-rippling');
  }

  function toggleTheme(ev) {
    const current = root.getAttribute('data-theme') || 'night';
    const next = current === 'day' ? 'night' : 'day';
    triggerThemeRipple(ev, next);
    applyTheme(next);
  }

  const savedTheme = (() => {
    try { return localStorage.getItem('peachy-theme'); } catch (_) { return null; }
  })();
  applyTheme(savedTheme === 'day' ? 'day' : 'night');

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
     3. Live Scroll Progress (Pill %, Top 2px Bar, Floating Back-to-Top Ring)
     ------------------------------------------------------------------------ */
  const scrollPctEl = document.getElementById('scroll-pct');
  const readingBar = document.getElementById('reading-progress-bar');
  const fabTopBtn = document.getElementById('fab-top-btn');
  const fabRingFill = document.getElementById('fab-ring-fill');
  const RING_CIRCUMFERENCE = 2 * Math.PI * 21; // ~131.95

  function updateScrollPct() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    const pct = Math.round(ratio * 100);

    if (scrollPctEl) scrollPctEl.textContent = `${pct}%`;
    if (readingBar) readingBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    if (fabRingFill) {
      fabRingFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
      fabRingFill.style.strokeDashoffset = `${(RING_CIRCUMFERENCE * (1 - ratio)).toFixed(2)}`;
    }
    if (fabTopBtn) {
      fabTopBtn.classList.toggle('is-visible', window.scrollY > 360);
    }
  }
  window.addEventListener('scroll', updateScrollPct, { passive: true });
  updateScrollPct();

  if (fabTopBtn) {
    fabTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     3B. Floating Quick-Chat Menu & Full-Screen Lightbox Image Zoom
     ------------------------------------------------------------------------ */
  const fabChatBtn = document.getElementById('fab-chat-btn');
  const fabChatMenu = document.getElementById('fab-chat-menu');
  const fabContactLink = document.getElementById('fab-opt-contact-link');

  function closeFabChat() {
    if (!fabChatMenu || !fabChatBtn) return;
    fabChatMenu.classList.remove('is-open');
    fabChatMenu.setAttribute('aria-hidden', 'true');
    fabChatBtn.setAttribute('aria-expanded', 'false');
  }

  if (fabChatBtn && fabChatMenu) {
    fabChatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = fabChatMenu.classList.toggle('is-open');
      fabChatMenu.setAttribute('aria-hidden', String(!open));
      fabChatBtn.setAttribute('aria-expanded', String(open));
    });
    if (fabContactLink) fabContactLink.addEventListener('click', closeFabChat);
    document.addEventListener('click', (e) => {
      if (!fabChatMenu.contains(e.target) && e.target !== fabChatBtn) closeFabChat();
    });
  }

  // Lightbox Zoom
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.getElementById('close-lightbox');

  function openLightbox(src, caption) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Peachy Tiny Studio creation';
    if (lightboxCaption) {
      lightboxCaption.textContent = caption || 'PEACHY TINY STUDIO';
    }
    lightboxModal.classList.add('is-open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('is-open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeLightboxBtn && lightboxModal) {
    closeLightboxBtn.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFabChat();
      if (lightboxModal && lightboxModal.classList.contains('is-open')) closeLightbox();
    }
  });

  // Attach click-to-zoom on key showcase photos
  const zoomMainImg = document.getElementById('gallery-main-img');
  if (zoomMainImg) {
    zoomMainImg.addEventListener('click', () => openLightbox(zoomMainImg.src, zoomMainImg.alt));
  }
  const zoomPlaqueImg = document.querySelector('.plaque-real img');
  if (zoomPlaqueImg) {
    zoomPlaqueImg.addEventListener('click', () => openLightbox(zoomPlaqueImg.src, zoomPlaqueImg.alt));
  }
  const zoomStudioImg = document.getElementById('studio-slide-img');
  if (zoomStudioImg) {
    zoomStudioImg.addEventListener('click', () => openLightbox(zoomStudioImg.src, zoomStudioImg.alt));
  }

  /* ------------------------------------------------------------------------
     4. Ambient Particles Canvas:
        - Night Glow: Warm Golden Fireflies
        - Daylight: Shimmering Morning Sun Dust Motes + Gentle Peach Petals
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('fireflies-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const fireflies = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.1,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.00012 - Math.random() * 0.00022,
      phase: Math.random() * Math.PI * 2,
    }));

    const sunMotes = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.4 + Math.random() * 2.4,
      vx: 0.00008 + Math.random() * 0.00016,
      vy: -0.00006 - Math.random() * 0.00014,
      phase: Math.random() * Math.PI * 2,
    }));

    const petals = Array.from({ length: 9 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 4.5 + Math.random() * 4,
      vx: 0.00018 + Math.random() * 0.00022,
      vy: 0.00016 + Math.random() * 0.0002,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.014,
      sway: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.4 ? '244, 174, 148' : '255, 224, 198',
    }));

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawAmbient(time) {
      ctx.clearRect(0, 0, width, height);
      const isNight = root.getAttribute('data-theme') === 'night';

      if (isNight) {
        for (const p of fireflies) {
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
      } else {
        // Warm morning sun dust motes
        for (const m of sunMotes) {
          m.x = (m.x + m.vx + 1) % 1;
          m.y = (m.y + m.vy + 1) % 1;
          const shimmer = 0.22 + 0.45 * (0.5 + 0.5 * Math.sin(time * 0.0015 + m.phase));
          const mx = m.x * width;
          const my = m.y * height;

          const grad = ctx.createRadialGradient(mx, my, 0, mx, my, m.r * 5.2);
          grad.addColorStop(0, `rgba(255, 245, 214, ${shimmer})`);
          grad.addColorStop(0.45, `rgba(242, 180, 118, ${shimmer * 0.65})`);
          grad.addColorStop(1, 'rgba(242, 180, 118, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(mx, my, m.r * 5.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gentle drifting peach-blossom petals
        for (const pt of petals) {
          pt.x = (pt.x + pt.vx + Math.sin(time * 0.0012 + pt.sway) * 0.00018 + 1) % 1;
          pt.y = (pt.y + pt.vy + 1) % 1;
          pt.rot += pt.vrot;
          const px = pt.x * width;
          const py = pt.y * height;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(pt.rot);
          ctx.fillStyle = `rgba(${pt.tint}, 0.58)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.size, pt.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      requestAnimationFrame(drawAmbient);
    }
    requestAnimationFrame(drawAmbient);
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
  let activeHotspotIndex = 0;
  let hotspotTl = null;

  const galleryStage = document.getElementById('gallery-stage');
  const mainImg = document.getElementById('gallery-main-img');
  const hotspotsLayer = document.getElementById('hotspots-layer');
  const hotspotCard = document.getElementById('hotspot-card');
  const hotspotPointer = document.getElementById('hotspot-pointer');
  const hotspotAccentLine = document.getElementById('hotspot-accent-line');
  const hotspotTag = document.getElementById('hotspot-tag');
  const hotspotTitle = document.getElementById('hotspot-title');
  const hotspotDesc = document.getElementById('hotspot-desc');
  const hotspotPrev = document.getElementById('hotspot-prev');
  const hotspotNext = document.getElementById('hotspot-next');
  const hotspotClose = document.getElementById('hotspot-close');
  const thumbStrip = document.getElementById('thumb-strip');
  const pieceEdition = document.getElementById('piece-edition');
  const pieceName = document.getElementById('piece-name');
  const pieceStory = document.getElementById('piece-story');
  const pieceSpecs = document.getElementById('piece-specs');
  const pieceEtsyBtn = document.getElementById('piece-etsy-btn');

  function positionHotspotCard(spot, allSpots = []) {
    if (!hotspotCard || !galleryStage || !spot) return;
    if (window.innerWidth <= 640) {
      hotspotCard.style.width = '';
      hotspotCard.style.left = '';
      hotspotCard.style.top = '';
      return;
    }

    const stageW = galleryStage.clientWidth;
    const stageH = galleryStage.clientHeight;
    if (!stageW || !stageH) return;

    const cardW = Math.min(276, stageW - 24);
    const cardH = 162;
    const pad = 12;
    const gap = 24;
    const pinClearance = 24;
    hotspotCard.style.width = `${cardW}px`;

    const px = (spot.x / 100) * stageW;
    const py = (spot.y / 100) * stageH;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // Outward X anchor pushes left-side pins flush left & right-side pins flush right to clear center pins/subject
    const outwardX =
      spot.x <= 46
        ? clamp(px - cardW * 0.82, pad, stageW - cardW - pad)
        : spot.x >= 56
        ? clamp(px - cardW * 0.18, pad, stageW - cardW - pad)
        : clamp(px - cardW / 2, pad, stageW - cardW - pad);

    // Unclamped side offsets so a side never gets pushed back over the active pin
    const candidates = [
      { side: 'right',  left: px + gap,         top: clamp(py - cardH * 0.45, pad, stageH - cardH - pad) },
      { side: 'left',   left: px - cardW - gap, top: clamp(py - cardH * 0.45, pad, stageH - cardH - pad) },
      { side: 'bottom', left: outwardX,         top: py + gap },
      { side: 'top',    left: outwardX,         top: py - cardH - gap },
    ];

    // Score candidates: strictly stay inside stage bounds, avoid covering ANY pin, stay near active pin & outward from center
    const centerX = stageW * 0.5;
    const centerY = stageH * 0.46;
    let best = candidates[2];
    let bestScore = Infinity;

    for (const c of candidates) {
      const outOfBounds =
        c.left < pad ||
        c.left + cardW > stageW - pad ||
        c.top < pad ||
        c.top + cardH > stageH - pad;

      let overlapCount = 0;
      for (const s of allSpots) {
        const sx = (s.x / 100) * stageW;
        const sy = (s.y / 100) * stageH;
        if (
          sx >= c.left - pinClearance &&
          sx <= c.left + cardW + pinClearance &&
          sy >= c.top - pinClearance &&
          sy <= c.top + cardH + pinClearance
        ) {
          overlapCount += s.id === spot.id ? 10 : 1;
        }
      }

      const cardCx = c.left + cardW / 2;
      const cardCy = c.top + cardH / 2;
      const distToPin = Math.hypot(cardCx - px, cardCy - py);
      const distFromCenter = Math.hypot(cardCx - centerX, cardCy - centerY);
      const score = (outOfBounds ? 50000 : 0) + overlapCount * 5000 + distToPin - distFromCenter * 0.65;

      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }

    best.left = clamp(best.left, pad, stageW - cardW - pad);
    best.top = clamp(best.top, pad, stageH - cardH - pad);

    hotspotCard.style.left = `${Math.round(best.left)}px`;
    hotspotCard.style.top = `${Math.round(best.top)}px`;
    hotspotCard.setAttribute('data-side', best.side);

    // Align pointer arrow directly toward the active pin
    if (hotspotPointer) {
      hotspotPointer.style.left = '';
      hotspotPointer.style.right = '';
      hotspotPointer.style.top = '';
      hotspotPointer.style.bottom = '';
      if (best.side === 'bottom' || best.side === 'top') {
        const ptrX = clamp(px - best.left - 6, 18, cardW - 30);
        hotspotPointer.style.left = `${Math.round(ptrX)}px`;
      } else {
        const ptrY = clamp(py - best.top - 6, 18, cardH - 30);
        hotspotPointer.style.top = `${Math.round(ptrY)}px`;
      }
    }
  }

  window.addEventListener('resize', () => {
    const piece = DIORAMAS[activePieceKey];
    if (piece && activeAngleIndex === 0 && !hotspotCard.classList.contains('is-hidden')) {
      positionHotspotCard(piece.hotspots[activeHotspotIndex], piece.hotspots);
    }
  });

  function showHotspot(spot, animate = true) {
    if (!hotspotCard) return;
    const piece = DIORAMAS[activePieceKey];
    const d = getDict();
    const locPiece = d && d.creations && d.creations.pieces[activePieceKey];
    const total = piece ? piece.hotspots.length : 4;
    let idx = 0;
    if (piece) {
      idx = piece.hotspots.findIndex((h) => h.id === spot.id);
      if (idx >= 0) activeHotspotIndex = idx;
    }
    const locSpot = locPiece && locPiece.hotspots[activeHotspotIndex] ? locPiece.hotspots[activeHotspotIndex] : spot;
    const prefix = d && d.creations ? d.creations.detailPrefix : 'DETAIL';

    hotspotTag.textContent = `${prefix} ${spot.id} / 0${total}`;
    hotspotTitle.textContent = locSpot.title;
    hotspotDesc.textContent = locSpot.desc;
    hotspotCard.classList.remove('is-hidden');
    positionHotspotCard(spot, piece ? piece.hotspots : [spot]);

    hotspotsLayer.querySelectorAll('.hotspot-pin').forEach((pin) => {
      pin.classList.toggle('is-active', pin.dataset.id === spot.id);
    });

    // Trigger luminous border sheen sweep
    hotspotCard.classList.remove('is-animating');
    void hotspotCard.offsetWidth;
    if (!prefersReducedMotion) {
      hotspotCard.classList.add('is-animating');
    }

    // Editorial staggered reveal with GSAP (frame stays rock-solid; inner content & sheen animate)
    if (animate && !prefersReducedMotion && typeof window.gsap !== 'undefined') {
      if (hotspotTl) hotspotTl.kill();
      hotspotTl = gsap.timeline();
      hotspotTl
        .fromTo(
          hotspotAccentLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power2.out' },
          0
        )
        .fromTo(
          hotspotTag,
          { y: 5, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' },
          0.03
        )
        .fromTo(
          hotspotTitle,
          { y: 8, opacity: 0, filter: 'blur(4px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.38, ease: 'power3.out' },
          0.08
        )
        .fromTo(
          hotspotDesc,
          { y: 7, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out' },
          0.14
        );
    } else if (hotspotAccentLine) {
      hotspotAccentLine.style.transform = 'scaleX(1)';
    }
  }

  function stepHotspot(delta) {
    const piece = DIORAMAS[activePieceKey];
    if (!piece || activeAngleIndex !== 0) return;
    const len = piece.hotspots.length;
    activeHotspotIndex = (activeHotspotIndex + delta + len) % len;
    showHotspot(piece.hotspots[activeHotspotIndex], true);
  }

  if (hotspotPrev) hotspotPrev.addEventListener('click', () => stepHotspot(-1));
  if (hotspotNext) hotspotNext.addEventListener('click', () => stepHotspot(1));

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

    // Update info (localized if dictionary loaded)
    const d = getDict();
    const locPiece = d && d.creations && d.creations.pieces[pieceKey];
    pieceEdition.textContent = locPiece ? locPiece.edition : piece.edition;
    pieceName.textContent = locPiece ? locPiece.name : piece.name;
    pieceStory.textContent = locPiece ? locPiece.story : piece.story;
    pieceEtsyBtn.href = piece.etsyUrl;
    const specsList = locPiece ? locPiece.specs : piece.specs;
    pieceSpecs.innerHTML = specsList
      .map((s) => `<li><small>${s.label}</small><strong>${s.value}</strong></li>`)
      .join('');

    // Render thumbnails
    thumbStrip.innerHTML = '';
    piece.angles.forEach((ang, idx) => {
      const angLabel = locPiece && locPiece.angles[idx] ? locPiece.angles[idx] : ang.label;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `thumb-btn${idx === angleIdx ? ' is-active' : ''}`;
      btn.innerHTML = `<img src="${ang.src}" alt="${angLabel}" loading="lazy" /><span class="mono">${angLabel}</span>`;
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
      showHotspot(piece.hotspots[0], true);
    } else {
      hotspotCard.classList.add('is-hidden');
      if (mainImg) {
        mainImg.style.transform = 'scale(1)';
        mainImg.style.transformOrigin = 'center center';
      }
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
      if (mainImg) {
        mainImg.style.transform = 'scale(1)';
        mainImg.style.transformOrigin = 'center center';
      }
    });
  }

  renderGallery('shrine', 0);

  /* ------------------------------------------------------------------------
     5B. Behind the Scenes Horizontal Carousel + Professional Detail Popup
     ------------------------------------------------------------------------ */
  const CRAFT_STEPS = [
    {
      num: '01',
      phase: 'CONCEPT & SKETCH',
      title: 'Daydreaming on paper first.',
      desc: 'Every diorama starts as a quiet pencil sketch—mapping the meeting between a character, ancient pillars, and the glow of floating lanterns under the stars. Before touching any clay, Giang plans every millimeter of depth, light placement, and storytelling balance.',
      img: './assets/step-01-sketch.webp',
      alt: 'Pencil concept sketch of a girl meeting a white dragon under lanterns',
      chips: ['Original Storyboard', 'Scale Planning', 'Hand-Drawn'],
    },
    {
      num: '02',
      phase: 'MICRO-SCULPTING',
      title: 'Shaped millimeter by millimeter.',
      desc: 'Using fine tweezers and miniature sculpting tools, every tiny horn, dragon scale, whisker, and pastry is shaped and placed individually by hand from soft clay. Zero molds are used—giving each creature its own gentle expression and soul.',
      img: './assets/step-02-dragon.webp',
      alt: 'Hand-sculpted white clay dragon head beside pink sculpting tools',
      chips: ['Soft Sculpting Clay', 'Zero Molds', 'Fine Tweezer Detail'],
    },
    {
      num: '03',
      phase: 'PAINTING & ILLUMINATION',
      title: 'Hand-painted skies & hidden warm LEDs.',
      desc: 'Backdrops are painted in layered acrylic strokes to capture starry midnight skies and drifting lanterns, then wired with delicate warm fairy lights and a discreet switch so your diorama transforms the moment night falls.',
      img: './assets/step-03-lanterns.webp',
      alt: 'Hand-painted miniature blue night sky with floating lanterns and boat',
      chips: ['Acrylic Night Skies', 'Warm Built-in LED', 'Hidden Wiring'],
    },
    {
      num: '04',
      phase: 'ARCHITECTURE & WORLDWIDE DELIVERY',
      title: 'Carved archways, safely delivered to your door.',
      desc: 'Hand-carved columns and gilded frames are sealed with a protective matte finish for lasting durability, then cradled in custom multi-layer shock-absorbing packaging for safe, tracked international shipping from Vietnam.',
      img: './assets/step-04-arch.webp',
      alt: 'Hand-carved white miniature stone pillar and archway frame in progress',
      chips: ['Hand-Carved Arch', 'Protective Double-Box', 'Global Tracking'],
    },
  ];

  const craftCarousel = document.getElementById('craft-carousel');
  const craftPrevBtn = document.getElementById('craft-scroll-prev');
  const craftNextBtn = document.getElementById('craft-scroll-next');
  const craftDots = document.querySelectorAll('.craft-dot');
  const craftSlides = document.querySelectorAll('.craft-slide');

  const craftModal = document.getElementById('craft-modal');
  const closeCraftModalBtn = document.getElementById('close-craft-modal');
  const craftModalImg = document.getElementById('craft-modal-img');
  const craftModalStep = document.getElementById('craft-modal-step');
  const craftModalTitle = document.getElementById('craft-modal-title');
  const craftModalDesc = document.getElementById('craft-modal-desc');
  const craftModalChips = document.getElementById('craft-modal-chips');
  const craftModalCounter = document.getElementById('craft-modal-counter');
  const craftModalPrev = document.getElementById('craft-modal-prev');
  const craftModalNext = document.getElementById('craft-modal-next');

  let activeCraftIndex = 0;

  function updateCraftDots(idx) {
    craftDots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
  }

  function scrollCraftTo(idx) {
    if (!craftCarousel || !craftSlides[idx]) return;
    const targetSlide = craftSlides[idx];
    craftCarousel.scrollTo({
      left: targetSlide.offsetLeft - craftCarousel.offsetLeft,
      behavior: 'smooth',
    });
    updateCraftDots(idx);
  }

  if (craftCarousel) {
    craftCarousel.addEventListener(
      'scroll',
      () => {
        if (!craftSlides.length) return;
        const slideWidth = craftSlides[0].offsetWidth + 16;
        const idx = Math.min(
          CRAFT_STEPS.length - 1,
          Math.max(0, Math.round(craftCarousel.scrollLeft / slideWidth))
        );
        updateCraftDots(idx);
      },
      { passive: true }
    );
  }

  if (craftPrevBtn) {
    craftPrevBtn.addEventListener('click', () => {
      const current = Array.from(craftDots).findIndex((d) => d.classList.contains('is-active'));
      scrollCraftTo(Math.max(0, current - 1));
    });
  }

  if (craftNextBtn) {
    craftNextBtn.addEventListener('click', () => {
      const current = Array.from(craftDots).findIndex((d) => d.classList.contains('is-active'));
      scrollCraftTo(Math.min(CRAFT_STEPS.length - 1, current + 1));
    });
  }

  craftDots.forEach((dot) => {
    dot.addEventListener('click', () => scrollCraftTo(Number(dot.dataset.dot)));
  });

  function renderCraftModal(idx) {
    activeCraftIndex = (idx + CRAFT_STEPS.length) % CRAFT_STEPS.length;
    const baseStep = CRAFT_STEPS[activeCraftIndex];
    const d = getDict();
    const step = (d && d.craft && d.craft.steps[activeCraftIndex]) || baseStep;
    if (!baseStep || !step) return;

    const prefix = d && d.craft ? d.craft.stepPrefix : 'STEP';
    const ofWord = d && d.craft ? d.craft.ofWord : 'OF';
    craftModalImg.src = baseStep.img;
    craftModalImg.alt = baseStep.alt;
    craftModalStep.textContent = `${prefix} ${step.num} ${ofWord} 0${CRAFT_STEPS.length} · ${step.phase}`;
    craftModalTitle.textContent = step.title;
    craftModalDesc.textContent = step.desc;
    craftModalCounter.textContent = `${step.num} / 0${CRAFT_STEPS.length}`;
    craftModalChips.innerHTML = step.chips.map((c) => `<span>${c}</span>`).join('');

    if (!prefersReducedMotion && typeof window.gsap !== 'undefined') {
      gsap.fromTo(
        [craftModalImg, craftModalTitle, craftModalDesc],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }
  }

  function openCraftModal(idx) {
    if (!craftModal) return;
    renderCraftModal(idx);
    craftModal.classList.add('is-open');
    craftModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCraftModal() {
    if (!craftModal) return;
    craftModal.classList.remove('is-open');
    craftModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  craftSlides.forEach((slide) => {
    const idx = Number(slide.dataset.step);
    slide.addEventListener('click', () => openCraftModal(idx));
    slide.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCraftModal(idx);
      }
    });
  });

  if (closeCraftModalBtn && craftModal) {
    closeCraftModalBtn.addEventListener('click', closeCraftModal);
    craftModal.addEventListener('click', (e) => {
      if (e.target === craftModal) closeCraftModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && craftModal.classList.contains('is-open')) {
        closeCraftModal();
      }
    });
  }

  if (craftModalPrev) craftModalPrev.addEventListener('click', () => renderCraftModal(activeCraftIndex - 1));
  if (craftModalNext) craftModalNext.addEventListener('click', () => renderCraftModal(activeCraftIndex + 1));

  /* ------------------------------------------------------------------------
     6. Live Golden Plaque Studio (Name, Presets, Finish Swatches) + Modal
     ------------------------------------------------------------------------ */
  const customNameInput = document.getElementById('custom-name-input');
  const plaqueLiveText = document.getElementById('plaque-live-text');
  const plaqueCharCount = document.getElementById('plaque-char-count');
  const plaqueArchMock = document.getElementById('plaque-arch-mock');
  const plaqueChipThumb = document.getElementById('plaque-chip-thumb');
  const plaqueChipLabel = document.getElementById('plaque-chip-label');
  const plaqueArchSub = document.querySelector('.plaque-arch-sub');
  const pickerPills = document.querySelectorAll('.picker-pill');
  const presetChips = document.querySelectorAll('.preset-chip');
  const swatchBtns = document.querySelectorAll('.swatch-btn');
  const customModal = document.getElementById('custom-modal');
  const openModalBtn = document.getElementById('open-custom-modal');
  const closeModalBtn = document.getElementById('close-custom-modal');
  const inqPlaque = document.getElementById('inq-plaque');
  const inqIdea = document.getElementById('inq-idea');

  const CUSTOM_PIECES_META = {
    shrine: { thumb: './assets/shrine-main.webp', finish: 'cream' },
    cottage: { thumb: './assets/cottage-full.webp', finish: 'oak' },
    dragon: { thumb: './assets/step-02-dragon.webp', finish: 'midnight' },
  };
  let activeCustomPiece = 'shrine';

  function selectCustomPiece(key, syncFinish = true) {
    if (!CUSTOM_PIECES_META[key]) return;
    activeCustomPiece = key;
    const meta = CUSTOM_PIECES_META[key];
    const d = getDict();
    const loc = d && d.custom && d.custom.pieces && d.custom.pieces[key];
    const forPrefix = d && d.custom && d.custom.forPrefix ? d.custom.forPrefix : 'FOR:';

    pickerPills.forEach((pill) => {
      const active = pill.dataset.customPiece === key;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-checked', String(active));
    });

    if (plaqueChipThumb) plaqueChipThumb.src = meta.thumb;
    if (plaqueChipLabel) {
      const labelName = loc ? loc.name : key;
      plaqueChipLabel.textContent = `${forPrefix} ${labelName.toUpperCase()}`;
    }
    if (plaqueArchSub && loc) {
      plaqueArchSub.textContent = loc.sub;
    }

    if (syncFinish && plaqueArchMock) {
      plaqueArchMock.setAttribute('data-finish', meta.finish);
      swatchBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.finish === meta.finish));
    }
  }

  pickerPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      selectCustomPiece(pill.dataset.customPiece, true);
      sparklePlaque();
    });
  });

  function updatePlaquePreview(rawValue) {
    const val = rawValue.trim();
    if (plaqueLiveText) plaqueLiveText.textContent = val || 'Your Name';
    if (plaqueCharCount) plaqueCharCount.textContent = `${rawValue.length} / 22`;
    presetChips.forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.preset === val);
    });
  }

  if (customNameInput) {
    customNameInput.addEventListener('input', (e) => updatePlaquePreview(e.target.value));
    updatePlaquePreview(customNameInput.value);
  }

  const plaqueStar = document.querySelector('.plaque-star');
  function sparklePlaque() {
    if (!plaqueStar || prefersReducedMotion) return;
    plaqueStar.classList.remove('is-sparkling');
    void plaqueStar.offsetWidth;
    plaqueStar.classList.add('is-sparkling');
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.preset || '';
      if (customNameInput) customNameInput.value = name;
      updatePlaquePreview(name);
      sparklePlaque();
    });
  });

  swatchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const finish = btn.dataset.finish || 'cream';
      swatchBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (plaqueArchMock) plaqueArchMock.setAttribute('data-finish', finish);
    });
  });

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
      const d = getDict();
      customFeedback.textContent = d ? d.custom.feedbackSuccess : '✨ Thank you! Your custom request has been noted. Giang will reply within 24–48 hours.';
      customInquiryForm.reset();
      setTimeout(() => {
        if (customModal.open) customModal.close();
        customFeedback.textContent = '';
      }, 2400);
    });
  }

  /* ------------------------------------------------------------------------
     7. Upcoming Story Video (Full 9:16, Play Once on Scroll with Sound, Tap to Replay)
     ------------------------------------------------------------------------ */
  const dragonVideoBox = document.getElementById('dragon-video-box');
  const dragonVideo = document.getElementById('dragon-video');
  const dragonSoundBtn = document.getElementById('dragon-sound-btn');
  const dragonSoundIcon = document.getElementById('dragon-sound-icon');
  const dragonSoundPrompt = document.getElementById('dragon-sound-prompt');
  const dragonReplayOverlay = document.getElementById('dragon-replay-overlay');
  const dragonReplayBtn = document.getElementById('dragon-replay-btn');

  if (dragonVideo && dragonVideoBox) {
    let hasFinishedOnce = false;
    let isCurrentlyVisible = false;

    function syncSoundUI() {
      const isMuted = dragonVideo.muted;
      if (dragonSoundIcon) dragonSoundIcon.textContent = isMuted ? '🔇' : '🔊';
      if (dragonSoundBtn) dragonSoundBtn.setAttribute('aria-pressed', String(!isMuted));
      if (dragonSoundPrompt) {
        const showPrompt = isMuted && !dragonVideo.paused && !hasFinishedOnce;
        dragonSoundPrompt.classList.toggle('is-hidden', !showPrompt);
      }
    }

    async function playWithSoundPreferred() {
      if (dragonReplayOverlay) dragonReplayOverlay.classList.add('is-hidden');
      try {
        dragonVideo.muted = false;
        await dragonVideo.play();
      } catch (_) {
        // Browser blocked unmuted autoplay because user hasn't interacted yet -> play muted + show tap-for-sound pill
        try {
          dragonVideo.muted = true;
          await dragonVideo.play();
        } catch (_) {}
      }
      syncSoundUI();
    }

    function replayFromStart() {
      hasFinishedOnce = false;
      dragonVideo.currentTime = 0;
      dragonVideo.muted = false;
      if (dragonReplayOverlay) dragonReplayOverlay.classList.add('is-hidden');
      dragonVideo.play().catch(() => {});
      syncSoundUI();
    }

    dragonVideo.addEventListener('ended', () => {
      hasFinishedOnce = true;
      if (dragonSoundPrompt) dragonSoundPrompt.classList.add('is-hidden');
      if (dragonReplayOverlay) dragonReplayOverlay.classList.remove('is-hidden');
    });

    dragonVideo.addEventListener('volumechange', syncSoundUI);

    if (dragonSoundBtn) {
      dragonSoundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dragonVideo.muted = !dragonVideo.muted;
        if (dragonVideo.paused && !hasFinishedOnce) {
          dragonVideo.play().catch(() => {});
        }
        syncSoundUI();
      });
    }

    if (dragonSoundPrompt) {
      dragonSoundPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        dragonVideo.muted = false;
        if (dragonVideo.paused) dragonVideo.play().catch(() => {});
        syncSoundUI();
      });
    }

    if (dragonReplayBtn) {
      dragonReplayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        replayFromStart();
      });
    }

    dragonVideoBox.addEventListener('click', () => {
      if (hasFinishedOnce || dragonVideo.ended) {
        replayFromStart();
      } else if (dragonVideo.muted) {
        dragonVideo.muted = false;
        if (dragonVideo.paused) dragonVideo.play().catch(() => {});
        syncSoundUI();
      } else if (dragonVideo.paused) {
        dragonVideo.play().catch(() => {});
      } else {
        dragonVideo.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      const vidObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isCurrentlyVisible = entry.isIntersecting;
            if (isCurrentlyVisible) {
              if (!hasFinishedOnce && dragonVideo.paused) {
                playWithSoundPreferred();
              }
            } else if (!dragonVideo.paused) {
              dragonVideo.pause();
            }
          });
        },
        { threshold: 0.45 }
      );
      vidObserver.observe(dragonVideoBox);
    }
  }

  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactFeedback = document.getElementById('contact-feedback');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sender = (contactName && contactName.value.trim()) || 'friend';
      const d = getDict();
      contactFeedback.textContent = d && d.contact
        ? d.contact.feedbackSuccess(sender)
        : `✨ Thank you, ${sender}! Your message has been received. Giang will reply within 24 hours.`;
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     7B. Tiny Studio Corner 3-Photo Slideshow (Arrows, Thumbs & Touch Swipe)
     ------------------------------------------------------------------------ */
  const STUDIO_PHOTOS = [
    {
      src: './assets/studio-02.jpg',
      alt: 'Sunlit window corner of Peachy Tiny Studio with paint jars and graduation bear',
      caption: 'The sunlit window corner — paint jars, daydreams, and morning skies.',
    },
    {
      src: './assets/studio-03.jpg',
      alt: 'Golden hour sunlight across Giang’s clay crafting desk with tiny sunflowers and books',
      caption: 'Golden hour on the crafting desk — tiny clay sunflowers, books, and quiet focus.',
    },
    {
      src: './assets/studio-01.jpg',
      alt: 'Blue sky and clouds seen from Peachy Tiny Studio desk window',
      caption: 'Looking up between sculpting hours — a calm breath under blue clouds.',
    },
  ];

  const studioStage = document.getElementById('studio-stage');
  const studioImg = document.getElementById('studio-slide-img');
  const studioCounter = document.getElementById('studio-counter');
  const studioCaptionText = document.getElementById('studio-caption-text');
  const studioPrevBtn = document.getElementById('studio-prev');
  const studioNextBtn = document.getElementById('studio-next');
  const studioThumbs = document.querySelectorAll('.studio-thumb');
  let activeStudioIndex = 0;

  function showStudioPhoto(idx) {
    activeStudioIndex = (idx + STUDIO_PHOTOS.length) % STUDIO_PHOTOS.length;
    const item = STUDIO_PHOTOS[activeStudioIndex];
    if (!item || !studioImg) return;

    studioImg.style.opacity = '0.35';
    setTimeout(() => {
      studioImg.src = item.src;
      studioImg.alt = item.alt;
      studioImg.style.opacity = '1';
    }, 150);

    const d = getDict();
    const locCaption = d && d.studio && d.studio.photos[activeStudioIndex] ? d.studio.photos[activeStudioIndex].caption : item.caption;
    if (studioCounter) studioCounter.textContent = `0${activeStudioIndex + 1} / 0${STUDIO_PHOTOS.length}`;
    if (studioCaptionText) studioCaptionText.textContent = locCaption;

    studioThumbs.forEach((btn, i) => {
      const active = i === activeStudioIndex;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  if (studioPrevBtn) studioPrevBtn.addEventListener('click', () => showStudioPhoto(activeStudioIndex - 1));
  if (studioNextBtn) studioNextBtn.addEventListener('click', () => showStudioPhoto(activeStudioIndex + 1));
  studioThumbs.forEach((btn) => {
    btn.addEventListener('click', () => showStudioPhoto(Number(btn.dataset.studio)));
  });

  // Touch swipe support on mobile
  if (studioStage) {
    let touchStartX = 0;
    studioStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    studioStage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        showStudioPhoto(activeStudioIndex + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     8. Bilingual EN ↔ VI Engine
     ------------------------------------------------------------------------ */
  let manifestoTrigger = null;

  function setupManifestoReveal() {
    const manifestoEl = document.getElementById('manifesto-text');
    if (!manifestoEl) return;
    const raw = manifestoEl.textContent.trim();
    const words = raw.split(/\s+/);
    manifestoEl.innerHTML = words
      .map((w) => `<span class="manifesto-word">${w}</span>`)
      .join(' ');

    if (manifestoTrigger) {
      manifestoTrigger.kill();
      manifestoTrigger = null;
    }

    if (prefersReducedMotion || typeof window.gsap === 'undefined') {
      document.querySelectorAll('.manifesto-word').forEach((el) => (el.style.opacity = '1'));
      return;
    }

    const manifestoWords = document.querySelectorAll('.manifesto-word');
    if (manifestoWords.length) {
      const tween = gsap.to(manifestoWords, {
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
      manifestoTrigger = tween.scrollTrigger;
    }
  }

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el && typeof text === 'string') el.textContent = text;
  }

  function setHtml(sel, html) {
    const el = document.querySelector(sel);
    if (el && typeof html === 'string') el.innerHTML = html;
  }

  function applyLanguage(lang) {
    currentLang = lang === 'vi' ? 'vi' : 'en';
    const d = getDict();
    if (!d) return;

    root.setAttribute('lang', currentLang);
    document.title = d.pageTitle;
    try {
      localStorage.setItem('peachy-lang', currentLang);
    } catch (_) {}

    // Language toggle buttons state
    document.querySelectorAll('[data-lang-opt]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.langOpt === currentLang);
    });
    const mobileLangBtn = document.getElementById('mobile-lang-toggle');
    if (mobileLangBtn) {
      mobileLangBtn.textContent = currentLang === 'en' ? 'VI' : 'EN';
    }

    // Header & Drawer Nav
    const navLinks = document.querySelectorAll('.pill-nav .nav-link');
    const navKeys = ['creations', 'craft', 'custom', 'story'];
    navLinks.forEach((el, i) => {
      if (d.nav[navKeys[i]]) el.textContent = d.nav[navKeys[i]];
    });
    const headerEtsySpan = document.querySelector('#header-etsy-btn span:first-child');
    if (headerEtsySpan) headerEtsySpan.textContent = d.nav.visitEtsy;

    const drawerLinks = document.querySelectorAll('#mobile-drawer .drawer-link');
    const drawerKeys = ['creations', 'craft', 'drawerCustom', 'drawerDragon', 'drawerGiang'];
    drawerLinks.forEach((el, i) => {
      if (d.nav[drawerKeys[i]]) el.textContent = d.nav[drawerKeys[i]];
    });

    // Sync theme labels to new language
    applyTheme(root.getAttribute('data-theme') || 'day');

    // Hero
    const heroEyebrowText = document.querySelector('.hero-eyebrow span:last-child');
    if (heroEyebrowText) heroEyebrowText.textContent = d.hero.eyebrow;
    setHtml('.hero-title', d.hero.titleHtml);
    setText('.hero-subtitle', d.hero.subtitle);
    const heroExploreSpan = document.querySelector('.hero-cta-row a span:first-child');
    if (heroExploreSpan) heroExploreSpan.textContent = d.hero.ctaExplore;
    const scrollCueSpan = document.querySelector('.scroll-cue span:first-child');
    if (scrollCueSpan) scrollCueSpan.textContent = d.hero.scrollCue;

    // Manifesto + Marquee
    setText('#manifesto .section-kicker', d.manifesto.kicker);
    setText('#manifesto-text', d.manifesto.text);
    setupManifestoReveal();
    document.querySelectorAll('.marquee-group').forEach((group) => {
      group.innerHTML = d.manifesto.marquee.map((item) => `<span>${item}</span>`).join('');
    });

    // Creations
    setText('#creations .section-kicker', d.creations.kicker);
    setHtml('#creations .section-title', d.creations.titleHtml);
    const tabShrine = document.querySelector('.piece-tab[data-piece="shrine"]');
    if (tabShrine) tabShrine.innerHTML = `<span class="mono">01</span> ${d.creations.tabShrine}`;
    const tabCottage = document.querySelector('.piece-tab[data-piece="cottage"]');
    if (tabCottage) tabCottage.innerHTML = `<span class="mono">02</span> ${d.creations.tabCottage}`;
    const statusBadge = document.querySelector('#creations .status-badge');
    if (statusBadge) statusBadge.innerHTML = `<span class="pulse-dot"></span> ${d.creations.available}`;
    const adoptSpan = document.querySelector('#piece-etsy-btn span:first-child');
    if (adoptSpan) adoptSpan.textContent = d.creations.adoptBtn;
    const customCtaSpan = document.querySelector('.info-cta-stack .btn-outline span');
    if (customCtaSpan) customCtaSpan.textContent = d.creations.customBtn;
    setText('#creations .shipping-note', d.creations.shippingNote);
    renderGallery(activePieceKey, activeAngleIndex);

    // Craft Carousel & Popup
    setText('#craft .section-kicker', d.craft.kicker);
    setHtml('#craft .section-title', d.craft.titleHtml);
    setText('#craft .section-lead', d.craft.lead);
    setText('.craft-swipe-hint', d.craft.swipeHint);
    setText('#craft-modal-prev', d.craft.modalPrev);
    setText('#craft-modal-next', d.craft.modalNext);
    craftSlides.forEach((slide, i) => {
      const st = d.craft.steps[i];
      if (!st) return;
      const badge = slide.querySelector('.slide-step-badge');
      const zoom = slide.querySelector('.slide-zoom-pill');
      const title = slide.querySelector('.craft-slide-title');
      const teaser = slide.querySelector('.craft-slide-teaser');
      const chipsWrap = slide.querySelector('.craft-chips');
      if (badge) badge.textContent = st.badge;
      if (zoom) zoom.textContent = d.craft.viewDetail;
      if (title) title.textContent = st.title;
      if (teaser) teaser.textContent = st.teaser;
      if (chipsWrap) chipsWrap.innerHTML = st.chips.slice(0, 2).map((c) => `<span>${c}</span>`).join('');
    });
    if (craftModal && craftModal.classList.contains('is-open')) {
      renderCraftModal(activeCraftIndex);
    }

    // Custom Plaque Studio & Modal
    setText('#custom .section-kicker', d.custom.kicker);
    setText('.custom-free-tag', d.custom.editionTag);
    setHtml('#custom .section-title', d.custom.titleHtml);
    setText('.custom-desc', d.custom.desc);
    setText('.plaque-pill', d.custom.realPill);
    const liveInd = document.querySelector('.live-indicator');
    if (liveInd) liveInd.innerHTML = `<span class="pulse-dot"></span> ${d.custom.livePreview}`;
    setText('.plaque-arch-sub', d.custom.backplateSub);
    setText('#custom-picker-label', d.custom.pickerLabel);
    if (d.custom.pieces) {
      document.querySelectorAll('[data-picker-text]').forEach((el) => {
        const k = el.dataset.pickerText;
        if (k && d.custom.pieces[k]) el.textContent = d.custom.pieces[k].short || d.custom.pieces[k].name;
      });
    }
    selectCustomPiece(activeCustomPiece, false);
    setText('.input-label-row label', d.custom.inputLabel);
    if (customNameInput) {
      customNameInput.placeholder = d.custom.inputPlaceholder;
      if (!customNameInput.value.trim() && plaqueLiveText) {
        plaqueLiveText.textContent = d.custom.fallbackName;
      }
    }
    const reqSpan = document.querySelector('#open-custom-modal span:first-child');
    if (reqSpan) reqSpan.textContent = d.custom.ctaRequest;
    const msgEtsySpan = document.querySelector('.custom-cta-row .btn-outline span:first-child');
    if (msgEtsySpan) msgEtsySpan.textContent = d.custom.ctaEtsy;
    const perksWrap = document.querySelector('.custom-perks');
    if (perksWrap) perksWrap.innerHTML = d.custom.perks.map((p) => `<span>${p}</span>`).join('');

    setText('#custom-modal .section-kicker', d.custom.modalKicker);
    setHtml('#modal-title', d.custom.modalTitleHtml);
    setText('label[for="inq-name"]', d.custom.labelName);
    const inqName = document.getElementById('inq-name');
    if (inqName) inqName.placeholder = d.custom.placeholderName;
    setText('label[for="inq-email"]', d.custom.labelEmail);
    setText('label[for="inq-plaque"]', d.custom.labelPlaque);
    setText('label[for="inq-idea"]', d.custom.labelIdea);
    const inqIdea = document.getElementById('inq-idea');
    if (inqIdea) inqIdea.placeholder = d.custom.placeholderIdea;
    setText('#custom-inquiry-form button[type="submit"]', d.custom.submitBtn);

    // Meet Giang
    setText('#story .section-kicker', d.maker.kicker);
    setText('.maker-tag', d.maker.tag);
    setHtml('#story .section-title', d.maker.titleHtml);
    setText('.maker-quote', d.maker.quote);
    setText('.maker-sign', d.maker.sign);

    // Tiny Studio Corner
    setText('#studio .section-kicker', d.studio.kicker);
    setHtml('#studio .section-title', d.studio.titleHtml);
    setText('.studio-tagline', d.studio.tagline);
    setText('.studio-origin', d.studio.origin);
    const storyCopy = document.querySelector('.studio-story-copy');
    if (storyCopy) {
      storyCopy.innerHTML = d.studio.paragraphs.map((p) => `<p>${p}</p>`).join('');
    }
    studioThumbs.forEach((btn, i) => {
      const span = btn.querySelector('span');
      if (span && d.studio.photos[i]) span.textContent = d.studio.photos[i].thumb;
    });
    if (studioCaptionText && d.studio.photos[activeStudioIndex]) {
      studioCaptionText.textContent = d.studio.photos[activeStudioIndex].caption;
    }

    // Waitlist / Upcoming Story
    setText('#waitlist .section-kicker', d.waitlist.kicker);
    setText('#waitlist .media-badge-inline', d.waitlist.badge);
    setHtml('#waitlist .section-title', d.waitlist.titleHtml);
    setText('.waitlist-desc', d.waitlist.desc);
    setText('#waitlist-follow-label', d.waitlist.followBtn);
    if (d.waitlist.replayBtn) setText('#dragon-replay-label', d.waitlist.replayBtn);
    if (d.waitlist.tapSound) setText('#dragon-sound-prompt-text', d.waitlist.tapSound);

    // FAQ
    setText('#faq .section-kicker', d.faq.kicker);
    setHtml('.faq-heading', d.faq.titleHtml);
    const faqItems = document.querySelectorAll('#faq-list .faq-item');
    faqItems.forEach((item, i) => {
      const qa = d.faq.items[i];
      if (!qa) return;
      const qSpan = item.querySelector('summary span:first-child');
      const aEl = item.querySelector('p');
      if (qSpan) qSpan.textContent = qa.q;
      if (aEl) aEl.textContent = qa.a;
    });

    // Contact Studio
    if (d.contact) {
      setText('#contact-kicker', d.contact.kicker);
      setHtml('#contact-title', d.contact.titleHtml);
      setText('#contact-lead', d.contact.lead);
      setText('#contact-meta-loc', d.contact.metaLoc);
      setText('#contact-meta-reply', d.contact.metaReply);
      setText('#contact-label-name', d.contact.labelName);
      if (contactName) contactName.placeholder = d.contact.placeholderName;
      setText('#contact-label-email', d.contact.labelEmail);
      setText('#contact-label-topic', d.contact.labelTopic);
      setText('#opt-custom', d.contact.topics.custom);
      setText('#opt-shipping', d.contact.topics.shipping);
      setText('#opt-gift', d.contact.topics.gift);
      setText('#opt-other', d.contact.topics.other);
      setText('#contact-label-msg', d.contact.labelMsg);
      const contactMsg = document.getElementById('contact-message');
      if (contactMsg) contactMsg.placeholder = d.contact.placeholderMsg;
      setText('#contact-submit-label', d.contact.submitBtn);
    }

    // Floating Quick-Chat Labels
    if (d.fab) {
      setText('#fab-opt-etsy', d.fab.etsy);
      setText('#fab-opt-ig', d.fab.ig);
      setText('#fab-opt-contact', d.fab.contact);
      if (fabTopBtn) fabTopBtn.title = d.fab.backTop;
    }

    // Footer
    setText('.footer-note', d.footer.note);
    setText('.back-top', d.footer.backTop);

    if (typeof window.ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  function toggleLanguage() {
    applyLanguage(currentLang === 'en' ? 'vi' : 'en');
  }

  const headerLangToggle = document.getElementById('header-lang-toggle');
  const mobileLangToggle = document.getElementById('mobile-lang-toggle');
  if (headerLangToggle) headerLangToggle.addEventListener('click', toggleLanguage);
  if (mobileLangToggle) mobileLangToggle.addEventListener('click', toggleLanguage);

  /* ------------------------------------------------------------------------
     9. Scroll Intro Reveal Engine (Native IntersectionObserver + GSAP Hero)
     ------------------------------------------------------------------------ */
  function initScrollReveals() {
    const groups = [
      { sel: '#creations .section-header-split > *', step: 110 },
      { sel: '#creations .gallery-stage-col, #creations .gallery-info-col', step: 140 },
      { sel: '#craft .craft-intro > *, #craft .craft-nav-arrows', step: 90 },
      { sel: '#craft-carousel .craft-slide', step: 110 },
      { sel: '#custom .plaque-real, #custom .plaque-live-wrap, #custom .custom-form-col', step: 130 },
      { sel: '#story .maker-portrait-wrap, #story .maker-copy > *', step: 95 },
      { sel: '#studio .studio-stage-wrap, #studio .studio-info-col > *', step: 95 },
      { sel: '#waitlist .waitlist-media, #waitlist .waitlist-content > *', step: 95 },
      { sel: '#faq .faq-header > *, #faq .faq-item', step: 90 },
      { sel: '#contact .contact-info-col > *, #contact .contact-form', step: 95 },
    ];

    const allTargets = [];
    groups.forEach(({ sel, step }) => {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach((node, idx) => {
        node.classList.add('reveal-item');
        node.style.setProperty('--reveal-delay', `${idx * step}ms`);
        allTargets.push(node);
      });
    });

    if (!('IntersectionObserver' in window)) {
      allTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    allTargets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     9B. Extra Micro-Animations:
         - Active Nav Scroll-Spy
         - Subtle Hero Parallax
         - Craft Slide 3D Hover Tilt (Desktop)
         - Soft Candlelight Cursor Glow (Desktop Night Glow)
     ------------------------------------------------------------------------ */
  function initMicroAnimations() {
    // 1. Active Nav Pill Scroll-Spy
    const navMap = [
      { id: 'creations', href: '#creations' },
      { id: 'craft', href: '#craft' },
      { id: 'custom', href: '#custom' },
      { id: 'story', href: '#story' },
      { id: 'studio', href: '#story' },
    ];
    const navLinks = document.querySelectorAll('.pill-nav .nav-link');
    if ('IntersectionObserver' in window && navLinks.length) {
      const spyObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const match = navMap.find((m) => m.id === entry.target.id);
            if (!match) return;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === match.href);
            });
          });
        },
        { rootMargin: '-35% 0px -50% 0px' }
      );
      navMap.forEach(({ id }) => {
        const sec = document.getElementById(id);
        if (sec) spyObs.observe(sec);
      });
    }

    if (prefersReducedMotion) return;

    // 2. Subtle Hero Parallax on scroll
    const heroMedia = document.querySelector('.hero-media-frame');
    if (heroMedia) {
      window.addEventListener(
        'scroll',
        () => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            heroMedia.style.transform = `translate3d(0, ${Math.round(y * 0.16)}px, 0)`;
          }
        },
        { passive: true }
      );
    }

    // Desktop-only subtle tactile animations
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    // 3. Craft Carousel Cards subtle 3D tilt on hover
    craftSlides.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-ny * 5).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // 4. Soft Candlelight Cursor Glow (smooth lerp)
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
      let tx = -500;
      let ty = -500;
      let cx = -500;
      let cy = -500;
      window.addEventListener(
        'mousemove',
        (e) => {
          tx = e.clientX - 180;
          ty = e.clientY - 180;
          cursorGlow.classList.add('is-visible');
        },
        { passive: true }
      );
      document.addEventListener('mouseleave', () => cursorGlow.classList.remove('is-visible'));
      function tickGlow() {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        cursorGlow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        requestAnimationFrame(tickGlow);
      }
      requestAnimationFrame(tickGlow);
    }
  }

  function playHeroEntrance() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined') return;
    gsap.from('.hero-eyebrow, .hero-title, .hero-subtitle, .hero-cta-row', {
      y: 28,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });
  }

  function runIntroPreloader() {
    const preloader = document.getElementById('intro-preloader');
    const pctEl = document.getElementById('intro-pct');
    const fillEl = document.getElementById('intro-progress-fill');
    const skipBtn = document.getElementById('intro-skip');
    const d = getDict();

    if (!preloader || prefersReducedMotion) {
      document.body.classList.remove('is-intro-active');
      if (preloader) preloader.classList.add('is-done');
      playHeroEntrance();
      return;
    }

    if (d && d.intro && skipBtn) {
      skipBtn.textContent = d.intro.skip;
    }

    const isReturning = (() => {
      try { return sessionStorage.getItem('peachy-intro-seen') === '1'; } catch (_) { return false; }
    })();

    const duration = isReturning ? 1100 : 2100;
    const start = performance.now();
    let dismissed = false;

    function finishIntro(immediate = false) {
      if (dismissed) return;
      dismissed = true;
      try { sessionStorage.setItem('peachy-intro-seen', '1'); } catch (_) {}

      if (pctEl) pctEl.textContent = '100%';
      if (fillEl) fillEl.style.width = '100%';
      preloader.style.setProperty('--intro-spread', '132%');
      preloader.classList.add('is-lit');

      const leaveDelay = immediate ? 0 : 320;
      setTimeout(() => {
        document.body.classList.remove('is-intro-active');
        preloader.classList.add('is-leaving');
        playHeroEntrance();
        setTimeout(() => preloader.classList.add('is-done'), 900);
      }, leaveDelay);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => finishIntro(true));
    }

    // Hard failsafe so the intro can never block the page
    const failsafeTimer = setTimeout(() => finishIntro(true), 4500);

    function tickIntro(now) {
      if (dismissed) return;
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / duration);
      // Smooth ease-out curve for the 0 -> 100% logo bloom
      const eased = 1 - Math.pow(1 - raw, 2.2);
      const pct = Math.round(eased * 100);
      const spreadPct = (eased * 132).toFixed(2);

      if (pctEl) pctEl.textContent = `${String(pct).padStart(2, '0')}%`;
      if (fillEl) fillEl.style.width = `${pct}%`;
      preloader.style.setProperty('--intro-spread', `${spreadPct}%`);

      if (pct >= 35) {
        preloader.classList.add('is-lit');
      }

      if (raw < 1) {
        requestAnimationFrame(tickIntro);
      } else {
        clearTimeout(failsafeTimer);
        finishIntro(false);
      }
    }

    requestAnimationFrame(tickIntro);
  }

  function initMotion() {
    if (typeof window.gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    applyLanguage(currentLang);
    initScrollReveals();
    initMicroAnimations();
    runIntroPreloader();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
