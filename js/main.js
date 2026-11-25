/* Meshcore Bulgaria — redesigned (local version)
   Interactions: banner, mobile menu, dropdown, scrollspy, reveal,
   tabs, channel filter, copy buttons, theme, language, hero canvas. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Announcement banner (dismissible, remembered) ─────────── */
  var banner = document.getElementById("banner");
  if (banner && localStorage.getItem("mc-banner-dismissed") === "1") {
    banner.hidden = true;
  }
  var bannerClose = document.getElementById("banner-close");
  if (bannerClose) {
    bannerClose.addEventListener("click", function () {
      banner.hidden = true;
      localStorage.setItem("mc-banner-dismissed", "1");
    });
  }

  /* ── Header height → CSS var (banner may change layout) ────── */

  /* ── Mobile menu ───────────────────────────────────────────── */
  var menuBtn = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      mobileMenu.hidden = false;
      menuBtn.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        menuBtn.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Resources dropdown ────────────────────────────────────── */
  var dropdown = document.querySelector(".dropdown");
  if (dropdown) {
    var toggle = dropdown.querySelector(".dropdown-toggle");
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── Scrollspy ─────────────────────────────────────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Reveal on scroll ──────────────────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            ro.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ── Setup tabs ────────────────────────────────────────────── */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = t !== tab;
      });
      var activePanel = document.getElementById(tab.getAttribute("aria-controls"));
      if (activePanel) activePanel.classList.add("is-active");
    });
  });

  /* ── Channel filter ────────────────────────────────────────── */
  var filterChips = document.querySelectorAll(".filter-chip");
  var channelCards = document.querySelectorAll("#channels-grid .channel");
  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      filterChips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
      var f = chip.getAttribute("data-filter");
      channelCards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-region") === f;
        card.classList.toggle("hide", !show);
        if (show) card.classList.add("in"); // already visible, skip animation
      });
    });
  });

  /* ── Copy buttons ──────────────────────────────────────────── */
  function doCopy(btn, text) {
    function done() {
      btn.classList.add("copied");
      setTimeout(function () { btn.classList.remove("copied"); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
      done();
    }
  }
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var codeEl = btn.parentElement.querySelector("code");
      if (!codeEl) return;
      var text = codeEl.textContent;
      if (codeEl.textContent.indexOf("\n") === -1 && btn.closest(".cmd-block")) {
        // whole block copy
        text = btn.closest(".cmd-block").querySelector("pre code").textContent;
      }
      doCopy(btn, text);
    });
  });

  /* ── Theme ─────────────────────────────────────────────────── */
  var themeToggle = document.getElementById("theme-toggle");
  var storedTheme = localStorage.getItem("mc-theme");
  if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("mc-theme", next);
    });
  }

  /* ── Language (BG / EN) ────────────────────────────────────── */
  var i18n = (window.MC_I18N && window.MC_I18N.en) || {};
  var originals = new Map();
  var ariaOriginals = new Map();

  function collectOriginals() {
    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach(function (el) {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      if (!ariaOriginals.has(el)) ariaOriginals.set(el, el.getAttribute("aria-label"));
    });
  }
  function applyLang(lang) {
    var html = document.documentElement;
    if (lang === "en") {
      collectOriginals();
      document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach(function (el) {
        var key = el.getAttribute("data-i18n") || el.getAttribute("data-i18n-html");
        if (i18n[key] !== undefined) el.innerHTML = i18n[key];
      });
      document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
        var key = el.getAttribute("data-i18n-aria");
        if (i18n[key] !== undefined) el.setAttribute("aria-label", i18n[key]);
      });
      document.title = "Meshcore Bulgaria — Off-grid network with open source code and encrypted messages";
    } else {
      originals.forEach(function (value, el) { el.innerHTML = value; });
      ariaOriginals.forEach(function (value, el) { el.setAttribute("aria-label", value); });
      document.title = "Meshcore Bulgaria — Off-grid мрежа с отворен код и криптирани съобщения";
    }
    html.setAttribute("lang", lang === "en" ? "en" : "bg");
    var label = document.getElementById("lang-label");
    if (label) label.textContent = lang === "en" ? "BG" : "EN";
  }

  var langToggle = document.getElementById("lang-toggle");
  var lang = localStorage.getItem("mc-lang") || "bg";
  applyLang(lang);
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      lang = lang === "bg" ? "en" : "bg";
      localStorage.setItem("mc-lang", lang);
      applyLang(lang);
    });
  }

  /* ── Back to top ───────────────────────────────────────────── */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ── Hero canvas: animated mesh network ────────────────────── */
  var canvas = document.getElementById("hero-canvas");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var raf = null;
    var running = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var LINK_DIST = 150;

    function accentColor() {
      var theme = document.documentElement.getAttribute("data-theme");
      return theme === "light" ? "2, 132, 199" : "56, 189, 248";
    }

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      buildNodes(rect.width, rect.height);
    }

    function buildNodes(w, h) {
      var count = Math.min(70, Math.max(30, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 1
        });
      }
    }

    function step() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var col = accentColor();

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            var alpha = (1 - d / LINK_DIST) * 0.22;
            ctx.strokeStyle = "rgba(" + col + "," + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < nodes.length; j++) {
        ctx.beginPath();
        ctx.arc(nodes[j].x, nodes[j].y, nodes[j].r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + col + ",0.5)";
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    function start() {
      if (!running) { running = true; raf = requestAnimationFrame(step); }
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    resize();
    start();
  } else if (canvas) {
    // Static fallback for reduced motion
    canvas.style.display = "none";
  }
})();
