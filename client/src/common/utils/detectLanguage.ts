import i18n from "@/i18n";

export const detectLanguage = async () => {
  // Only detect if no language is set
  if (localStorage.getItem("i18nextLng")) {
    return;
  }

  try {
    const res = await fetch("https://ipinfo.io/json?token=7ba74eea907365");
    const data = await res.json();
    // console.log("IP API response:", data);

    // Map countries to your supported languages
    const langMap: Record<string, string> = {
      // Vietnam
      VN: "vi",
      // Spanish speaking countries
      ES: "es",
      MX: "es",
      AR: "es",
      CO: "es",
      PE: "es",
      VE: "es",
      CL: "es",
      // Chinese speaking countries/regions
      CN: "zh",
      TW: "zh",
      HK: "zh",
      SG: "zh",
      // Japanese
      JP: "ja",
      // Korean
      KR: "ko",
      // Thai
      TH: "th",
      // Hindi (India)
      IN: "hi",
      // English speaking countries (fallback to en)
      US: "en",
      GB: "en",
      AU: "en",
      CA: "en",
      NZ: "en",
    };

    const detectedLang = langMap[data.country] || "en";

    // Only change if it's one of your supported languages
    if (detectedLang) {
      await i18n.changeLanguage(detectedLang);
      console.log(`🌍 Language detected: ${detectedLang} (${data.country})`);
    }
  } catch (error) {
    console.warn("Language detection failed:", error);
  }
};
