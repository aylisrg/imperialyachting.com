"use client";

import { useEffect } from "react";
import { pickUtm, UTM_STORAGE } from "@/lib/careers/utm";

/**
 * IY-1142: запоминает метки объявления из адреса при заходе в раздел вакансий, чтобы они
 * дошли до отклика и после перехода «вакансия → форма» (ссылка «Откликнуться» адрес не несёт).
 * Новая ссылка с метками заменяет прежние; заход без меток прежние не стирает.
 */
export default function UtmKeeper() {
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const utm = pickUtm((k) => q.get(k));
      if (Object.keys(utm).length) sessionStorage.setItem(UTM_STORAGE, JSON.stringify(utm));
    } catch {
      /* хранилище закрыто (частный режим) — метки уйдут только из адреса формы */
    }
  }, []);
  return null;
}
