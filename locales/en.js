export default {
  locale: "en",
  screenshotFolder: "en-us",
  meta: {
    title: "Free Project Scheduling & Gantt Chart Tool Ploto | No Cloud, Offline",
    description: "Ploto is a free offline project scheduling and Gantt chart tool with no account registration required. Integrates Kanban (status boards) and priority matrix. All data is saved safely on your PC, ensuring zero leakage of confidential project info. Supports Windows 10/11."
  },
  i18n: {
    nav_features: "Features",
    nav_demo: "Live Demo",
    nav_beta: "Beta Offer",
    nav_manual: "User Manual",
    cta_download: "Free Download",

    hero_badge: "🏢 Built for Cloud-Restricted & SaaS-Blocked Teams | Works Locally | Free",
    hero_title: 'Tired of Managing Schedules<br>with <span class="text-gradient">Messy Excel Worksheets?</span>',
    hero_desc: "No cloud access? Frustrated with slow Excel sheets? Ploto is an offline project management app installable directly from the Microsoft Store. Get started instantly without account creation or procurement hassle.",
    hero_cta_download: "Get it for Free",
    hero_cta_demo: "Try Live Demo",
    hero_meta: "<span>✓ Free & No Registration</span><span>✓ Offline-First · Local Run</span><span>✓ Direct File Storage, No Leakage Risk</span>",

    mock_tab_gantt: "Gantt Chart (Schedule)",
    mock_tab_kanban: "Kanban (Status Board)",
    mock_tab_matrix: "Priority (Matrix)",
    mock_col_task: "Task Name",

    features_title: "Solve Your Excel Frustrations with Simple Features",
    features_subtitle: "Ploto is designed to eliminate the tedious repetitive tasks commonly found in spreadsheet-based management.",
    feat_alert_title: "3-Color Health Status Alert",
    feat_alert_desc: "Automatically highlights tasks as red (overdue), yellow (delayed), or green (on track). Quickly spot bottlenecks without manual checks.",
    feat_cal_title: "Holidays & Company Calendars",
    feat_cal_desc: "Configure custom holidays and work schedules. Weekend dimming and holiday highlighting ensure accurate capacity planning matching your real schedule.",
    feat_undo_title: "Recover from Mistakes with Ctrl+Z",
    feat_undo_desc: "Just like Excel, you can undo (`Ctrl+Z`) or redo (`Ctrl+Y`) operations like drag-and-drops, creations, or deletions. No fear of misclicks.",
    feat_db_title: "Offline Storage for Strict Data Protection",
    feat_db_desc: "All data is stored directly on your PC as standard files (.ploto). Because no cloud connections are established, confidential project data never leaves your environment.",

    demo_title: "See It In Action",
    demo_subtitle: "Before installing, try the interactive Gantt chart and task board directly in your browser.",
    demo_tab_gantt: "Gantt Chart",
    demo_tab_kanban: "Kanban Board",
    demo_tab_matrix: "Priority Matrix",
    demo_mobile_notice: "On smartphones, you can preview the UI only. Try the full experience on a PC.",

    demo_kanban_help: "Drag and drop cards between columns to change task status.",
    kanban_todo: "To Do",
    kanban_progress: "In Progress",
    kanban_done: "Done",
    kanban_todo_notes: "💡 Place tasks here that are waiting to be started.",
    kanban_progress_notes: "💡 Tasks currently in active development.",
    kanban_done_notes: "💡 Finished tasks. Celebrate your achievements!",

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

    beta_badge: "📢 Active Beta Phase",
    beta_title: "Core Features Free to Use!<br>(Advanced utilities as one-time purchases)",
    beta_desc: "Ploto is currently in beta. Essential features like Gantt charts and progress boards will remain free to use. Only advanced capabilities such as Excel file import/export or special customizations will be offered as one-time purchases in the future.",
    beta_price: "Beta Phase Price",
    beta_limit: "Future License Model",
    beta_unlimited: "One-time purchase (for exports & advanced features)",

    feedback_title: "Beta Feedback Submission",
    feedback_desc: "Send us your bug reports, feature requests, or general feedback.",
    feedback_name: "Your Name (Optional)",
    feedback_name_placeholder: "John Doe",
    feedback_email: "Email Address (Optional)",
    feedback_email_placeholder: "john@example.com",
    feedback_msg: "Feedback Message (Required)",
    feedback_msg_placeholder: "Type your feature request, bug details, or thoughts...",
    btn_send: "Submit Feedback",
    feedback_success: "Thank you! Your feedback has been submitted successfully.",
    feedback_sending: "Sending...",
    feedback_error: "An error occurred while sending. Please verify your action URL.",

    dl_title: "Simplify Your Project Management Now",
    dl_desc: "Download the application and experience smooth, offline project management today.",
    dl_win_sub: "Get it from",
    dl_win_exe: "Windows Installer",
    dl_notes: "* Compatible with Windows 10/11. Ships with local SQLite 3 support.",

    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    privacy_url: "https://github.com/hiroking-ocean/ploto-privacy",
    // --- Security Section ---
    security_title: "Data Management and Security",
    security_subtitle: "Even in corporate environments with strict cloud policies, Ploto can be deployed without complex security assessments.",
    security_c1_title: "Local-First Architecture",
    security_c1_desc: "All data is saved in a local file (.ploto) on your PC. It never transmits schedule data or task descriptions to external servers, making it ideal for closed intranets and confidential projects.",
    security_c2_title: "Microsoft Store Secure Distribution",
    security_c2_desc: "The app is signed and distributed via Microsoft Store after rigorous security scans. Unlike unofficial installers, it simplifies procurement approval from internal IT departments.",
    security_c3_title: "No Account Creation or Sign-in",
    security_c3_desc: "No email registration, logins, or corporate domain details are needed. Just install and run immediately in an isolated offline environment.",

    // --- Excel vs Ploto Section ---
    excel_title: "Hitting the Limits of Spreadsheet Management?",
    excel_subtitle: "Compare common Excel headaches in Gantt chart and WBS creation with Ploto's solutions.",
    excel_col_excel: "😰 Excel Frustrations & Pain Points",
    excel_col_ploto: "✅ Solved by Ploto",
    excel_pain1: "Adjusting one column width breaks the layout of the entire sheet",
    excel_pain2: "Massive scrolling as task counts grow, losing the project overview",
    excel_pain3: "Sharing files via email causes version mess and conflicts",
    excel_pain4: "Someone breaks a macro or formula, rendering the sheet unusable",
    excel_pain5: "Keeping task boards and priority sheets updated manually",
    ploto_sol1: "Drag task bars directly to adjust schedules; Gantt chart updates instantly",
    ploto_sol2: "Switch seamlessly between schedule, progress board, and priority matrix",
    ploto_sol3: "Share a single lightweight '.ploto' file to maintain one single source of truth",
    ploto_sol4: "Familiar 'Undo (Ctrl+Z)' instantly resets any missteps or accidental edits",
    ploto_sol5: "Gantt charts, Kanban boards, and priority matrix unified in one simple app",
    excel_cta: "Say Goodbye to Excel Frustrations →",

    // --- Manual Sidebar ---
    manual_sidebar_title: "Ploto Manual",
    manual_menu_gantt: "Gantt Chart",
    manual_menu_kanban: "Kanban Board",
    manual_menu_matrix: "Priority Matrix",
    manual_back_to_lp: "← Back to Official Site",

    // --- Manual Common / Coming Soon ---
    manual_coming_soon_title: "Coming Soon",
    manual_coming_soon_desc: "The manual for this feature is currently under preparation. Please stay tuned for future updates.",

    // --- Manual Gantt Page ---
    manual_gantt_heading: "How to Use Gantt Chart",
    manual_gantt_intro: "The Gantt Chart, the core feature of Ploto, allows you to visually manage your project's tasks and schedules. With intuitive drag-and-drop operations, you can easily change durations and move tasks.",
    
    manual_gantt_section_basic: "1. Basic Operations",
    manual_gantt_basic_desc: "Here are the most fundamental operations for the Gantt Chart. You can intuitively build your schedule using mouse actions.",
    
    manual_gantt_multi_project_title: "Adding and Switching Projects (Multi-Tab)",
    manual_gantt_multi_project_desc: "In Ploto, you can manage multiple projects simultaneously within a single file. Click the 'List' button on the far left sidebar to open the panel, then click the '+' button in the Project section to add a new project. Added projects will appear as 'tabs' at the top of the screen. Simply click a tab to instantly switch between different Gantt charts.",
    
    manual_gantt_add_title: "Adding and Deleting Tasks",
    manual_gantt_add_desc: "Click the '+' button at the top of the task list (grid) on the left, or at the right end of each row, to add a new task. To delete a task, right-click the task name and select 'Delete' from the menu, or select the task and press the Delete key.",
    
    manual_gantt_drag_title: "Adjusting Duration (Drag & Drop)",
    manual_gantt_drag_desc: "Drag the left or right edge of a task bar (blue bar) on the chart to change the start or end date. Drag the center of the bar to move the entire schedule left or right while maintaining the duration (number of days).",
    
    manual_gantt_link_title: "Setting Dependencies (Links)",
    manual_gantt_link_desc: "You can define sequential relationships (predecessor/successor) between tasks. Drag the circular dot at the edge of a task bar and connect it to another task bar to create a link (dependency). Double-click the link line to delete it.",
    
    manual_gantt_progress_title: "Updating Progress",
    manual_gantt_progress_desc: "Drag the small slider inside the task bar left or right to change the progress rate (0% to 100%). The progress is visually represented by the darker fill inside the bar.",
    
    manual_gantt_detail_panel_title: "Task Details Settings (Details, ToDo, Memo)",
    manual_gantt_detail_panel_desc: "Double-click a task or click the details button to open the 'Details Panel' on the right side of the screen. This panel contains three tabs where you can edit basic parameters, manage ToDos, and write formatted notes.",
    manual_gantt_detail_tab_title: "1. Details Tab (Basic Info Settings)",
    manual_gantt_detail_tab_desc: "Configure various basic items related to the task, such as task name, progress rate, priority, duration, and start date/time.",
    manual_gantt_todo_tab_title: "2. ToDo Tab (Task Breakdowns)",
    manual_gantt_todo_tab_desc: "Enter a detailed checklist (ToDo list) associated with the task. You can assign an individual due date and assignee to each ToDo item.",
    manual_gantt_memo_tab_title: "3. Memo Tab (Formatted Notes)",
    manual_gantt_memo_tab_desc: "Write detailed notes or instructions for the task. Rich-text formatting such as bold, italics, and lists is supported.",
    
    manual_gantt_section_advanced: "2. Advanced Features",
    manual_gantt_advanced_desc: "Features designed to make your project management more detailed and robust.",
    
    manual_gantt_calendar_title: "Holiday & Company Off-day Settings",
    manual_gantt_calendar_desc: "In addition to standard weekends, you can register public holidays or unique company-specific holidays in the calendar. Days designated as holidays are grayed out on the chart and automatically excluded from active duration calculations, allowing you to create plans based on actual working days.",
    
    manual_gantt_alert_title: "Health Alert Line",
    manual_gantt_alert_desc: "Automatically evaluates task health based on current progress and today's date. Lines for 'Overdue (Red)', 'Delayed Start (Yellow)', and 'On Track (Green)' are automatically displayed on the left edge of the task bar, letting you identify tasks that require immediate attention.",
    
    manual_gantt_undo_title: "Undo / Redo",
    manual_gantt_undo_desc: "Don't worry if you make a mistake. Just like in Excel, you can use the keyboard shortcuts <kbd>Ctrl + Z</kbd> (Undo) and <kbd>Ctrl + Y</kbd> (Redo) to revert or re-apply your recent actions step-by-step.",
  },
  gantt: {
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
    },
    data: {
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
    }
  }
};