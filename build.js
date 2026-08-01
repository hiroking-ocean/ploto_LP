/* ==========================================================================
   Ploto LP - 多言語プリレンダリング ビルドスクリプト
   --------------------------------------------------------------------------
   編集元: template.html ＋ locales/*.js
   生成物: index.html(ja) / {lang}/index.html / sitemap.xml
   使い方: node build.js   （または npm run build）
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as cheerio from "cheerio";
import locales from "./locales/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- 設定 -----------------------------------------------------------------
const SITE = "https://hiroking-ocean.github.io/ploto_LP/"; // 末尾スラッシュ必須
const BASE = "/ploto_LP/"; // GitHub Pages のサブパス（絶対パス化に使用）
const LANGS = ["ja", "en", "de", "fr", "ko"];
// マニュアルのスクリーンショットが当該言語に無い場合の代替言語。
const FALLBACK_LANG = "en";
const LASTMOD = "2026-07-30"; // sitemap の更新日。内容を更新したらここも上げる

const OG_LOCALE = { ja: "ja_JP", en: "en_US", de: "de_DE", fr: "fr_FR", ko: "ko_KR" };
const IMG_ALT = {
  ja: "Plotoのガントチャート画面",
  en: "Ploto Gantt chart screen",
  de: "Ploto Gantt-Diagramm",
  fr: "Écran du diagramme de Gantt de Ploto",
  ko: "Ploto 간트 차트 화면",
};

// ja はルート、その他は /{lang}/ サブディレクトリ
const urlFor = (lang) => (lang === "ja" ? SITE : `${SITE}${lang}/`);

// 相対パス（assets/… styles.css app.js）を /ploto_LP/… へ絶対化する。
// http(s):// , // , #anchor , 既に絶対の / は対象外。
const absolutize = (val) => {
  if (!val) return val;
  if (/^(https?:)?\/\//i.test(val) || val.startsWith("#") || val.startsWith("/")) return val;
  return BASE + val;
};

// --- キャッシュバスティング -------------------------------------------------
// styles.css / app.js などはファイル名が変わらないため、ブラウザやCDNが古い版を
// 掴んだままだと「HTMLは新しいのに見た目だけ壊れる」状態になる（新しいセクションの
// CSSだけ当たらない、など）。中身のハッシュを ?v= に付けて、変更時だけURLを変える。
// app.js / manual.js は locales/*.js を import するため、翻訳の変更もハッシュに含める。
const LOCALE_FILES = ["locales/index.js", ...LANGS.map((l) => `locales/${l}.js`)];
const hashOf = (files) => {
  const h = createHash("sha1");
  for (const f of files) h.update(readFileSync(join(__dirname, f)));
  return h.digest("hex").slice(0, 8);
};
const ASSET_VERSION = {
  "styles.css": hashOf(["styles.css"]),
  "manual.css": hashOf(["manual.css"]),
  "app.js": hashOf(["app.js", ...LOCALE_FILES]),
  "manual.js": hashOf(["manual.js", ...LOCALE_FILES]),
};

/** 自前の css/js に ?v=<内容ハッシュ> を付ける（既存のクエリは置き換える）。 */
function stampAssetVersions($) {
  $('link[rel="stylesheet"][href], script[src]').each((_, el) => {
    const attr = el.tagName === "script" ? "src" : "href";
    const value = $(el).attr(attr) || "";
    const path = value.split("?")[0];
    const name = path.split("/").pop();
    if (path.startsWith(BASE) && ASSET_VERSION[name]) {
      $(el).attr(attr, `${path}?v=${ASSET_VERSION[name]}`);
    }
  });
}

const template = readFileSync(join(__dirname, "template.html"), "utf8");

function buildPage(lang) {
  const locale = locales[lang];
  const i18n = locale.i18n;
  const url = urlFor(lang);
  const $ = cheerio.load(template, { decodeEntities: false });

  // 1. data-i18n テキスト注入（innerHTML。<br><span> 等の入れ子も保持）
  $("[data-i18n]").each((_, el) => {
    const key = $(el).attr("data-i18n");
    if (i18n[key] != null) $(el).html(i18n[key]);
  });
  $("[data-i18n-placeholder]").each((_, el) => {
    const key = $(el).attr("data-i18n-placeholder");
    if (i18n[key] != null) $(el).attr("placeholder", i18n[key]);
  });
  $("[data-i18n-href]").each((_, el) => {
    const key = $(el).attr("data-i18n-href");
    if (i18n[key] != null) $(el).attr("href", i18n[key]);
  });

  // 2. <html lang> （app.js が初期言語の正として読む）
  $("html").attr("lang", lang);

  // 3. title / description
  $("title").text(locale.meta.title);
  $('meta[name="description"]').attr("content", locale.meta.description);

  // 4. canonical / hreflang （テンプレの既存タグを各言語の個別URLへ更新）
  $('link[rel="canonical"]').attr("href", url);
  LANGS.forEach((l) => $(`link[hreflang="${l}"]`).attr("href", urlFor(l)));
  $('link[hreflang="x-default"]').attr("href", urlFor("ja"));

  // 5. OGP / Twitter （当該言語にローカライズ）
  // 画像はサイトルート直下（/ploto_LP/assets/…）にあるため、ページURLではなく SITE 基準にする
  const shot = `${SITE}assets/screenshots/${locale.screenshotFolder}/01-gantt.png`;
  $('meta[property="og:url"]').attr("content", url);
  $('meta[property="og:locale"]').attr("content", OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocaleTag = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocaleTag.after(`\n  <meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`);
  });
  $('meta[property="og:title"]').attr("content", locale.meta.title);
  $('meta[property="og:description"]').attr("content", locale.meta.description);
  $('meta[property="og:image"]').attr("content", shot);
  $('meta[property="og:image:alt"]').attr("content", IMG_ALT[lang]);
  $('meta[name="twitter:title"]').attr("content", locale.meta.title);
  $('meta[name="twitter:description"]').attr("content", locale.meta.description);
  $('meta[name="twitter:image"]').attr("content", shot);
  $('meta[name="twitter:image:alt"]').attr("content", IMG_ALT[lang]);

  // 6. JSON-LD（url / screenshot を当該言語へ）
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      data.url = url;
      data.screenshot = shot;
      $(el).text(JSON.stringify(data, null, 2));
    } catch {
      /* JSON でなければスキップ */
    }
  });

  // 7. ヒーロー画像を当該言語のスクショフォルダ＋絶対パスへ
  $("#hero-screenshot").attr("src", `${BASE}assets/screenshots/${locale.screenshotFolder}/01-gantt.png`);
  $("#hero-screenshot").attr("alt", IMG_ALT[lang]);

  // 8. Microsoft Store バッジのローカライズ
  const badgeLang = {
    ja: "ja-jp",
    en: "en-us",
    de: "de-de",
    fr: "fr-fr",
    ko: "ko-kr"
  }[lang] || "en-us";

  const badgeProductName = {
    ja: "Ploto - ガントチャート プロジェクト管理",
    en: "Ploto - Gantt Chart Project Management",
    de: "Ploto - Gantt-Diagramm Projektmanagement",
    fr: "Ploto - Diagramme de Gantt Gestion de Projet",
    ko: "Ploto - 간트 차트 프로젝트 관리"
  }[lang] || "Ploto - Gantt Chart Project Management";

  $("ms-store-badge").attr("language", badgeLang);
  $("ms-store-badge").attr("productname", badgeProductName);

  // 8.5 data-manual-link の href 置換
  $("[data-manual-link]").each((_, el) => {
    const targetPage = $(el).attr("data-manual-link");
    const targetUrl = lang === "ja" ? `${BASE}manual/${targetPage}.html` : `${BASE}${lang}/manual/${targetPage}.html`;
    $(el).attr("href", targetUrl);
  });

  // 9. アセットパス絶対化（サブ階層 /en/ で 404 しないように）
  $("img[src], script[src]").each((_, el) => {
    const a = el.tagName === "img" ? "src" : "src";
    $(el).attr(a, absolutize($(el).attr(a)));
  });
  $("link[href]").each((_, el) => {
    $(el).attr("href", absolutize($(el).attr("href")));
  });

  // 10. 自前アセットに ?v=<内容ハッシュ> を付ける（古いCSS/JSを掴ませない）
  stampAssetVersions($);

  return $.html();
}

function buildSitemap() {
  const entry = ({ urls: alternates, loc, priority }) => {
    const alts = LANGS.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${alternates[l]}"/>`
    ).join("\n");
    return `  <url>
    <loc>${loc}</loc>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${alternates.ja}"/>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  };

  const lpAlternates = Object.fromEntries(LANGS.map((l) => [l, urlFor(l)]));
  const lpUrls = LANGS.map((lang) =>
    entry({ urls: lpAlternates, loc: urlFor(lang), priority: lang === "ja" ? "1.0" : "0.8" })
  );

  // マニュアルは検索流入・サイト内参照が多いため、LPと同様に全言語分を登録する。
  const manualUrls = MANUAL_PAGES.flatMap((page) => {
    const alternates = Object.fromEntries(LANGS.map((l) => [l, manualUrlFor(l, page)]));
    return LANGS.map((lang) =>
      entry({ urls: alternates, loc: manualUrlFor(lang, page), priority: lang === "ja" ? "0.9" : "0.7" })
    );
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...lpUrls, ...manualUrls].join("\n")}
</urlset>
`;
}

function buildSitemapTxt() {
  const lp = LANGS.map((lang) => urlFor(lang));
  const manual = MANUAL_PAGES.flatMap((page) => LANGS.map((lang) => manualUrlFor(lang, page)));
  return [...lp, ...manual].join("\n") + "\n";
}

// サイドバーの目次と同じ並び順にする（sitemap の出力順もこれに従う）
const MANUAL_PAGES = ["basic", "gantt", "kanban", "note", "whiteboard", "matrix"];
const manualUrlFor = (lang, page) =>
  lang === "ja" ? `${SITE}manual/${page}.html` : `${SITE}${lang}/manual/${page}.html`;
const manualTemplate = readFileSync(join(__dirname, "manual-template.html"), "utf8");

function buildManualPage(lang, pageName) {
  const locale = locales[lang];
  const i18n = locale.i18n;
  const url = lang === "ja" ? `${SITE}manual/${pageName}.html` : `${SITE}${lang}/manual/${pageName}.html`;
  const $ = cheerio.load(manualTemplate, { decodeEntities: false });

  // 1. data-i18n テキスト注入
  $("[data-i18n]").each((_, el) => {
    const key = $(el).attr("data-i18n");
    if (i18n[key] != null) $(el).html(i18n[key]);
  });
  // 図（role="img"）の読み上げ用ラベルもローカライズする
  $("[data-i18n-aria-label]").each((_, el) => {
    const key = $(el).attr("data-i18n-aria-label");
    if (i18n[key] != null) $(el).attr("aria-label", i18n[key]);
  });

  // 2. html lang
  $("html").attr("lang", lang);

  // 言語切り替えボタンのテキストを現在の言語に設定
  const languageShortLabels = { ja: "JA", en: "EN", de: "DE", fr: "FR", ko: "KO" };
  $("#lang-toggle .lang-text").text(languageShortLabels[lang] || "JA");
  
  // ドロップダウンメニューの選択中クラス(active)を設定
  $(`.lang-option[data-lang="${lang}"]`).addClass("active");

  // 3. title & description
  const pageTitleKey = `manual_menu_${pageName}`;
  const pageTitle = i18n[pageTitleKey] || pageName;
  const siteTitle = i18n["manual_sidebar_title"] || "Ploto Manual";
  $("title").text(`${pageTitle} | ${siteTitle}`);
  
  // メタ記述は検索スニペット用の短い専用文を優先し、無ければページの導入文で代替する。
  const introText = i18n[`manual_${pageName}_intro`] || i18n["manual_gantt_intro"] || "";
  const metaDesc = i18n[`manual_${pageName}_meta_desc`] || `${pageTitle} - ${introText}`;
  $('meta[name="description"]').attr("content", metaDesc);

  // 4. canonical / hreflang
  $('link[rel="canonical"]').attr("href", url);
  LANGS.forEach((l) => {
    const targetUrl = l === "ja" ? `${SITE}manual/${pageName}.html` : `${SITE}${l}/manual/${pageName}.html`;
    $(`link[hreflang="${l}"]`).attr("href", targetUrl);
  });
  $('link[hreflang="x-default"]').attr("href", `${SITE}manual/${pageName}.html`);

  // 5. OGP / Twitter
  //    ページ固有の概要スクショが未撮影なら、ガントの概要図をOGP画像として使う。
  const ogCandidates = [
    `assets/manual/${lang}/${pageName}-overview.png`,
    `assets/manual/${FALLBACK_LANG}/${pageName}-overview.png`,
    `assets/manual/${lang}/gantt-overview.png`,
    `assets/manual/${FALLBACK_LANG}/gantt-overview.png`,
  ];
  const ogPath = ogCandidates.find((p) => existsSync(join(__dirname, p))) || ogCandidates[0];
  const shot = `${SITE}${ogPath}`;
  $('meta[property="og:url"]').attr("content", url);
  $('meta[property="og:locale"]').attr("content", OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocaleTag = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocaleTag.after(`\n  <meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`);
  });
  $('meta[property="og:title"]').attr("content", `${pageTitle} | ${siteTitle}`);
  $('meta[property="og:description"]').attr("content", metaDesc);
  $('meta[property="og:image"]').attr("content", shot);
  $('meta[property="og:image:alt"]').attr("content", pageTitle);
  $('meta[name="twitter:title"]').attr("content", `${pageTitle} | ${siteTitle}`);
  $('meta[name="twitter:description"]').attr("content", metaDesc);
  $('meta[name="twitter:image"]').attr("content", shot);
  $('meta[name="twitter:image:alt"]').attr("content", pageTitle);

  // 6. data-lp-href の置換（LPトップへの絶対パス化）
  $("[data-lp-href]").each((_, el) => {
    const targetUrl = lang === "ja" ? BASE : `${BASE}${lang}/`;
    $(el).attr("href", targetUrl);
  });

  // 7. data-lp-download-href の置換（LPダウンロード位置へのアンカー）
  $("[data-lp-download-href]").each((_, el) => {
    const targetUrl = lang === "ja" ? `${BASE}#download` : `${BASE}${lang}/#download`;
    $(el).attr("href", targetUrl);
  });

  // 8. data-manual-link の href 置換
  $("[data-manual-link]").each((_, el) => {
    const targetPage = $(el).attr("data-manual-link");
    const targetUrl = lang === "ja" ? `${BASE}manual/${targetPage}.html` : `${BASE}${lang}/manual/${targetPage}.html`;
    $(el).attr("href", targetUrl);
  });

  // 9. サイドバーのアクティブクラス付与
  $(`.manual-menu-item[data-menu-id="${pageName}"]`).addClass("active");

  // 10. コンテンツ表示制御
  $(`#content-${pageName}`).removeAttr("style");

  // 11. スクリーンショット画像のローカライズと絶対パス化
  //     当該言語 → FALLBACK_LANG の順に探し、どちらも無ければ画像枠ごと削除する
  //     （未撮影のスクショで壊れた画像アイコンが出ないようにするため）。
  //     同名の .gif があれば GIF アニメーションを優先する。
  $("[data-screenshot-path]").each((_, el) => {
    const file = $(el).attr("data-screenshot-path");
    const gifFile = file.replace(/\.[^/.]+$/, ".gif");

    const candidates = [
      `assets/manual/${lang}/${gifFile}`,
      `assets/manual/${lang}/${file}`,
      `assets/manual/${FALLBACK_LANG}/${gifFile}`,
      `assets/manual/${FALLBACK_LANG}/${file}`,
    ];
    const found = candidates.find((p) => existsSync(join(__dirname, p)));

    if (!found) {
      const container = $(el).closest(".manual-image-container");
      (container.length ? container : $(el)).remove();
      return;
    }

    $(el).attr("src", absolutize(found));
  });

  // 12. アセットパス絶対化
  $("img[src], script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith(BASE) && !src.startsWith("http")) {
      $(el).attr("src", absolutize(src));
    }
  });
  $("link[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith(BASE) && !href.startsWith("http")) {
      $(el).attr("href", absolutize(href));
    }
  });

  // 13. 自前アセットに ?v=<内容ハッシュ> を付ける（手書きの ?v=2.5.7 もここで上書きされる）
  stampAssetVersions($);

  return $.html();
}

// --- 実行 -----------------------------------------------------------------
// LPのビルド
for (const lang of LANGS) {
  const html = buildPage(lang);
  if (lang === "ja") {
    writeFileSync(join(__dirname, "index.html"), html);
    console.log("✓ index.html (ja)");
  } else {
    mkdirSync(join(__dirname, lang), { recursive: true });
    writeFileSync(join(__dirname, lang, "index.html"), html);
    console.log(`✓ ${lang}/index.html`);
  }
}

// マニュアルページのビルド
for (const page of MANUAL_PAGES) {
  for (const lang of LANGS) {
    const html = buildManualPage(lang, page);
    if (lang === "ja") {
      mkdirSync(join(__dirname, "manual"), { recursive: true });
      writeFileSync(join(__dirname, "manual", `${page}.html`), html);
      console.log(`✓ manual/${page}.html (ja)`);
    } else {
      mkdirSync(join(__dirname, lang, "manual"), { recursive: true });
      writeFileSync(join(__dirname, lang, "manual", `${page}.html`), html);
      console.log(`✓ ${lang}/manual/${page}.html`);
    }
  }
}

writeFileSync(join(__dirname, "sitemap.xml"), buildSitemap());
console.log("✓ sitemap.xml");

writeFileSync(join(__dirname, "sitemap.txt"), buildSitemapTxt());
console.log("✓ sitemap.txt");
console.log("\nBuild complete.");
