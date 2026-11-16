// ====== Interaksi website CV ======
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. Ganti tema terang/gelap ----------
  var themeBtn = document.getElementById('themeToggle');

  function updateThemeIcon() {
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = dark ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
  }
  updateThemeIcon();

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateThemeIcon();
  });

  // ---------- 2. Menu mobile ----------
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menuBtn');

  menuBtn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? '✕' : '☰';
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = '☰';
    });
  });

  // ---------- 3. Progres scroll + tombol ke atas ----------
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    toTop.classList.toggle('show', h.scrollTop > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // ---------- 4. Efek mengetik di bagian hero ----------
  var typed = document.getElementById('typed');
  // Ubah daftar ini sesuai keinginan kamu
  var roles = ['Software Engineer', 'AI Engineer', 'Data Analyst', 'UI/UX Designer'];

  if (!reduceMotion) {
    var r = 0, c = 0, deleting = false;
    (function tick() {
      var word = roles[r];
      typed.textContent = word.substring(0, c);
      var delay = deleting ? 45 : 95;

      if (!deleting && c === word.length) {
        deleting = true; delay = 1600;           // jeda setelah selesai mengetik
      } else if (deleting && c === 0) {
        deleting = false; r = (r + 1) % roles.length; delay = 350;
      } else {
        c += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    })();
  }

  // ---------- 5. Muncul perlahan saat di-scroll ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- 6. Menu aktif sesuai bagian yang sedang dilihat ----------
  var links = document.querySelectorAll('.nav nav a');
  var sections = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ link: a, section: s });
  });

  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          sections.forEach(function (x) {
            if (x.section === e.target) x.link.classList.add('active');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (x) { navObs.observe(x.section); });
  }

  // ---------- 7. Filter proyek ----------
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.getAttribute('data-filter');
      cards.forEach(function (card) {
        var kinds = (card.getAttribute('data-kind') || '').split(' ');
        card.classList.toggle('hide', f !== 'all' && kinds.indexOf(f) === -1);
      });
    });
  });

  // ---------- 8. Salin email + notifikasi kecil ----------
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  document.getElementById('copyEmail').addEventListener('click', function () {
    var email = this.getAttribute('data-email');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(
        function () { showToast('Email disalin ✓'); },
        function () { showToast(email); }
      );
    } else {
      showToast(email);
    }
  });

  // ---------- 9. Galeri sertifikat (klik untuk memperbesar) ----------
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');

  // Sembunyikan tombol "Verifikasi" / "GitHub" yang linknya belum diisi
  document.querySelectorAll('.verify, .links a').forEach(function (a) {
    if (a.getAttribute('href') === '#') a.style.display = 'none';
  });

  // Sembunyikan tombol "Unduh CV" kalau file PDF-nya belum ada
  var cvBtn = document.getElementById('cvDownload');
  if (cvBtn && window.fetch) {
    fetch(cvBtn.getAttribute('href'), { method: 'HEAD' })
      .then(function (r) { if (!r.ok) cvBtn.style.display = 'none'; })
      .catch(function () { cvBtn.style.display = 'none'; });
  }

  var lbFrame = document.getElementById('lbFrame');
  var lbOpen = document.getElementById('lbOpen');

  function openLightbox(thumb) {
    var img = thumb.querySelector('img');
    var hasImg = img && !thumb.classList.contains('empty');
    // data-full = berkas lengkap (boleh PDF); kalau tidak ada, pakai gambar thumbnail
    var full = thumb.getAttribute('data-full') || (hasImg ? img.getAttribute('src') : '');
    if (!full) {
      showToast('Berkas sertifikat belum ditambahkan');
      return;
    }
    var title = thumb.getAttribute('data-title') || (img ? img.alt : '');
    var isPdf = /\.pdf$/i.test(full);

    lbImg.style.display = isPdf ? 'none' : 'inline-block';
    lbFrame.style.display = isPdf ? 'block' : 'none';
    if (isPdf) {
      lbFrame.src = full;
      lbImg.removeAttribute('src');
    } else {
      lbImg.src = full;
      lbImg.alt = title;
      lbFrame.removeAttribute('src');
    }
    lbCaption.textContent = title;
    lbOpen.href = full;

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbFrame.removeAttribute('src');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.cert-thumb').forEach(function (t) {
    t.addEventListener('click', function () { openLightbox(t); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();   // klik area gelap = tutup
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();

// ---------- 11. Klik foto utama untuk ganti latar putih/merah ----------
(function () {
  var photo = document.getElementById('photo');
  if (!photo) return;
  var hint = document.querySelector('.photo-hint');

  function swap() {
    if (!photo.querySelector('.p2')) return;     // foto kedua tidak ada
    photo.classList.toggle('swap');
  }
  if (!photo.querySelector('.p2') && hint) hint.style.display = 'none';

  photo.addEventListener('click', swap);
  photo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(); }
  });
})();

// ---------- 10. Thumbnail otomatis dari halaman pertama PDF ----------
// Dipakai untuk kartu yang berkas gambarnya tidak ada tetapi PDF-nya ada.
(function () {
  var thumbs = document.querySelectorAll('.cert-thumb[data-full$=".pdf"]');
  if (!thumbs.length || !('IntersectionObserver' in window)) return;

  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var libPromise;

  function loadLib() {
    if (libPromise) return libPromise;
    libPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PDFJS + 'pdf.min.js';
      s.onload = function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function renderThumb(thumb) {
    if (thumb.querySelector('canvas')) return;
    loadLib()
      .then(function (pdfjs) { return pdfjs.getDocument(thumb.getAttribute('data-full')).promise; })
      .then(function (pdf) { return pdf.getPage(1); })
      .then(function (page) {
        var base = page.getViewport({ scale: 1 });
        var vp = page.getViewport({ scale: Math.min(2, 700 / base.width) });
        var canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
          .then(function () {
            thumb.insertBefore(canvas, thumb.firstChild);
            thumb.classList.remove('pdf', 'empty');
          });
      })
      .catch(function () { /* PDF tidak ditemukan: biarkan tulisan placeholder */ });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); renderThumb(e.target); }
    });
  }, { rootMargin: '200px' });

  thumbs.forEach(function (t) {
    var img = t.querySelector('img');
    if (!img) { io.observe(t); return; }              // kartu khusus PDF
    img.addEventListener('error', function () { io.observe(t); });   // gambar tidak ada
    if (img.complete && img.naturalWidth === 0) io.observe(t);
  });
})();