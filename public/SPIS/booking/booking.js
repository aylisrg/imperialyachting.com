"use strict";

const bookingExample = document.querySelector("#booking-engine");

if (bookingExample) {
  const exampleTime = bookingExample.querySelector("[data-example-time]");

  for (const option of bookingExample.querySelectorAll('input[name="example-time"]')) {
    option.addEventListener("change", () => {
      exampleTime.textContent = option.value;
    });
  }

  for (const button of bookingExample.querySelectorAll("[data-tab-step]")) {
    button.addEventListener("click", () => {
      bookingExample.querySelector('[role="tab"][aria-selected="true"]').focus();
    });
  }
}
