/* LUCA SALVEMINI!!! — motore animazioni (GSAP + ScrollTrigger + SplitText + Draggable + Lenis) */

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);

const SVGNS = 'http://www.w3.org/2000/svg';
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- stella a 8 punte: generatore punti ---------- */
function starPoints(cx, cy, rOut, rIn, spikes = 8, rotDeg = -90) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = (Math.PI / spikes) * i + (rotDeg * Math.PI) / 180;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

/* logo: tre strati concentrici */
(function buildLogoStar() {
  const layers = document.querySelectorAll('.logo-star polygon');
  const radii = [[48, 20], [36, 15], [24, 10]];
  layers.forEach((poly, i) => poly.setAttribute('points', starPoints(50, 50, radii[i][0], radii[i][1])));
})();

/* mini stella nello sticker circolare */
(function buildMiniStar() {
  const g = document.querySelector('.stk-star-mini');
  if (!g) return;
  const cols = ['#FF3EBA', '#CEFF00', '#F7F6EB'];
  [[30, 13], [22, 9], [13, 6]].forEach((r, i) => {
    const p = document.createElementNS(SVGNS, 'polygon');
    p.setAttribute('points', starPoints(75, 75, r[0], r[1]));
    p.setAttribute('fill', cols[i]);
    g.appendChild(p);
  });
})();

/* ---------- pill del marquee: due facce per il flip in hover ---------- */
(function buildPills() {
  document.querySelectorAll('.pill').forEach((p) => {
    const txt = p.textContent.trim();
    const inner = document.createElement('span');
    inner.className = 'pill__inner';
    const front = document.createElement('span');
    front.className = 'pill__face pill__front';
    front.textContent = txt;
    const back = document.createElement('span');
    back.className = 'pill__face pill__back';
    back.textContent = txt;
    inner.append(front, back);
    p.textContent = '';
    p.appendChild(inner);
  });
})();

/* ---------- cursore: il guanto che punta (solo con un mouse vero) ---------- */
(function glove() {
  if (!isFinePointer) return;
  const g = document.getElementById('guanto');
  if (!g) return;
  const SIZE = 52;
  const TIP_X = 0.33 * SIZE;
  const TIP_Y = 0.24 * SIZE;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hot = 'a, button, .pill, .stk, .roster-row, .hero-badge, input, textarea';
  gsap.set(g, { transformOrigin: '33% 24%' });
  const xTo = gsap.quickTo(g, 'x', { duration: reduce ? 0 : 0.11, ease: 'power3' });
  const yTo = gsap.quickTo(g, 'y', { duration: reduce ? 0 : 0.11, ease: 'power3' });
  const rTo = gsap.quickTo(g, 'rotation', { duration: 0.35, ease: 'power2' });
  let lastX = null;
  let shown = false;
  let hoverScale = 1;

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX - TIP_X);
    yTo(e.clientY - TIP_Y);
    if (!reduce) {
      const dx = lastX == null ? 0 : e.clientX - lastX;
      rTo(gsap.utils.clamp(-16, 16, dx * 0.9));
      lastX = e.clientX;
    }
    if (!shown) {
      shown = true;
      document.documentElement.classList.add('has-glove');
      gsap.to(g, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    shown = false;
    gsap.to(g, { autoAlpha: 0, duration: 0.2, overwrite: 'auto' });
  });

  document.addEventListener('mouseover', (e) => {
    if (!e.target.closest(hot)) return;
    hoverScale = 1.18;
    gsap.to(g, { scaleX: hoverScale, scaleY: hoverScale, duration: 0.22, ease: 'back.out(2)', overwrite: 'auto' });
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.target.closest(hot)) return;
    hoverScale = 1;
    gsap.to(g, { scaleX: 1, scaleY: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  });

  window.addEventListener('mousedown', () => {
    if (reduce) return;
    gsap.to(g, { scaleX: hoverScale * 1.08, scaleY: hoverScale * 0.8, duration: 0.1, overwrite: 'auto' });
  });
  window.addEventListener('mouseup', () => {
    if (reduce) return;
    gsap.to(g, { scaleX: hoverScale, scaleY: hoverScale, duration: 0.3, ease: 'back.out(2.5)', overwrite: 'auto' });
  });
})();

/* ---------- preloader: la bomba ---------- */
function buildPreloaderStar() {
  const host = document.getElementById('preloaderStar');
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  const cols = ['#4A60FF', '#FF3EBA', '#31A362', '#CEFF00', '#F7F6EB', '#141414'];
  const layers = [];
  cols.forEach((c, i) => {
    const p = document.createElementNS(SVGNS, 'polygon');
    const s = 1 - i * 0.155;
    p.setAttribute('points', starPoints(100, 100, 96 * s, 42 * s));
    p.setAttribute('fill', c);
    svg.appendChild(p);
    layers.push(p);
  });
  const mini = document.createElementNS(SVGNS, 'polygon');
  mini.setAttribute('points', starPoints(100, 100, 14, 6));
  mini.setAttribute('fill', '#F7F6EB');
  svg.appendChild(mini);
  layers.push(mini);
  host.appendChild(svg);
  return layers;
}

/* ---------- lenis ---------- */
const lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  });
});

/* ---------- utility marquee infinito ---------- */
const marqueeTweens = [];
function makeMarquee(track, dir = 1, duration = 22) {
  const parent = track.parentElement;
  const fill = () => {
    while (track.scrollWidth < parent.offsetWidth * 2.2) {
      [...track.children].forEach((c) => track.appendChild(c.cloneNode(true)));
    }
  };
  fill();
  const tween = gsap.fromTo(
    track,
    { xPercent: dir === 1 ? 0 : -50 },
    { xPercent: dir === 1 ? -50 : 0, duration, ease: 'none', repeat: -1 }
  );
  marqueeTweens.push({ tween, base: dir });
  return tween;
}

/* ============================================================
   MOTION COMPLETO (salvo reduced motion)
   ============================================================ */
const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  /* ---------- intro: preloader + hero ---------- */
  const layers = buildPreloaderStar();
  const heroWords = document.querySelectorAll('.hero-word');
  const splitHero = [];
  let heroSplitDone = document.fonts.ready.then(() => {
    heroWords.forEach((w) => splitHero.push(new SplitText(w, { type: 'chars', charsClass: 'ch' })));
  });

  gsap.set('.hero-sticker', { scale: 0, rotation: 18 });
  gsap.set('.hero-eyes', { scale: 0, transformOrigin: '50% 100%' });
  gsap.set('.hero-badge', { autoAlpha: 0 });
  gsap.set('.header', { yPercent: -120 });

  const boot = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
  boot
    .from(layers, {
      scale: 0,
      rotation: -45,
      transformOrigin: '50% 50%',
      duration: 0.55,
      stagger: 0.085,
    })
    .to(layers, {
      rotation: 12,
      transformOrigin: '50% 50%',
      duration: 0.5,
      ease: 'power2.inOut',
      stagger: { each: 0.03, from: 'end' },
    }, '-=0.2')
    .add('boom')
    .to('#preloaderStar', { scale: 16, rotation: 30, duration: 0.9, ease: 'power3.in' }, 'boom')
    .to('#preloader', { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 'boom+=0.75')
    .set('#preloader', { display: 'none' });

  heroSplitDone.then(() => {
    const chars = splitHero.flatMap((s) => s.chars);
    gsap.set(chars, { yPercent: 120, rotation: 8 });
    boot
      .to(chars, {
        yPercent: 0,
        rotation: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: { each: 0.035, from: 'start' },
      }, 'boom+=0.55')
      .to('.header', { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 'boom+=0.9')
      .to('.hero-sticker', {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'back.out(2.2)',
        clearProps: 'transform',
      }, 'boom+=1.05')
      .to('.hero-eyes', { scale: 1, duration: 0.65, ease: 'back.out(1.9)' }, 'boom+=1.15')
      .to('.hero-badge', { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 'boom+=1.3');
  });

  /* rotellina del badge */
  gsap.to('.hero-badge svg', { rotation: 360, duration: 16, ease: 'none', repeat: -1 });

  /* stella del logo: giro lento */
  gsap.to('.logo-star-spin', { rotation: 360, transformOrigin: '50% 50%', duration: 24, ease: 'none', repeat: -1 });

  /* ---------- occhi: pupille + blink ---------- */
  const eyes = document.getElementById('heroEyes');
  if (eyes && isFinePointer) {
    const px = gsap.quickTo('.hero-eyes .pupil', 'x', { duration: 0.4, ease: 'power3' });
    const py = gsap.quickTo('.hero-eyes .pupil', 'y', { duration: 0.4, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      const r = eyes.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      px(gsap.utils.clamp(-14, 14, dx * 34));
      py(gsap.utils.clamp(-10, 6, dy * 26));
    });
  }
  function blink() {
    gsap.to('.hero-eyes .eye', {
      scaleY: 0.06,
      transformOrigin: '50% 55%',
      duration: 0.09,
      yoyo: true,
      repeat: 1,
      onComplete: () => gsap.delayedCall(gsap.utils.random(2.5, 6), blink),
    });
  }
  gsap.delayedCall(3, blink);

  /* ---------- hero: parallasse + skew da velocità ---------- */
  gsap.to('.hero-title', {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  const skewTo = gsap.quickTo('.hero-title', 'skewX', { duration: 0.5, ease: 'power2.out' });
  lenis.on('scroll', (e) => {
    skewTo(gsap.utils.clamp(-6, 6, e.velocity * 0.25));
  });

  /* ---------- reveal generico delle card ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    gsap.from(card, {
      y: 90,
      rotation: gsap.utils.random(-1.6, 1.6),
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 88%' },
    });
  });

  /* ---------- titoli di sezione: parole che sbucano ---------- */
  document.fonts.ready.then(() => {
    document.querySelectorAll('.sec-title, .intro-title, .contact-sub').forEach((el) => {
      const split = new SplitText(el, { type: 'lines', linesClass: 'sl' });
      gsap.set(el, { perspective: 600 });
      split.lines.forEach((l) => (l.style.overflow = 'clip'));
      const inner = new SplitText(split.lines, { type: 'lines' });
      gsap.from(inner.lines, {
        yPercent: 115,
        rotation: 4,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });

    /* roster: nomi giganti con reveal a maschera */
    document.querySelectorAll('.roster-row').forEach((row) => {
      const name = row.querySelector('.roster-name');
      const cap = row.querySelector('.roster-cap');
      const wrap = document.createElement('span');
      wrap.style.display = 'block';
      wrap.style.overflow = 'clip';
      name.parentNode.insertBefore(wrap, name);
      wrap.appendChild(name);
      gsap.from(name, {
        yPercent: 105,
        rotation: 3,
        duration: 0.85,
        ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 90%' },
      });
      gsap.from(cap, {
        autoAlpha: 0,
        y: 12,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: row, start: 'top 88%' },
      });
    });
  });

  /* ---------- sticker delle sezioni ---------- */
  document.querySelectorAll('.sticker-progetti, .sticker-servizi').forEach((s) => {
    const finalRot = s.classList.contains('sticker-progetti') ? 12 : -10;
    gsap.fromTo(
      s,
      { scale: 0, rotation: finalRot - 40 },
      {
        scale: 1,
        rotation: finalRot,
        duration: 0.7,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: s, start: 'top 88%' },
      }
    );
  });

  /* ---------- chips: parallasse leggera ---------- */
  document.querySelectorAll('.chip').forEach((chip) => {
    const depth = parseFloat(chip.dataset.depth || 1);
    gsap.fromTo(
      chip,
      { y: 70 * depth },
      {
        y: -70 * depth,
        ease: 'none',
        scrollTrigger: { trigger: chip.closest('.card'), start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  /* ---------- marquee ---------- */
  makeMarquee(document.querySelector('.techmarquee-track'), 1, 26);
  document.querySelectorAll('.tagrow').forEach((row, i) => {
    makeMarquee(row.querySelector('.tagrow-track'), parseInt(row.dataset.dir, 10), 30 + i * 4);
  });
  lenis.on('scroll', (e) => {
    const v = gsap.utils.clamp(-8, 8, e.velocity * 0.12);
    marqueeTweens.forEach(({ tween }) => {
      gsap.to(tween, { timeScale: 1 + Math.abs(v) * 0.6, duration: 0.3, overwrite: 'auto' });
    });
  });

  /* ---------- bolla anteprima progetti ---------- */
  if (isFinePointer) {
    const bubble = document.getElementById('previewBubble');
    const bimg = document.getElementById('previewImg');
    const bx = gsap.quickTo(bubble, 'x', { duration: 0.45, ease: 'power3' });
    const by = gsap.quickTo(bubble, 'y', { duration: 0.45, ease: 'power3' });
    let bubbleOn = false;
    window.addEventListener('mousemove', (e) => {
      bx(e.clientX - bubble.offsetWidth / 2);
      by(e.clientY - bubble.offsetHeight * 1.08);
    });
    document.querySelectorAll('.roster-row').forEach((row) => {
      row.style.setProperty('--accent', row.dataset.accent);
      row.addEventListener('mouseenter', () => {
        bimg.src = row.dataset.img;
        if (!bubbleOn) {
          bubbleOn = true;
          gsap.to(bubble, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)', overwrite: 'auto' });
        }
      });
      row.addEventListener('mouseleave', () => {
        bubbleOn = false;
        gsap.to(bubble, { autoAlpha: 0, scale: 0.6, duration: 0.28, ease: 'power2.in', overwrite: 'auto' });
      });
    });
  }

  /* ---------- servizi: cerchi con parallasse e zoom ---------- */
  document.querySelectorAll('.venue-media').forEach((fig) => {
    const speed = parseFloat(fig.dataset.speed || 1);
    gsap.fromTo(
      fig,
      { y: 60 * speed, scale: 0.88 },
      {
        y: -60 * speed,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
    gsap.fromTo(
      fig.querySelector('img, video'),
      { scale: 1.24 },
      {
        scale: 1.05,
        ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  /* ---------- metodo: righe che si aprono ---------- */
  document.querySelectorAll('.metodo-row').forEach((rowEl) => {
    gsap.from(rowEl, {
      autoAlpha: 0,
      y: 26,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: rowEl, start: 'top 90%' },
    });
  });

  /* ---------- contatti: macchina da scrivere ---------- */
  const typeTarget = document.getElementById('typeTarget');
  const cursor = document.getElementById('typeCursor');
  const phrase = 'Il prossimo botto è il tuo sito.';
  gsap.to(cursor, { opacity: 0, duration: 0.55, ease: 'steps(1)', repeat: -1, yoyo: true });
  ScrollTrigger.create({
    trigger: '.contact-card',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      for (let i = 1; i <= phrase.length; i++) {
        tl.call(() => (typeTarget.textContent = phrase.slice(0, i)), null, i * 0.045);
      }
    },
  });

  /* ---------- pila di sticker: schiaffo + trascinabili ---------- */
  const stickers = document.querySelectorAll('.stk');
  stickers.forEach((s) => {
    gsap.set(s, { rotation: parseFloat(s.dataset.rot || 0) });
  });
  gsap.from(stickers, {
    scale: 1.7,
    autoAlpha: 0,
    rotation: () => gsap.utils.random(-60, 60),
    duration: 0.55,
    ease: 'back.out(1.6)',
    stagger: 0.09,
    scrollTrigger: { trigger: '#stickerpile', start: 'top 85%' },
  });
  if (isFinePointer) {
    Draggable.create(stickers, {
      type: 'x,y',
      bounds: '.contact-card',
      inertia: true,
      edgeResistance: 0.75,
      onPress() {
        gsap.to(this.target, { scale: 1.08, duration: 0.18, ease: 'power2.out' });
        this.target.style.zIndex = 20;
      },
      onRelease() {
        gsap.to(this.target, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      },
    });
  }

  /* ---------- footer ---------- */
  gsap.from('.footer > *', {
    y: 24,
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '.footer', start: 'top 96%' },
  });

  return () => {
    marqueeTweens.length = 0;
  };
});

/* ============================================================
   SCHERMO: le quattro mosse compaiono come fogli (solo desktop)
   ============================================================ */
mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
  const schermo = document.getElementById('schermo');
  if (!schermo) return;
  schermo.classList.add('is-scroll');
  const tutti = gsap.utils.toArray('.foglio');
  /* in modalità scroll la rotazione la gestisce GSAP (transform), non il CSS */
  tutti.forEach((f) => (f.style.rotate = '0deg'));
  const finale = tutti.find((f) => f.classList.contains('foglio--finale'));
  const fogli = tutti.filter((f) => f !== finale);
  const rotOf = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--rot')) || 0;

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.schermo', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
  });
  tl.fromTo(fogli,
      { autoAlpha: 0, scale: 0.5, y: 70, rotation: (i) => (i % 2 ? 16 : -16) },
      {
        autoAlpha: 1, scale: 1, y: 0,
        rotation: (i) => rotOf(fogli[i]),
        stagger: 0.14, duration: 0.18, ease: 'back.out(1.6)',
      }, 0.08);
  if (finale) {
    tl.fromTo(finale,
      { autoAlpha: 0, scale: 0.3, y: 40, rotation: -28 },
      { autoAlpha: 1, scale: 1, y: 0, rotation: rotOf(finale), duration: 0.24, ease: 'back.out(2.2)' },
      '+=0.08');
  }
  tl.to({}, { duration: 0.3 });

  return () => {
    schermo.classList.remove('is-scroll');
    fogli.forEach((f) => (f.style.rotate = ''));
  };
});

/* ============================================================
   REDUCED MOTION: tutto fermo, tutto visibile
   ============================================================ */
mm.add('(prefers-reduced-motion: reduce)', () => {
  const pre = document.getElementById('preloader');
  if (pre) pre.style.display = 'none';
  gsap.set('.header, .hero-sticker, .hero-eyes, .hero-badge', { clearProps: 'all' });
  const typeTarget = document.getElementById('typeTarget');
  if (typeTarget) typeTarget.textContent = 'Il prossimo botto è il tuo sito.';
  document.querySelectorAll('.stk').forEach((s) => {
    s.style.transform = `rotate(${s.dataset.rot || 0}deg)`;
  });
});
