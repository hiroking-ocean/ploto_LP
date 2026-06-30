export default {
  locale: "en",
  screenshotFolder: "en-us",
  meta: {
    title: "Ploto - Gorgeous & Intuitive Local-First Project Management Tool",
    description: "Ploto is a beautiful, offline-first desktop project management app integrating Gantt, Kanban, and Priority Matrix, powered by secure local SQLite."
  },
  i18n: {
    nav_features: "Features",
    nav_demo: "Live Demo",
    nav_beta: "Beta Offer",
    cta_download: "Free Download",

    hero_badge: "✨ Ideal for Personal Dev & Teams (Local-First)",
    hero_title: 'Project Management,<br><span class="text-gradient">More Intuitive & Beautiful.</span>',
    hero_desc: "Ploto is a local-first project management tool that integrates Gantt charts, Kanban boards, and priority matrices into one gorgeous user interface. High performance via SQLite and outstanding privacy protection.",
    hero_cta_download: "Get it for Free",
    hero_cta_demo: "Try Live Demo",
    hero_meta: "<span>✓ No Cloud Sign-in</span><span>✓ Fully Offline Ready</span><span>✓ 5-Language Localization</span>",

    mock_tab_gantt: "Gantt Chart",
    mock_tab_kanban: "Kanban",
    mock_tab_matrix: "Priority Matrix",
    mock_col_task: "Task Name",

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

    demo_title: "See It In Action",
    demo_subtitle: "Interact directly with Ploto's core views—Gantt Chart, Kanban Board, and Priority Matrix—before downloading.",
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
    beta_title: "Files You Create Now<br>Keep All Paid Features—Forever!",
    beta_desc: "Ploto is currently in beta. We plan to introduce a one-time purchase license for advanced features in the future—but any project files (.ploto) you create during the beta period will continue to enjoy those paid features without any additional purchase.",
    beta_price: "Beta Phase Price",
    beta_limit: "Future License Model",
    beta_unlimited: "One-time purchase (Beta files included free)",

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
    footer_terms: "Terms of Service"
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