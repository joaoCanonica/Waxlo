(function () {
  "use strict";
  var WPP = "5549988913704";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var root = document.documentElement;
  var MEDIA = {};
  try { MEDIA = JSON.parse(root.getAttribute("data-media") || "{}"); } catch (e) {}
  var conn = navigator.connection || {};
  var saveData = !!conn.saveData;
  var ICON_PAUSE_S = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>';
  var ICON_PLAY_S = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';

  /* Entrada animada: só criada por JS, decidida no <head> (classe "intro") */
  var introDone = !root.classList.contains("intro");
  var introWaiters = [];
  var onIntroDone = function (fn) { introDone ? fn() : introWaiters.push(fn); };
  if (!introDone) {
    var useVideo = root.classList.contains("intro-v");
    var page = $$("body > header, body > nav, body > main, body > footer, body > .wpp, body > .skip");
    var ov = document.createElement("div");
    ov.className = "intro-ov" + (useVideo ? "" : " intro-ov--css");
    var mark = "/assets/escritaWaxlo-alpha-dark.png";
    if (useVideo) {
      var srcs = (MEDIA.introWebm ? '<source src="' + MEDIA.introWebm + '" type="video/webm">' : "") + (MEDIA.introMp4 ? '<source src="' + MEDIA.introMp4 + '" type="video/mp4">' : "");
      ov.innerHTML = '<div class="intro-ov__box"><video muted playsinline preload="auto" aria-hidden="true"' + (MEDIA.introPoster ? ' poster="' + MEDIA.introPoster + '"' : "") + ">" + srcs + "</video>" +
        (MEDIA.wordmark ? '<img class="intro-ov__logo" src="' + MEDIA.wordmark + '" alt="" aria-hidden="true">' : "") + "</div>";
    } else {
      ov.innerHTML = '<span class="intro-ov__line" aria-hidden="true"></span><img class="intro-ov__mark" src="' + mark + '" alt="" aria-hidden="true">';
    }
    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "intro-ov__skip";
    skip.textContent = "Pular";
    ov.appendChild(skip);
    document.body.appendChild(ov);
    root.classList.add("intro-ready");
    page.forEach(function (el) { el.inert = true; });
    skip.focus({ preventScroll: true, focusVisible: false });

    var ended = false, safety, t0 = Date.now();
    var finish = function () {
      if (ended) return;
      ended = true;
      clearTimeout(safety);
      try { localStorage.setItem("waxlo-intro-v4", String(Date.now())); } catch (e) {}
      page.forEach(function (el) { el.inert = false; });
      document.removeEventListener("keydown", onKey);
      var done = function () {
        ov.remove();
        introDone = true;
        introWaiters.forEach(function (fn) { fn(); });
      };
      // Se a logo já está na tela, ela "voa" até a logo da navbar enquanto o fundo some
      var from = useVideo ? $(".intro-ov__logo.is-on", ov) : (Date.now() - t0 > 900 ? $(".intro-ov__mark", ov) : null);
      var navImg = $(".top .logo img");
      if (from && navImg && from.animate) {
        var r1 = from.getBoundingClientRect(), r2 = navImg.getBoundingClientRect();
        var fly = from.cloneNode();
        fly.className = "intro-fly";
        fly.style.cssText = "left:" + r1.left + "px;top:" + r1.top + "px;width:" + r1.width + "px;height:" + r1.height + "px";
        document.body.appendChild(fly);
        from.style.visibility = "hidden";
        $$("video, .intro-ov__line", ov).forEach(function (el) { el.style.visibility = "hidden"; });
        ov.classList.add("is-flying");
        var sx = r2.width / r1.width, sy = r2.height / r1.height;
        var dx = r2.left - r1.left, dy = r2.top - r1.top;
        ov.classList.add("is-out");
        fly.animate([{ transform: "none" }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")" }],
          { duration: 750, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" }).onfinish = function () {
          navImg.style.transition = "none";
          root.classList.remove("intro");
          requestAnimationFrame(function () { fly.remove(); navImg.style.transition = ""; });
          done();
        };
      } else {
        ov.classList.add("is-out");
        root.classList.remove("intro");
        setTimeout(done, 600);
      }
    };
    var onKey = function (e) { if (e.key === "Escape") finish(); };
    document.addEventListener("keydown", onKey);
    ov.addEventListener("click", finish);

    if (useVideo) {
      var iv = $("video", ov), logo = $(".intro-ov__logo", ov);
      safety = setTimeout(finish, 6000);
      iv.addEventListener("timeupdate", function () {
        if (logo && iv.duration && iv.currentTime >= iv.duration - 0.5) logo.classList.add("is-on");
      });
      iv.addEventListener("ended", finish);
      iv.addEventListener("error", finish, true);
      var pr = iv.play();
      if (pr && pr.catch) pr.catch(function () { if (logo) logo.classList.add("is-on"); setTimeout(finish, 800); });
    } else {
      safety = setTimeout(finish, 1200);
    }
  }

  /* Hero em vídeo: começa depois do load e do fim da entrada */
  var heroBox = $(".hero__media");
  if (heroBox) {
    var hv = $("video", heroBox), hb = $(".hero__pause", heroBox);
    var small = window.matchMedia("(max-width: 767px)").matches;
    var staticOnly = !hv || small || saveData || reduce;
    if (staticOnly) {
      var still = MEDIA.heroStatic || (!small && MEDIA.heroPoster);
      if (hv) hv.remove();
      if (hb) hb.remove();
      if (still) {
        // Imagem decorativa: entra só depois do load e da entrada, para não disputar o LCP com o H1
        var addStill = function () {
          var im = new Image();
          im.alt = "";
          im.decoding = "async";
          im.src = still;
          heroBox.appendChild(im);
        };
        var whenLoaded = function () { onIntroDone(function () { (window.requestIdleCallback || setTimeout)(addStill); }); };
        document.readyState === "complete" ? whenLoaded() : window.addEventListener("load", whenLoaded);
      }
    } else {
      if (hv.getAttribute("data-poster")) hv.poster = hv.getAttribute("data-poster");
      var heroPaused = false, heroVisible = true, started = false;
      var setHeroIcon = function () {
        var playing = !hv.paused;
        hb.innerHTML = playing ? ICON_PAUSE_S : ICON_PLAY_S;
        hb.setAttribute("aria-label", playing ? "Pausar animação" : "Reproduzir animação");
      };
      var tryPlay = function () {
        if (heroPaused || !heroVisible || document.hidden || !started) return;
        var p = hv.play();
        if (p && p.catch) p.catch(function () {});
      };
      var start = function () {
        if (started) return;
        started = true;
        hv.innerHTML = (MEDIA.heroWebm ? '<source src="' + MEDIA.heroWebm + '" type="video/webm">' : "") + (MEDIA.heroMp4 ? '<source src="' + MEDIA.heroMp4 + '" type="video/mp4">' : "");
        hv.load();
        hb.hidden = false;
        tryPlay();
      };
      hv.addEventListener("playing", function () { hv.classList.add("is-on"); setHeroIcon(); });
      hv.addEventListener("pause", setHeroIcon);
      hb.addEventListener("click", function () {
        if (hv.paused) { heroPaused = false; tryPlay(); } else { heroPaused = true; hv.pause(); }
      });
      document.addEventListener("visibilitychange", function () { document.hidden ? hv.pause() : tryPlay(); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          heroVisible = en[0].isIntersecting;
          heroVisible ? tryPlay() : hv.pause();
        }).observe(heroBox);
      }
      var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 200); };
      var afterLoad = function () { onIntroDone(function () { idle(start, { timeout: 2000 }); }); };
      document.readyState === "complete" ? afterLoad() : window.addEventListener("load", afterLoad);
    }
  }

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
