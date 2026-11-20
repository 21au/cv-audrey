// ====== Interaksi website CV ======
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Notifikasi kecil (toast) ----------
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  // ---------- 1. Ganti tema terang/gelap ----------
  var themeBtn = document.getElementById('themeToggle');

  function updateThemeIcon() {
    if (!themeBtn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = dark ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
  }
  updateThemeIcon();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateThemeIcon();
    });
  }

  // ---------- 2. Menu mobile ----------
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menuBtn');

  if (menu && menuBtn) {
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
  }

  // ---------- 3. Progres scroll + tombol ke atas ----------
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) {
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
    if (toTop) {
      toTop.classList.toggle('show', h.scrollTop > 600);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------- 4. Efek mengetik di bagian hero ----------
  var typed = document.getElementById('typed');
  // Ubah daftar ini sesuai keinginan kamu
  var roles = ['Software Engineer', 'AI Engineer', 'Data Analyst', 'UI/UX Designer'];

  if (typed && !reduceMotion) {
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
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- 6. Menu aktif sesuai bagian yang sedang dilihat ----------
  var links = document.querySelectorAll('.nav nav a');
  var sections = [];
  links.forEach(function (a) {
    var href = a.getAttribute('href');
    var s = href && href.startsWith('#') ? document.querySelector(href) : null;
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
  var toggleBtn = document.getElementById('toggleProjects');
  var LIMIT = 4;                       // jumlah proyek yang tampil sebelum "Lihat semua"
  var curFilter = 'all', expanded = false;

  function applyProjects() {
    var shown = 0, total = 0;
    cards.forEach(function (card) {
      var kinds = (card.getAttribute('data-kind') || '').split(' ');
      var match = curFilter === 'all' || kinds.indexOf(curFilter) !== -1;
      if (match) total++;
      var visible = match && (curFilter !== 'all' || expanded || shown < LIMIT);
      if (visible) shown++;
      card.classList.toggle('hide', !visible);
    });
    if (toggleBtn) {
      var needToggle = curFilter === 'all' && total > LIMIT;
      toggleBtn.style.display = needToggle ? '' : 'none';
      toggleBtn.textContent = expanded ? 'Tampilkan lebih sedikit' : 'Lihat semua proyek (' + total + ')';
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      curFilter = chip.getAttribute('data-filter');
      applyProjects();
    });
  });
  if (toggleBtn) toggleBtn.addEventListener('click', function () { expanded = !expanded; applyProjects(); });
  applyProjects();

  // ---------- 8. Salin email ----------
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = this.getAttribute('data-email');
      var textSpan = this.querySelector('.copy-text');
      var self = this;

      function onCopied() {
        showToast('Email disalin ✓');
        if (textSpan) textSpan.textContent = 'Tersalin ✓';
        self.classList.add('copied');
        setTimeout(function () {
          if (textSpan) textSpan.textContent = 'Salin';
          self.classList.remove('copied');
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(onCopied, function () {
          onCopied();
          showToast(email);
        });
      } else {
        onCopied();
      }
    });
  }

  // ---------- 9. Galeri sertifikat & dokumen (klik untuk memperbesar) ----------
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');

  // Sembunyikan tombol "Verifikasi" / "GitHub" yang linknya belum diisi (kecuali .soon-link)
  document.querySelectorAll('.verify, .links a').forEach(function (a) {
    if (a.getAttribute('href') === '#' && !a.classList.contains('soon-link')) {
      a.style.display = 'none';
    }
  });

  // Tampilkan notifikasi untuk tautan "Segera hadir"
  document.querySelectorAll('.soon-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showToast(a.getAttribute('data-soon') || 'Segera hadir');
    });
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
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCount = document.getElementById('lbCount');
  var lbFiles = [], lbIdx = 0, lbTitle = '';

  function showFile() {
    var full = lbFiles[lbIdx];
    var isPdf = /\.pdf$/i.test(full);
    if (lbImg) lbImg.style.display = isPdf ? 'none' : 'inline-block';
    if (lbFrame) lbFrame.style.display = isPdf ? 'block' : 'none';
    if (isPdf) {
      if (lbFrame) lbFrame.src = full;
      if (lbImg) lbImg.removeAttribute('src');
    } else {
      if (lbImg) {
        lbImg.src = full;
        lbImg.alt = lbTitle;
      }
      if (lbFrame) lbFrame.removeAttribute('src');
    }
    if (lbCaption) lbCaption.textContent = lbTitle;
    if (lbOpen) lbOpen.href = full;
    var multi = lbFiles.length > 1;
    if (lbPrev) lbPrev.style.display = multi ? 'flex' : 'none';
    if (lbNext) lbNext.style.display = multi ? 'flex' : 'none';
    if (lbCount) lbCount.textContent = multi ? ' (' + (lbIdx + 1) + '/' + lbFiles.length + ')' : '';
  }

  function openLightbox(thumb) {
    if (!lightbox) return;
    var img = thumb.querySelector('img');
    var hasImg = img && !thumb.classList.contains('empty');
    var full = thumb.getAttribute('data-full') || (hasImg ? img.getAttribute('src') : '');
    if (!full) {
      showToast('Berkas sertifikat belum ditambahkan');
      return;
    }
    lbFiles = full.split('|');
    lbIdx = 0;
    lbTitle = thumb.getAttribute('data-title') || (img ? img.alt : '');
    showFile();

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  window.openFileLightbox = function (url, title) {
    if (!lightbox || !url) return;
    lbFiles = String(url).split('|');
    lbIdx = 0;
    lbTitle = title || '';
    showFile();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function stepFile(d) {
    if (lbFiles.length < 2) return;
    lbIdx = (lbIdx + d + lbFiles.length) % lbFiles.length;
    showFile();
  }
  if (lbPrev) lbPrev.addEventListener('click', function () { stepFile(-1); });
  if (lbNext) lbNext.addEventListener('click', function () { stepFile(1); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') stepFile(-1);
    if (e.key === 'ArrowRight') stepFile(1);
  });
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbFrame) lbFrame.removeAttribute('src');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.cert-thumb, .edu-doc, .edu-view').forEach(function (t) {
    t.addEventListener('click', function () { openLightbox(t); });
  });
  var lbClose = document.getElementById('lbClose');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // ---------- 12. Detail proyek (klik kartu untuk membuka) ----------
  var modal = document.getElementById('projectModal');
  var $ = function (id) { return document.getElementById(id); };
  var lastFocus = null;

  function openProjectModal(card) {
    if (!modal) return;
    var wrap = card.querySelector('.card-img');
    var img = wrap && wrap.querySelector('img');
    var canvas = wrap && wrap.querySelector('canvas');
    var hasImg = img && !wrap.classList.contains('empty') && (img.currentSrc || img.src);
    var pdfUrl = wrap && wrap.getAttribute('data-full');
    var pdfTitle = wrap && wrap.getAttribute('data-title');

    var imgWrap = $('pmImgWrap');
    var pmImg = $('pmImg');
    if (imgWrap) {
      imgWrap.querySelectorAll('canvas.pm-pdf-canvas').forEach(function (c) { c.remove(); });
      if (hasImg && pmImg) {
        pmImg.style.display = 'block';
        pmImg.src = img.currentSrc || img.src;
        pmImg.alt = img.alt;
        imgWrap.classList.remove('none');
      } else if (canvas) {
        if (pmImg) pmImg.style.display = 'none';
        var clone = document.createElement('canvas');
        clone.className = 'pm-pdf-canvas';
        clone.width = canvas.width;
        clone.height = canvas.height;
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.objectFit = 'cover';
        clone.style.objectPosition = 'top';
        clone.getContext('2d').drawImage(canvas, 0, 0);
        imgWrap.appendChild(clone);
        imgWrap.classList.remove('none');
      } else if (pdfUrl) {
        if (pmImg) pmImg.style.display = 'none';
        imgWrap.classList.remove('none');
      } else {
        imgWrap.classList.add('none');
      }

      imgWrap.onclick = pdfUrl ? function () {
        if (typeof window.openFileLightbox === 'function') {
          window.openFileLightbox(pdfUrl, pdfTitle || card.querySelector('h3').textContent);
        }
      } : null;
      imgWrap.style.cursor = pdfUrl ? 'zoom-in' : '';
    }

    if ($('pmTitle')) $('pmTitle').textContent = card.querySelector('h3').textContent;
    var role = card.querySelector('.pr-role');
    if ($('pmRole')) $('pmRole').textContent = role ? role.textContent : '';
    var desc = card.querySelector('p:not(.pr-role):not(.tags):not(.links)');
    if ($('pmDesc')) $('pmDesc').textContent = desc ? desc.textContent : '';
    var tags = card.querySelector('.tags');
    if ($('pmTags')) $('pmTags').innerHTML = tags ? tags.innerHTML : '';

    var links = $('pmLinks');
    if (links) {
      links.innerHTML = '';
      card.querySelectorAll('.links a').forEach(function (a) {
        if (a.getAttribute('href') !== '#' || a.classList.contains('soon-link')) {
          links.appendChild(a.cloneNode(true));
        }
      });
    }

    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if ($('pmClose')) $('pmClose').focus();
  }
  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      openProjectModal(card);
    });
    card.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); openProjectModal(card); }
    });
  });
  if ($('pmClose')) $('pmClose').addEventListener('click', closeProjectModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeProjectModal(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeProjectModal();
  });

  // ---------- 13. Statistik di hero (dihitung otomatis dari isi halaman) ----------
  (function () {
    var map = {
      proyek: '#proyek .card',
      pengalaman: '#pengalaman .exp-card',
      sertifikat: '#sertifikat .cert',
      teknologi: '#keahlian .tags span'
    };
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var sel = map[el.getAttribute('data-stat')];
      if (!sel) return;
      var n = document.querySelectorAll(sel).length;
      if (!n) return;
      if (reduceMotion) { el.textContent = n; return; }
      var start = null;
      requestAnimationFrame(function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / 900, 1);
        el.textContent = Math.round(n * p);
        if (p < 1) requestAnimationFrame(step);
      });
    });
  })();

  // ---------- 14. Pendidikan: timeline, sorotan, tilt, ijazah ----------
  (function () {
    var eduCards = document.querySelectorAll('.edu-card');
    if (!eduCards.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      eduCards.forEach(function (c) { io.observe(c); });
    } else {
      eduCards.forEach(function (c) { c.classList.add('in'); });
    }

    eduCards.forEach(function (card) {
      var doc = card.querySelector('.edu-doc');
      if (!doc || !window.fetch) return;
      fetch(doc.getAttribute('data-full'), { method: 'HEAD' })
        .then(function (r) { if (!r.ok) card.classList.add('nodoc'); })
        .catch(function () { card.classList.add('nodoc'); });
    });

    document.querySelectorAll('.edu-toggle').forEach(function (btn) {
      var wrap = document.getElementById(btn.getAttribute('data-target'));
      if (!wrap) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        wrap.classList.toggle('closed', open);
      });
    });

    document.querySelectorAll('.hl-link').forEach(function (b) {
      b.addEventListener('click', function () {
        var slug = b.getAttribute('data-project');
        if (slug) {
          var c = document.querySelector('.card[data-slug="' + slug + '"]');
          if (c) c.click();
          return;
        }
        var sel = b.getAttribute('data-goto');
        var t = sel && document.querySelector(sel);
        if (!t) return;
        t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        t.classList.add('flash');
        setTimeout(function () { t.classList.remove('flash'); }, 1400);
      });
    });

    if (!reduceMotion && window.matchMedia && matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.edu-box').forEach(function (box) {
        box.addEventListener('mousemove', function (e) {
          var r = box.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          box.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          box.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          box.style.setProperty('--ry', ((x - 0.5) * 3).toFixed(2) + 'deg');
          box.style.setProperty('--rx', ((0.5 - y) * 2.4).toFixed(2) + 'deg');
        });
        box.addEventListener('mouseleave', function () {
          box.style.setProperty('--rx', '0deg');
          box.style.setProperty('--ry', '0deg');
        });
      });
    }
  })();

  // ---------- 15. Navbar, hero, dan pilar "Tentang" ----------
  (function () {
    var navEl = document.getElementById('nav');
    var menuEl = document.getElementById('menu');
    var ind = document.getElementById('navInd');

    function onNavScroll() { if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 24); }
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    if (menuEl && ind) {
      var navLinks = Array.prototype.slice.call(menuEl.querySelectorAll('a'));
      var lastActive = null;

      var place = function (link) {
        navLinks.forEach(function (l) { l.classList.toggle('lit', l === link); });
        if (!link || getComputedStyle(ind).display === 'none') { ind.style.opacity = 0; return; }
        ind.style.width = link.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + link.offsetLeft + 'px)';
        ind.style.opacity = 1;
      };
      var rest = function () { place(menuEl.querySelector('a.active')); };

      navLinks.forEach(function (l) {
        l.addEventListener('mouseenter', function () { place(l); });
        l.addEventListener('focus', function () { place(l); });
      });
      menuEl.addEventListener('mouseleave', rest);
      menuEl.addEventListener('focusout', rest);
      new MutationObserver(function () {
        var a = menuEl.querySelector('a.active');
        if (a !== lastActive) { lastActive = a; rest(); }
      }).observe(menuEl, { attributes: true, attributeFilter: ['class'], subtree: true });
      window.addEventListener('resize', rest);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
      rest();
    }

    var hero = document.querySelector('.hero');
    var wrap = document.getElementById('photoWrap');
    if (hero && wrap && !reduceMotion && window.matchMedia && matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        wrap.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        wrap.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      hero.addEventListener('mouseleave', function () {
        wrap.style.setProperty('--mx', 0);
        wrap.style.setProperty('--my', 0);
      });
    }

    document.querySelectorAll('.pillar-link').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        if (f) {
          var chip = document.querySelector('.chip[data-filter="' + f + '"]');
          if (chip) chip.click();
        }
        var t = document.querySelector(b.getAttribute('data-goto') || '#proyek');
        if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  })();

  // ---------- 11. Klik foto utama untuk ganti latar putih/merah ----------
  (function () {
    var photo = document.getElementById('photo');
    if (!photo) return;
    var hint = document.querySelector('.photo-hint');

    function swap() {
      if (!photo.querySelector('.p2')) return;
      photo.classList.toggle('swap');
    }
    if (!photo.querySelector('.p2') && hint) hint.style.display = 'none';

    photo.addEventListener('click', swap);
    photo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(); }
    });
  })();

  // ---------- 10. Thumbnail otomatis dari halaman pertama PDF ----------
  (function () {
    var thumbs = document.querySelectorAll('.cert-thumb[data-full$=".pdf"], .edu-doc[data-full$=".pdf"], .card-img[data-full$=".pdf"]');
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
        .catch(function () {});
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); renderThumb(e.target); }
      });
    }, { rootMargin: '200px' });

    thumbs.forEach(function (t) {
      var img = t.querySelector('img');
      if (!img) { io.observe(t); return; }
      img.addEventListener('error', function () { io.observe(t); });
      if (img.complete && img.naturalWidth === 0) io.observe(t);
    });
  })();

  // ---------- 16. Filter & rincian interaktif bagian Pengalaman ----------
  (function () {
    var expChips = document.querySelectorAll('.exp-chip');
    var expCards = document.querySelectorAll('.exp-card');
    if (!expChips.length && !expCards.length) return;

    expChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        expChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var filter = chip.getAttribute('data-exp');

        expCards.forEach(function (card) {
          var kind = card.getAttribute('data-exp');
          var show = filter === 'all' || kind === filter;
          card.classList.toggle('hide', !show);
        });
      });
    });

    function toggleCard(card) {
      var isOpen = card.classList.toggle('open');
      card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var label = card.querySelector('.exp-more');
      if (label && label.childNodes.length > 0 && label.childNodes[0].nodeType === 3) {
        label.childNodes[0].nodeValue = isOpen ? 'Tutup rincian ' : 'Rincian peran ';
      }
    }

    expCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        toggleCard(card);
      });
      card.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
          e.preventDefault();
          toggleCard(card);
        }
      });
    });
  })();

  // ---------- 17. Toggle status ketersediaan kerja saat diklik ----------
  (function () {
    var badge = document.getElementById('statusBadge');
    if (!badge) return;

    var textEl = badge.querySelector('.status-text');
    var dotEl = badge.querySelector('.dot');
    var STORAGE_KEY = 'workStatusOpen';

    function renderStatus(isOpen) {
      badge.setAttribute('data-open', isOpen ? 'true' : 'false');
      if (textEl) {
        textEl.textContent = isOpen ? 'Terbuka untuk peluang kerja' : 'Sedang bekerja · Terbuka untuk kolaborasi';
      }
      if (dotEl) {
        dotEl.style.background = isOpen ? '' : '#94a3b8';
      }
    }

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var isOpen = saved === null ? badge.getAttribute('data-open') !== 'false' : saved === 'true';
    renderStatus(isOpen);

    function toggleStatus() {
      isOpen = !isOpen;
      renderStatus(isOpen);
      try { localStorage.setItem(STORAGE_KEY, String(isOpen)); } catch (e) {}
      showToast(isOpen ? 'Status: Terbuka untuk peluang kerja' : 'Status: Sedang bekerja · Terbuka untuk kolaborasi');
    }

    badge.addEventListener('click', toggleStatus);
    badge.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleStatus();
      }
    });
  })();
})();