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
  let currentLang = document.documentElement.lang || "ja";
  let currentTheme = localStorage.getItem("ploto-theme") || "dark";
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

  // --- 3. DHTMLX Gantt Locale Dictionaries ---
  // Gantt locale data is provided by the individual locale modules.

  // --- 4. Interactive Demo Mock Data ---
  // --- 5. Initialization / Theme & Lang Application ---
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

  // OS theme detection
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  if (!localStorage.getItem("ploto-theme")) {
    applyTheme(prefersDark.matches ? "dark" : "light");
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

    // Refresh Gantt locale if loaded
    updateGanttLocale(lang);

    // Update hero screenshot language based on current locale settings
    const heroScreenshot = document.getElementById("hero-screenshot");
    if (heroScreenshot) {
      heroScreenshot.src = `${BASE}assets/screenshots/${locale.screenshotFolder}/${screenshotNames[screenshotIndex]}`;
    }
  }

  // --- 6. DHTMLX Gantt Demo Initialization ---
  let isGanttInitialized = false;

  function initGanttDemo() {
    if (isGanttInitialized) return;

    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.row_height = 40;
    gantt.config.scale_height = 50;
    gantt.config.grid_width = 240;

    const localeGantt = localesData[currentLang].gantt;

    // Configure grid headers & column mapping
    gantt.config.columns = [
      { name: "text", label: localeGantt.labels.column_text, width: "*", tree: true },
      { name: "duration", label: localeGantt.labels.column_duration, align: "center", width: 60 }
    ];

    // Grid config
    gantt.config.scales = [
      { unit: "month", step: 1, format: currentLang === "ja" ? "%Y年%M" : "%F, %Y" },
      { unit: "day", step: 1, format: currentLang === "ja" ? "%d" : "%j" }
    ];

    gantt.init("gantt_container");
    
    // Parse respective language data initially
    gantt.parse(localeGantt.data);

    isGanttInitialized = true;
  }

  function updateGanttLocale(lang) {
    if (!isGanttInitialized) return;

    const localeGantt = localesData[lang]?.gantt || localesData.ja.gantt;
    Object.assign(gantt.locale.labels, localeGantt.labels);
    Object.assign(gantt.locale.date, localeGantt.date);

    // Apply grid column headers
    gantt.config.columns[0].label = localeGantt.labels.column_text;
    gantt.config.columns[1].label = localeGantt.labels.column_duration;

    // Set timeline scales format depending on language
    gantt.config.scales = [
      { unit: "month", step: 1, format: lang === "ja" ? "%Y年%M" : "%F, %Y" },
      { unit: "day", step: 1, format: lang === "ja" ? "%d" : "%j" }
    ];

    // Reload translated task data for this locale
    gantt.clearAll();
    gantt.parse(localeGantt.data);
    gantt.render();
  }

  // --- 7. Kanban Board Drag & Drop Logic ---
  const cards = document.querySelectorAll(".kanban-card");
  const containers = document.querySelectorAll(".kanban-cards-container");
  let draggedCard = null;

  cards.forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedCard = card;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCard = null;
      updateKanbanCounts();
    });
  });

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggedCard);
      } else {
        container.insertBefore(draggedCard, afterElement);
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".kanban-card:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function updateKanbanCounts() {
    containers.forEach((container) => {
      const count = container.querySelectorAll(".kanban-card").length;
      const column = container.closest(".kanban-column");
      if (column) {
        column.querySelector(".column-count").textContent = count;
      }
    });
  }

  // --- 8. Priority Matrix Demo Logic ---
  const matrixAddBtn = document.getElementById("btn-add-matrix-task");
  const matrixInput = document.getElementById("matrix-task-name");
  const quadrantSelect = document.getElementById("matrix-quadrant-select");
  const quadLists = document.querySelectorAll(".quad-task-list");
  let draggedMatrixChip = null;

  function makeMatrixChipDraggable(chip) {
    chip.setAttribute("draggable", "true");
    
    chip.addEventListener("dragstart", () => {
      draggedMatrixChip = chip;
      chip.classList.add("dragging");
    });

    chip.addEventListener("dragend", () => {
      chip.classList.remove("dragging");
      draggedMatrixChip = null;
    });
    
    // Click to remove interaction
    chip.addEventListener("click", () => {
      chip.style.transform = "scale(0.8)";
      chip.style.opacity = "0";
      setTimeout(() => chip.remove(), 200);
    });
  }

  // Setup drop containers
  quadLists.forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    list.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedMatrixChip) {
        list.appendChild(draggedMatrixChip);
        
        // Update border color depending on target quadrant
        const quadId = list.id;
        const quadIndex = parseInt(quadId.replace("quad-list-", "")) - 1;
        const borderColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
        draggedMatrixChip.style.borderLeftColor = borderColors[quadIndex];
      }
    });
  });

  if (matrixAddBtn && matrixInput && quadrantSelect) {
    matrixAddBtn.addEventListener("click", () => {
      const taskName = matrixInput.value.trim();
      if (!taskName) return;

      const quadValue = quadrantSelect.value;
      const targetContainer = document.getElementById(`quad-list-${quadValue}`);
      
      if (targetContainer) {
        // Create chip
        const chip = document.createElement("div");
        chip.className = "matrix-task-chip";
        chip.textContent = taskName;

        // Apply distinct colors per quadrant
        const borderColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
        chip.style.borderLeftColor = borderColors[parseInt(quadValue) - 1];

        // Setup drag & drop and delete interaction
        makeMatrixChipDraggable(chip);

        targetContainer.appendChild(chip);
        matrixInput.value = "";
      }
    });

    // Press Enter to submit
    matrixInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        matrixAddBtn.click();
      }
    });

    // Setup initial chips
    document.querySelectorAll(".matrix-task-chip").forEach((chip) => {
      makeMatrixChipDraggable(chip);
    });
  }

  // --- 9. Tab Switcher Logic (Gantt / Kanban / Matrix) ---
  const tabButtons = document.querySelectorAll(".demo-tab-btn");
  const panes = document.querySelectorAll(".demo-pane");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-demo-tab");

      // Set button active
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Set pane active
      panes.forEach((pane) => {
        pane.classList.remove("active");
        if (pane.id === `demo-pane-${targetTab}`) {
          pane.classList.add("active");
        }
      });

      // Special Initialization for Gantt when selected
      if (targetTab === "gantt") {
        initGanttDemo();
        // Force refresh Gantt to resolve layout glitch in hidden div
        setTimeout(() => {
          if (isGanttInitialized) {
            gantt.render();
          }
        }, 100);
      }
    });
  });

  // --- 10. Feedback Form Submission Handler ---
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

  // --- 11. Hero Visual Slideshow Logic ---
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

  // --- 12. Initial Invocation ---
  applyLanguage(currentLang);
  // Auto-init Gantt demo as Gantt is the first active tab
  initGanttDemo();
  // Start visual slideshow
  startScreenshotSlideshow();

  // --- 13. ハンバーガーメニュー開閉制御 ---
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

  // --- 14. デモセクションのモバイルスケール制御 ---
  const demoScaleWrapper = document.querySelector(".demo-scale-wrapper");
  const demoContainer = demoScaleWrapper ? demoScaleWrapper.querySelector(".demo-container") : null;

  /**
   * スマホ幅でのみ、demo-containerをPC縦横比のままscale縮小する。
   * CSSに固定値を書くと端末幅ごとにズレるため、JSで動的に計算する。
   */
  function updateDemoScale() {
    if (!demoScaleWrapper || !demoContainer) return;

    const MOBILE_BREAKPOINT = 768;
    const DEMO_FIXED_WIDTH = 1100; // CSSで設定したdemo-containerの固定幅と合わせる

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      // ラッパーの実際の表示幅に対するスケール比を計算
      const wrapperWidth = demoScaleWrapper.getBoundingClientRect().width;
      const scale = wrapperWidth / DEMO_FIXED_WIDTH;

      // CSSカスタムプロパティにセットしてtransform: scaleに反映
      demoContainer.style.setProperty("--demo-scale", scale);
      demoContainer.style.transform = `scale(${scale})`;

      // scale後のコンテナ実高さ（元の高さ × scale）でラッパーの高さを確保
      // これをしないとラッパーが0高さになって後続要素が重なる
      const originalHeight = demoContainer.scrollHeight;
      demoScaleWrapper.style.height = `${originalHeight * scale}px`;
    } else {
      // PCではscaleなし・高さ指定なし（通常レイアウト）
      demoContainer.style.transform = "";
      demoScaleWrapper.style.height = "";
    }
  }

  // 初回実行 & リサイズ時に再計算
  updateDemoScale();
  window.addEventListener("resize", updateDemoScale);
});
