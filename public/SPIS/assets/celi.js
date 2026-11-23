"use strict";
// IY-2251: цели Метрики 114603316 на кликах по внешним ссылкам SPIS (список целей — Маркетолог).
(function () {
  var SCHETCHIK = 114603316;
  var CELI = {
    Yb4: "spis_whatsapp", "3oa": "spis_whatsapp", OUf: "spis_whatsapp", "1xq": "spis_whatsapp",
    lGw: "spis_booking_ai", Xni: "spis_booking_ai",
    crm: "spis_calendar",
    mnQ: "spis_catalogue",
    "0sr": "spis_fleet", bYD: "spis_fleet", EZp: "spis_fleet", Gb2: "spis_fleet",
    IuN: "spis_fleet", mdl: "spis_fleet", uhd: "spis_fleet", zoT: "spis_fleet"
  };
  function cel(imya, dalshe) {
    var sdelano = false;
    function idti() { if (!sdelano) { sdelano = true; if (dalshe) dalshe(); } }
    try {
      if (typeof window.ym === "function") { window.ym(SCHETCHIK, "reachGoal", imya, {}, idti); }
      else { idti(); return; }
    } catch (e) { idti(); return; }
    if (dalshe) setTimeout(idti, 600);
  }
  window.spisCel = cel;
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var m = /^https?:\/\/iy\.je\/([A-Za-z0-9]+)\/?$/.exec(a.href);
    var imya = m && CELI[m[1]];
    if (!imya) return;
    var novoeOkno = a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0;
    if (novoeOkno || e.defaultPrevented) { cel(imya); return; }
    e.preventDefault();
    cel(imya, function () { window.location.href = a.href; });
  }, true);
})();
