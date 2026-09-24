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
  const hot = 'a, button, .pill, .stk, .roster-row, .hero-badge, .attrezzo, input, textarea';
  gsap.set(g, { transformOrigin: '33% 24%' });
  const xTo = gsap.quickTo(g, 'x', { duration: reduce ? 0 : 0.11, ease: 'power3' });
  const yTo = gsap.quickTo(g, 'y', { duration: reduce ? 0 : 0.11, ease: 'power3' });
  const rTo = gsap.quickTo(g, 'rotation', { duration: 0.35, ease: 'power2' });
  let lastX = null;
  let shown = false;
  let hoverScale = 1;

  /* pointer event, non mouse: durante un drag GSAP Draggable fa preventDefault sul pointerdown
     e il browser sopprime i mousemove, il guanto resterebbe fermo */
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
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

  document.addEventListener('pointerleave', () => {
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

  window.addEventListener('pointerdown', (e) => {
    if (reduce || (e.pointerType && e.pointerType !== 'mouse')) return;
    gsap.to(g, { scaleX: hoverScale * 1.08, scaleY: hoverScale * 0.8, duration: 0.1, overwrite: 'auto' });
  });
  window.addEventListener('pointerup', (e) => {
    if (reduce || (e.pointerType && e.pointerType !== 'mouse')) return;
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

/* ancore: corsa calma, durata in base alla distanza, curva in-out che parte piano e frena dolce */
const riduciMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const corsaCalma = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function vaiA(target) {
  const destinazione = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
  const distanza = Math.abs(destinazione - window.scrollY);
  const durata = gsap.utils.clamp(1.6, 3.2, 1.2 + distanza / 1800);
  lenis.scrollTo(target, { offset: target === 0 ? 0 : -70, duration: durata, easing: corsaCalma, immediate: riduciMovimento });
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); vaiA(0); return; }
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    vaiA(target);
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
      .to('.hero-badge', { autoAlpha: 1, duration: 0.5, ease: 'power1.out', onComplete: abilitaLettere }, 'boom+=1.3');
  });

  /* ---------- lettere dell'hero: salto e onda al passaggio del mouse ---------- */
  const PALETTE_LETTERE = ['#CEFF00', '#FF3EBA', '#4A60FF', '#0099FF', '#31A362'];
  let lettereAttive = false;
  function abilitaLettere() {
    if (lettereAttive || !isFinePointer) return;
    lettereAttive = true;
    gsap.set('.hero-line', { overflow: 'visible' });
    splitHero.forEach((split) => {
      const chars = split.chars;
      gsap.set(chars, { transformOrigin: '50% 100%' });
      chars.forEach((ch, i) => {
        ch.addEventListener('pointerenter', (e) => {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          gsap.timeline({ defaults: { overwrite: 'auto' } })
            .to(ch, { yPercent: -18, scaleX: 1.1, scaleY: 0.88, rotation: gsap.utils.random(-12, 12), color: gsap.utils.random(PALETTE_LETTERE), duration: 0.16, ease: 'power2.out' })
            .to(ch, { yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 1.0, ease: 'elastic.out(1, 0.32)' })
            .to(ch, { color: '#F7F6EB', duration: 0.7, ease: 'power1.out' }, '-=0.85');
          [[i - 1, 1], [i + 1, 1], [i - 2, 2], [i + 2, 2]].forEach(([j, d]) => {
            const vicina = chars[j];
            if (!vicina) return;
            gsap.timeline({ delay: d * 0.05, defaults: { overwrite: 'auto' } })
              .to(vicina, { yPercent: d === 1 ? -8 : -3, duration: 0.16, ease: 'power2.out' })
              .to(vicina, { yPercent: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
          });
        });
      });
    });
  }

  /* freccia che saltella verso il basso */
  gsap.to('.hero-badge svg', { y: 16, duration: 0.6, ease: 'power1.inOut', yoyo: true, repeat: -1 });

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
  /* senza mouse (telefoni): le pupille guardano in giro da sole, ogni tanto tornano al centro */
  if (eyes && !isFinePointer) {
    let heroInVista = true;
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: (self) => { heroInVista = self.isActive; } });
    const sguardo = () => {
      if (heroInVista) {
        const centro = Math.random() < 0.25;
        gsap.to('.hero-eyes .pupil', {
          x: centro ? 0 : gsap.utils.random(-14, 14),
          y: centro ? 0 : gsap.utils.random(-10, 6),
          duration: 0.22, ease: 'power2.out', overwrite: 'auto',
        });
      }
      gsap.delayedCall(gsap.utils.random(1.2, 3), sguardo);
    };
    gsap.delayedCall(2.5, sguardo);
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
  document.querySelectorAll('.sticker-progetti, .sticker-servizi, .sticker-metodo').forEach((s) => {
    const finalRot = s.classList.contains('sticker-progetti') ? 12 : s.classList.contains('sticker-metodo') ? 8 : -10;
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

  /* ---------- numeri dell'intro: schiaffo in entrata e conteggio ---------- */
  const stats = gsap.utils.toArray('.stat');
  if (stats.length) {
    /* GSAP azzera le proprieta' CSS rotate/scale quando gestisce il transform:
       la rotazione da adesivo (--rot) e l'hover li fa GSAP stesso */
    const rotStat = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--rot')) || 0;
    gsap.set(stats, { transformOrigin: '50% 60%', rotation: (i, el) => rotStat(el) });
    if (isFinePointer) {
      stats.forEach((s) => {
        s.addEventListener('pointerenter', () => gsap.to(s, { rotation: 0, scale: 1.04, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' }));
        s.addEventListener('pointerleave', () => gsap.to(s, { rotation: rotStat(s), scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }));
      });
    }
    ScrollTrigger.create({
      trigger: '.stats',
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.from(stats, {
          scale: 0, autoAlpha: 0,
          rotation: (i, el) => rotStat(el) + (i % 2 ? 28 : -28),
          duration: 0.6, ease: 'back.out(1.8)', stagger: 0.09,
        });
        stats.forEach((s, i) => {
          const num = s.querySelector('.stat__num');
          if (num.dataset.count == null) {
            gsap.from(num, { scale: 0.3, rotation: -90, duration: 0.9, ease: 'elastic.out(1, 0.45)', delay: 0.45 + i * 0.09 });
            return;
          }
          const fine = parseInt(num.dataset.count, 10);
          const suff = num.dataset.suffix || '';
          const o = { n: 0 };
          num.textContent = '0' + suff;
          gsap.to(o, {
            n: fine, duration: 1.3, delay: 0.3 + i * 0.09, ease: 'power2.out', snap: 'n',
            onUpdate: () => (num.textContent = Math.round(o.n) + suff),
          });
        });
      },
    });
  }

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
      { y: 30 * speed },
      {
        y: -30 * speed,
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

  /* ---------- contatti: macchina da scrivere in ciclo ---------- */
  const typeTarget = document.getElementById('typeTarget');
  const cursor = document.getElementById('typeCursor');
  const FRASI = [
    'Il prossimo botto è il tuo sito.',
    'Niente template, promesso.',
    'Facciamo il botto insieme?',
    'Un sito che si fa ricordare.',
    'Scrivimi, rispondo io.',
    'Animazioni dappertutto.',
    'Fatto a mano, a Brescia.',
    'Zero fotocopie, solo botti.',
    'Il tuo sito merita di più.',
    'Partiamo da un foglio nero.',
  ];
  const lampeggio = gsap.to(cursor, { opacity: 0, duration: 0.55, ease: 'steps(1)', repeat: -1, yoyo: true, paused: true });
  const cursoreFisso = () => { lampeggio.pause(); gsap.set(cursor, { opacity: 1 }); };
  const cursoreLampeggia = () => lampeggio.play();
  cursoreLampeggia();

  let visibile = false;
  let partita = false;
  let sacchetto = [];
  let ultima = -1;
  const pesca = () => {
    if (!sacchetto.length) sacchetto = FRASI.map((_, i) => i).filter((i) => i !== ultima);
    const k = Math.floor(Math.random() * sacchetto.length);
    ultima = sacchetto.splice(k, 1)[0];
    return FRASI[ultima];
  };
  const attendi = (s) => new Promise((ok) => gsap.delayedCall(s, ok));
  const finoAVisibile = async () => { while (!visibile) await attendi(0.4); };

  const scrivi = (testo) => new Promise((ok) => {
    cursoreFisso();
    const tl = gsap.timeline({ onComplete: ok });
    for (let i = 1; i <= testo.length; i++) {
      tl.call(() => (typeTarget.textContent = testo.slice(0, i)), null, i * 0.045);
    }
  });
  const cancella = () => new Promise((ok) => {
    cursoreFisso();
    const testo = typeTarget.textContent;
    const tl = gsap.timeline({ onComplete: ok });
    for (let i = testo.length - 1; i >= 0; i--) {
      tl.call(() => (typeTarget.textContent = testo.slice(0, i)), null, (testo.length - i) * 0.026);
    }
  });

  /* il testo statico nell'HTML serve ai crawler: con il motion attivo parte vuoto e viene scritto */
  typeTarget.textContent = '';
  const ciclo = async () => {
    ultima = 0;
    await scrivi(FRASI[0]);
    for (;;) {
      cursoreLampeggia();
      await attendi(3.6);
      await finoAVisibile();
      await cancella();
      await attendi(0.35);
      await finoAVisibile();
      await scrivi(pesca());
    }
  };

  ScrollTrigger.create({
    trigger: '.contact-card',
    start: 'top 80%',
    end: 'bottom top',
    onToggle: (self) => {
      visibile = self.isActive;
      if (visibile && !partita) { partita = true; ciclo(); }
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
  /* trascinabili anche col dito (richiesta di Lucas): Draggable gestisce mouse e touch */
  {
    Draggable.create(stickers, {
      type: 'x,y',
      bounds: '.contact-card',
      inertia: true,
      edgeResistance: 0.75,
      allowContextMenu: true,
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
   METODO: le quattro carte si impilano, ogni scena si disegna
   quando la sua carta arriva, gli attrezzi cadono con la fisica
   ============================================================ */
function nascondiTratti(els) {
  els.forEach((el) => {
    const L = el.getTotalLength() + 2;
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = `${L}`;
  });
}

function scenaParla(svg, idle) {
  const a = svg.querySelector('.fumetto--a');
  const b = svg.querySelector('.fumetto--b');
  const linee = [...svg.querySelectorAll('.sc-linee path')];
  nascondiTratti(linee);
  gsap.set(a, { scale: 0.3, autoAlpha: 0, svgOrigin: '72 178' });
  gsap.set(b, { scale: 0.3, autoAlpha: 0, svgOrigin: '350 306' });
  return gsap.timeline({ paused: true })
    .to(a, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.4)' })
    .to(b, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.4)' }, '+=0.3')
    .to(linee, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out', stagger: 0.07 }, '-=0.15')
    .add(() => {
      idle.push(gsap.to(a, { y: -7, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      idle.push(gsap.to(b, { y: 7, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
}

function scenaDisegna(svg, idle) {
  const pezzi = [...svg.querySelectorAll('.disegno')];
  const pieni = svg.querySelectorAll('.disegno--pieno');
  const matita = svg.querySelector('.matita');
  nascondiTratti(pezzi);
  gsap.set(pieni, { fillOpacity: 0 });
  gsap.set(matita, { x: 300, y: 262, autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true });
  tl.to(matita, { x: 52, y: 26, autoAlpha: 1, duration: 0.45, ease: 'power2.out' });
  pezzi.forEach((p) => {
    const d = parseFloat(p.dataset.durata) || 0.36;
    const giro = p.dataset.giro.split(';').map((c) => c.split(',').map(Number));
    tl.to(p, { strokeDashoffset: 0, duration: d, ease: 'none' });
    const mano = gsap.timeline();
    giro.forEach(([x, y]) => mano.to(matita, { x, y, duration: d / giro.length, ease: 'none' }));
    tl.add(mano, '<');
  });
  tl.to(pieni, { fillOpacity: 1, duration: 0.4, stagger: 0.08 }, '-=0.1')
    .to(matita, { x: 300, y: 262, duration: 0.55, ease: 'back.out(1.8)' }, '<')
    .add(() => idle.push(gsap.to(matita, { y: 252, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
  return tl;
}

function scenaCostruisce(svg, idle) {
  const editor = svg.querySelector('.editor');
  const righe = svg.querySelectorAll('.riga');
  const caret = svg.querySelector('.caret');
  const adesivo = svg.querySelector('.adesivo-codice');
  gsap.set(editor, { scale: 0.86, autoAlpha: 0, transformOrigin: '50% 50%' });
  gsap.set(righe, { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set(caret, { autoAlpha: 0 });
  gsap.set(adesivo, { scale: 1.7, autoAlpha: 0, rotation: -28, transformOrigin: '50% 50%' });
  return gsap.timeline({ paused: true })
    .to(editor, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' })
    .to(righe, { scaleX: 1, duration: 0.26, ease: 'power2.out', stagger: 0.09 }, '+=0.1')
    .set(caret, { autoAlpha: 1 })
    .to(adesivo, { scale: 1, autoAlpha: 1, rotation: 10, duration: 0.55, ease: 'back.out(2.2)' }, '-=0.05')
    .add(() => {
      idle.push(gsap.to(caret, { opacity: 0, duration: 0.5, ease: 'steps(1)', repeat: -1, yoyo: true }));
      idle.push(gsap.to(adesivo, { rotation: 4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
}

function scenaOnline(svg, idle) {
  const stella = svg.querySelector('.stella');
  const strati = svg.querySelectorAll('.stella polygon');
  const raggi = [...svg.querySelectorAll('.raggio')];
  const nastro = svg.querySelector('.nastro');
  nascondiTratti(raggi);
  gsap.set(strati, { scale: 0.2, autoAlpha: 0, svgOrigin: '200 152' });
  gsap.set(nastro, { scale: 1.8, autoAlpha: 0, rotation: -26, transformOrigin: '50% 50%' });
  return gsap.timeline({ paused: true })
    .to(strati, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.07 })
    .to(raggi, { strokeDashoffset: 0, duration: 0.35, ease: 'expo.out', stagger: 0.03 }, '-=0.25')
    .to(nastro, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.5, ease: 'back.out(2.2)' }, '-=0.2')
    .add(() => idle.push(gsap.to(stella, { rotation: '+=360', svgOrigin: '200 152', duration: 28, ease: 'none', repeat: -1 })));
}

function cassettaFisica() {
  const box = document.getElementById('cassetta');
  if (!box || !window.Matter) return () => {};
  const { Engine, Bodies, Body, Composite, Constraint, Vector } = Matter;
  box.classList.add('is-fisica');
  box.closest('.cassetta')?.classList.add('is-viva');
  const engine = Engine.create();
  engine.gravity.y = 1.05;
  const SP = 200;
  let W = box.clientWidth;
  let H = box.clientHeight;
  let muri = [];
  const costruisciMuri = () => {
    if (muri.length) Composite.remove(engine.world, muri);
    W = box.clientWidth;
    H = box.clientHeight;
    muri = [
      Bodies.rectangle(W / 2, H + SP / 2, W + SP * 2, SP, { isStatic: true }),
      Bodies.rectangle(-SP / 2, -H / 2, SP, H * 4, { isStatic: true }),
      Bodies.rectangle(W + SP / 2, -H / 2, SP, H * 4, { isStatic: true }),
      Bodies.rectangle(W / 2, -H * 1.5 - SP / 2, W + SP * 2, SP, { isStatic: true }),
    ];
    Composite.add(engine.world, muri);
  };
  costruisciMuri();

  const pezzi = [...box.querySelectorAll('.attrezzo')].map((el) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const body = Bodies.rectangle(W / 2, -600, w, h, {
      chamfer: { radius: h / 2 - 1 }, restitution: 0.28, friction: 0.45, frictionAir: 0.012, density: 0.002,
    });
    /* piu' inerzia alla rotazione: si inclinano ma si capovolgono di rado, restano leggibili */
    Body.setInertia(body, body.inertia * 2.5);
    return { el, w, h, body, dentro: false };
  });

  const disegna = () => {
    for (const p of pezzi) {
      if (!p.dentro) continue;
      const { x, y } = p.body.position;
      p.el.style.transform = `translate3d(${(x - p.w / 2).toFixed(1)}px, ${(y - p.h / 2).toFixed(1)}px, 0) rotate(${p.body.angle.toFixed(3)}rad)`;
    }
  };
  let attiva = false;
  let viva = true;
  const passo = (t, dt) => {
    if (!attiva) return;
    Engine.update(engine, Math.min(dt, 1000 / 60));
    disegna();
  };
  gsap.ticker.add(passo);

  const lancia = () => {
    pezzi.forEach((p, i) => gsap.delayedCall(i * 0.09, () => {
      if (!viva) return;
      const minX = p.w / 2 + 6;
      Body.setPosition(p.body, { x: gsap.utils.random(minX, Math.max(minX, W - p.w / 2 - 6)), y: -p.h - gsap.utils.random(10, 240) });
      Body.setAngle(p.body, gsap.utils.random(-0.3, 0.3));
      Body.setVelocity(p.body, { x: gsap.utils.random(-1.5, 1.5), y: 2 });
      Body.setAngularVelocity(p.body, gsap.utils.random(-0.02, 0.02));
      Composite.add(engine.world, p.body);
      p.dentro = true;
      p.el.style.visibility = 'visible';
    }));
  };
  const stVista = ScrollTrigger.create({ trigger: box, start: 'top bottom', end: 'bottom top', onToggle: (s) => { attiva = s.isActive; } });
  const stVia = ScrollTrigger.create({ trigger: box, start: 'top 72%', once: true, onEnter: lancia });

  /* presa col puntatore (mouse o dito): un vincolo elastico tra il punto e la pillola */
  const nelBox = (e) => {
    const r = box.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  let presa = null;
  pezzi.forEach((p) => {
    p.el.addEventListener('pointerdown', (e) => {
      if (!viva || !p.dentro || presa) return;
      e.preventDefault();
      try { p.el.setPointerCapture(e.pointerId); } catch (_) { /* niente */ }
      const punto = nelBox(e);
      const vincolo = Constraint.create({
        pointA: punto, bodyB: p.body, pointB: Vector.sub(punto, p.body.position), stiffness: 0.2, damping: 0.08, length: 0,
      });
      Composite.add(engine.world, vincolo);
      presa = { p, vincolo, id: e.pointerId };
      p.el.classList.add('is-presa');
    });
    p.el.addEventListener('pointermove', (e) => {
      if (presa && presa.p === p && presa.id === e.pointerId) presa.vincolo.pointA = nelBox(e);
    });
    const lascia = () => {
      if (!presa || presa.p !== p) return;
      Composite.remove(engine.world, presa.vincolo);
      presa = null;
      p.el.classList.remove('is-presa');
    };
    p.el.addEventListener('pointerup', lascia);
    p.el.addEventListener('pointercancel', lascia);
    p.el.addEventListener('lostpointercapture', lascia);
  });

  let attesa;
  const rimetti = () => {
    costruisciMuri();
    pezzi.forEach((p) => {
      if (!p.dentro) return;
      const x = gsap.utils.clamp(p.w / 2, Math.max(p.w / 2, W - p.w / 2), p.body.position.x);
      Body.setPosition(p.body, { x, y: Math.min(p.body.position.y, H - p.h / 2) });
      Body.setVelocity(p.body, { x: 0, y: 0 });
    });
  };
  const ridimensiona = () => { clearTimeout(attesa); attesa = setTimeout(rimetti, 150); };
  window.addEventListener('resize', ridimensiona);

  return () => {
    viva = false;
    gsap.ticker.remove(passo);
    stVista.kill();
    stVia.kill();
    window.removeEventListener('resize', ridimensiona);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    box.classList.remove('is-fisica');
    box.closest('.cassetta')?.classList.remove('is-viva');
    pezzi.forEach((p) => { p.el.style.transform = ''; p.el.style.visibility = ''; });
  };
}

/* su telefono la carta occupa tutta la larghezza: lo sticker scherzoso va dopo la pila, non sopra */
mm.add('(max-width: 900px)', () => {
  const mossa = document.querySelector('.mossa-segreta');
  const passi = document.querySelector('.passi');
  if (!mossa || !passi) return undefined;
  const casa = mossa.parentElement;
  passi.after(mossa);
  return () => casa.append(mossa);
});

mm.add('(prefers-reduced-motion: no-preference)', () => {
  const sezione = document.querySelector('.metodo');
  if (!sezione) return undefined;
  const passi = gsap.utils.toArray('.passo');
  const ancore = gsap.utils.toArray('.passo__ancora');
  const idle = [];
  const scene = { parla: scenaParla, disegna: scenaDisegna, costruisce: scenaCostruisce, online: scenaOnline };
  const topDi = (el) => parseFloat(getComputedStyle(el).top) || 0;

  passi.forEach((passo, i) => {
    const svg = passo.querySelector('.scena');
    const tl = svg && scene[svg.dataset.scena] ? scene[svg.dataset.scena](svg, idle) : null;
    ScrollTrigger.create({ trigger: ancore[i], start: 'top 72%', once: true, onEnter: () => tl && tl.play() });

    gsap.from(passo.querySelector('.passo__nome'), {
      yPercent: 30, autoAlpha: 0, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: ancore[i], start: 'top 72%', once: true },
    });
    gsap.from(passo.querySelectorAll('.passo__cosa li'), {
      y: 18, autoAlpha: 0, rotation: gsap.utils.wrap([-6, 5, -3]), duration: 0.5, ease: 'back.out(2)', stagger: 0.07,
      scrollTrigger: { trigger: ancore[i], start: 'top 55%', once: true },
    });

    /* quando arriva la carta dopo, questa si fa piccola, si storce appena e va in ombra */
    const dopo = passi[i + 1];
    if (!dopo) return;
    const corsa = () => ({
      trigger: ancore[i + 1], start: 'top bottom', end: () => `top ${topDi(dopo)}px`, scrub: true, invalidateOnRefresh: true,
    });
    gsap.to(passo, { scale: 0.93, rotation: i % 2 ? 1.4 : -1.4, ease: 'none', scrollTrigger: corsa() });
    gsap.to(passo.querySelector('.passo__velo'), { opacity: 0.38, ease: 'none', scrollTrigger: corsa() });
  });

  const mossa = sezione.querySelector('.mossa-segreta');
  if (mossa) {
    gsap.fromTo(mossa,
      { scale: 1.8, autoAlpha: 0, rotation: -18 },
      { scale: 1, autoAlpha: 1, rotation: 4, duration: 0.55, ease: 'back.out(2)',
        scrollTrigger: { trigger: mossa, start: 'top 92%', toggleActions: 'play none none reverse' } });
  }

  /* le animazioni di contorno girano solo quando la sezione e' a schermo */
  ScrollTrigger.create({
    trigger: sezione, start: 'top bottom', end: 'bottom top',
    onToggle: (s) => idle.forEach((t) => (s.isActive ? t.resume() : t.pause())),
  });

  let smontaCassetta = () => {};
  let smontata = false;
  document.fonts.ready.then(() => { if (!smontata) smontaCassetta = cassettaFisica(); });
  return () => {
    smontata = true;
    smontaCassetta();
    idle.forEach((t) => t.kill());
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
