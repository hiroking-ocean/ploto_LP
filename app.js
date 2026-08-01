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

});
