/* ==========================================================================
   Ploto LP - 多言語プリレンダリング ビルドスクリプト
   --------------------------------------------------------------------------
   編集元: template.html ＋ locales/*.js
   生成物: index.html(ja) / {lang}/index.html / sitemap.xml
   使い方: node build.js   （または npm run build）
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as cheerio from "cheerio";
import locales from "./locales/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- 設定 -----------------------------------------------------------------
const SITE = "https://hiroking-ocean.github.io/ploto_LP/"; // 末尾スラッシュ必須
const BASE = "/ploto_LP/"; // GitHub Pages のサブパス（絶対パス化に使用）
const LANGS = ["ja", "en", "de", "fr", "ko"];
const LASTMOD = "2026-06-30";

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

  // 8. アセットパス絶対化（サブ階層 /en/ で 404 しないように）
  $("img[src], script[src]").each((_, el) => {
    const a = el.tagName === "img" ? "src" : "src";
    $(el).attr(a, absolutize($(el).attr(a)));
  });
  $("link[href]").each((_, el) => {
    $(el).attr("href", absolutize($(el).attr("href")));
  });

  return $.html();
}

function buildSitemap() {
  const alts = LANGS.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l)}"/>`
  ).join("\n");
  const xdefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor("ja")}"/>`;
  const urls = LANGS.map(
    (lang) => `  <url>
    <loc>${urlFor(lang)}</loc>
${alts}
${xdefault}
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang === "ja" ? "1.0" : "0.8"}</priority>
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

// --- 実行 -----------------------------------------------------------------
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
writeFileSync(join(__dirname, "sitemap.xml"), buildSitemap());
console.log("✓ sitemap.xml");
console.log("\nBuild complete.");
