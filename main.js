/* JAY English in Osaka — 動きの設定ファイル
   一番上の FORM_ENDPOINT が、フォームの送信先(Googleのスクリプト)です。 */
/* ページを開いたとき、必ず一番上から表示する(前回の位置を覚えて下に飛ぶのを防ぐ) */
if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
if (!location.hash) {
  window.scrollTo(0, 0);
  window.addEventListener("load", function () { window.scrollTo(0, 0); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) { window.scrollTo(0, 0); } });
}

  // 送信先(Google Apps ScriptのウェブアプリのURL)を入れると、フォームの内容がそこへ送信されます。
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycby0dg1-O5nTOWRfg027S45luEq8OlLHoBuxOwb9h1iQaaFqSCmzftGMiMGixGIH_tAOcw/exec";
  // フォームの内容を送る共通の処理(Google Apps Script用)。
  // 流入経路の記録: URLの ?utm_source=flyer&utm_content=A のような目印を、最初に来たときに1度だけ覚えておき、
  // 問い合わせ送信時に一緒に送ります(チラシA/Bなどの比較用)。ブラウザの保存が使えなくても動きます。
  var TRACK_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var TRACK = (function () {
    var saved = {}, found = {}, hasNew = false;
    try { saved = JSON.parse(localStorage.getItem("jayTrack") || "{}") || {}; } catch (e) {}
    try {
      var q = new URLSearchParams(location.search);
      TRACK_KEYS.forEach(function (k) {
        var v = (q.get(k) || "").slice(0, 60);
        if (v) { found[k] = v; hasNew = true; }
      });
    } catch (e) {}
    if (hasNew) {
      found.first_visit = new Date().toISOString().slice(0, 10);
      saved = found;
      try { localStorage.setItem("jayTrack", JSON.stringify(saved)); } catch (e) {}
    }
    return saved;
  })();
  function sendForm(form) {
    var body = new URLSearchParams(new FormData(form));
    TRACK_KEYS.concat(["first_visit"]).forEach(function (k) { if (TRACK[k]) { body.set(k, TRACK[k]); } });
    return fetch(FORM_ENDPOINT, { method: "POST", body: body })
      .then(function (res) { return res.json(); })
      .then(function (data) { if (!data || !data.ok) { throw new Error("failed"); } });
  }
  // 「現在作成中」画面の背景に使うロンドン空撮動画のURL(mp4など)。空のままだと、ゆっくり流れるロンドンのスカイラインのアニメーションが表示されます。
  var VIDEO_SRC = "";

  (function () {
    var form = document.getElementById("counselForm");
    var thanks = document.getElementById("thanks");
    var btn = document.getElementById("submitBtn");
    var nameEl = document.getElementById("f-name");
    var emailEl = document.getElementById("f-email");
    var errName = document.getElementById("err-name");
    var errEmail = document.getElementById("err-email");
    var errForm = document.getElementById("err-form");

    function validate() {
      var ok = true;
      errName.textContent = "";
      errEmail.textContent = "";
      errForm.textContent = "";
      if (!nameEl.value.trim()) {
        errName.textContent = "お名前を入力してください。";
        ok = false;
      }
      var mail = emailEl.value.trim();
      if (!mail) {
        errEmail.textContent = "メールアドレスを入力してください。";
        ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        errEmail.textContent = "メールアドレスの形式を確認してください。(例: name@example.com)";
        ok = false;
      }
      if (!ok) { (nameEl.value.trim() ? emailEl : nameEl).focus(); }
      return ok;
    }

    function showThanks(sent) {
      form.hidden = true;
      thanks.hidden = false;
      document.getElementById("previewNote").hidden = sent;
      thanks.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      if (!FORM_ENDPOINT) { showThanks(false); return; }

      btn.disabled = true;
      btn.textContent = "送信中…";
      sendForm(form).then(function () {
        showThanks(true);
      }).catch(function () {
        errForm.textContent = "送信できませんでした。時間をおいて、もう一度お試しください。";
        btn.disabled = false;
        btn.textContent = "送信する";
      });
    });
  })();
  (function () {
    var stage = document.getElementById("stage");
    var video = document.getElementById("stageVideo");
    var title = document.getElementById("stageTitle");
    var eyebrow = document.getElementById("stageEyebrow");
    var desc = document.getElementById("stageDesc");
    var closeBtn = document.getElementById("stageClose");
    var kview = document.getElementById("kview");
    var cview = document.getElementById("cview");
    var fview = document.getElementById("fview");
    var drop = document.getElementById("navDrop");
    var menuWrap = document.getElementById("menuWrap");
    var burger = document.getElementById("burger");
    var items = document.querySelectorAll("[data-stage]");
    var touch = !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
    var lastItem = null;

    function setLock(on) {
      try { document.documentElement.style.overflow = on ? "hidden" : ""; } catch (e) {}
    }
    function closeDrop() { drop.classList.remove("open"); drop.classList.add("dismiss"); }
    drop.addEventListener("mouseenter", function () { drop.classList.remove("dismiss"); });
    drop.addEventListener("mouseleave", function () { drop.classList.remove("dismiss"); });

    function closeMenu() {
      menuWrap.classList.remove("open");
      menuWrap.classList.add("dismiss");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "メニューを開く");
    }
    menuWrap.addEventListener("mouseenter", function () { menuWrap.classList.remove("dismiss"); });
    menuWrap.addEventListener("mouseleave", function () { menuWrap.classList.remove("dismiss"); });
    burger.addEventListener("click", function () {
      menuWrap.classList.remove("dismiss");
      var open = menuWrap.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });

    function closeKids() { if (!kview.hidden) { kview.hidden = true; setLock(false); } }
    function closeCourses() { if (!cview.hidden) { cview.hidden = true; setLock(false); } }
    function closeFeatures() { if (!fview.hidden) { fview.hidden = true; setLock(false); } }
    function closeStage() {
      if (stage.hidden) return;
      stage.hidden = true;
      setLock(false);
      try { video.pause(); } catch (e) {}
      Array.prototype.forEach.call(items, function (b) { b.removeAttribute("aria-current"); });
    }
    function closeAll() { closeStage(); closeKids(); closeCourses(); closeFeatures(); closeDrop(); closeMenu(); }

    function openStage(btn) {
      closeKids(); closeCourses(); closeFeatures(); closeDrop(); closeMenu();
      Array.prototype.forEach.call(items, function (b) { b.removeAttribute("aria-current"); });
      btn.setAttribute("aria-current", "true");
      lastItem = btn;
      title.textContent = btn.getAttribute("data-stage");
      eyebrow.textContent = btn.getAttribute("data-en");
      var d = btn.getAttribute("data-desc");
      desc.textContent = d || "";
      desc.hidden = !d;
      stage.hidden = false;
      setLock(true);
      if (VIDEO_SRC) {
        if (!video.getAttribute("src")) { video.src = VIDEO_SRC; }
        video.hidden = false;
        var p = video.play();
        if (p && p.catch) { p.catch(function () {}); }
      }
    }
    function openKids() {
      closeStage(); closeCourses(); closeFeatures(); closeDrop(); closeMenu();
      kview.hidden = false;
      kview.scrollTop = 0;
      setLock(true);
    }
    function openCourses(id) {
      closeStage(); closeKids(); closeFeatures(); closeDrop(); closeMenu();
      cview.hidden = false;
      setLock(true);
      var target = id ? document.getElementById(id) : null;
      if (target) { target.scrollIntoView({ block: "start" }); } else { cview.scrollTop = 0; }
    }
    function openFeatures() {
      closeStage(); closeKids(); closeCourses(); closeDrop(); closeMenu();
      fview.hidden = false;
      fview.scrollTop = 0;
      setLock(true);
    }

    Array.prototype.forEach.call(items, function (btn) {
      btn.addEventListener("click", function () { openStage(btn); });
    });
    closeBtn.addEventListener("click", function () {
      closeStage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (lastItem) lastItem.focus();
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-kids]"), function (b) {
      b.addEventListener("click", openKids);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-features]"), function (b) {
      b.addEventListener("click", openFeatures);
    });
    document.getElementById("featuresBack").addEventListener("click", closeFeatures);
    document.getElementById("fCta").addEventListener("click", closeAll);
    document.getElementById("kidsBack").addEventListener("click", closeKids);
    document.getElementById("coursesBack").addEventListener("click", closeCourses);
    document.getElementById("cCta").addEventListener("click", closeAll);
    Array.prototype.forEach.call(document.querySelectorAll("[data-go-counseling]"), function (a) {
      a.addEventListener("click", closeAll);
    });
    Array.prototype.forEach.call(document.querySelectorAll("a.drop-item"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openCourses(a.getAttribute("href").slice(1));
      });
    });
    document.getElementById("navCourses").addEventListener("click", function (e) {
      e.preventDefault();
      if (touch) {
        closeStage(); closeKids(); closeCourses(); closeFeatures();
        drop.classList.remove("dismiss");
        drop.classList.toggle("open");
      } else {
        openCourses();
      }
    });
    document.getElementById("navCta").addEventListener("click", closeAll);
    document.getElementById("logo").addEventListener("click", function (e) {
      e.preventDefault();
      closeAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.addEventListener("click", function (e) {
      if (!drop.contains(e.target)) closeDrop();
      if (!menuWrap.contains(e.target) && menuWrap.classList.contains("open")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  })();

  // Kidsページのお問い合わせフォーム
  (function () {
    var form = document.getElementById("kidsForm");
    var thanks = document.getElementById("kidsThanks");
    var btn = document.getElementById("kidsSubmit");
    var nameEl = document.getElementById("kf-name");
    var emailEl = document.getElementById("kf-email");
    var errName = document.getElementById("kerr-name");
    var errEmail = document.getElementById("kerr-email");
    var errForm = document.getElementById("kerr-form");
    var label = btn.textContent;

    function validate() {
      var ok = true;
      errName.textContent = "";
      errEmail.textContent = "";
      errForm.textContent = "";
      if (!nameEl.value.trim()) { errName.textContent = "お名前を入力してください。"; ok = false; }
      var mail = emailEl.value.trim();
      if (!mail) {
        errEmail.textContent = "メールアドレスを入力してください。";
        ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        errEmail.textContent = "メールアドレスの形式を確認してください。(例: name@example.com)";
        ok = false;
      }
      if (!ok) { (nameEl.value.trim() ? emailEl : nameEl).focus(); }
      return ok;
    }
    function showThanks(sent) {
      form.hidden = true;
      thanks.hidden = false;
      document.getElementById("kidsPreviewNote").hidden = sent;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      if (!FORM_ENDPOINT) { showThanks(false); return; }
      btn.disabled = true;
      btn.textContent = "送信中…";
      sendForm(form)
        .then(function () { showThanks(true); })
        .catch(function () {
          errForm.textContent = "送信できませんでした。時間をおいて、もう一度お試しください。";
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  })();

  // 「海外経験あり」「これから留学予定」を選ぶと、国名の入力欄が出る
  (function () {
    var past = document.getElementById("lv-past");
    var plan = document.getElementById("lv-plan");
    var wPast = document.getElementById("w-past");
    var wPlan = document.getElementById("w-plan");
    function sync() {
      wPast.hidden = !past.checked;
      wPlan.hidden = !plan.checked;
    }
    past.addEventListener("change", sync);
    plan.addEventListener("change", sync);
    sync();
  })();

  // ================================================================
  // オープニング(大阪から世界へ)と、トップの文字の演出
  // 所要時間は、下の T_ から始まる数字(ミリ秒)で調整できます。
  // ================================================================
  (function () {
    var root = document.documentElement;
    var intro = document.getElementById("intro");

    // 文字を1文字ずつに分ける(見出し・キャッチコピー用)
    function splitText(el) {
      if (!el) return;
      var i = 0;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var txt = node.nodeValue;
        if (!txt.trim()) return;
        var inW = node.parentNode.classList && node.parentNode.classList.contains("w");
        var parts = inW ? [txt] : txt.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var holder = inW ? frag : document.createElement("span");
          if (!inW) holder.className = "w";
          Array.from(part).forEach(function (c) {
            var s = document.createElement("span");
            s.className = "ch";
            s.setAttribute("aria-hidden", "true");
            s.style.setProperty("--i", i++);
            s.textContent = c;
            holder.appendChild(s);
          });
          if (!inW) frag.appendChild(holder);
        });
        node.parentNode.replaceChild(frag, node);
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-split]"), splitText);
    splitText(document.getElementById("introCatch"));
    root.classList.add("split");

    // トップの演出を始める(飛行ルートの光も動かす)
    function heroGo() {
      if (root.classList.contains("hero-go")) return;
      root.classList.add("hero-go");
      var fl = document.querySelectorAll(".flyer");
      Array.prototype.forEach.call(fl, function (f, n) {
        setTimeout(function () {
          Array.prototype.forEach.call(f.children, function (a) { try { a.beginElement(); } catch (e) {} });
        }, 3600 + n * 1500);
      });
    }

    if (!intro || !root.classList.contains("intro-on")) {
      requestAnimationFrame(function () { requestAnimationFrame(heroGo); });
      return;
    }

    try { sessionStorage.setItem("jayIntroSeen", "1"); } catch (e) {}

    // ---- 時間の設定(ミリ秒) ----
    var T_ZOOM_START = 200;    // 日本から引いていく動きの開始
    var T_ZOOM_END = 2300;     // 世界が見える位置に着く
    var T_COPY = 1900;         // キャッチコピーが出始める
    var T_LEAVE = 4300;        // サイトへ切り替わり始める
    var T_WIPE = 1100;         // 切り替えにかかる時間

    var canvas = document.getElementById("introCanvas");
    var ctx = canvas.getContext && canvas.getContext("2d");
    var started = 0, raf = 0, leaving = false, done = false, copyShown = false;

    function cleanup() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("keydown", onKey);
      if (intro.parentNode) intro.parentNode.removeChild(intro);
      root.classList.remove("intro-on");
    }
    function leave() {
      if (leaving) return;
      leaving = true;
      if (!copyShown) { copyShown = true; intro.classList.add("show-copy"); }
      intro.classList.add("leaving");
      setTimeout(heroGo, 450);
      setTimeout(cleanup, T_WIPE + 150);
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter") leave(); }
    document.getElementById("introSkip").addEventListener("click", leave);
    document.addEventListener("keydown", onKey);

    if (!ctx) { setTimeout(leave, 600); return; }

    // ---- 点で描いた世界地図(1度ごと。経度150°を中心に置き、日本が左・北米が右に来る) ----
    var COLS = 360, ROWS = 138, LAT_TOP = 80, CENTER = 150;
    function decode(b64) {
      var bin = atob(b64), a = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
      return a;
    }
    var landBits = decode("AAAAAAAAAAAAAOD//wP8//////8BAACAfx4AAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAA4+I73//n///////8AAAAAfwAAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAOAQACDwP4D///////8BAAAAPAQAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAADzAgPP5H8D//////38AAAAAAAAAAAAA4AEAAAD+DwAAAAAAAAAAAAAAAAAAAIC/g7PfBwAA/v////8AAAAAAAAAAADgBwAAwP//PwAA4B8AAAAAAAAAAAAAAAAMAAB8AgAA+P////8AAAAAAAAAAABwAAAA/P//AwAAAAAAAAAAAAAAAAAAAP8Ahvc5OwAA8P///38AAAAAAAAAAAAcAADg////34cHAAcAAAAAAAAAAAAAgN9/xzf8RwAA4P///z8AAAAAAAAAAAAPAB7g//////8fgD8AAAAAAQAAAAAAAO//B3f8/wsA4P///z8AAAAAAAAAAAAPAG////////8f2f8HAAAAAAD4HwAAAAD4H/D4/38A4P///xMAAAAAAPAHAAAAgN//////////////DwAAAAD+///h/4//H+/Bg/8BwP7//w8AAAAAwP8fAAAAj9///////////////88/A+D///////8DB8TPB/4AAP///wAAAAAA8P//AwDjf77/////////////////DwD////////////vh/kPwP//BwAAAAAA/P//H/P//5//////////////////34H8////////////Afw/gP//AQAQAAAA/v8fH////+///////////////////vD///////////9fAPwYgP8PAOA/AAAA/+N/8P//////////////////////QID4///////////Pw/0DAP8HAMAfAACA//F//v////////////////////8/AAP4///////////BBPAHAP4HAAAAAADg//z///////////////////////9/AID///////////8AQ4ABAPwBAAAAAAD8P/7///////////////////////9fAMD//////////z8AwA8AAPgBAAAAAAD+H/7/////////////////////Of8BAID///z//////z8AwD8AAMABAAAAAAD+P/z///////////////////9/wH8AAAD8MwD//////x8AwH8MAAAAAAAAAAD+P2D///////////////////95cAAAAACAAwD8/////38AwP8eAAAAAAAAgAGcH/D//////////////////wEAOAAAAADADgDA/////38AgP8/AAAAAAAAwANAH/T//////////////////wAAfgAAAAAwAAAA//////8PgP8/AAAAAAAAwAFwD/7/////////////////PwAAfwAAAAAGAAAA//////8/wP//AAAAAAAAwAOwA/7/////////////////DwCAPwAAAIAAAAAA/v//////8///BwAAAAAAOAcgcP//////////////////HwAAHwAAAAAAAACA+P//////4///DwAAAAAAOA74/////////////////////wUADwAAAAAAAAAA8P//////4///DwAAAAAAGD///////////////////////wUAAwAAAAAAAAAA8P//////7///FwAAAAAAAB///////////////////////wUAAgAAAAAAAAAA0P//////////DAAAAAAAgOH//////////////////////w0AAAAAAAAAAAAAYP////////8xLAAAAAAAAPz//////////////////////wwAAAAAAAAAAAAAAP7//////38HfgAAAAAAgP///////////////////////wQAAAAAAAAAAAAAAP3///////8HUAAAAAAAAP7/////////////////////fwQAAAAAAAAAAAAAAP////////+XAAAAAAAAAPz///93/D/+////////////PwwAAAAAAAAAAAAAAP////////9/AAAAAAAAAPj//f9j/g/+////////////HwAAAAAAAAAAAAAAAP////////8MAAAAAAAAAPj/+P8B/Mf/////////////DwQAAAAAAAAAAAAAAP///////z8AAAAAAAAAcPzH8/8A8I//////////////Bx4AAAAAAAAAAAAAAP///////x8AAAAAAAAA+H+Aw/8AwA/+//////////9/AA8AAAAAAAAAAAAAAP///////x8AAAAAAAAA+D8Aj//w4R/8//////////8/AAAAAAAAAAAAAAAAAP///////wMAAAAAAAAA+B8wuE/+/z/+/////////98fAAMAAAAAAAAAAAAAAP///////wMAAAAAAAAA+A8wEMf//x/+/////////0cOAAMAAAAAAAAAAAAAAP7//////wEAAAAAAAAA+A8AAM7//x/8/////////wMOAAMAAAAAAAAAAAAAAP7//////wAAAAAAAAAA+AcABob//z/8/////////zccwAEAAAAAAAAAAAAAAPz//////wAAAAAAAAAAQOB/AAQ2/////////////x8c8AEAAAAAAAAAAAAAAPj//////wAAAAAAAAAAQPx/AAAA/////////////w8Y/gEAAAAAAAAAAAAAAPD/////fwAAAAAAAAAA4P8/AAAA/////////////w+EGwAAAAAAAAAAAAAAAMD/////HwAAAAAAAAAA8P9/AACA/////////////x/AAwAAAAAAAAAAAAAAAID/////DwAAAAAAAAAA+P//BwaA/////////////x/AAAAAAAAAAAAAAAAAAID9////BwAAAAAAAAAA/P//D3+E/////////////z9AAAAAAAAAAAAAAAAAAAD5////BwAAAAAAAAAA/P//f////////////////x8AAAAAAAAAAAAAAAAAAADy/x8GBgAAAAAAAAAA/P/////v/8///////////z8AAAAAAAAAAAAAAAAAAAD0/w8ABgAAAAAAAAAA/v////+//4///////////z8AAAAAAAAAAAAAAAAAAADu/wcADgAAAAAAAACA//////8f/x/+/////////x8AAAAAAAAAAAAAAAAAAACI/wcALAAAAAAAAADA//////8//z/g/////////w8AAAAAAAAAAAAAAAAAAACQ/wcACAAAAAAAAADg//////9//r+A/////////wcAAAAAAAAAAAAAAAAAAAAQ/wMAAAAAAAAAAADg//////9//n8cgP///////ycAAAAAAAAAAAAAAAAAAAAA/gMAAAAAAAAAAADw////////+P9/AP///////xEAAAAAAAAAAAAAAAAAAAAA/AMAHQAAAAAAAADw////////+P//APz/f///fxAAAAAAAAAAAAAAAAAAAAAA+AcAYAAAAAAAAAD4////////+f9/APz/B///BgAAAAAAAAAAAAAAAAAAAAAA/AccgAEAAAAAAADw////////8f9/AOD/B/5/AAAAAAAAAAAAAAAAAQAAAAAA+A8eADgAAAAAAADw////////4f8/AOD/Afw/BgAAAAAAAAAAAAAAAAAAAAAA8J8PAPwCAAAAAADw////////4/8fAOD/APw/AgAAAAAAAAAAAAAAAAAAAAAAgP8PAAAAAAAAAADw////////x/8HAOB/APx/ADAAAAAAAAAAAAAAAAAAAAAAAP4PAAAAAAAAAAD4////////h/8BAOA/APz/ADAAAAAAAAAAAAAAAAAAAAAAAID/AAAAAAAAAAD4////////j/8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAAD/AQAAAAAAAAD4////////nx8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAD4////////vwcAAIAPAMD/AcAAAAAAAAAAAAAAAAAAAAAAAADgAQAAAAAAAAD4////////fwAAAIAPAMD8AQABAAAAAAAAAAAAAAAAAAAAAADAAAgAAAAAAADw////////f2AAAAAPAID4AUACAAAAAAAAAAAAAAAAAAAAAADAAe9TAAAAAADg/////////34AAAAPAEBwAAgAAAAAAAAAAAAAAAAAAAAAAAAAE+9/AAAAAADA/////////38AAAAXAEAgAAQCAAAAAAAAAAAAAAAAAAAAAAAAz///AAAAAACA/////////z8AAAASAMAAAIACAAAAAAAAAAAAAAAAAAAAAAAAyP//AQAAAACA/////////z8AAAAwAIAAAEAHAAAAAAAAAAAAAAAAAAAAAAAAgP//AwAAAAAA/v///////x8AAAAwAAADAAMBAAAAAAAAAAAAAAAAAAAAAAAAwP//fwAAAAAA/A/+/////x8AAAAAAAAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wAAAAAAEAD8/////w8AAAAAADAGwAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wEAAAAAAADA/////wcAAAAAAGAG4AEAAAAAAAAAAAAAAAAAAAAAAAAA4P///wEAAAAAAADA/////wMAAAAAAMAM+AMAAAAAAAAAAAAAAAAAAAAAAAAA4P///wMAAAAAAADg/////wEAAAAAAIAL/gMQAAAAAAAAAAAAAAAAAAAAAAAA8P///wMAAAAAAADg////fwAAAAAAAIAH/vMQAAAAAAAAAAAAAAAAAAAAAAAA8P///wcAAAAAAADg////PwAAAAAAAAAP/gMAAQAAAAAAAAAAAAAAAAAAAAAA+P///38AAAAAAADg////PwAAAAAAAAAO/DmAAwAAAAAAAAAAAAAAAAAAAAAA+P///38BAAAAAADA////HwAAAAAAAAA+/DkA8gAAAAAAAAAAAAAAAAAAAAAA8P////8fAAAAAACA////DwAAAAAAAAA8wChE/gcAAAAAAAAAAAAAAAAAAAAA+P////8/AAAAAACA////BwAAAAAAAAA4AEAA8B8AAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAAAwAEAAxD8NAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAADAAQAAxP+AAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA/v//BwAAAAAAAACAHwAAwH8ABAAAAAAAAAAAAAAAAAAA4P//////AQAAAAAA/v//BwAAAAAAAAAAQFYEAMcAAAAAAAAAAAAAAAAAAAAA4P//////AAAAAAAA/v//DwAAAAAAAAAAAAgBAIABMAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/v//DwAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAgP////9/AAAAAAAA/P//DwAAAAAAAAAAAAAAAQQAAAAAAAAAAAAAAAAAAAAAgP////8/AAAAAAAA/v//HyAAAAAAAAAAAACAHwQAAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA/v//HyAAAAAAAAAAAADADwwAAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA////HzAAAAAAAAAAAADsDxwAAAAAAAAAAAAAAAAAAAAAAP7///8fAAAAAAAA////DzgAAAAAAAAAAAD/DxwAAAAAAAAAAAAAAAAAAAAAAPj///8fAAAAAAAA////Dz8AAAAAAAAAAAD/Pz4AAAiAAAAAAAAAAAAAAAAAAOD///8fAAAAAAAA////Ax8AAAAAAAAAAMD//z4AAABAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA////AB8AAAAAAAAAAMD//z8AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAOD//38AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAPz///8BAAEAAAAAAAAAAAAAAAAAAMD///8HAAAAAAAA/P9/gA8AAAAAAAAAgP////8BAAIAAAAAAAAAAAAAAAAAAMD///8DAAAAAAAA/P//gA8AAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAMD//38AAAAAAAAA/P9/AA8AAAAAAAAAwP////8HAAAAAAAAAAAAAAAAAAAAAOD//x8AAAAAAAAA+P9/AAcAAAAAAAAA4P////8PAAAAAAAAAAAAAAAAAAAAAOD//w8AAAAAAAAA+P8fAAIAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAA4P////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA8P8PAAAAAAAAAAAAgP////8/AAAAAAAAAAAAAAAAAAAAAOD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wEAAAAAAAAAwP8DAAAAAAAAAAAAAP////8fAAAAAAAAAAAAAAAAAAAAAOD//wAAAAAAAAAAwP8BAAAAAAAAAAAAAP8D/P8PAAAAAAAAAAAAAAAAAAAAAPD/fwAAAAAAAAAAwH8AAAAAAAAAAAAAgP8A2P8HAAAAAAAAAAAAAAAAAAAAAPD/OwAAAAAAAAAAgAEAAAAAAAAAAAAAAAcA6P8HAAAAAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8DAAACAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAEAAAAAAAAAAAAAAAAAPz/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAIAAAAAAAAAAAAAAAAAPj/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAAA4AAAAAAAAAAAAAAAAAPg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAPw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAALAAAAAAAAAAAAAAAAAPwfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAIADAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAMABAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAP4DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    var jpBits = decode("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    function projX(lon) { return ((lon - CENTER + 540) % 360) - 180; }
    var OSK = { x: projX(135.5), y: -34.7 };

    var cnt = 0, k;
    for (k = 0; k < ROWS * COLS; k++) { if ((landBits[k >> 3] >> (k & 7)) & 1) cnt++; }
    var DX = new Float32Array(cnt), DY = new Float32Array(cnt), DD = new Float32Array(cnt), FL = new Uint8Array(cnt);
    var n = 0, r, c;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        k = r * COLS + c;
        if (!((landBits[k >> 3] >> (k & 7)) & 1)) continue;
        var x = projX(-180 + c + 0.5), y = -(LAT_TOP - r - 0.5);
        DX[n] = x; DY[n] = y;
        DD[n] = Math.sqrt((x - OSK.x) * (x - OSK.x) + (y - OSK.y) * (y - OSK.y));
        FL[n] = (((jpBits[k >> 3] >> (k & 7)) & 1) ? 1 : 0) | ((r % 2 === 0 && c % 2 === 0) ? 2 : 0) | ((r % 3 === 0 && c % 3 === 0) ? 4 : 0);
        n++;
      }
    }

    // ---- 飛んでいく先 ----
    // lift=上にふくらむ量、side=東(右)にふくらむ量(距離に対する割合)。start/dur=出発時刻と所要時間(ミリ秒)
    function pt(lon, lat) { return { x: projX(lon), y: -lat }; }
    var DEST = [
      { name: "UK", p: pt(-0.1, 51.5), start: 500, dur: 1700, lift: 0.32, side: 0, always: true },
      { name: "VANCOUVER", p: pt(-123.1, 49.3), start: 650, dur: 1850, lift: 0.30, side: 0, always: true },
      { name: "PHILIPPINES", p: pt(121, 14.6), start: 400, dur: 1000, lift: 0.20, side: 0, ox: -12, align: "right" },
      { name: "AUSTRALIA", p: pt(151.2, -33.9), start: 800, dur: 1500, lift: 0.05, side: 0.18, ox: -12, align: "right" },
      { name: "NEW ZEALAND", p: pt(174.8, -36.8), start: 950, dur: 1500, lift: 0.05, side: 0.20, ox: 12, align: "left" }
    ];
    DEST.forEach(function (d) {
      var dx = d.p.x - OSK.x, dy = d.p.y - OSK.y, dist = Math.sqrt(dx * dx + dy * dy);
      d.c = { x: (OSK.x + d.p.x) / 2 + dist * (d.side || 0), y: (OSK.y + d.p.y) / 2 - dist * d.lift };
    });
    function bez(d, t) {
      var u = 1 - t;
      return { x: u * u * OSK.x + 2 * u * t * d.c.x + t * t * d.p.x, y: u * u * OSK.y + 2 * u * t * d.c.y + t * t * d.p.y };
    }

    var W = 0, H = 0, dpr = 1, s0 = 20, s1 = 4, stride = 1;
    var END_X = (DEST[0].p.x + DEST[1].p.x) / 2, END_Y = -14;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      s1 = Math.min(W * 0.94 / 270, H * 0.92 / 118);
      s0 = Math.max(s1 * 5.5, W * 0.55 / 18);
      stride = s1 < 1.9 ? 3 : (s1 < 3.4 ? 2 : 1);
    }
    resize();
    window.addEventListener("resize", resize);

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      if (done) return;
      if (!started) started = now;
      var t = now - started;
      try {
        draw(t);
      } catch (err) { if (window.console) console.error(err); leave(); return; }
      if (!copyShown && t >= T_COPY) { copyShown = true; intro.classList.add("show-copy"); }
      if (!leaving && t >= T_LEAVE) leave();
      raf = requestAnimationFrame(frame);
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = clamp(t / 500, 0, 1);

      var e = easeInOut(clamp((t - T_ZOOM_START) / (T_ZOOM_END - T_ZOOM_START), 0, 1));
      var ep = Math.pow(e, 1.5);
      var s = s0 * Math.pow(s1 / s0, e);
      var cx = OSK.x + (END_X - OSK.x) * ep, cy = OSK.y + (END_Y - OSK.y) * ep;
      var ox = W / 2 - cx * s, oy = H / 2 - cy * s;
      var R = (t / 2200) * 260;                       // 日本から広がっていく波
      var rad = Math.min(2.6, Math.max(0.8, s * 0.24));

      var pFull = new Path2D(), pEdge = new Path2D(), pJp = new Path2D();
      for (var i = 0; i < cnt; i++) {
        var f = FL[i], isJp = f & 1;
        if (!isJp) {
          if (DD[i] > R) continue;
          if (stride === 3 ? !(f & 4) : (stride === 2 && !(f & 2))) continue;
        }
        var sx = ox + DX[i] * s, sy = oy + DY[i] * s;
        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) continue;
        var path = isJp ? pJp : ((R - DD[i]) < 16 ? pEdge : pFull);
        path.moveTo(sx + rad, sy);
        path.arc(sx, sy, rad, 0, 6.2832);
      }
      ctx.fillStyle = "rgba(243,238,229,.12)"; ctx.fill(pEdge);
      ctx.fillStyle = "rgba(243,238,229,.30)"; ctx.fill(pFull);
      ctx.fillStyle = "#efb878"; ctx.fill(pJp);

      // 大阪から広がる波紋
      var oX = ox + OSK.x * s, oY = oy + OSK.y * s;
      var j, ph;
      for (j = 0; j < 3; j++) {
        ph = ((t / 1300) + j / 3) % 1;
        ctx.beginPath();
        ctx.arc(oX, oY, 5 + ph * 46, 0, 6.2832);
        ctx.strokeStyle = "rgba(239,184,120," + ((1 - ph) * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 飛行ルート
      DEST.forEach(function (d) {
        var p = clamp((t - d.start) / d.dur, 0, 1);
        if (p <= 0) return;
        var pe = easeOut(p), N = 90, m, q, a, b;
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(239,184,120,.5)"; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (m = 0; m <= N; m++) {
          q = bez(d, (m / N) * pe);
          a = ox + q.x * s; b = oy + q.y * s;
          if (m === 0) ctx.moveTo(a, b); else ctx.lineTo(a, b);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,243,220,.95)"; ctx.lineWidth = 2;
        ctx.beginPath();
        var t0 = Math.max(0, pe - 0.16);
        for (m = 0; m <= 24; m++) {
          q = bez(d, t0 + (pe - t0) * (m / 24));
          a = ox + q.x * s; b = oy + q.y * s;
          if (m === 0) ctx.moveTo(a, b); else ctx.lineTo(a, b);
        }
        ctx.stroke();
        var h = bez(d, pe), hx = ox + h.x * s, hy = oy + h.y * s;
        if (p < 1) {
          ctx.fillStyle = "rgba(239,184,120,.14)"; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(239,184,120,.3)"; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#fff3dc"; ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, 6.2832); ctx.fill();
        } else {
          var dx2 = ox + d.p.x * s, dy2 = oy + d.p.y * s;
          var pulse = clamp((t - d.start - d.dur) / 900, 0, 1);
          ctx.fillStyle = "#efb878"; ctx.beginPath(); ctx.arc(dx2, dy2, 3, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(239,184,120," + ((1 - pulse) * 0.6).toFixed(3) + ")"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(dx2, dy2, 4 + pulse * 20, 0, 6.2832); ctx.stroke();
          if (d.name && (d.always || s1 >= 3)) label(d.name, dx2 + (d.ox || 0), dy2 + (d.align ? 4 : 20), clamp((t - d.start - d.dur) / 500, 0, 1), d.align);
        }
      });

      // 大阪の点と文字
      ctx.fillStyle = "#efb878"; ctx.beginPath(); ctx.arc(oX, oY, 3.6, 0, 6.2832); ctx.fill();
      label("OSAKA", oX, oY + 22, clamp((t - 600) / 500, 0, 1));
      ctx.globalAlpha = 1;
    }

    function label(text, x, y, a, align) {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.font = "500 11px Jost, 'Helvetica Neue', Arial, sans-serif";
      if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
      ctx.textAlign = align || "center";
      ctx.fillStyle = "#f3eee5";
      ctx.fillText(text, align ? x : x + 1.5, y);
      ctx.restore();
    }

    raf = requestAnimationFrame(frame);
    // 保険:何があっても7秒でサイトに切り替える
    setTimeout(leave, 7000);
  })();
