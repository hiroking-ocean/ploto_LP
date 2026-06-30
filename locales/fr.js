export default {
  locale: "fr",
  screenshotFolder: "en-us",
  meta: {
    title: "Ploto - Outil de gestion de projet local-first, élégant et intuitif",
    description: "Ploto est un outil de gestion de projet local-first, qui intègre Gantt, Kanban et matrice de priorité dans une interface élégante. Performant grâce à SQLite local et respectueux de la vie privée."
  },
  i18n: {
    nav_features: "Fonctionnalités",
    nav_demo: "Démo en direct",
    nav_beta: "Offre bêta",
    cta_download: "Téléchargement gratuit",

    hero_badge: "✨ Idéal pour le développement solo et les équipes (local-first)",
    hero_title: 'Gestion de projet,<br><span class="text-gradient">plus intuitive et plus belle.</span>',
    hero_desc: "Ploto est un outil de gestion de projet local-first qui intègre diagrammes de Gantt, tableaux Kanban et matrices de priorité dans une seule interface élégante. Performant grâce à SQLite et offrant une excellente protection de la vie privée.",
    hero_cta_download: "Télécharger gratuitement",
    hero_cta_demo: "Essayer la démo",
    hero_meta: "<span>✓ Pas de connexion cloud</span><span>✓ Entièrement disponible hors ligne</span><span>✓ Localisé en 5 langues</span>",

    mock_tab_gantt: "Gantt",
    mock_tab_kanban: "Kanban",
    mock_tab_matrix: "Matrice de priorité",
    mock_col_task: "Nom de tâche",

    features_title: "Fonctionnalités puissantes pour accélérer vos projets",
    features_subtitle: "Ploto est conçu pour offrir le meilleur équilibre entre simplicité et productivité.",
    feat_alert_title: "Ligne d'alerte de santé",
    feat_alert_desc: "Affiche les tâches avec des lignes rouges (en retard), orange (retardées) et vertes (dans les temps) pour repérer rapidement celles qui exigent une action immédiate.",
    feat_cal_title: "Jours fériés et week-ends personnalisables",
    feat_cal_desc: "Importez des jours fériés personnalisés et mettez en évidence les week-ends/jours fériés pour visualiser un calendrier de travail réaliste.",
    feat_undo_title: "Annuler / Rétablir fiable",
    feat_undo_desc: "Restaurez ou refaites facilement vos actions — glisser-déposer de tâches, création, suppression ou modifications — avec Ctrl+Z / Y.",
    feat_db_title: "SQLite orienté confidentialité",
    feat_db_desc: "Vos données restent stockées en toute sécurité dans des fichiers SQLite locaux (.ploto). Pas besoin de cloud, pour une gouvernance stricte des données.",

    demo_title: "Voyez-le en action",
    demo_subtitle: "Interagissez directement avec les vues principales de Ploto — Gantt, Kanban et matrice de priorité — avant de télécharger.",
    demo_tab_gantt: "Gantt",
    demo_tab_kanban: "Tableau Kanban",
    demo_tab_matrix: "Matrice de priorité",
    demo_mobile_notice: "Sur smartphone, vous pouvez uniquement prévisualiser l'interface. Essayez l'expérience complète sur PC.",

    demo_kanban_help: "Glissez et déposez les cartes entre les colonnes pour changer le statut des tâches.",
    kanban_todo: "À faire",
    kanban_progress: "En cours",
    kanban_done: "Terminé",
    kanban_todo_notes: "💡 Placez ici les tâches qui doivent encore être démarrées.",
    kanban_progress_notes: "💡 Tâches actuellement en cours de développement.",
    kanban_done_notes: "💡 Tâches terminées. Célébrez vos réussites !",

    demo_matrix_help: "Cliquez dans l'un des quadrants ou utilisez le créateur pour tracer des tâches. Cliquez sur une puce pour la supprimer.",
    matrix_quad1: "Q I : Urgent & Important",
    matrix_quad2: "Q II : Peu urgent & Important",
    matrix_quad3: "Q III : Urgent & Peu important",
    matrix_quad4: "Q IV : Peu urgent & Peu important",
    matrix_add_title: "Ajouter une tâche à la matrice",
    matrix_placeholder: "Nouveau nom de tâche...",
    matrix_opt1: "I. Urgent & Important",
    matrix_opt2: "II. Peu urgent & Important",
    matrix_opt3: "III. Urgent & Peu important",
    matrix_opt4: "IV. Peu urgent & Peu important",
    btn_add: "Ajouter",

    beta_badge: "📢 Bêta active",
    beta_title: "Les fichiers créés maintenant<br>conservent toutes les fonctionnalités payantes — à vie !",
    beta_desc: "Ploto est actuellement en bêta. Nous prévoyons d'introduire une licence paiement unique pour des fonctionnalités avancées à l'avenir, mais les fichiers de projet (.ploto) créés pendant la bêta continueront d'accéder à ces fonctionnalités sans achat supplémentaire.",
    beta_price: "Prix bêta",
    beta_limit: "Modèle de licence futur",
    beta_unlimited: "Paiement unique (fichiers bêta inclus gratuitement)",

    feedback_title: "Soumission de feedback bêta",
    feedback_desc: "Envoyez-nous vos rapports de bugs, demandes de fonctionnalités ou retours généraux.",
    feedback_name: "Votre nom (optionnel)",
    feedback_name_placeholder: "Jean Dupont",
    feedback_email: "Adresse e-mail (optionnel)",
    feedback_email_placeholder: "jean@example.com",
    feedback_msg: "Message de feedback (obligatoire)",
    feedback_msg_placeholder: "Tapez votre demande de fonctionnalité, détails du bug ou avis...",
    btn_send: "Envoyer le feedback",
    feedback_success: "Merci ! Votre feedback a été envoyé avec succès.",
    feedback_sending: "Envoi...",
    feedback_error: "Une erreur s'est produite pendant l'envoi. Veuillez vérifier l'URL d'action.",

    dl_title: "Simplifiez votre gestion de projet maintenant",
    dl_desc: "Téléchargez l'application et découvrez une gestion de projet fluide et hors ligne dès aujourd'hui.",
    dl_win_sub: "Disponible sur",
    dl_win_exe: "Installateur Windows",
    dl_notes: "* Compatible avec Windows 10/11. Livré avec SQLite 3.",

    footer_privacy: "Politique de confidentialité",
    footer_terms: "Conditions d'utilisation"
  },
  gantt: {
    labels: {
      new_task: "Nouvelle tâche",
      column_text: "Nom de tâche",
      column_start_date: "Heure de début",
      column_duration: "Durée",
      column_add: "",
      link: "Lien",
      confirm_link_deleting: "Voulez-vous supprimer ce lien ?",
      link_start: " (début)",
      link_end: " (fin)",
      type_task: "Tâche",
      type_project: "Projet",
      type_milestone: "Jalon",
      minutes: "Minutes",
      hours: "Heures",
      days: "Jours",
      weeks: "Semaines",
      months: "Mois",
      years: "Années"
    },
    date: {
      month_full: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      month_short: ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"],
      day_full: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      day_short: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"]
    },
    data: {
      data: [
        { id: 1, text: "Initialisation du projet", start_date: "2026-07-01", duration: 8, open: true, progress: 0.6, type: "project" },
        { id: 2, text: "Étude de marché & définition des besoins", start_date: "2026-07-01", duration: 4, parent: 1, progress: 0.8 },
        { id: 3, text: "Maquettes UI/UX", start_date: "2026-07-05", duration: 4, parent: 1, progress: 0.3 },
        { id: 4, text: "Développement du prototype", start_date: "2026-07-09", duration: 10, open: true, progress: 0.1, type: "project" },
        { id: 5, text: "Développement frontend", start_date: "2026-07-09", duration: 7, parent: 4, progress: 0.2 },
        { id: 6, text: "Intégration API backend", start_date: "2026-07-12", duration: 7, parent: 4, progress: 0.0 }
      ],
      links: [
        { id: 1, source: 2, target: 3, type: "0" },
        { id: 2, source: 3, target: 5, type: "0" },
        { id: 3, source: 5, target: 6, type: "0" }
      ]
    }
  }
};