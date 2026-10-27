/* ============================================================================
   Happy Tihar — script.js
   Vanilla JavaScript only. Everything runs offline from index.html.
   Sections:
     1. Helpers & motion preference
     2. Night-sky stars
     3. Name personalisation
     4. Scroll reveals
     5. Kag Tihar — feeding the crows
     6. Kukur Tihar — garlanding the dog
     7. Laxmi Puja — lighting the diyos
     8. Bhai Tika — the seven-colour blessing
     9. The final wish + petal burst
    10. River of lights
   ========================================================================== */

(() => {
  'use strict';

  /* -------------------------------------------------------------------------
     1. Helpers & motion preference
     ---------------------------------------------------------------------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  /* -------------------------------------------------------------------------
     2. Night-sky stars (generated so the HTML stays clean)
     ---------------------------------------------------------------------- */
  const starsContainer = $('#stars');
  if (starsContainer) {
    const fragment = document.createDocumentFragment();
    const starCount = window.innerWidth < 640 ? 45 : 90;

    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement('span');
      const size = Math.random() < 0.85 ? 1 : 2;

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--dur', `${3 + Math.random() * 5}s`);
      star.style.setProperty('--delay', `${Math.random() * 6}s`);

      fragment.appendChild(star);
    }
    starsContainer.appendChild(fragment);
  }

  /* -------------------------------------------------------------------------
     3. Name personalisation
     ---------------------------------------------------------------------- */
  const nameInput = $('#nameInput');
  const nameTargets = $$('[data-name]');
  const FALLBACK_NAME = 'friend';

  function currentName() {
    const typed = nameInput ? nameInput.value.trim() : '';
    return typed || FALLBACK_NAME;
  }

  function syncName() {
    const name = currentName();
    nameTargets.forEach((element) => {
      element.textContent = name;
    });
    renderWish(false);
  }

  /* -------------------------------------------------------------------------
     9a. Wish state (defined before the name handler uses it)
     ---------------------------------------------------------------------- */
  const wishText = $('#wishText');
  const sendWishButton = $('#sendWish');
  const wishHint = $('.wish-hint');

  const DEFAULT_WISH =
    'May this Tihar leave a lamp burning in every corner you call home — and may you always find your way back to it.';

  const blessings = [
    'May your home always hold one more chair than guests — and one more lamp than worries.',
    'May the year ahead be gentle with your heart and generous with your laughter.',
    'May every door you knock on open, and every door you close feel like home.',
    'May Laxmi bring you enough: enough rest, enough courage, enough reasons to celebrate.',
    'May your people stay close, your worries grow small, and your diyos never run out of oil.',
    'May the road ahead be lit brighter than the road behind, {name}.',
    'May your kindness come back to you tenfold, wrapped in marigold.',
    'May you be the reason someone lights a lamp tonight — and someone be the reason you smile tomorrow.',
    'May the coming year bring you the kind of luck that looks a lot like hard work, rewarded.',
    'Wishing you a Tihar full of warm hands, full plates, and a heart that feels at home.',
    'May every corner of your life be bright enough to find your way, and soft enough to rest.',
    'May you never run out of reasons to come home — and may home never run out of reasons to welcome you.'
  ];

  let currentWish = DEFAULT_WISH;
  let lastBlessingIndex = -1;

  function renderWish(animate) {
    if (!wishText) return;

    wishText.textContent = currentWish.replace(/\{name\}/g, currentName());

    if (animate) {
      wishText.classList.remove('pop');
      void wishText.offsetWidth; // force a reflow so the animation can restart
      wishText.classList.add('pop');
    }
  }

  if (nameInput) {
    nameInput.addEventListener('input', syncName);
  }

  /* Initialise the personal greeting and the default wish. */
  syncName();

  /* -------------------------------------------------------------------------
     4. Scroll reveals
     ---------------------------------------------------------------------- */
  /* The "js" class switches on the reveal styles. If this script never runs,
     the story stays fully visible instead of being hidden. */
  document.documentElement.classList.add('js');

  const revealItems = $$('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in-view'));
  }

  /* -------------------------------------------------------------------------
     5. Kag Tihar — feeding the crows
     ---------------------------------------------------------------------- */
  const crows = $$('.crow');
  const crowLine = $('#crowLine');
  const crowCount = $('#crowCount');

  const crowLines = [
    'The first crow tilts its head — as if it already knew you would come.',
    'The second takes the grain gently. News of your kindness is already on its way.',
    'The third waits, then bows. Some messages are not spoken; they are carried.'
  ];

  const CROW_FINAL =
    'Kag Tihar is a reminder that even the smallest voice in the sky deserves to be fed — and heard.';

  let fedCrows = 0;

  crows.forEach((crow, index) => {
    crow.addEventListener('click', () => {
      if (crow.classList.contains('fed')) {
        if (fedCrows < crows.length && crowLine) {
          crowLine.textContent = 'This one has eaten. It stays anyway, for the company.';
        }
        return;
      }

      crow.classList.add('fed');
      crow.setAttribute('aria-pressed', 'true');
      crow.setAttribute('aria-label', `Crow ${index + 1}, fed`);
      fedCrows += 1;

      if (crowCount) {
        crowCount.textContent = `${fedCrows} / ${crows.length} fed`;
      }

      if (crowLine) {
        crowLine.textContent = crowLines[index] || crowLines[0];
      }

      if (fedCrows === crows.length && crowLine) {
        crowLine.textContent = CROW_FINAL;
        crowLine.classList.add('is-gold');
      }
    });
  });

  /* -------------------------------------------------------------------------
     6. Kukur Tihar — garlanding the dog
     ---------------------------------------------------------------------- */
  const dog = $('.dog');
  const dogLine = $('#dogLine');
  let dogBlessed = false;

  if (dog) {
    dog.addEventListener('click', () => {
      if (dogBlessed) {
        if (dogLine) {
          dogLine.textContent = 'Another pat. The tail answers before the dog does.';
          dogLine.classList.add('is-gold');
        }
        return;
      }

      dogBlessed = true;
      dog.classList.add('garlanded');
      dog.setAttribute('aria-pressed', 'true');
      dog.setAttribute('aria-label', 'Dog wearing a marigold garland and a tika');

      if (dogLine) {
        dogLine.textContent =
          'A garland around the neck. A tika on the brow. The dog wags once — which, in dog, means everything.';
        dogLine.classList.add('is-gold');
      }
    });
  }

  /* -------------------------------------------------------------------------
     7. Laxmi Puja — lighting the diyos
     ---------------------------------------------------------------------- */
  const lampStage = $('#lampStage');
  const lamps = $$('.lamp');
  const lampLine = $('#lampLine');
  const lampCount = $('#lampCount');

  const ALL_LAMPS_MESSAGE =
    'Five flames, one home. Where there is light, Laxmi is already inside — and abundance stops meaning money. It means enough: enough warmth, enough food, enough people who call you theirs.';

  function litLampTotal() {
    return lamps.filter((lamp) => lamp.classList.contains('lit')).length;
  }

  function refreshLampStage() {
    const lit = litLampTotal();
    const allLit = lit === lamps.length && lamps.length > 0;

    if (lampCount) {
      lampCount.textContent = `${lit} of ${lamps.length} lit`;
    }

    if (lampStage) {
      lampStage.classList.toggle('complete', allLit);
    }

    if (allLit && lampLine) {
      lampLine.textContent = ALL_LAMPS_MESSAGE;
      lampLine.classList.add('is-gold');
    } else if (lampLine) {
      lampLine.classList.remove('is-gold');
    }
  }

  lamps.forEach((lamp) => {
    if (!lamp.hasAttribute('aria-label')) {
      lamp.setAttribute('aria-label', `${lamp.dataset.word || 'Diyo'} diyo`);
    }

    lamp.addEventListener('click', () => {
      const isLit = lamp.classList.toggle('lit');
      lamp.setAttribute('aria-pressed', String(isLit));

      if (lampLine && isLit) {
        lampLine.textContent = lamp.dataset.line || 'A small flame joins the others.';
        lampLine.classList.remove('is-gold');
      } else if (lampLine) {
        const lit = litLampTotal();
        lampLine.textContent =
          lit === 0
            ? 'Five diyos wait in the dark. The mandala is holding its breath.'
            : `${lit} flame${lit === 1 ? '' : 's'} still burning. The house is not fully awake yet.`;
        lampLine.classList.remove('is-gold');
      }

      refreshLampStage();
    });
  });

  /* -------------------------------------------------------------------------
     8. Bhai Tika — the seven-colour blessing
     ---------------------------------------------------------------------- */
  const portrait = $('.portrait');
  const portraitHint = $('#portraitHint');
  const tikaLine = $('#tikaLine');
  let tikaGiven = false;

  if (portrait) {
    portrait.addEventListener('click', () => {
      if (tikaGiven) {
        if (tikaLine) {
          tikaLine.textContent = 'The tika stays. So does the promise.';
          tikaLine.classList.add('is-gold');
        }
        return;
      }

      tikaGiven = true;
      portrait.classList.add('tikaed');
      portrait.setAttribute('aria-pressed', 'true');
      portrait.setAttribute('aria-label', 'Portrait wearing the seven-colour tika, blessed');

      if (portraitHint) {
        portraitHint.textContent = 'blessed · seven colours';
      }

      if (tikaLine) {
        tikaLine.textContent =
          'Seven colours on the forehead. A thread at the wrist. A promise that outlasts the festival: you will not face the year alone.';
        tikaLine.classList.add('is-gold');
      }
    });
  }

  /* -------------------------------------------------------------------------
     9b. The final wish + petal / sparkle burst
     ---------------------------------------------------------------------- */
  const burstCanvas = $('#burstCanvas');
  const burstCtx = burstCanvas ? burstCanvas.getContext('2d') : null;
  const PETAL_COLORS = [
    '#f7a52b', '#ffc85c', '#e8c27a', '#d6455b',
    '#ff8f4d', '#fff3df', '#8fbf8f', '#e05a6b'
  ];

  let burstDpr = 1;
  let burstParticles = [];
  let burstRaf = 0;

  function resizeBurstCanvas() {
    if (!burstCanvas || !burstCtx) return;

    burstDpr = Math.min(window.devicePixelRatio || 1, 2);
    burstCanvas.width = Math.max(1, Math.floor(window.innerWidth * burstDpr));
    burstCanvas.height = Math.max(1, Math.floor(window.innerHeight * burstDpr));
    burstCtx.setTransform(burstDpr, 0, 0, burstDpr, 0, 0);
  }

  function makeParticle(x, y, options = {}) {
    const angle =
      options.angle !== undefined
        ? options.angle
        : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = options.speed !== undefined ? options.speed : 5 + Math.random() * 9;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: options.gravity !== undefined ? options.gravity : 0.14 + Math.random() * 0.08,
      drag: options.drag !== undefined ? options.drag : 0.988,
      life: 1,
      decay: options.decay !== undefined ? options.decay : 0.006 + Math.random() * 0.006,
      size: options.size !== undefined ? options.size : 4 + Math.random() * 7,
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.24,
      type: options.type || (Math.random() < 0.68 ? 'petal' : 'spark')
    };
  }

  function drawBurst() {
    if (!burstCtx) return;

    burstCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = burstParticles.length - 1; i >= 0; i -= 1) {
      const particle = burstParticles[i];

      particle.vx *= particle.drag;
      particle.vy = particle.vy * particle.drag + particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;
      particle.life -= particle.decay;

      if (particle.life <= 0 || particle.y > window.innerHeight + 80) {
        burstParticles.splice(i, 1);
        continue;
      }

      burstCtx.save();
      burstCtx.translate(particle.x, particle.y);
      burstCtx.rotate(particle.rotation);
      burstCtx.globalAlpha = Math.min(1, particle.life * 1.4);
      burstCtx.fillStyle = particle.color;

      if (particle.type === 'petal') {
        // A soft, pointed petal
        const s = particle.size;
        burstCtx.beginPath();
        burstCtx.moveTo(0, -s);
        burstCtx.bezierCurveTo(s * 0.9, -s * 0.25, s * 0.55, s, 0, s);
        burstCtx.bezierCurveTo(-s * 0.55, s, -s * 0.9, -s * 0.25, 0, -s);
        burstCtx.fill();
      } else {
        // A four-point sparkle
        burstCtx.beginPath();
        for (let point = 0; point < 8; point += 1) {
          const radius = point % 2 === 0 ? particle.size : particle.size * 0.28;
          const angle = (point * Math.PI) / 4;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (point === 0) burstCtx.moveTo(px, py);
          else burstCtx.lineTo(px, py);
        }
        burstCtx.closePath();
        burstCtx.fill();
      }

      burstCtx.restore();
    }

    if (burstParticles.length > 0) {
      burstRaf = requestAnimationFrame(drawBurst);
    } else {
      burstRaf = 0;
      burstCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function celebrate(source) {
    if (!burstCanvas || !burstCtx) return;

    resizeBurstCanvas();

    const rect = source.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const count = reduceMotion ? 28 : 120;

    for (let i = 0; i < count; i += 1) {
      const particle = makeParticle(
        originX + (Math.random() - 0.5) * 40,
        originY + (Math.random() - 0.5) * 14
      );

      if (reduceMotion) {
        particle.gravity = 0.02;
        particle.vx *= 0.4;
        particle.vy *= 0.4;
        particle.decay = 0.012;
      }

      burstParticles.push(particle);
    }

    // A gentle shower of petals from above, unless the visitor prefers less motion.
    if (!reduceMotion) {
      for (let i = 0; i < 45; i += 1) {
        const petal = makeParticle(
          Math.random() * window.innerWidth,
          -30 - Math.random() * 120,
          {
            angle: Math.PI / 2,
            speed: 0.6 + Math.random() * 1.4,
            gravity: 0.012,
            drag: 0.999,
            decay: 0.0025,
            size: 4 + Math.random() * 6
          }
        );
        petal.vx = (Math.random() - 0.5) * 1.2;
        burstParticles.push(petal);
      }
    }

    if (burstParticles.length > 450) {
      burstParticles.splice(0, burstParticles.length - 450);
    }

    if (!burstRaf) {
      burstRaf = requestAnimationFrame(drawBurst);
    }
  }

  function chooseBlessing() {
    if (blessings.length === 1) return blessings[0];

    let index = lastBlessingIndex;

    while (index === lastBlessingIndex) {
      index = Math.floor(Math.random() * blessings.length);
    }

    lastBlessingIndex = index;
    return blessings[index];
  }

  if (sendWishButton) {
    sendWishButton.addEventListener('click', () => {
      currentWish = chooseBlessing();
      renderWish(true);
      celebrate(sendWishButton);

      if (wishHint) {
        wishHint.textContent = 'Sent into the night. Tap again for another blessing.';
      }

      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    });
  }

  resizeBurstCanvas();
  window.addEventListener('resize', resizeBurstCanvas);

  /* -------------------------------------------------------------------------
     10. River of lights
     ---------------------------------------------------------------------- */
  const riverCanvas = $('#riverCanvas');
  const riverCaption = $('#riverCaption');
  const addLampButton = $('#addLamp');

  const riverWords = [
    'patience',
    'courage',
    'softness',
    'a safe return',
    'good health',
    'more laughter',
    'a kinder year',
    'enough',
    'a second chance',
    'someone to come home to',
    'quiet joy',
    'a full heart'
  ];

  let riverCtx = null;
  let riverWidth = 0;
  let riverHeight = 0;
  let riverDpr = 1;
  let riverLamps = [];
  let riverRipples = [];
  let riverRaf = 0;
  let riverLastTime = 0;
  let riverVisible = false;
  let lampSprite = null;

  /* A small pre-rendered diyo sprite keeps the animation cheap on phones. */
  function createLampSprite() {
    const size = 128;
    const sprite = document.createElement('canvas');
    sprite.width = size;
    sprite.height = size;

    const ctx = sprite.getContext('2d');
    const centre = size / 2;

    // Soft halo
    const glow = ctx.createRadialGradient(centre, centre, 4, centre, centre, 60);
    glow.addColorStop(0, 'rgba(255, 205, 110, 0.9)');
    glow.addColorStop(0.25, 'rgba(255, 165, 65, 0.35)');
    glow.addColorStop(1, 'rgba(255, 140, 40, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centre, centre, 60, 0, Math.PI * 2);
    ctx.fill();

    // Clay bowl seen from above
    ctx.fillStyle = '#8a3a22';
    ctx.beginPath();
    ctx.arc(centre, centre, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b4502f';
    ctx.beginPath();
    ctx.arc(centre, centre - 1, 19, 0, Math.PI * 2);
    ctx.fill();

    // Oil
    ctx.fillStyle = 'rgba(70, 26, 18, 0.9)';
    ctx.beginPath();
    ctx.arc(centre, centre - 1, 15, 0, Math.PI * 2);
    ctx.fill();

    // Flame
    ctx.save();
    ctx.translate(centre, centre - 2);
    ctx.shadowColor = 'rgba(255, 190, 80, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.ellipse(0, -10, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.ellipse(0, -9, 2.4, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return sprite;
  }

  function resizeRiver() {
    if (!riverCanvas || !riverCtx) return;

    const rect = riverCanvas.getBoundingClientRect();
    riverDpr = Math.min(window.devicePixelRatio || 1, 2);
    riverWidth = Math.max(1, Math.round(rect.width));
    riverHeight = Math.max(1, Math.round(rect.height));

    riverCanvas.width = Math.floor(riverWidth * riverDpr);
    riverCanvas.height = Math.floor(riverHeight * riverDpr);
    riverCtx.setTransform(riverDpr, 0, 0, riverDpr, 0, 0);

    riverLamps.forEach((lamp) => {
      lamp.x = Math.min(lamp.x, riverWidth - 24);
      lamp.y = Math.min(Math.max(lamp.y, 24), riverHeight - 24);
    });
  }

  function addRiverLamp(x, y, announce) {
    if (!riverCtx) return;

    const lampX = typeof x === 'number' ? x : riverWidth * (0.15 + Math.random() * 0.7);
    const lampY = typeof y === 'number' ? y : riverHeight * (0.2 + Math.random() * 0.6);
    const word = riverWords[(Math.random() * riverWords.length) | 0];

    riverLamps.push({
      x: lampX,
      y: lampY,
      scale: 0.5 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 4 + Math.random() * 8,
      tilt: (Math.random() - 0.5) * 0.4
    });

    if (riverLamps.length > 26) {
      riverLamps.shift();
    }

    riverRipples.push({ x: lampX, y: lampY, radius: 8, alpha: 0.55 });

    if (announce && riverCaption) {
      riverCaption.textContent = `You set adrift: ${word}.`;
    }

    if (reduceMotion) {
      drawRiver();
    }
  }

  function updateRiver(delta) {
    riverLamps.forEach((lamp) => {
      lamp.x += lamp.speed * delta;
      lamp.phase += delta * 1.2;

      if (lamp.x > riverWidth + 40) {
        lamp.x = -40;
        lamp.y = riverHeight * (0.15 + Math.random() * 0.7);
      }
    });

    for (let i = riverRipples.length - 1; i >= 0; i -= 1) {
      const ripple = riverRipples[i];
      ripple.radius += delta * 26;
      ripple.alpha -= delta * 0.35;

      if (ripple.alpha <= 0) {
        riverRipples.splice(i, 1);
      }
    }
  }

  function drawRiver() {
    if (!riverCtx || !lampSprite) return;

    riverCtx.clearRect(0, 0, riverWidth, riverHeight);

    // Faint current lines
    riverCtx.save();
    riverCtx.strokeStyle = 'rgba(255, 243, 223, 0.035)';
    riverCtx.lineWidth = 1;
    for (let i = 1; i < 7; i += 1) {
      const y = (riverHeight / 7) * i;
      riverCtx.beginPath();
      riverCtx.moveTo(0, y);
      riverCtx.bezierCurveTo(
        riverWidth * 0.3, y + 8,
        riverWidth * 0.7, y - 8,
        riverWidth, y
      );
      riverCtx.stroke();
    }
    riverCtx.restore();

    // Ripples
    riverRipples.forEach((ripple) => {
      riverCtx.beginPath();
      riverCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      riverCtx.strokeStyle = `rgba(255, 200, 100, ${Math.max(0, ripple.alpha)})`;
      riverCtx.lineWidth = 1.2;
      riverCtx.stroke();
    });

    // Floating diyos
    riverLamps.forEach((lamp) => {
      const bob = reduceMotion ? 0 : Math.sin(lamp.phase) * 2.2;
      const sway = reduceMotion ? 0 : Math.sin(lamp.phase * 0.7) * 0.06;
      const size = 128 * lamp.scale;

      riverCtx.save();
      riverCtx.translate(lamp.x, lamp.y + bob);
      riverCtx.rotate(lamp.tilt + sway);
      riverCtx.globalAlpha = 0.96;
      riverCtx.drawImage(lampSprite, -size / 2, -size / 2, size, size);
      riverCtx.restore();
    });
  }

  function riverLoop(time) {
    riverRaf = 0;

    if (!riverVisible) return;

    if (!reduceMotion) {
      const delta = Math.min((time - riverLastTime) / 1000 || 0.016, 0.05);
      riverLastTime = time;
      updateRiver(delta);
      drawRiver();
      riverRaf = requestAnimationFrame(riverLoop);
    } else {
      drawRiver();
    }
  }

  function startRiver() {
    if (!riverCtx || !riverVisible || riverRaf) return;

    riverLastTime = performance.now();
    riverRaf = requestAnimationFrame(riverLoop);
  }

  function stopRiver() {
    if (riverRaf) {
      cancelAnimationFrame(riverRaf);
      riverRaf = 0;
    }
  }

  if (riverCanvas) {
    riverCtx = riverCanvas.getContext('2d');

    if (riverCtx) {
      lampSprite = createLampSprite();
      resizeRiver();

      for (let i = 0; i < 5; i += 1) {
        addRiverLamp(
          riverWidth * (0.16 + i * 0.17),
          riverHeight * (0.28 + (i % 2) * 0.32),
          false
        );
      }
      drawRiver();

      if (riverCaption) {
        riverCaption.textContent = 'Each lamp carries a quiet wish.';
      }

      riverCanvas.addEventListener('pointerdown', (event) => {
        const rect = riverCanvas.getBoundingClientRect();
        addRiverLamp(event.clientX - rect.left, event.clientY - rect.top, true);
      });

      if (addLampButton) {
        addLampButton.addEventListener('click', () => {
          addRiverLamp(undefined, undefined, true);
        });
      }

      if ('IntersectionObserver' in window) {
        const riverObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              riverVisible = entry.isIntersecting;
              if (riverVisible) startRiver();
              else stopRiver();
            });
          },
          { threshold: 0.05 }
        );
        riverObserver.observe(riverCanvas);
      } else {
        riverVisible = true;
        startRiver();
      }

      window.addEventListener('resize', () => {
        resizeRiver();
        drawRiver();
      });
    }
  }
})();
