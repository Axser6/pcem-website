// PCEM: Prema Constructions & Earthmovers
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var WHATSAPP_NUMBER = '919666768099';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  // Smooth scrolling
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Hero video: pause when off screen or when the visitor prefers less motion
  var heroVideo = document.querySelector('video.hero-bg');
  if (heroVideo) {
    if (reduceMotion) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); } else heroVideo.pause(); });
      }).observe(heroVideo);
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && heroVideo.getBoundingClientRect().bottom > 0) {
          var p = heroVideo.play(); if (p && p.catch) p.catch(function () {});
        }
      });
    }
  }

  // Opening intro: PCEM mark revealed under glass, then the page
  (function () {
    var screen = document.getElementById('intro-screen');
    if (!root.classList.contains('intro-on') || !screen) { if (screen) screen.remove(); return; }
    if (lenis) lenis.stop();
    var LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1030 206">' +
      '<path fill="#d62a46" d="M0 50 L45 0 L165 0 L120 50 Z"/>' +
      '<g fill="#ffffff"><path d="M137 50 L185 0 L225 0 A70 70 0 0 1 225 140 L95 140 L70 206 L0 206 L32 135 L55 112 Q62 93 85 93 L215 93 A21.5 21.5 0 0 0 215 50 Z"/>' +
      '<path d="M370 0 H520 V50 H380 Q345 50 345 85 V121 Q345 156 380 156 H520 V206 H370 Q295 206 295 131 V75 Q295 0 370 0 Z"/>' +
      '<path d="M537 0 H740 V50 H587 V78 H740 V128 H587 V156 H740 V206 H537 Z"/>' +
      '<path d="M757 0 H807 L893 95 L980 0 H1030 V206 H980 V85 L893 175 L807 85 V206 H757 Z"/></g></svg>';
    var finished = false, reveal = null;
    function finish() {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('pcemIntroSeen', '1'); } catch (e) {}
      screen.classList.add('leaving');
      root.classList.remove('intro-on');           // page entrance animations start now
      if (lenis) lenis.start();
      setTimeout(function () { if (reveal) reveal.dispose(); screen.remove(); }, 950);
    }
    var safety = setTimeout(finish, 9000);
    reveal = window.GlassReveal && window.GlassReveal.mount(document.getElementById('intro-stage'), {
      logo: LOGO,
      look: 'dark',
      settings: {
        background: '#0f0d0c', plateColor: '#17120f', originalColors: true,
        tileSize: 360, logoScale: 0.84, finalScale: 1.1
      },
      onEnd: function () {
        screen.classList.add('named');
        setTimeout(finish, 1100);
        clearTimeout(safety);
      }
    });
    if (!reveal) { finish(); return; }
    screen.addEventListener('click', finish);
    document.addEventListener('keydown', function onKey() { finish(); document.removeEventListener('keydown', onKey); });
  })();

  // Header: transparent over the hero, cream after
  function onScroll() { header.classList.toggle('solid', window.scrollY > window.innerHeight * 0.75); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Gentle reveal on scroll (cards in a row arrive one after another)
  document.querySelectorAll('.svc-grid .reveal').forEach(function (el, i) {
    el.style.setProperty('--d', (i % 4) * 0.12 + 's');
  });
  // Anything that has reached (or been scrolled past) the lower part of the screen is shown
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var ticking = false;
  function reveal() {
    ticking = false;
    var limit = window.innerHeight * 0.9;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
      return true;
    });
    if (!pending.length) window.removeEventListener('scroll', onRevealScroll);
  }
  function onRevealScroll() { if (!ticking) { ticking = true; requestAnimationFrame(reveal); } }
  window.addEventListener('scroll', onRevealScroll, { passive: true });
  window.addEventListener('resize', onRevealScroll);
  reveal();

  // Project carousel: endless 3D ring of cards (transform-only, rAF while moving)
  (function () {
    var root_ = document.querySelector('.pc');
    if (!root_) return;
    var stage = root_.querySelector('.pc-stage');
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.pc-card'));
    var n = cards.length;
    if (!n) return;
    var barsWrap = root_.querySelector('.pc-bars');
    var live = root_.querySelector('.pc-live');
    var playBtn = root_.querySelector('.pc-play');
    var section = root_.closest('section') || root_;
    var AUTOPLAY = parseInt(root_.getAttribute('data-autoplay'), 10) || 4500;
    var titles = cards.map(function (c) { var t = c.querySelector('h3'); return t ? t.textContent.trim() : ''; });

    var target = 0, current = 0, raf = 0, last = 0;
    var cardW = 0, step = 0;
    var mod = function (a, m) { return ((a % m) + m) % m; };
    var ringDist = function (x) { return mod(x + n / 2, n) - n / 2; };
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

    // Pagination bars
    var bars = titles.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pc-bar';
      b.setAttribute('aria-label', 'Show ' + t);
      b.innerHTML = '<span class="pc-bar-track"><span class="pc-bar-fill"></span></span>';
      b.addEventListener('click', function () { goTo(i, true); });
      barsWrap.appendChild(b);
      return b.querySelector('.pc-bar-fill');
    });
    var barBtns = Array.prototype.slice.call(barsWrap.children);

    function measure() {
      cardW = cards[0].offsetWidth || 1;
      step = 0.9 * cardW;
    }

    var activeIdx = -1;
    function render() {
      var half = n / 2;
      for (var i = 0; i < n; i++) {
        var d = ringDist(i - current), a = Math.abs(d), m = Math.min(a, 1);
        var op = a <= 1 ? 1 - 0.42 * a : (half > 1 ? 0.58 * clamp(1 - (a - 1) / (half - 1), 0, 1) : 0);
        var s = cards[i].style;
        s.transform = 'translate(-50%,-50%) translate3d(' + (d * step).toFixed(2) + 'px,0,0) scale(' + (1 - 0.16 * m).toFixed(4) + ')';
        s.filter = m > 0.001 ? 'blur(' + (5 * m).toFixed(2) + 'px)' : 'none';
        s.opacity = op.toFixed(3);
        s.zIndex = String(100 - Math.round(a * 10));
        s.pointerEvents = op < 0.05 ? 'none' : '';
        bars[i].style.transform = 'scaleX(' + clamp(1 - Math.abs(ringDist(i - current)), 0, 1).toFixed(4) + ')';
      }
      var idx = mod(Math.round(current), n);
      if (idx !== activeIdx) {
        activeIdx = idx;
        cards.forEach(function (c, i) {
          var on = i === idx;
          c.classList.toggle('is-active', on);
          c.querySelectorAll('a').forEach(function (l) { l.tabIndex = on ? 0 : -1; });
        });
        barBtns.forEach(function (b, i) { if (i === idx) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      }
    }

    function tick(now) {
      raf = 0;
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (dragging) { current = target; }
      else {
        current += (target - current) * (1 - Math.exp(-9 * dt));
        if (Math.abs(target - current) < 0.0004) current = target;
      }
      render();
      if (current !== target || dragging) raf = requestAnimationFrame(tick);
    }
    function kick() {
      if (reduceMotion) { current = target; render(); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    function announce(user) {
      live.setAttribute('aria-live', user ? 'polite' : 'off');
      var idx = mod(Math.round(target), n);
      live.textContent = 'Showing ' + (idx + 1) + ' of ' + n + ': ' + titles[idx];
    }
    function setTarget(t, user) { target = t; kick(); announce(user); if (user) restartTimer(); }
    function move(dir, user) { setTarget(Math.round(target) + dir, user); }
    function goTo(i, user) {
      var base = Math.round(target);
      setTarget(base + ringDist(i - mod(base, n)), user);
    }

    root_.querySelector('.pc-prev').addEventListener('click', function () { move(-1, true); });
    root_.querySelector('.pc-next').addEventListener('click', function () { move(1, true); });

    // Keyboard on the stage
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1, true); }
    });
    // Focusing a card's link centres that card
    cards.forEach(function (c, i) {
      c.addEventListener('focusin', function () { if (mod(Math.round(target), n) !== i) goTo(i, true); });
    });

    // Drag / swipe (horizontal only; vertical intent is left to the page)
    var dragging = false, ptr = null, suppressClick = false;
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, t0: target, axis: null, samples: [{ x: e.clientX, t: e.timeStamp }], touch: e.pointerType !== 'mouse' };
      if (ptr.touch) { touching = true; updatePlay(); }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!ptr || e.pointerId !== ptr.id) return;
      var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
      if (!ptr.axis) {
        if (Math.hypot(dx, dy) < 6) return;
        ptr.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (ptr.axis === 'y') { endPointer(); return; }
        dragging = true;
        stage.classList.add('is-dragging');
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      }
      e.preventDefault();
      ptr.samples.push({ x: e.clientX, t: e.timeStamp });
      if (ptr.samples.length > 6) ptr.samples.shift();
      target = ptr.t0 - dx / step;
      kick();
    });
    function release(e) {
      if (!ptr || e.pointerId !== ptr.id) return;
      if (ptr.axis === 'x') {
        var dx = e.clientX - ptr.x;
        var s = ptr.samples, a = s[0], b = s[s.length - 1];
        var v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0;
        var base = Math.round(ptr.t0);
        if (Math.abs(v) > 0.35 || Math.abs(dx) > 0.2 * cardW) {
          var dir = (Math.abs(v) > 0.35 ? v : dx) < 0 ? 1 : -1;
          var t = Math.round(ptr.t0 - dx / step);
          if (t === base) t = base + dir;
          target = t;
        } else target = base;
        dragging = false;
        stage.classList.remove('is-dragging');
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        kick(); announce(true); restartTimer();
      }
      endPointer();
    }
    function endPointer() {
      if (ptr && ptr.touch) { touching = false; updatePlay(); }
      ptr = null;
      if (dragging) { dragging = false; stage.classList.remove('is-dragging'); target = Math.round(target); kick(); }
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', function (e) { if (ptr && e.pointerId === ptr.id) endPointer(); });
    // After a drag, swallow the click; clicking a side card centres it instead of following its link
    stage.addEventListener('click', function (e) {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
      var card = e.target.closest('.pc-card');
      if (!card) return;
      var i = cards.indexOf(card);
      if (i !== mod(Math.round(target), n)) { e.preventDefault(); e.stopPropagation(); goTo(i, true); }
    }, true);

    // Autoplay
    var hovered = false, focused = false, touching = false, visible = false, userPaused = false, timer = 0;
    function canPlay() { return !reduceMotion && !userPaused && !hovered && !focused && !touching && visible && !document.hidden; }
    function restartTimer() {
      clearTimeout(timer);
      if (canPlay()) timer = setTimeout(function () { move(1, false); restartTimer(); }, AUTOPLAY);
    }
    function updatePlay() { restartTimer(); }
    root_.addEventListener('mouseenter', function () { hovered = true; updatePlay(); });
    root_.addEventListener('mouseleave', function () { hovered = false; updatePlay(); });
    root_.addEventListener('focusin', function () { focused = true; updatePlay(); });
    root_.addEventListener('focusout', function (e) { if (!root_.contains(e.relatedTarget)) { focused = false; updatePlay(); } });
    document.addEventListener('visibilitychange', updatePlay);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].intersectionRatio >= 0.35; updatePlay(); },
        { threshold: [0, 0.35, 0.6, 1] }).observe(section);
    } else visible = true;
    playBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      playBtn.classList.toggle('is-paused', userPaused);
      playBtn.setAttribute('aria-label', userPaused ? 'Play automatic rotation' : 'Pause automatic rotation');
      updatePlay();
    });
    if (reduceMotion) { playBtn.hidden = true; }

    window.addEventListener('resize', function () { measure(); render(); });
    measure();
    render();
    announce(false);
  })();

  // Quote dialog
  var dlg = document.getElementById('quote');
  function openQuote() { setMenu(false); if (lenis) lenis.stop(); dlg.showModal(); }
  dlg.addEventListener('close', function () { if (lenis) lenis.start(); });
  document.querySelectorAll('.open-quote').forEach(function (b) { b.addEventListener('click', openQuote); });
  dlg.querySelector('.quote-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  var form = document.getElementById('quote-form');
  var note = form.querySelector('.form-note');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var phoneOk = phone.replace(/\D/g, '').length >= 10;
    form.name.classList.toggle('invalid', !name);
    form.phone.classList.toggle('invalid', !phoneOk);
    if (!name || !phoneOk) {
      note.textContent = 'Please enter your name and a valid phone number.';
      note.className = 'form-note err';
      return;
    }
    var lines = [
      'Quote request (website)',
      'Name: ' + name,
      'Organisation: ' + form.company.value.trim(),
      'Phone: ' + phone,
      'Email: ' + form.email.value.trim(),
      'Service: ' + form.service.value,
      'Location: ' + form.location.value.trim(),
      'Details: ' + form.message.value.trim()
    ];
    // TODO: send by email once the company email is set up
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    note.textContent = 'Thank you. Your request is ready in WhatsApp. Press send to submit it.';
    note.className = 'form-note ok';
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
