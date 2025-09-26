import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

export const initLocalization = () => {
  i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
      fallbackLng: "en",
      preload: ["en", "sk"],
      backend: {
        loadPath: path.join(__dirname, "../locales/{{lng}}.json"),
      },
      detection: {
        order: ["header"],
        caches: false,
        lookupHeader: "language",
      },
    });

  return middleware.handle(i18next);
};
