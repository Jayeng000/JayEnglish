/* JAY English in Osaka — 動きの設定ファイル
   一番上の FORM_ENDPOINT が、フォームの送信先(Googleのスクリプト)です。 */
  // 送信先(Google Apps ScriptのウェブアプリのURL)を入れると、フォームの内容がそこへ送信されます。
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbyZ7Imw9wz6wyT5vKRXilIaV9w8cx0TC2JzBvx20sqPQOHYA9UMdM52WYeNbQitL_1ZGQ/exec";
  // フォームの内容を送る共通の処理(Google Apps Script用)。
  function sendForm(form) {
    return fetch(FORM_ENDPOINT, { method: "POST", body: new URLSearchParams(new FormData(form)) })
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
    var closeBtn = document.getElementById("stageClose");
    var kview = document.getElementById("kview");
    var cview = document.getElementById("cview");
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
    function closeStage() {
      if (stage.hidden) return;
      stage.hidden = true;
      setLock(false);
      try { video.pause(); } catch (e) {}
      Array.prototype.forEach.call(items, function (b) { b.removeAttribute("aria-current"); });
    }
    function closeAll() { closeStage(); closeKids(); closeCourses(); closeDrop(); closeMenu(); }

    function openStage(btn) {
      closeKids(); closeCourses(); closeDrop(); closeMenu();
      Array.prototype.forEach.call(items, function (b) { b.removeAttribute("aria-current"); });
      btn.setAttribute("aria-current", "true");
      lastItem = btn;
      title.textContent = btn.getAttribute("data-stage");
      eyebrow.textContent = btn.getAttribute("data-en");
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
      closeStage(); closeCourses(); closeDrop(); closeMenu();
      kview.hidden = false;
      kview.scrollTop = 0;
      setLock(true);
    }
    function openCourses(id) {
      closeStage(); closeKids(); closeDrop(); closeMenu();
      cview.hidden = false;
      setLock(true);
      var target = id ? document.getElementById(id) : null;
      if (target) { target.scrollIntoView({ block: "start" }); } else { cview.scrollTop = 0; }
    }

    Array.prototype.forEach.call(items, function (btn) {
      btn.addEventListener("click", function () { openStage(btn); });
    });
    closeBtn.addEventListener("click", function () {
      closeStage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (lastItem) lastItem.focus();
    });
    document.getElementById("openKids").addEventListener("click", openKids);
    document.getElementById("kidsBack").addEventListener("click", closeKids);
    document.getElementById("coursesBack").addEventListener("click", closeCourses);
    document.getElementById("cCta").addEventListener("click", closeAll);
    Array.prototype.forEach.call(document.querySelectorAll("a.drop-item"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openCourses(a.getAttribute("href").slice(1));
      });
    });
    document.getElementById("navCourses").addEventListener("click", function (e) {
      e.preventDefault();
      if (touch) {
        closeStage(); closeKids(); closeCourses();
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
