"use strict";

for (const calendar of document.querySelectorAll("[data-yacht-calendar]")) {
  const sources = [...calendar.querySelectorAll("[data-yc-source]")];
  const events = [...calendar.querySelectorAll("[data-yc-event]")];
  const detail = calendar.querySelector("[data-yc-detail]");
  const title = calendar.querySelector("[data-yc-detail-title]");
  const metadata = calendar.querySelector("[data-yc-detail-meta]");

  function clearSelection() {
    for (const event of events) event.setAttribute("aria-pressed", "false");
    detail.className = "yc-event-detail";
    title.textContent = "Select an event";
    metadata.textContent = "See its time and where it came from.";
  }

  for (const event of events) {
    event.addEventListener("click", () => {
      for (const item of events) item.setAttribute("aria-pressed", String(item === event));
      detail.className = "yc-event-detail " + [...event.classList]
        .filter((name) => name !== "yc-event")
        .join(" ");
      title.textContent = event.querySelector("strong").textContent;
      metadata.textContent = `${event.dataset.ycWhen} · Dubai (UTC+4) · ${event.dataset.ycOrigin}`;
    });
  }

  function updateSources() {
    for (const source of sources) {
      for (const event of events.filter((item) => item.dataset.ycEvent === source.value)) {
        event.hidden = !source.checked;
      }
    }
    const selectedIsHidden = events.some((event) => event.hidden && event.getAttribute("aria-pressed") === "true");
    if (selectedIsHidden) clearSelection();
  }

  for (const source of sources) source.addEventListener("change", updateSources);
  updateSources();
}
