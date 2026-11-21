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

  // Projects carousel
  var track = document.getElementById('work-track');
  var cards = track.querySelectorAll('.pcard');
  var count = document.getElementById('work-count');
  var prev = document.getElementById('work-prev');
  var next = document.getElementById('work-next');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function step() { return cards[0].getBoundingClientRect().width + 20; }
  function update() {
    var i = Math.round(track.scrollLeft / step());
    count.textContent = '[ ' + pad(Math.min(i + 1, cards.length)) + '/' + pad(cards.length) + ' ]';
    prev.disabled = track.scrollLeft < 5;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

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
