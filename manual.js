/* ==========================================================================
   Ploto Manual - Application Control Logic
   ========================================================================== */

import locales from "./locales/index.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Management ---
  const BASE = "/ploto_LP/";
  let currentLang = document.documentElement.lang || "ja";
  let currentTheme = localStorage.getItem("ploto-theme") || "light";

  const supportedLangs = ["ja", "en", "de", "fr", "ko"];
  const languageShortLabels = {
    ja: "JA",
    en: "EN",
    de: "DE",
    fr: "FR",
    ko: "KO"
  };

  // 現在表示されているファイル名（gantt.html, kanban.html, matrix.html など）を抽出
  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1] || "gantt.html";

  // 言語切替時の遷移先URLの決定
  const urlForLang = (lang) => {
    if (lang === "ja") {
      return `${BASE}manual/${fileName}`;
    } else {
      return `${BASE}${lang}/manual/${fileName}`;
    }
  };

  // --- 2. Theme Management ---
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    currentTheme = theme;
    localStorage.setItem("ploto-theme", theme);
  }

  if (!localStorage.getItem("ploto-theme")) {
    applyTheme("light");
  } else {
    applyTheme(currentTheme);
  }

  // Toggle Theme Button
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  // --- 3. Language Switcher ---
  const langSwitcher = document.getElementById("lang-switcher");
  const langToggleBtn = document.getElementById("lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const langOptions = langMenu ? langMenu.querySelectorAll(".lang-option") : [];

  function openLangMenu() {
    if (langSwitcher && langToggleBtn) {
      langSwitcher.classList.add("is-open");
      langToggleBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeLangMenu() {
    if (langSwitcher && langToggleBtn) {
      langSwitcher.classList.remove("is-open");
      langToggleBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (langSwitcher && langSwitcher.classList.contains("is-open")) {
        closeLangMenu();
      } else {
        openLangMenu();
      }
    });
  }

  langOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      if (supportedLangs.includes(lang) && lang !== currentLang) {
        window.location.href = urlForLang(lang);
        return;
      }
      closeLangMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (langSwitcher && !langSwitcher.contains(e.target)) {
      closeLangMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLangMenu();
    }
  });

  // --- 4. Mobile Navigation Drawer ---
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMobile = document.getElementById("nav-mobile");

  if (hamburgerBtn && navMobile) {
    hamburgerBtn.addEventListener("click", () => {
      const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", !expanded);
      navMobile.classList.toggle("is-open");
    });

    // モバイルメニュー内のリンクをクリックした時、ドロワーを閉じる
    navMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburgerBtn.setAttribute("aria-expanded", "false");
        navMobile.classList.remove("is-open");
      });
    });
  }
});
