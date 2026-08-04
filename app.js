/* ==========================================================================
   Ploto LP - Application Control Logic
   ========================================================================== */

import locales from "./locales/index.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Management ---
  // 初期言語は「ページが持つ言語」(<html lang>) を正とする。
  // 各言語は別URLでプリレンダリングされており、これによりSSR内容とJSの再適用が一致する。
  const BASE = "/ploto_LP/";
  const urlForLang = (lang) => (lang === "ja" ? BASE : `${BASE}${lang}/`);
  let currentLang = (document.documentElement.getAttribute("lang") || "ja").split("-")[0].toLowerCase();
  let currentTheme = localStorage.getItem("ploto-theme") || "light";
  const screenshotNames = ["01-gantt.png", "02-kanban.png", "03-matrix.png", "04-darkmode.png"];
  let screenshotIndex = 0;
  let slideshowInterval = null;

  // --- 2. Translation Dictionary ---
  const localesData = locales;
  const supportedLangs = ["ja", "en", "de", "fr", "ko"];
  // 切替ボタンに表示する現在言語の短縮ラベル
  const languageShortLabels = {
    ja: "JA",
    en: "EN",
    de: "DE",
    fr: "FR",
    ko: "KO"
  };

  // --- 3. Initialization / Theme & Lang Application ---
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    currentTheme = theme;
    localStorage.setItem("ploto-theme", theme);

    // Microsoft Store バッジのテーマを連動させる
    const storeBadge = document.querySelector("ms-store-badge");
    if (storeBadge) {
      storeBadge.setAttribute("theme", theme);
    }
  }

  // OS theme detection (初期表示はOS設定に関わらず常にライトモードを優先)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  if (!localStorage.getItem("ploto-theme")) {
    applyTheme("light");
  } else {
    applyTheme(currentTheme);
  }

  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("ploto-theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  // Toggle Theme Button
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  // Microsoft Store バッジのクリックイベントをインターセプトしてWebサイトを開く
  // (Storeアプリの強制起動やインストーラー自動DLを防ぎ、安全にブラウザでストアを開く)
  document.addEventListener("click", (e) => {
    const badge = e.target.closest("ms-store-badge");
    if (badge) {
      e.preventDefault();
      e.stopPropagation();

      // 現在表示中の言語に合わせたMicrosoft Storeのロケールパスをマッピング
      const storeLocale = {
        ja: "ja-jp",
        en: "en-us",
        de: "de-de",
        fr: "fr-fr",
        ko: "ko-kr"
      }[currentLang] || "en-us";

      window.open(`https://apps.microsoft.com/${storeLocale}/detail/9n4njnmt2b77`, "_blank");
    }
  }, true); // キャプチャリングフェーズで先に処理を奪う

  // Language Switcher (dropdown)
  const langSwitcher = document.getElementById("lang-switcher");
  const langToggleBtn = document.getElementById("lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const langOptions = langMenu ? langMenu.querySelectorAll(".lang-option") : [];

  function openLangMenu() {
    langSwitcher.classList.add("is-open");
    langToggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeLangMenu() {
    langSwitcher.classList.remove("is-open");
    langToggleBtn.setAttribute("aria-expanded", "false");
  }

  // ボタンクリックで開閉トグル
  langToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (langSwitcher.classList.contains("is-open")) {
      closeLangMenu();
    } else {
      openLangMenu();
    }
  });

  // 各言語オプションを選択
  langOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      // 言語切替は該当言語のURLへ遷移（URL=言語の正 を維持）
      if (supportedLangs.includes(lang) && lang !== currentLang) {
        location.href = urlForLang(lang);
        return;
      }
      closeLangMenu();
    });
  });

  // メニュー外クリック・Escキーで閉じる
  document.addEventListener("click", (e) => {
    if (!langSwitcher.contains(e.target)) {
      closeLangMenu();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLangMenu();
    }
  });

  function applyLanguage(lang) {
    const locale = localesData[lang] || localesData.ja;
    currentLang = lang;
    localStorage.setItem("ploto-lang", lang);
    
    // 切替ボタンには現在の言語を表示し、メニューの選択中項目をハイライト
    langToggleBtn.querySelector(".lang-text").textContent = languageShortLabels[lang];
    langOptions.forEach((option) => {
      option.classList.toggle("active", option.getAttribute("data-lang") === lang);
    });

    // Replace data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (locale.i18n[key]) {
        el.innerHTML = locale.i18n[key];
      }
    });

    // Replace inputs with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (locale.i18n[key]) {
        el.setAttribute("placeholder", locale.i18n[key]);
      }
    });

    // Set page title & description
    document.title = locale.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", locale.meta.description);
    }

    // Update <html lang> so crawlers & screen readers see the active language
    document.documentElement.lang = locale.locale || lang;

    // Update hero screenshot language based on current locale settings
    const heroScreenshot = document.getElementById("hero-screenshot");
    if (heroScreenshot) {
      heroScreenshot.src = `${BASE}assets/screenshots/${locale.screenshotFolder}/${screenshotNames[screenshotIndex]}`;
    }
  }

  // --- 4. Feedback Form Submission Handler ---
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackSuccessMsg = document.getElementById("feedback-success-msg");

  if (feedbackForm && feedbackSuccessMsg) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const btn = document.getElementById("btn-submit-feedback");
      const originalText = btn.innerHTML;
      btn.disabled = true;
      const feedbackLocale = localesData[currentLang] || localesData.ja;
      btn.textContent = feedbackLocale.i18n.feedback_sending;

      const action = feedbackForm.getAttribute("action");

      // Default placeholder handling (simulate success on local tests)
      if (action.includes("feedback-placeholder@ploto.app")) {
        setTimeout(() => {
          feedbackForm.style.display = "none";
          feedbackSuccessMsg.style.display = "block";
          btn.disabled = false;
          btn.innerHTML = originalText;
        }, 1000);
      } else {
        // Real submission using fetch (suitable for FormSubmit or typical API)
        const formData = new FormData(feedbackForm);
        fetch(action, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            feedbackForm.style.display = "none";
            feedbackSuccessMsg.style.display = "block";
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert(currentLang === "ja" 
            ? "送信中にエラーが発生しました。設定を確認してください。" 
            : "An error occurred while sending. Please verify your action URL."
          );
        })
        .finally(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
        });
      }
    });
  }

  // --- 5. Hero Visual Slideshow Logic ---
  function startScreenshotSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    
    slideshowInterval = setInterval(() => {
      const heroScreenshot = document.getElementById("hero-screenshot");
      if (!heroScreenshot) return;

      screenshotIndex = (screenshotIndex + 1) % screenshotNames.length;
      
      // Smooth fade transition
      heroScreenshot.style.opacity = "0";
      
      setTimeout(() => {
        heroScreenshot.src = `${BASE}assets/screenshots/${currentLang === "ja" ? "ja-jp" : "en-us"}/${screenshotNames[screenshotIndex]}`;
        heroScreenshot.style.opacity = "1";
      }, 300);
    }, 5000); // 5 seconds per slide
  }

  // --- 6. Initial Invocation ---
  applyLanguage(currentLang);
  // Start visual slideshow
  startScreenshotSlideshow();

  // --- 7. ハンバーガーメニュー開閉制御 ---
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMobile = document.getElementById("nav-mobile");

  /** ドロワーを開く／閉じるをトグルする */
  function toggleMobileNav() {
    const isOpen = navMobile.classList.toggle("is-open");
    hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    hamburgerBtn.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    // スクロール禁止はメニューが開いているときのみ
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  /** ドロワーを明示的に閉じる */
  function closeMobileNav() {
    navMobile.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "メニューを開く");
    document.body.style.overflow = "";
  }

  if (hamburgerBtn && navMobile) {
    hamburgerBtn.addEventListener("click", toggleMobileNav);

    // ドロワー内のリンクをタップしたら閉じる
    navMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* ==========================================================================
     主要機能セクション: 同じ1件が画面ごとに姿を変えるジャーニー
     --------------------------------------------------------------------------
     マークアップの既定は「モック → 説明」の縦並び。motion許可時は幅を問わず
     data-enhanced を立て、sticky と flyer（タスクが飛ぶ演出）を有効にする。
     説明パネルの固定表示・段階フェード・モックの縮小は 901px 以上だけ
     styles.css 側のメディアクエリで効かせる（モバイルは通常フローのまま）。
     ========================================================================== */
  const journey = document.getElementById("task-journey");

  if (journey) {
    const steps = Array.from(journey.querySelectorAll(".journey-step"));
    const anchors = steps.map((step) => step.querySelector("[data-journey-anchor]"));
    const screens = steps.map((step) => step.querySelector(".journey-screen"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const ease = (value) => value * value * (3 - 2 * value);
    /* ステップ内の進行度 p は「モックが sticky で止まっていられる範囲」で
       正規化する（p=1 が、モックが上へ流れ出す瞬間）。フェードアウト完了を
       p=1 より手前に置けば、説明が消えきるまでモックは動かない。 */
    const STICKY_TOP = 80 + 24; /* ヘッダー80px + .journey-screen の top 1.5rem */
    const PANEL_IN_START = 0.05;
    const PANEL_IN_END = 0.52;
    const PANEL_OUT_START = 0.72;
    const PANEL_OUT_END = 0.90;
    const FLIGHT_START = PANEL_OUT_END;
    const SCREEN_ENTRY_END = 0.99;
    const center = (rect) => ({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    const t = (key) => localesData[currentLang]?.i18n[key]
      || localesData.ja.i18n[key]
      || "";

    if (steps.length === 5 && anchors.every(Boolean)) {
      const flyer = document.createElement("div");
      flyer.className = "journey-flyer";
      flyer.id = "journey-flyer";
      flyer.setAttribute("aria-hidden", "true");
      flyer.innerHTML = `
        <div class="jf-plate"></div>

        <div class="jf-face" data-face="gantt">
          <div class="gv-row is-sel jf-gantt-row">
            <span class="gv-name">${t("flow_task_name")}</span>
            <span class="jf-gantt-period">
              <span>${t("flow_field_period_label")}</span>
              <b>${t("flow_field_period_value")}</b>
            </span>
          </div>
        </div>

        <div class="jf-face" data-face="kanban">
          <div class="uic ac-blue">
            <div class="uic-top jf-new"><span class="uic-pill">${t("flow_field_process_value")}</span></div>
            <div class="uic-t">${t("flow_task_name")}</div>
            <div class="uic-tags jf-new"><span class="u-tag tg-front">${t("mock_tag_front")}</span></div>
            <div class="uic-foot">
              <span class="u-date"><i class="u-cal"></i>2026-08-06</span>
              <span class="uic-sp"></span>
              <span class="u-pri"><i class="u-pb">I</i>78</span>
            </div>
          </div>
        </div>

        <div class="jf-face jf-note" data-face="note">
          <div class="nv-doc jf-note-doc">
            <div class="nv-crumb">${t("mock_project")} / ${t("flow_field_process_value")}</div>
            <div class="nv-h1"><i></i><b>${t("flow_task_name")}</b></div>
            <div class="nv-meta"><span>${t("flow_field_period_value")}</span><span>${t("flow_field_process_value")}</span></div>
            <div class="jf-note-copy jf-new">
              <p><b>${t("flow_field_memo_label")}</b></p>
              <p>${t("flow_field_memo_value")}</p>
              <p>${t("mock_note_p2")}</p>
            </div>
          </div>
        </div>

        <div class="jf-face" data-face="matrix">
          <div class="uic ac-blue jf-matrix-card">
            <div class="uic-top"><span class="uic-pill">${t("flow_field_process_value")}</span><span class="uic-score jf-new">75</span></div>
            <div class="uic-t">${t("flow_task_name")}</div>
            <div class="uic-foot jf-new"><span class="u-pri"><i class="u-pb">I</i>${t("flow_field_priority_value")}</span></div>
            <div class="uic-prog"><span class="u-track"><i></i></span><span class="uic-pct">0%</span></div>
          </div>
        </div>

        <div class="jf-face" data-face="whiteboard">
          <div class="wb-card jf-whiteboard-card">
            <div class="wb-card-h"><i class="u-pb">I</i><span>${t("flow_task_name")}</span></div>
            <div class="wb-card-m jf-new"><span>${t("flow_field_period_value")}</span><span>${t("mock_owner_name")}</span></div>
            <div class="wb-card-p jf-new"><span class="u-track"><i></i></span><b>0%</b></div>
          </div>
        </div>`;
      journey.append(flyer);

      const plate = flyer.querySelector(".jf-plate");
      const faces = Array.from(flyer.querySelectorAll(".jf-face"));
      let sizes = faces.map(() => ({ width: 228, height: 132 }));
      let holdLeftX = window.innerWidth * 0.3;
      let holdRightX = window.innerWidth * 0.7;
      /* 説明は nth-child(even)＝インデックスが奇数のステップで左に出る。
         着地しながら次の説明が立ち上がるので、その反対側で待たせる。 */
      const holdXFor = (targetIndex) =>
        (targetIndex % 2 === 1 ? holdRightX : holdLeftX);
      let frame = 0;

      function measureFaces() {
        const oldDisplay = flyer.style.display;
        const oldVisibility = flyer.style.visibility;
        flyer.style.display = "block";
        flyer.style.visibility = "hidden";
        sizes = faces.map((face) => ({
          width: face.offsetWidth,
          height: face.offsetHeight
        }));

        const container = journey.closest(".container")?.getBoundingClientRect();
        const widest = Math.max(...sizes.map((size) => size.width));
        const safeHalf = widest / 2 + 24;
        const left = container ? container.left : 0;
        const right = container ? container.right : window.innerWidth;
        const inset = Math.max(safeHalf, (right - left) * 0.26);
        holdLeftX = clamp(left + inset, safeHalf, window.innerWidth - safeHalf);
        holdRightX = clamp(right - inset, safeHalf, window.innerWidth - safeHalf);

        flyer.style.display = oldDisplay;
        flyer.style.visibility = oldVisibility;
      }

/* 語の長い言語（de/fr）や背の低いウィンドウでは、説明が画面からはみ出す。
         収まらないぶんだけ縮める。内容は削らない。 */
      function fitPanels() {
        const available = window.innerHeight - 80 - 56;
        steps.forEach((step) => {
          const panel = step.querySelector(".journey-panel");
          if (!panel) return;
          panel.style.removeProperty("--journey-panel-scale");
          const height = panel.offsetHeight;
          if (!height) return;
          const scale = Math.min(1, available / height);
          panel.style.setProperty("--journey-panel-scale", scale.toFixed(3));
        });
      }

      function hideFlyer() {
        flyer.style.display = "none";
        flyer.style.opacity = "0";
        flyer.classList.remove("is-active");
        faces.forEach((face) => {
          face.style.opacity = "0";
          face.classList.remove("is-incoming", "is-revealed");
        });
      }

      function clearStepState() {
        steps.forEach((step) => {
          step.classList.remove("is-current", "is-back", "is-departing", "is-arrived", "is-panel-visible");
          step.style.removeProperty("--journey-panel-opacity");
          step.style.removeProperty("--journey-panel-p");
          step.style.removeProperty("--journey-entry-y");
        });
      }

      function renderJourney() {
        frame = 0;
        if (!journey.hasAttribute("data-enhanced")) return;

        /* Read phase: step positions first, then only the two anchors involved in
           the active transition. Sticky anchors are deliberately remeasured. */
        const viewportHeight = window.innerHeight;
        const stepRects = steps.map((step) => step.getBoundingClientRect());
        /* 分母はステップの高さではなく sticky の可動域。ここを取り違えると
           p がモックの固定より速く進み、説明が消える前にモックが流れ出す。 */
        const progress = stepRects.map((rect, index) => {
          const screenHeight = screens[index]
            ? screens[index].getBoundingClientRect().height
            : 0;
          const range = Math.max(1, rect.height - screenHeight - STICKY_TOP);
          return clamp((STICKY_TOP - rect.top) / range);
        });

        let currentIndex = 0;
        stepRects.forEach((rect, index) => {
          if (rect.top <= viewportHeight * 0.5) currentIndex = index;
        });

        let transitionIndex = -1;
        for (let index = 0; index < steps.length - 1; index += 1) {
          if (progress[index] > FLIGHT_START) transitionIndex = index;
        }

        let flight = null;
        if (transitionIndex >= 0) {
          const fromRect = anchors[transitionIndex].getBoundingClientRect();
          const toRect = anchors[transitionIndex + 1].getBoundingClientRect();
          const from = center(fromRect);
          const to = center(toRect);
          const holdY = viewportHeight * 0.34;
          const startLandingY = viewportHeight * 0.78;
          const landingY = viewportHeight * 0.5;
          const a = clamp((progress[transitionIndex] - FLIGHT_START) / 0.14);
          const s = clamp(
            (startLandingY - to.y) / Math.max(1, startLandingY - landingY)
          );
          flight = { index: transitionIndex, from, to, holdY, a, s };
        }

        /* Write phase. Step-local custom properties drive the panel fade and the
           next mock's entrance; moving-task geometry stays on the fixed flyer. */
        steps.forEach((step, index) => {
          const p = progress[index];
          /* 入りは段階表示（番号→見出し→リード→要点→リンク）を CSS 側に任せるため
             進行度をそのまま渡す。出は一括なので不透明度を渡す。 */
          const panelIn = clamp(
            (p - PANEL_IN_START) / (PANEL_IN_END - PANEL_IN_START)
          );
          const fadeOut = p <= PANEL_OUT_START
            ? 1
            : 1 - ease(clamp(
              (p - PANEL_OUT_START) / (PANEL_OUT_END - PANEL_OUT_START)
            ));
          const panelOpacity = p < PANEL_IN_START ? 0 : fadeOut;

          step.style.setProperty("--journey-panel-p", panelIn.toFixed(4));
          step.style.setProperty("--journey-panel-opacity", panelOpacity.toFixed(4));
          const previousProgress = index > 0 ? progress[index - 1] : SCREEN_ENTRY_END;
          const entryProgress = ease(clamp(
            (previousProgress - PANEL_OUT_END) / (SCREEN_ENTRY_END - PANEL_OUT_END)
          ));
          const entryY = index > 0
            ? (1 - entryProgress) * viewportHeight * 0.45
            : 0;
          step.style.setProperty("--journey-entry-y", `${entryY.toFixed(2)}px`);
          step.classList.toggle("is-current", index === currentIndex);
          step.classList.toggle("is-back", p > PANEL_IN_START);
          /* フェードアウト完了までは固定したまま、以降で初めて次の移動へ進む。 */
          step.classList.toggle(
            "is-panel-visible",
            panelOpacity > 0.001
          );
          step.classList.toggle(
            "is-departing",
            !!flight && index === flight.index && flight.a > 0
          );
          step.classList.toggle(
            "is-arrived",
            !!flight && index === flight.index + 1 && flight.s >= 0.88
          );
        });

        /* s は着地点の位置で決まるので、アンカーが背の高い要素だと 1 に
           届かないことがある（ノートで実際に起きた）。次のステップの説明が
           出はじめたら、着地判定に関わらず必ず片付ける。 */
        const movedOn = flight
          && progress[flight.index + 1] > PANEL_IN_START;
        if (!flight || flight.a <= 0 || flight.s >= 1 || movedOn) {
          hideFlyer();
          return;
        }

        const sourceIndex = flight.index;
        const targetIndex = sourceIndex + 1;
        const landingEase = ease(flight.s);
        const peelEase = ease(flight.a);
        const x = flight.s > 0
          ? lerp(holdXFor(targetIndex), flight.to.x, landingEase)
          : lerp(flight.from.x, holdXFor(targetIndex), peelEase);
        const y = flight.s > 0
          ? lerp(flight.holdY, flight.to.y, landingEase)
          : lerp(flight.from.y, flight.holdY, peelEase);
        const width = lerp(sizes[sourceIndex].width, sizes[targetIndex].width, landingEase);
        const height = lerp(sizes[sourceIndex].height, sizes[targetIndex].height, landingEase);
        const peelOpacity = clamp(flight.a / 0.3);
        const landOpacity = 1 - clamp((flight.s - 0.88) / 0.12);
        const sourceOpacity = 1 - clamp((flight.s - 0.15) / 0.3);
        const targetOpacity = clamp((flight.s - 0.35) / 0.35);

        flyer.style.display = "block";
        flyer.style.visibility = "visible";
        /* contain: paint のクリップ領域を確保する。plate は補間中の寸法、
           face は自然寸法なので、両 face の大きいほうを flyer 本体に持たせる。 */
        flyer.style.width = `${Math.max(sizes[sourceIndex].width, sizes[targetIndex].width) + 72}px`;
        flyer.style.height = `${Math.max(sizes[sourceIndex].height, sizes[targetIndex].height) + 72}px`;
        flyer.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        flyer.style.opacity = String(peelOpacity * landOpacity);
        flyer.classList.add("is-active");
        plate.style.width = `${width}px`;
        plate.style.height = `${height}px`;

        faces.forEach((face, index) => {
          face.style.opacity = index === sourceIndex
            ? String(sourceOpacity)
            : index === targetIndex
              ? String(targetOpacity)
              : "0";
          face.classList.toggle("is-incoming", index === targetIndex);
          face.classList.toggle(
            "is-revealed",
            index === targetIndex && flight.s >= 0.43
          );
        });
      }

      function scheduleRender() {
        if (!frame) frame = window.requestAnimationFrame(renderJourney);
      }

      function syncEnhancement() {
        const enabled = !still.matches;
        journey.toggleAttribute("data-enhanced", enabled);
        if (enabled) {
          measureFaces();
          fitPanels();
          scheduleRender();
        } else {
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
          clearStepState();
          hideFlyer();
          /* 縦並びに戻る側では縮小も左右振りも無し。素の大きさに戻す。 */
          steps.forEach((step) => {
            step.querySelector(".journey-panel")
              ?.style.removeProperty("--journey-panel-scale");
          });
        }
      }

      window.addEventListener("scroll", scheduleRender, { passive: true });
      window.addEventListener("resize", () => {
        measureFaces();
        fitPanels();
        scheduleRender();
      });
      still.addEventListener("change", syncEnhancement);

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          measureFaces();
          fitPanels();
          scheduleRender();
        });
      }

      syncEnhancement();
    }
  }

});
