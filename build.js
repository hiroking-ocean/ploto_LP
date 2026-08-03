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
// app.js は locales/*.js を import するため、翻訳の変更もハッシュに含める。
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
  // manual.js は locales を読み込まない（プリレンダリング済みのため）ので自分自身のみ
  "manual.js": hashOf(["manual.js"]),
};

// --- 画像の実寸取得 ---------------------------------------------------------
// lazy 読み込みは width/height（= 内在アスペクト比）が無いと機能しない。高さ0の
// 画像は「全部ビューポート内」と判定され、結局すべて先読みされてしまうため。
// スクショは PNG か GIF なのでヘッダを直接読む（依存パッケージを増やさない）。
const imageSizeCache = new Map();
function imageSize(relPath) {
  if (imageSizeCache.has(relPath)) return imageSizeCache.get(relPath);
  let size = null;
  try {
    const buf = readFileSync(join(__dirname, relPath));
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      // PNG: 8バイトのシグネチャ + IHDR チャンク(長さ4 + 型4)の直後が幅・高さ
      size = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    } else if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
      // GIF: 論理画面記述子の先頭がリトルエンディアンの幅・高さ
      size = { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
  } catch {
    size = null;
  }
  imageSizeCache.set(relPath, size);
  return size;
}

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

/**
 * data-screenshot-path が付いた <img> を当該言語の実ファイルへ解決する。
 * 当該言語 → FALLBACK_LANG の順に探し、同名の .gif があればそちらを優先する
 * （GIF アニメーションのほうが伝わる操作説明があるため）。
 * あわせて実寸と lazy 読み込み属性を付ける。width/height が無いと内在アスペクト比が
 * 決まらず、高さ0の画像が「全部ビューポート内」と判定されて lazy が効かなくなる。
 *
 * 見つからなかったときの落とし方は呼び出し側で変わるので onMissing に委ねる。
 * マニュアルは画像枠ごと消す。LPは画像を消して CSS モックを残す。
 *
 * @param {object} opts
 * @param {boolean} opts.eagerFirst 1枚目を eager + 高優先度で読ませるか（LCP対策）
 * @param {(el:any)=>void} opts.onMissing 画像が1つも見つからなかったときの処理
 */
function resolveScreenshots($, lang, { eagerFirst, onMissing }) {
  let isFirst = true;

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
      onMissing($(el));
      return;
    }

    $(el).attr("src", absolutize(found));

    const size = imageSize(found);
    if (size) {
      $(el).attr("width", String(size.width));
      $(el).attr("height", String(size.height));
    }

    if (eagerFirst && isFirst) {
      $(el).attr("loading", "eager").attr("fetchpriority", "high");
      isFirst = false;
    } else {
      $(el).attr("loading", "lazy").attr("fetchpriority", "low");
    }
    $(el).attr("decoding", "async");
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

  // 主要機能セクションの5画面は HTML/CSS で組んであるので、LP 側に
  // スクリーンショットの解決処理は要らない（resolveScreenshots はマニュアル専用）。

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
  //     テンプレートは全ページ分の <article> を持つが、1ページに必要なのは1つだけ。
  //     display:none の記事も画像は取得されるため（ブラウザは非表示要素の img も
  //     ダウンロードする）、残したままだと他ページ分の数MBを毎回読むことになる。
  //     HTML自体も 89KB → 20KB 程度まで減るので、ここで丸ごと取り除く。
  $(`.manual-article:not(#content-${pageName})`).remove();
  $(`#content-${pageName}`).removeAttr("style");

  // 11. スクリーンショット画像のローカライズと絶対パス化
  //     未撮影のときは画像枠ごと削除する（壊れた画像アイコンを出さないため）。
  //     最初の1枚はファーストビューに入るので eager + 高優先度で読ませる。
  resolveScreenshots($, lang, {
    eagerFirst: true,
    onMissing: ($el) => {
      const container = $el.closest(".manual-image-container");
      (container.length ? container : $el).remove();
    },
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
