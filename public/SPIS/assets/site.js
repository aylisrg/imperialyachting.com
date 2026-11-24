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

// IY-2280: demo of the agent booking cabinet. Sample data only: no network requests, no real bookings.
const bookingDemo = document.querySelector("[data-booking-demo]");
if (bookingDemo) {
  const q = (selector) => bookingDemo.querySelector(selector);
  const BOATS = {
    // Per hour, AED, excl. 5% VAT: hold = standard B2B (hold for 12 hours), fast = pay within 2 hours.
    montecarlo: { name: "Monte Carlo 60", hold: 1600, fast: 1500 },
    vandutch: { name: "Van Dutch 40", hold: 800, fast: 750 },
    maybach: { name: "Maybach", hold: 1200, fast: 1125 },
  };
  const DAYS = ["Thu 26 Nov", "Fri 27 Nov", "Sat 28 Nov"];
  const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i); // 09:00–22:00, hourly start slots
  const status = q("[data-booking-status]");
  const hoursBox = q("[data-agent-hours]");
  const prebook = q("[data-agent-prebook]");
  const rowsBox = q("[data-agent-rows]");
  const tab = (id) => document.getElementById(id);
  const state = { boat: "montecarlo", day: 0, start: null, duration: 2, holds: [] };
  const busy = {};
  let nextId = 1;
  let ticker;

  const hh = (h) => String(h).padStart(2, "0") + ":00";
  const aed = (n) => n.toLocaleString("en-US") + " AED";
  const key = (boat, day) => boat + "|" + day;

  // Deterministic sample: a few booked blocks per boat and day.
  for (const [boatIndex, boat] of Object.keys(BOATS).entries()) {
    DAYS.forEach((_, day) => {
      const taken = {};
      let seed = boatIndex * 7 + day * 3 + 1;
      for (let block = 0; block < 2; block += 1) {
        seed = (seed * 9301 + 49297) % 233280;
        const start = 9 + (seed % 12);
        const length = 2 + (seed % 2);
        for (let h = start; h < Math.min(start + length, 22); h += 1) taken[h] = "booked";
      }
      busy[key(boat, day)] = taken;
    });
  }

  function slotState(h) {
    const hold = state.holds.find((x) => x.boat === state.boat && x.day === state.day && x.status !== "Cancelled" && h >= x.start && h < x.start + x.duration);
    if (hold) return hold.status === "Paid" ? "booked" : "held";
    return busy[key(state.boat, state.day)][h] || "free";
  }
  function fits(start, duration) {
    if (start + duration > 22) return false;
    for (let h = start; h < start + duration; h += 1) if (slotState(h) !== "free") return false;
    return true;
  }
  function chip(label, pressed, onClick, disabled = false) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.disabled = disabled;
    b.setAttribute("aria-pressed", String(pressed));
    b.addEventListener("click", onClick);
    return b;
  }
  function left(hold) {
    const s = Math.max(0, Math.ceil((hold.expires - Date.now()) / 1000));
    return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map((p) => String(p).padStart(2, "0")).join(":");
  }

  function renderCalendar() {
    q("[data-agent-cal-label]").textContent = BOATS[state.boat].name + " · " + DAYS[state.day] + " · Dubai time";
    const boats = q("[data-agent-boat-chips]"); boats.replaceChildren();
    for (const [id, boat] of Object.entries(BOATS)) boats.append(chip(boat.name, id === state.boat, () => { state.boat = id; state.start = null; renderCalendar(); }));
    const days = q("[data-agent-day-chips]"); days.replaceChildren();
    DAYS.forEach((label, i) => days.append(chip(label, i === state.day, () => { state.day = i; state.start = null; renderCalendar(); })));
    const scrolled = hoursBox.scrollLeft;
    hoursBox.replaceChildren();
    for (const h of HOURS) {
      const kind = slotState(h);
      const hold = kind === "held" && state.holds.find((x) => x.boat === state.boat && x.day === state.day && x.status === "Pre-booked" && h >= x.start && h < x.start + x.duration);
      const picked = state.start !== null && h >= state.start && h < state.start + state.duration;
      const cell = document.createElement(kind === "free" ? "button" : "div");
      cell.className = "agent-hour is-" + kind + (picked ? " is-picked" : "");
      if (kind === "free") { cell.type = "button"; cell.setAttribute("aria-pressed", String(picked)); cell.addEventListener("click", () => pick(h)); }
      const label = kind === "free" ? "Free" : kind === "held" ? "Held" : "Booked";
      cell.innerHTML = "<time></time><span></span>";
      cell.querySelector("time").textContent = hh(h);
      cell.querySelector("span").textContent = picked ? "Selected" : label;
      if (hold && h === hold.start) { const t = document.createElement("small"); t.dataset.agentTimer = hold.id; t.textContent = left(hold); cell.append(t); }
      cell.setAttribute("aria-label", hh(h) + " " + (picked ? "selected" : label.toLowerCase()));
      hoursBox.append(cell);
    }
    hoursBox.scrollLeft = scrolled;
    renderPrebook();
  }

  function pick(h) {
    state.start = h;
    if (!fits(h, state.duration)) state.duration = [2, 3, 4, 1].find((d) => fits(h, d)) || 1;
    renderCalendar();
    prebook.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderPrebook() {
    prebook.hidden = state.start === null;
    if (state.start === null) return;
    const boat = BOATS[state.boat];
    q("[data-agent-pick]").textContent = boat.name + " · " + DAYS[state.day] + " · " + hh(state.start) + "–" + hh(state.start + state.duration);
    const durations = q("[data-agent-durations]"); durations.replaceChildren();
    for (const d of [1, 2, 3, 4]) durations.append(chip(d + " h", d === state.duration, () => { state.duration = d; renderCalendar(); }, !fits(state.start, d)));
    q('[data-agent-price="2"]').textContent = aed(boat.fast * state.duration) + " · " + aed(boat.fast) + "/h";
    q('[data-agent-price="12"]').textContent = aed(boat.hold * state.duration) + " · " + aed(boat.hold) + "/h";
  }

  function renderBalance() {
    const active = state.holds.filter((x) => x.status === "Pre-booked");
    q("[data-agent-count]").textContent = active.length ? active.length + " pre-booked" : "No pre-bookings";
    q("[data-agent-empty]").hidden = state.holds.length > 0;
    q("[data-agent-info-held]").textContent = active.reduce((n, x) => n + x.duration, 0) + " h";
    rowsBox.replaceChildren();
    for (const hold of [...state.holds].reverse()) {
      const li = document.createElement("li");
      li.className = "agent-row is-" + hold.status.toLowerCase().replace(/\W+/g, "-");
      li.innerHTML = '<div><strong></strong><span></span></div><div class="agent-row-state"><em></em><b></b></div><div class="agent-row-actions"></div>';
      li.querySelector("strong").textContent = hold.boat_name + " · " + DAYS[hold.day] + " · " + hh(hold.start) + "–" + hh(hold.start + hold.duration);
      li.querySelector("span").textContent = (hold.hours === 2 ? "Pay within 2 hours" : "Hold for 12 hours") + " · " + aed(hold.price);
      li.querySelector("em").textContent = hold.status;
      const timer = li.querySelector("b");
      if (hold.status === "Pre-booked") { timer.dataset.agentTimer = hold.id; timer.textContent = left(hold); }
      if (hold.status === "Pre-booked") {
        const actions = li.querySelector(".agent-row-actions");
        const pay = document.createElement("button"); pay.type = "button"; pay.className = "button"; pay.textContent = "Pay online";
        pay.addEventListener("click", () => settle(hold, "Paid", "Sample payment marked as paid. The hours now show as booked. No card was charged."));
        const cancel = document.createElement("button"); cancel.type = "button"; cancel.className = "quiet-button"; cancel.textContent = "Cancel hold";
        cancel.addEventListener("click", () => settle(hold, "Cancelled", "Sample hold cancelled. The hours are free again."));
        actions.append(pay, cancel);
      }
      rowsBox.append(li);
    }
  }

  function settle(hold, next, message) {
    hold.status = next;
    status.textContent = message;
    renderBalance(); renderCalendar();
    tab("broker-tab-balance").focus({ preventScroll: true });
  }

  function tick() {
    for (const hold of state.holds) {
      if (hold.status === "Pre-booked" && hold.expires <= Date.now()) { hold.status = "Expired"; renderBalance(); renderCalendar(); }
    }
    for (const el of bookingDemo.querySelectorAll("[data-agent-timer]")) {
      const hold = state.holds.find((x) => String(x.id) === el.dataset.agentTimer);
      if (hold) el.textContent = left(hold);
    }
    if (!state.holds.some((x) => x.status === "Pre-booked")) { clearInterval(ticker); ticker = null; }
  }

  q("[data-agent-confirm]").addEventListener("click", () => {
    if (state.start === null || !fits(state.start, state.duration)) return;
    const hours = Number(q('input[name="agent-option"]:checked').value);
    const boat = BOATS[state.boat];
    const hold = { id: nextId++, boat: state.boat, boat_name: BOATS[state.boat].name, day: state.day, start: state.start, duration: state.duration, hours, price: (hours === 2 ? boat.fast : boat.hold) * state.duration, status: "Pre-booked", expires: Date.now() + hours * 3600000 };
    state.holds.push(hold);
    state.start = null;
    status.textContent = hours === 2
      ? "Sample pre-booking: pay within 2 hours."
      : "Sample pre-booking: held for 12 hours.";
    renderBalance(); renderCalendar();
    if (!ticker) ticker = setInterval(tick, 1000);
  });
  q("[data-agent-close]").addEventListener("click", () => { state.start = null; renderCalendar(); });

  for (const button of bookingDemo.querySelectorAll("[data-agent-boat]")) {
    button.addEventListener("click", () => {
      state.boat = button.dataset.agentBoat; state.start = null;
      renderCalendar();
      tab("broker-tab-calendar").click();
      tab("broker-tab-calendar").focus({ preventScroll: true });
    });
  }

  renderCalendar(); renderBalance();
}
