(function () {
  "use strict";
  var WPP = "5549988913704";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Header border on scroll */
  var top = $(".top");
  if (top) {
    var onScroll = function () { top.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu: aria-expanded, focus trap, Esc */
  var btn = $(".menu-btn"), menu = $("#mnav");
  if (btn && menu) {
    var focusables = function () { return [btn].concat($$("a, button", menu)); };
    var close = function (refocus) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menu");
      menu.hidden = true;
      document.body.style.overflow = "";
      if (refocus) btn.focus();
    };
    var open = function () {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fechar menu");
      menu.hidden = false;
      document.body.style.overflow = "hidden";
      var first = $("a", menu);
      if (first) first.focus();
    };
    btn.addEventListener("click", function () {
      btn.getAttribute("aria-expanded") === "true" ? close(true) : open();
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) close(false); });
    document.addEventListener("keydown", function (e) {
      if (btn.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { close(true); return; }
      if (e.key !== "Tab") return;
      var f = focusables(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960) close(false); });
  }

  /* Reveal on scroll */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else {
    $$(".rv").forEach(function (el) { el.classList.add("in"); });
  }

  /* Case videos: load only on hover or when visible, never preload */
  var ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';
  $$(".case__media[data-video]").forEach(function (media) {
    var video = $("video", media), pause = $(".case__pause", media);
    var userPaused = reduce, loaded = false;
    var load = function () {
      if (loaded) return;
      loaded = true;
      var base = media.getAttribute("data-video");
      video.innerHTML = '<source src="' + base + '.webm" type="video/webm"><source src="' + base + '.mp4" type="video/mp4">';
      video.load();
    };
    var setIcon = function () {
      var playing = !video.paused;
      pause.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      pause.setAttribute("aria-label", playing ? "Pausar vídeo" : "Reproduzir vídeo");
    };
    var play = function () {
      if (userPaused) return;
      load();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    };
    video.addEventListener("playing", function () { video.classList.add("is-on"); setIcon(); });
    video.addEventListener("pause", setIcon);
    pause.addEventListener("click", function () {
      if (video.paused) { userPaused = false; play(); }
      else { userPaused = true; video.pause(); }
    });
    media.addEventListener("mouseenter", play);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) play(); else if (!video.paused) video.pause();
        });
      }, { threshold: 0.6 }).observe(media);
    }
    setIcon();
  });

  /* Niche filter */
  var chips = $$(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var n = chip.getAttribute("data-nicho");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      $$(".case").forEach(function (card) {
        card.hidden = !(n === "*" || card.getAttribute("data-nicho") === n);
      });
    });
  });

  /* Live viewer: iframe loads only after click */
  var dlg = $("#viewer");
  if (dlg && typeof dlg.showModal === "function") {
    var frame = $("iframe", dlg), url = $(".viewer__url", dlg), openLink = $(".viewer__open", dlg), title = $(".viewer__title", dlg);
    var setMode = function (m) {
      dlg.setAttribute("data-mode", m);
      $$(".viewer__modes button", dlg).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m)); });
    };
    $$("[data-live]").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        var u = b.getAttribute("data-live");
        frame.src = u;
        frame.title = "Site " + b.getAttribute("data-nome") + " ao vivo";
        url.textContent = u.replace(/^https?:\/\//, "");
        openLink.href = u;
        title.textContent = b.getAttribute("data-nome");
        setMode(window.innerWidth < 760 ? "mobile" : "desktop");
        dlg.showModal();
      });
    });
    $$(".viewer__modes button", dlg).forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });
    $(".viewer__close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { frame.src = "about:blank"; });
  }

  /* Mini diagnosis -> WhatsApp */
  var form = $("#diag");
  if (form) {
    var err = $(".form__err", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var nome = (data.get("nome") || "").toString().trim();
      var seg = (data.get("segmento") || "").toString().trim();
      var precisa = data.getAll("precisa").join(", ");
      var site = (data.get("tem_site") || "").toString();
      var msg = (data.get("mensagem") || "").toString().trim();
      if (!seg) { err.textContent = "Conte qual é o segmento do seu negócio."; $("#f-seg").focus(); return; }
      if (!$("#f-ok").checked) { err.textContent = "Para continuar, aceite a Política de Privacidade."; $("#f-ok").focus(); return; }
      err.textContent = "";
      var lines = ["Olá, WAXLO! Quero um diagnóstico."];
      if (nome) lines.push("Nome: " + nome);
      lines.push("Segmento: " + seg);
      if (precisa) lines.push("Preciso de: " + precisa);
      if (site) lines.push("Já tenho site: " + site);
      if (msg) lines.push("Mensagem: " + msg);
      window.open("https://wa.me/" + WPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }
})();
