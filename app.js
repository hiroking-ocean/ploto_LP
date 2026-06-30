/* ==========================================================================
   Ploto LP - Application Control Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Management ---
  let currentLang = localStorage.getItem("ploto-lang") || "ja";
  let currentTheme = localStorage.getItem("ploto-theme") || "dark";
  const screenshotNames = ["01-gantt.png", "02-kanban.png", "03-matrix.png", "04-darkmode.png"];
  let screenshotIndex = 0;
  let slideshowInterval = null;

  // --- 2. Translation Dictionary ---
  const i18nData = {
    ja: {
      // Header & Navigation
      nav_features: "特徴",
      nav_demo: "体験デモ",
      nav_beta: "ベータ版",
      cta_download: "無料ダウンロード",

      // Hero Section
      hero_badge: "✨ 個人開発・チームに最適なローカルファースト",
      hero_title: 'プロジェクト管理を、<br><span class="text-gradient">もっと直感的に、美しく。</span>',
      hero_desc: "Ploto（プロト）は、ガントチャート、カンバン、優先度マトリクスを一つの美しいインターフェースに統合した、ローカルファーストのプロジェクト管理ツールです。SQLiteによる高速動作と、抜群のプライバシー保護を実現します。",
      hero_cta_download: "無料で手に入れる",
      hero_cta_demo: "デモを触ってみる",
      hero_meta: "<span>✓ クラウドサインイン不要</span><span>✓ 完全オフライン対応</span><span>✓ 5言語ローカライズ</span>",

      // Simulated Workspace in Hero Visual
      mock_tab_gantt: "ガントチャート",
      mock_tab_kanban: "カンバン",
      mock_tab_matrix: "優先度マトリクス",
      mock_col_task: "タスク名",

      // Features Section
      features_title: "プロジェクト管理を加速する強力な機能",
      features_subtitle: "Plotoは使いやすさと高い機能性を両立するために設計されています。",
      feat_alert_title: "健康度アラートライン",
      feat_alert_desc: "タスクの進行状況を「期限超過（赤）」「開始遅延（オレンジ）」「正常（緑）」の3色で左端にライン表示。対応が必要なタスクが一目でわかります。",
      feat_cal_title: "祝日・週末のカスタマイズ表示",
      feat_cal_desc: "独自の祝日データをインポート・追加可能。週末の減色表示や祝日ハイライトにより、現実に即した稼働スケジュールを視覚化します。",
      feat_undo_title: "Undo / Redo 対応",
      feat_undo_desc: "タスクのドラッグ、情報の追加、削除など、誤った操作を行ってもスムーズに元に戻す・やり直す（Ctrl+Z / Y）ことができます。",
      feat_db_title: "プライバシー重視の SQLite 設計",
      feat_db_desc: "データはすべてローカルの安全なSQLiteファイル（.ploto）に保存。インターネット環境不要で、プライベートなデータがクラウドに漏洩する心配はありません。",

      // Demo Section Headers
      demo_title: "実際に動かしてみましょう",
      demo_subtitle: "ダウンロード前に、Plotoの代表的なインターフェース（ガントチャート、カンバン、マトリクス）の操作性を体験してください。",
      demo_tab_gantt: "ガントチャート",
      demo_tab_kanban: "カンバンボード",
      demo_tab_matrix: "優先度マトリクス",

      // Kanban Demo Specific
      demo_kanban_help: "カードを別の列にドラッグ＆ドロップしてステータスを変更できます。",
      kanban_todo: "未実施",
      kanban_progress: "実施中",
      kanban_done: "完了",
      kanban_todo_notes: "💡 ここにはこれから取り組むタスクを配置します。",
      kanban_progress_notes: "💡 現在取り組んでいる最中のタスクです。",
      kanban_done_notes: "💡 完了済みのタスクです。達成感を味わいましょう！",

      // Matrix Demo Specific
      demo_matrix_help: "緊急度と重要度の4つのエリアをクリックして、タスクをプロットできます（タスクチップをクリックすると削除できます）。",
      matrix_quad1: "第Ⅰ象限: 緊急・重要",
      matrix_quad2: "第Ⅱ象限: 緊急でない・重要",
      matrix_quad3: "第Ⅲ象限: 緊急・重要でない",
      matrix_quad4: "第Ⅳ象限: 緊急でない・重要でない",
      matrix_add_title: "タスクをマトリクスに追加",
      matrix_placeholder: "新しいタスク名...",
      matrix_opt1: "Ⅰ. 緊急・重要",
      matrix_opt2: "Ⅱ. 緊急でない・重要",
      matrix_opt3: "Ⅲ. 緊急・重要でない",
      matrix_opt4: "Ⅳ. 緊急でない・重要でない",
      btn_add: "追加",

      // Beta Offer Section
      beta_badge: "📢 ベータテスト実施中",
      beta_title: "ベータ期間中に作成されたファイルは<br>将来もずっと追加料金なしで利用可能！",
      beta_desc: "Plotoは現在、品質向上のためのベータテストを行っています。将来的に高度な機能を備えた有料プランを導入する予定ですが、ベータ期間中に作成されたプロジェクトファイル（.ploto）は、有料化後もすべての機能を無料で引き続きご利用いただけます。",
      beta_price: "ベータ版価格",
      beta_limit: "将来のライセンス",
      beta_unlimited: "作成済みファイルは永久無料",

      // Download Section
      dl_title: "Plotoでプロジェクト管理をシンプルに",
      dl_desc: "今すぐアプリケーションをダウンロードして、ローカルファーストで快適なプロジェクト管理を開始しましょう。",
      dl_win_sub: "手に入れる",
      dl_win_exe: "Windows インストーラー",
      dl_notes: "* Windows 10/11 対応。SQLite 3標準搭載。",

      // Footer
      footer_privacy: "プライバシーポリシー",
      footer_terms: "利用規約",

      // Feedback Form
      feedback_title: "ベータ版フィードバック送信",
      feedback_desc: "バグ報告、機能のご要望、ご感想などをお寄せください。",
      feedback_name: "お名前（任意）",
      feedback_name_placeholder: "山田 太郎",
      feedback_email: "メールアドレス（任意）",
      feedback_email_placeholder: "taro@example.com",
      feedback_msg: "フィードバック内容（必須）",
      feedback_msg_placeholder: "機能の要望や改善点など...",
      btn_send: "フィードバックを送信する",
      feedback_success: "フィードバックを送信しました。ご協力ありがとうございました！"
    },
    en: {
      // Header & Navigation
      nav_features: "Features",
      nav_demo: "Live Demo",
      nav_beta: "Beta Offer",
      cta_download: "Free Download",

      // Hero Section
      hero_badge: "✨ Ideal for Personal Dev & Teams (Local-First)",
      hero_title: 'Project Management,<br><span class="text-gradient">More Intuitive & Beautiful.</span>',
      hero_desc: "Ploto is a local-first project management tool that integrates Gantt charts, Kanban boards, and priority matrices into one gorgeous user interface. High performance via SQLite and outstanding privacy protection.",
      hero_cta_download: "Get it for Free",
      hero_cta_demo: "Try Live Demo",
      hero_meta: "<span>✓ No Cloud Sign-in</span><span>✓ Fully Offline Ready</span><span>✓ 5-Language Localization</span>",

      // Simulated Workspace in Hero Visual
      mock_tab_gantt: "Gantt Chart",
      mock_tab_kanban: "Kanban",
      mock_tab_matrix: "Priority Matrix",
      mock_col_task: "Task Name",

      // Features Section
      features_title: "Powerful Features to Accelerate Your Projects",
      features_subtitle: "Ploto is engineered to strike the perfect balance between simplicity and productivity.",
      feat_alert_title: "Health Alert Line",
      feat_alert_desc: "Visualizes schedules with red (overdue), orange (delayed), and green (on track) left lines, helping you instantly spot tasks requiring immediate attention.",
      feat_cal_title: "Custom Holidays & Weekends",
      feat_cal_desc: "Supports importing custom holidays and highlights weekends/holidays with lower contrast to visualize real-world work capacities.",
      feat_undo_title: "Reliable Undo / Redo",
      feat_undo_desc: "Easily restore or redo your operations—like task drags, creation, deletion, or edits—with standard Ctrl+Z / Y support.",
      feat_db_title: "SQLite Built for Privacy",
      feat_db_desc: "Your data remains securely stored in local SQLite database files (.ploto). No cloud required, ensuring strict corporate data governance.",

      // Demo Section Headers
      demo_title: "See It In Action",
      demo_subtitle: "Interact directly with Ploto's core views—Gantt Chart, Kanban Board, and Priority Matrix—before downloading.",
      demo_tab_gantt: "Gantt Chart",
      demo_tab_kanban: "Kanban Board",
      demo_tab_matrix: "Priority Matrix",

      // Kanban Demo Specific
      demo_kanban_help: "Drag and drop cards between columns to change task status.",
      kanban_todo: "To Do",
      kanban_progress: "In Progress",
      kanban_done: "Done",
      kanban_todo_notes: "💡 Place tasks here that are waiting to be started.",
      kanban_progress_notes: "💡 Tasks currently in active development.",
      kanban_done_notes: "💡 Finished tasks. Celebrate your achievements!",

      // Matrix Demo Specific
      demo_matrix_help: "Click in any of the quadrants or use the creator to plot tasks. Click a chip to remove it.",
      matrix_quad1: "Q I: Urgent & Important",
      matrix_quad2: "Q II: Not Urgent & Important",
      matrix_quad3: "Q III: Urgent & Not Important",
      matrix_quad4: "Q IV: Not Urgent & Not Important",
      matrix_add_title: "Add Task to Matrix",
      matrix_placeholder: "New task title...",
      matrix_opt1: "I. Urgent & Important",
      matrix_opt2: "II. Not Urgent & Important",
      matrix_opt3: "III. Urgent & Not Important",
      matrix_opt4: "IV. Not Urgent & Not Important",
      btn_add: "Add",

      // Beta Offer Section
      beta_badge: "📢 Active Beta Phase",
      beta_title: "Files Created During Beta<br>Remain Fully Free Forever!",
      beta_desc: "Ploto is currently in beta testing for final polishing. We plan to introduce advanced features as part of a paid plan, but any project files (.ploto) created during the beta period will stay completely free and usable without restrictions.",
      beta_price: "Beta Phase Price",
      beta_limit: "Future License",
      beta_unlimited: "Beta files remain free forever",

      // Download Section
      dl_title: "Simplify Your Project Management Now",
      dl_desc: "Download the application and experience smooth, offline project management today.",
      dl_win_sub: "Get it from",
      dl_win_exe: "Windows Installer",
      dl_notes: "* Compatible with Windows 10/11. Ships with local SQLite 3 support.",

      // Footer
      footer_privacy: "Privacy Policy",
      footer_terms: "Terms of Service",

      // Feedback Form
      feedback_title: "Beta Feedback Submission",
      feedback_desc: "Send us your bug reports, feature requests, or general feedback.",
      feedback_name: "Your Name (Optional)",
      feedback_name_placeholder: "John Doe",
      feedback_email: "Email Address (Optional)",
      feedback_email_placeholder: "john@example.com",
      feedback_msg: "Feedback Message (Required)",
      feedback_msg_placeholder: "Type your feature request, bug details, or thoughts...",
      btn_send: "Submit Feedback",
      feedback_success: "Thank you! Your feedback has been submitted successfully."
    }
  };

  // --- 3. DHTMLX Gantt Locale Dictionaries ---
  const ganttLocales = {
    ja: {
      labels: {
        new_task: "新規タスク",
        column_text: "タスク名",
        column_start_date: "開始日時",
        column_duration: "期間",
        column_add: "",
        link: "リンク",
        confirm_link_deleting: "リンクを削除しますか？",
        link_start: " (開始)",
        link_end: " (終了)",
        type_task: "タスク",
        type_project: "プロジェクト",
        type_milestone: "マイルストーン",
        minutes: "分",
        hours: "時間",
        days: "日",
        weeks: "週",
        months: "月",
        years: "年"
      },
      date: {
        month_full: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        day_full: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        day_short: ["日", "月", "火", "水", "木", "金", "土"]
      }
    },
    en: {
      labels: {
        new_task: "New Task",
        column_text: "Task name",
        column_start_date: "Start time",
        column_duration: "Duration",
        column_add: "",
        link: "Link",
        confirm_link_deleting: "Do you want to delete this link?",
        link_start: " (start)",
        link_end: " (end)",
        type_task: "Task",
        type_project: "Project",
        type_milestone: "Milestone",
        minutes: "Minutes",
        hours: "Hours",
        days: "Days",
        weeks: "Weeks",
        months: "Months",
        years: "Years"
      },
      date: {
        month_full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        month_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        day_full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        day_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      }
    }
  };

  // --- 4. Interactive Demo Mock Data ---
  const initialGanttData = {
    data: [
      { id: 1, text: "プロジェクト立ち上げ", start_date: "2026-07-01", duration: 8, open: true, progress: 0.6, type: "project" },
      { id: 2, text: "市場調査と要件定義", start_date: "2026-07-01", duration: 4, parent: 1, progress: 0.8 },
      { id: 3, text: "UI/UX デザイン作成", start_date: "2026-07-05", duration: 4, parent: 1, progress: 0.3 },
      { id: 4, text: "プロトタイプ開発", start_date: "2026-07-09", duration: 10, open: true, progress: 0.1, type: "project" },
      { id: 5, text: "フロントエンド開発", start_date: "2026-07-09", duration: 7, parent: 4, progress: 0.2 },
      { id: 6, text: "バックエンドAPI構築", start_date: "2026-07-12", duration: 7, parent: 4, progress: 0.0 }
    ],
    links: [
      { id: 1, source: 2, target: 3, type: "0" },
      { id: 2, source: 3, target: 5, type: "0" },
      { id: 3, source: 5, target: 6, type: "0" }
    ]
  };

  const initialGanttDataEn = {
    data: [
      { id: 1, text: "Project Initialization", start_date: "2026-07-01", duration: 8, open: true, progress: 0.6, type: "project" },
      { id: 2, text: "Market Research & Scope", start_date: "2026-07-01", duration: 4, parent: 1, progress: 0.8 },
      { id: 3, text: "UI/UX Wireframes", start_date: "2026-07-05", duration: 4, parent: 1, progress: 0.3 },
      { id: 4, text: "Prototype Development", start_date: "2026-07-09", duration: 10, open: true, progress: 0.1, type: "project" },
      { id: 5, text: "Frontend Coding", start_date: "2026-07-09", duration: 7, parent: 4, progress: 0.2 },
      { id: 6, text: "Backend API Integration", start_date: "2026-07-12", duration: 7, parent: 4, progress: 0.0 }
    ],
    links: [
      { id: 1, source: 2, target: 3, type: "0" },
      { id: 2, source: 3, target: 5, type: "0" },
      { id: 3, source: 5, target: 6, type: "0" }
    ]
  };

  // --- 5. Initialization / Theme & Lang Application ---
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    currentTheme = theme;
    localStorage.setItem("ploto-theme", theme);
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

  // Toggle Language Button
  const langToggleBtn = document.getElementById("lang-toggle");
  langToggleBtn.addEventListener("click", () => {
    const nextLang = currentLang === "ja" ? "en" : "ja";
    applyLanguage(nextLang);
  });

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("ploto-lang", lang);
    
    // Update Toggle Button label (displays the OTHER language option)
    langToggleBtn.querySelector(".lang-text").textContent = lang === "ja" ? "EN" : "日本語";

    // Replace data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18nData[lang][key]) {
        el.innerHTML = i18nData[lang][key];
      }
    });

    // Replace inputs with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (i18nData[lang][key]) {
        el.setAttribute("placeholder", i18nData[lang][key]);
      }
    });

    // Set page title & description
    document.title = lang === "ja" 
      ? "Ploto - 美しく直感的なローカルファースト・プロジェクト管理ツール"
      : "Ploto - Gorgeous & Intuitive Local-First Project Management Tool";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", lang === "ja"
        ? "Plotoはガントチャート、カンバン、優先度マトリクスを融合した、美しく高速なデスクトップ向けプロジェクト管理アプリケーションです。SQLiteによるローカルファースト設計で、データを安全に管理します。"
        : "Ploto is a beautiful, offline-first desktop project management app integrating Gantt, Kanban, and Priority Matrix, powered by secure local SQLite."
      );
    }

    // Refresh Gantt locale if loaded
    updateGanttLocale(lang);

    // Update hero screenshot language based on current slide
    const heroScreenshot = document.getElementById("hero-screenshot");
    if (heroScreenshot) {
      heroScreenshot.src = `assets/screenshots/${lang === "ja" ? "ja-jp" : "en-us"}/${screenshotNames[screenshotIndex]}`;
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

    // Configure grid headers & column mapping
    gantt.config.columns = [
      { name: "text", label: currentLang === "ja" ? "タスク名" : "Task Name", width: "*", tree: true },
      { name: "duration", label: currentLang === "ja" ? "期間" : "Days", align: "center", width: 60 }
    ];

    // Grid config
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%Y年%M" },
      { unit: "day", step: 1, format: "%d" }
    ];

    gantt.init("gantt_container");
    
    // Parse respective language data initially
    const activeData = currentLang === "ja" ? initialGanttData : initialGanttDataEn;
    gantt.parse(activeData);

    isGanttInitialized = true;
  }

  function updateGanttLocale(lang) {
    if (!isGanttInitialized) return;

    // Apply translations directly into gantt.locale.labels
    const loc = ganttLocales[lang];
    Object.assign(gantt.locale.labels, loc.labels);
    Object.assign(gantt.locale.date, loc.date);

    // Apply grid column headers
    gantt.config.columns[0].label = lang === "ja" ? "タスク名" : "Task Name";
    gantt.config.columns[1].label = lang === "ja" ? "期間" : "Days";

    // Set timeline scales format depending on language
    if (lang === "ja") {
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%Y年%M" },
        { unit: "day", step: 1, format: "%d" }
      ];
    } else {
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: "%j" }
      ];
    }

    // Replace entire tasks with local translations for demo elegance
    const taskData = lang === "ja" ? initialGanttData.data : initialGanttDataEn.data;
    taskData.forEach((task) => {
      if (gantt.isTaskExists(task.id)) {
        const item = gantt.getTask(task.id);
        item.text = task.text;
        gantt.updateTask(task.id);
      }
    });

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
      btn.textContent = currentLang === "ja" ? "送信中..." : "Sending...";

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
        heroScreenshot.src = `assets/screenshots/${currentLang === "ja" ? "ja-jp" : "en-us"}/${screenshotNames[screenshotIndex]}`;
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
});
