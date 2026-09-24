import ja from "./ja.js";
import en from "./en.js";
import de from "./de.js";
import fr from "./fr.js";
import ko from "./ko.js";
import addons from "./addons.js";

export default {
  ja: { ...ja, i18n: { ...ja.i18n, ...addons.ja } },
  en: { ...en, i18n: { ...en.i18n, ...addons.en } },
  de: { ...de, i18n: { ...de.i18n, ...addons.de } },
  fr: { ...fr, i18n: { ...fr.i18n, ...addons.fr } },
  ko: { ...ko, i18n: { ...ko.i18n, ...addons.ko } },
};
