export default {
  locale: "ja",
  screenshotFolder: "ja-jp",
  meta: {
    title: "Ploto - 美しく直感的なローカルファースト・プロジェクト管理ツール",
    description: "Plotoはガントチャート、カンバン、優先度マトリクスを融合した、美しく高速なデスクトップ向けプロジェクト管理アプリです。SQLite によるローカルファースト設計で、データを安全に管理します。"
  },
  i18n: {
    nav_features: "特徴",
    nav_demo: "体験デモ",
    nav_beta: "ベータ版",
    cta_download: "無料ダウンロード",

    hero_badge: "✨ 個人開発・チームに最適なローカルファースト",
    hero_title: 'プロジェクト管理を、<br><span class="text-gradient">もっと直感的に、美しく。</span>',
    hero_desc: "Ploto（プロト）は、ガントチャート、カンバン、優先度マトリクスを一つの美しいインターフェースに統合した、ローカルファーストのプロジェクト管理ツールです。SQLiteによる高速動作と、抜群のプライバシー保護を実現します。",
    hero_cta_download: "無料で手に入れる",
    hero_cta_demo: "デモを触ってみる",
    hero_meta: "<span>✓ クラウドサインイン不要</span><span>✓ 完全オフライン対応</span><span>✓ 5言語ローカライズ</span>",

    mock_tab_gantt: "ガントチャート",
    mock_tab_kanban: "カンバン",
    mock_tab_matrix: "優先度マトリクス",
    mock_col_task: "タスク名",

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

    demo_title: "実際に動かしてみましょう",
    demo_subtitle: "ダウンロード前に、Plotoの代表的なインターフェース（ガントチャート、カンバン、マトリクス）の操作性を体験してください。",
    demo_tab_gantt: "ガントチャート",
    demo_tab_kanban: "カンバンボード",
    demo_tab_matrix: "優先度マトリクス",
    demo_mobile_notice: "スマートフォンでは見た目の確認のみ可能です。全機能はPCでお試しください。",

    demo_kanban_help: "カードを別の列にドラッグ＆ドロップしてステータスを変更できます。",
    kanban_todo: "未実施",
    kanban_progress: "実施中",
    kanban_done: "完了",
    kanban_todo_notes: "💡 ここにはこれから取り組むタスクを配置します。",
    kanban_progress_notes: "💡 現在取り組んでいる最中のタスクです。",
    kanban_done_notes: "💡 完了済みのタスクです。達成感を味わいましょう！",

    demo_matrix_help: "緊急度と重要度の4つのエリアをクリックして、タスクをプロットできます。",
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

    beta_badge: "📢 ベータテスト実施中",
    beta_title: "今作ったファイルは、有料化後も<br>永久に有料機能をそのまま利用可能！",
    beta_desc: "Plotoは現在ベータテスト中です。将来的に機能拡張に伴う買い切りライセンスを導入する予定ですが、ベータ期間中に作成したプロジェクトファイル（.ploto）は、有料化後も追加購入不要で有料機能を引き続きそのままお使いいただけます。",
    beta_price: "ベータ版価格",
    beta_limit: "将来のライセンス形態",
    beta_unlimited: "買い切り（ベータファイルは追加購入不要）",

    feedback_title: "ベータ版フィードバック送信",
    feedback_desc: "バグ報告、機能のご要望、ご感想などをお寄せください。",
    feedback_name: "お名前（任意）",
    feedback_name_placeholder: "山田 太郎",
    feedback_email: "メールアドレス（任意）",
    feedback_email_placeholder: "taro@example.com",
    feedback_msg: "フィードバック内容（必須）",
    feedback_msg_placeholder: "機能の要望や改善点など...",
    btn_send: "フィードバックを送信する",
    feedback_success: "フィードバックを送信しました。ご協力ありがとうございました！",
    feedback_sending: "送信中...",
    feedback_error: "送信中にエラーが発生しました。設定を確認してください。",

    dl_title: "Plotoでプロジェクト管理をシンプルに",
    dl_desc: "今すぐアプリケーションをダウンロードして、ローカルファーストで快適なプロジェクト管理を開始しましょう。",
    dl_win_sub: "手に入れる",
    dl_win_exe: "Windows インストーラー",
    dl_notes: "* Windows 10/11 対応。SQLite 3標準搭載。",

    footer_privacy: "プライバシーポリシー",
    footer_terms: "利用規約"
  },
  gantt: {
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
    },
    data: {
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
    }
  }
};