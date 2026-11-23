"use strict";

const whatsapp = "https://wa.me/971585272280"; // IY-2251: номер выставки, слово Ильи 23.11
const campaign = "Dubai Yacht Show";

function whatsappUrl(message) {
  const url = new URL(whatsapp);
  url.searchParams.set("text", message);
  return url.href;
}


for (const menu of document.querySelectorAll("[data-mobile-nav]")) {
  for (const link of menu.querySelectorAll("a")) {
    link.addEventListener("click", () => { menu.open = false; });
  }
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
}

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
for (const group of document.querySelectorAll("[data-tabset]")) {
  const tabs = [...group.querySelectorAll('[role="tab"]')];

  function selectTab(index, focus = false) {
    for (const [position, tab] of tabs.entries()) {
      const active = position === index;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      panel.classList.toggle("tab-entering", active && panel.hidden && !reducedMotion.matches);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    }

    if (focus) tabs[index].focus({ preventScroll: true });
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", (event) => {
      const positions = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = positions[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next, true);
    });
  }

  for (const button of group.querySelectorAll("[data-tab-step]")) {
    button.addEventListener("click", () => {
      const active = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
      const next = (active + Number(button.dataset.tabStep) + tabs.length) % tabs.length;
      selectTab(next);
    });
  }
}

if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches) entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px 45px 0px", threshold: 0.06 });
  for (const element of document.querySelectorAll("[data-reveal]")) sceneObserver.observe(element);
}

const enquiry = document.getElementById("enquiry-form");
if (enquiry) {
  enquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = new FormData(enquiry);
    const yacht = fields.get("yacht").trim();
    const help = fields.get("help").trim();
    if (!help) {
      enquiry.elements.help.value = "";
      enquiry.elements.help.reportValidity();
      return;
    }
    const lines = [
      "Hello Elliott's assistant. I’d like to enquire about yacht management.",
      `I’m a ${fields.get("role")}.`,
      yacht ? `Yacht: ${yacht}` : "",
      help,
      `[${campaign} · Imperial Yachting]`,
    ];
    const adres = whatsappUrl(lines.filter(Boolean).join("\n"));
    if (typeof window.spisCel === "function") window.spisCel("spis_whatsapp", () => window.location.assign(adres));
    else window.location.assign(adres);
  });
}

const bookingDemo = document.querySelector("[data-booking-demo]");
if (bookingDemo) {
  const status = bookingDemo.querySelector("[data-booking-status]");
  const slot = bookingDemo.querySelector("[data-booking-slot]");
  const balance = bookingDemo.querySelector("[data-booking-chip]");
  const timer = bookingDemo.querySelector("[data-booking-timer]");
  const release = bookingDemo.querySelector("[data-hold-release]");
  const balanceTab = document.getElementById("broker-tab-balance");
  const availability = bookingDemo.querySelector("[data-booking-availability]");
  const holdButtons = [...bookingDemo.querySelectorAll("[data-hold-hours]")];
  const requests = bookingDemo.querySelector("[data-booking-requests]");
  const captainNote = bookingDemo.querySelector("[data-captain-note]");
  const captainText = bookingDemo.querySelector("[data-captain-text]");
  let expiresAt = 0;
  let timerId;

  function clearHold(message) {
    clearInterval(timerId);
    expiresAt = 0;
    balance.textContent = "No hold";
    slot.textContent = "Available";
    slot.classList.remove("is-held");
    timer.textContent = "—";
    release.disabled = true;
    captainNote.hidden = true;
    captainText.textContent = "";
    availability.textContent = "Try a hold on the 18:00 sample slot.";
    for (const button of holdButtons) button.disabled = false;
    status.textContent = message;
  }

  function showCountdown() {
    const secondsLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    if (!secondsLeft) {
      clearHold("The sample hold expired. The 18:00 sample slot is available again.");
      return;
    }
    const parts = [
      Math.floor(secondsLeft / 3600),
      Math.floor(secondsLeft % 3600 / 60),
      secondsLeft % 60,
    ];
    timer.textContent = parts.map((part) => String(part).padStart(2, "0")).join(":");
  }

  for (const button of holdButtons) {
    button.addEventListener("click", () => {
      const hours = Number(button.dataset.holdHours);
      clearInterval(timerId);
      expiresAt = Date.now() + hours * 3600000;
      balance.textContent = "Hold active";
      slot.textContent = "Held";
      slot.classList.add("is-held");
      release.disabled = false;
      captainText.textContent = requests.value.trim();
      captainNote.hidden = !captainText.textContent;
      availability.textContent = "The 18:00 sample slot is held.";
      for (const button of holdButtons) button.disabled = true;
      status.textContent = `Sample hold placed for ${hours} hours. The 18:00 slot now shows as held in Calendar.`;
      showCountdown();
      timerId = setInterval(showCountdown, 1000);
      balanceTab.click();
      balanceTab.focus({ preventScroll: true });
    });
  }

  release.addEventListener("click", () => {
    clearHold("Sample hold released. The 18:00 slot is available again.");
    balanceTab.focus({ preventScroll: true });
  });
}
