(() => {
  "use strict";

  const roles = {
    office: { name: "Office", short: "Incoming requests", color: "#7e95a5", hair: "#54626b", mode: "message", seat: [658, 572], work: [650, 520], label: [560, 588], chair: [616, 486, 100, 105], purpose: "Picks up incoming requests and gets the right specialist involved.", input: "WhatsApp, Telegram, email and connected channels", output: "A request with context and a responsible role", activity: "Routing an enquiry" },
    sales: { name: "Sales", short: "WhatsApp & enquiries", color: "#557e9d", hair: "#41494e", mode: "type", seat: [273, 446], work: [265, 283], label: [320, 425], chair: [238, 351, 73, 79], purpose: "Answers enquiries using the yacht calendar and passes the guest's requirements to the team.", input: "Enquiry, availability and guest wishes", output: "A clear reply and the next booking step", activity: "Replying in WhatsApp" },
    designer: { name: "Designer", short: "Brochures & visuals", color: "#a4aeb4", hair: "#7c7268", mode: "draw", seat: [249, 666], work: [238, 523], label: [302, 640], chair: [212, 564, 77, 84], purpose: "Shows how a design specialist prepares a yacht brochure for the conversation.", input: "Yacht media and the broker or guest audience", output: "A brochure with the appropriate branding", activity: "Drawing a brochure" },
    booking: { name: "Booking", short: "Shared calendar", color: "#688ba4", hair: "#63584d", mode: "type", seat: [234, 897], work: [230, 716], label: [292, 872], chair: [196, 795, 78, 88], purpose: "Checks availability and places a hold in the shared yacht calendar.", input: "Yacht, requested slot and hold option", output: "A held slot visible across the system", activity: "Updating the calendar" },
    crew: { name: "Crew & Logbook", short: "Trips & maintenance", color: "#586f85", hair: "#4b525a", mode: "paper", seat: [1259, 447], work: [1243, 331], label: [1092, 425], chair: [1219, 351, 79, 78], purpose: "Keeps the captain's trip details, service work and vessel history together.", input: "Guest wishes, crew messages and service requests", output: "Trip notes and an updated yacht record", activity: "Updating the logbook" },
    finance: { name: "Finance", short: "Invoices & receipts", color: "#667788", hair: "#7a6b60", mode: "paper", seat: [1280, 666], work: [1280, 491], label: [1090, 642], chair: [1241, 565, 81, 87], purpose: "Checks invoices and records approved spending with its supporting receipt.", input: "Invoice, expense request and human approval", output: "A checked expense with a recorded receipt", activity: "Checking an invoice" },
    legal: { name: "Legal", short: "Documents & deadlines", color: "#727d8a", hair: "#4b4544", mode: "paper", seat: [1313, 903], work: [1298, 719], label: [1115, 893], chair: [1273, 805, 82, 89], purpose: "Tracks document deadlines and prepares the renewal work before a yacht is affected.", input: "Vessel documents, expiry dates and next trip", output: "A renewal pack and an updated document record", activity: "Reviewing documents" },
    pm: { name: "PM", short: "Projects & handoffs", color: "#4d7396", hair: "#444e55", mode: "board", seat: [805, 302], work: [748, 137], label: [876, 287], purpose: "Gives work a responsible role, a deadline and a result to be checked.", input: "Requests, dependencies and specialist updates", output: "An assigned task and a clear next step", activity: "Reviewing the project" },
    qa: { name: "Quality check", short: "Independent verification", color: "#78918c", hair: "#53575b", mode: "type", seat: [758, 880], work: [756, 687], label: [824, 916], chair: [714, 787, 86, 92], purpose: "Checks the result against the task and its evidence before it is closed.", input: "Expected result, completed work and evidence", output: "A verified result or a request for correction", activity: "Checking the result" }
  };

  // Positions on the three-by-three portrait sheet, kept independent of roster order.
  const portraitPositions = {
    office: "0% 0%", sales: "50% 0%", designer: "100% 0%",
    booking: "0% 50%", crew: "50% 50%", finance: "100% 50%",
    legal: "0% 100%", pm: "50% 100%", qa: "100% 100%"
  };

  const stories = {
    charter: {
      label: "WhatsApp → booking",
      question: "“Is VanDutch available tomorrow evening?”",
      steps: [
        { role: "office", title: "An enquiry arrives.", description: "The office picks up the WhatsApp message and passes the request to Sales.", result: "An enquiry with a yacht and a requested time.", short: "Receive enquiry" },
        { role: "sales", title: "Sales checks the details.", description: "Sales checks the yacht calendar and replies in WhatsApp. Guest wishes stay with the enquiry.", result: "A reply based on the shared calendar.", short: "Reply in WhatsApp" },
        { role: "designer", title: "A brochure joins the reply.", description: "The design desk prepares the right version. Brokers receive an unbranded brochure. Guests receive the branded version.", result: "The right brochure for the audience.", short: "Prepare brochure" },
        { role: "booking", title: "One slot. One hold.", description: "Booking places a hold. The same slot is blocked across the shared yacht calendar.", result: "A held slot with its expiry recorded.", short: "Hold the slot" },
        { role: "crew", title: "The captain gets the context.", description: "Guest wishes pass into the trip note, ready for the crew to prepare the yacht.", result: "Trip details and requests in the yacht record.", short: "Brief the captain" },
        { role: "qa", title: "The handoff is checked.", description: "A separate checker reviews the booking details, the calendar record and the handoff to the crew.", result: "The booking workflow has been checked.", short: "Check the details" },
        { role: "pm", title: "The loop is closed.", description: "PM checks that each part of the enquiry has an owner and a recorded outcome.", result: "One enquiry. A coordinated team.", short: "Close the task" }
      ]
    },
    maintenance: {
      label: "Captain → approved work",
      question: "“The yacht needs an engine service.”",
      steps: [
        { role: "crew", title: "A request enters the logbook.", description: "The captain's service request becomes a task linked to the yacht.", result: "The request is recorded with its vessel context.", short: "Record the request" },
        { role: "pm", title: "The work gets an owner.", description: "PM assigns the service task, its deadline and the evidence needed to accept the result.", result: "A responsible role and a defined outcome.", short: "Assign the work" },
        { role: "finance", title: "The invoice is checked.", description: "Finance reviews the service invoice and prepares it for a person's approval.", result: "A checked request ready for approval.", short: "Check the invoice" },
        { role: "pm", title: "A person approves the spend.", description: "The workflow waits here. In this illustration, approve the example to see the next part.", result: "The human decision is recorded before payment.", short: "Human approval", approval: true },
        { role: "finance", title: "The receipt stays with it.", description: "After approval, payment and its receipt are recorded. The confirmation can return to the yacht chat.", result: "An approved expense with its supporting receipt.", short: "Record the receipt" },
        { role: "crew", title: "The vessel history grows.", description: "Completed maintenance and its documents are added to the yacht's service history.", result: "The work is traceable in the logbook.", short: "Update the logbook" },
        { role: "qa", title: "Completion is verified.", description: "A separate checker compares the recorded work and evidence with the task's expected result.", result: "The task closes after its result is checked.", short: "Verify the work" }
      ]
    },
    renewal: {
      label: "Expiry date → renewed record",
      question: "“A yacht document needs renewal before the next trip.”",
      steps: [
        { role: "legal", title: "The deadline is spotted.", description: "Legal identifies an approaching document expiry in the yacht's renewal register.", result: "A renewal deadline linked to the document.", short: "Read the deadline" },
        { role: "crew", title: "The next trip is checked.", description: "The logbook compares the document date with the yacht's next planned trip.", result: "The deadline is understood in the trip's context.", short: "Check the next trip" },
        { role: "pm", title: "Renewal becomes a task.", description: "PM assigns the work in advance, with a responsible role and a due date.", result: "A renewal task before the document expires.", short: "Assign the renewal" },
        { role: "legal", title: "The renewal pack is prepared.", description: "Legal gathers the required vessel documents and prepares the pack for review.", result: "A renewal pack ready for a person to review.", short: "Prepare documents" },
        { role: "pm", title: "A person reviews the submission.", description: "The workflow waits for a person's decision. Approve the example to continue the illustration.", result: "Approval is recorded before submission.", short: "Human approval", approval: true },
        { role: "legal", title: "The record is updated.", description: "Once the renewal is completed, the new document and its expiry date are recorded. This story compresses the elapsed time.", result: "The new document is in the vessel record.", short: "Update the record" },
        { role: "qa", title: "The new deadline is checked.", description: "The checker verifies the updated document record and its date before the task closes.", result: "A checked record for the next renewal cycle.", short: "Verify the record" }
      ]
    }
  };


  const embeddedOffice = document.querySelector("spis-ai-office");
  if (embeddedOffice && !embeddedOffice.shadowRoot) {
    const template = embeddedOffice.querySelector("template");
    embeddedOffice.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    template.remove();
  }
  const officeRoot = embeddedOffice?.shadowRoot || document;
  const get = (id) => officeRoot.getElementById(id);
  const canvas = get("office-canvas");
  const ctx = canvas.getContext("2d");
  const background = get("office-background");
  const viewport = get("office-viewport");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    story: "charter", step: 0, elapsed: 0, clock: reducedMotion.matches ? 6 : 0, playing: !reducedMotion.matches,
    visible: !embeddedOffice, selected: "office", approvals: new Set(), zoomed: false, ended: false, followActive: true
  };
  const STEP_DURATION = 6.5;
  const WORLD_WIDTH = 1536;
  const WORLD_HEIGHT = 1024;
  const storyTabs = [...officeRoot.querySelectorAll("[data-story]")];
  const roleButtons = new Map();
  let stepButtons = [];
  let hitTargets = [];
  let frame = 0;
  let lastTime = 0;
  let lastPaint = 0;

  function announce(text) {
    get("interaction-status").textContent = text;
  }

  function currentStep() {
    return stories[state.story].steps[state.step];
  }

  function approvalNeeded() {
    return Boolean(currentStep().approval && !state.approvals.has(state.step));
  }

  function showPortrait(element, roleKey) {
    element.style.setProperty("--portrait-position", portraitPositions[roleKey]);
  }

  function selectRole(key, userAction = false) {
    state.selected = key;
    const role = roles[key];
    roleButtons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === key)));
    get("role-name").textContent = role.name;
    get("role-purpose").textContent = role.purpose;
    get("role-input").textContent = role.input;
    get("role-output").textContent = role.output;
    showPortrait(get("role-avatar"), key);
    if (userAction) {
      state.followActive = false;
      announce(role.name + ". " + role.purpose);
      if (state.zoomed) centerOnRole(key);
    }
    draw();
  }

  function buildRoles() {
    const fragment = document.createDocumentFragment();
    Object.entries(roles).forEach(([key, role]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "role-button";
      button.setAttribute("aria-pressed", String(key === state.selected));
      button.setAttribute("aria-controls", "role-detail");
      button.title = role.short;
      const portrait = document.createElement("span");
      portrait.className = "role-portrait";
      portrait.setAttribute("aria-hidden", "true");
      showPortrait(portrait, key);
      const label = document.createElement("span");
      label.textContent = role.name;
      button.append(portrait, label);
      button.addEventListener("click", () => selectRole(key, true));
      roleButtons.set(key, button);
      fragment.append(button);
    });
    get("role-list").append(fragment);
  }

  function buildTimeline() {
    stepButtons = [];
    const fragment = document.createDocumentFragment();
    stories[state.story].steps.forEach((step, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      const roleLabel = document.createElement("span");
      roleLabel.textContent = step.approval ? "A person" : roles[step.role].name;
      const action = document.createElement("strong");
      action.textContent = step.short;
      button.append(roleLabel, action);
      button.addEventListener("click", () => goToStep(index, true));
      item.append(button);
      fragment.append(item);
      stepButtons.push(button);
    });
    get("step-list").replaceChildren(fragment);
  }

  function updateControls() {
    const waiting = approvalNeeded();
    get("play-icon").textContent = state.playing ? "Ⅱ" : "▷";
    get("play-label").textContent = state.playing ? "Pause" : "Play";
    get("play-toggle").setAttribute("aria-label", state.playing ? "Pause office animation" : "Play office animation");
    get("work-state").textContent = waiting ? "Awaiting a person" : state.playing ? "Working" : "Paused";
    get("previous-step").disabled = state.step === 0;
    get("next-step").disabled = waiting || state.step === stories[state.story].steps.length - 1;
    get("scene-status").textContent = waiting ? "A human decision is needed to continue." :
      state.ended ? "Story complete. Choose another story or restart." :
      state.playing ? "Follow the blue task from desk to desk." : "Paused. Choose any step to explore the work.";
    get("approval-box").hidden = !waiting;
    officeRoot.querySelector(".story-inspector").classList.toggle("is-waiting", waiting);
  }

  function updateStep() {
    const story = stories[state.story];
    const step = currentStep();
    get("story-category").textContent = story.label;
    get("story-question").textContent = story.question;
    get("step-counter").textContent = (state.step + 1) + " / " + story.steps.length;
    get("active-role").textContent = step.approval ? "Human approval" : roles[step.role].name;
    const activePortrait = get("active-role-portrait");
    activePortrait.hidden = Boolean(step.approval);
    showPortrait(activePortrait, step.role);
    get("step-heading").textContent = step.title;
    get("step-description").textContent = step.description;
    get("step-result").textContent = step.result;
    get("result-caption").textContent = step.approval ? "Decision" : state.step === story.steps.length - 1 ? "Result" : "Handoff";
    stepButtons.forEach((button, index) => {
      if (index === state.step) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      button.classList.toggle("is-done", index < state.step);
    });
    roleButtons.forEach((button, key) => button.classList.toggle("is-working", key === step.role));
    updateProgress();
    updateControls();
    draw();
  }

  function updateProgress() {
    const part = approvalNeeded() ? 0 : Math.min(state.elapsed / STEP_DURATION, 1);
    get("story-progress").style.width = ((state.step + part) / stories[state.story].steps.length * 100) + "%";
  }

  function goToStep(index, manual = false) {
    const steps = stories[state.story].steps;
    let target = Math.max(0, Math.min(index, steps.length - 1));
    const gate = steps.findIndex((step, i) => step.approval && i < target && !state.approvals.has(i));
    if (gate !== -1) target = gate;
    state.step = target;
    state.elapsed = manual ? 2.1 : 0;
    state.ended = false;
    if (manual || approvalNeeded()) state.playing = false;
    if (state.followActive) selectRole(currentStep().role);
    updateStep();
    if (manual) {
      announce(currentStep().title + " " + currentStep().description);
      stepButtons[state.step].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
      if (state.zoomed) centerOnRole(currentStep().role);
    }
    requestFrame();
  }

  function selectStory(key, manual = true) {
    state.story = key;
    state.step = 0;
    state.elapsed = 0;
    state.ended = false;
    state.approvals.clear();
    state.followActive = true;
    state.playing = !reducedMotion.matches;
    storyTabs.forEach((button) => {
      const selected = button.dataset.story === key;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    get("story-panel").setAttribute("aria-labelledby", "story-" + key);
    buildTimeline();
    selectRole(currentStep().role);
    if (state.zoomed) centerOnRole(currentStep().role);
    updateStep();
    if (manual) announce("Selected story. " + stories[key].question);
    requestFrame();
  }

  function centerOnRole(key) {
    const role = roles[key];
    const world = get("office-world");
    viewport.scrollLeft = role.seat[0] / WORLD_WIDTH * world.clientWidth - viewport.clientWidth / 2;
    viewport.scrollTop = (role.seat[1] - 80) / WORLD_HEIGHT * world.clientHeight - viewport.clientHeight / 2;
  }

  storyTabs.forEach((button, index) => {
    button.addEventListener("click", () => selectStory(button.dataset.story));
    button.addEventListener("keydown", (event) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: storyTabs.length - 1 - index };
      if (!(event.key in keys)) return;
      event.preventDefault();
      const next = storyTabs[(index + keys[event.key] + storyTabs.length) % storyTabs.length];
      selectStory(next.dataset.story);
      next.focus();
    });
  });

  get("play-toggle").addEventListener("click", () => {
    if (state.ended) {
      selectStory(state.story, false);
    } else {
      state.playing = !state.playing && !approvalNeeded();
      updateControls();
      requestFrame();
    }
    announce(approvalNeeded() ? "Waiting for human approval." : state.playing ? "Office playing." : "Office paused.");
  });
  get("restart").addEventListener("click", () => {
    selectStory(state.story, false);
    announce("Story restarted.");
  });
  get("previous-step").addEventListener("click", () => goToStep(state.step - 1, true));
  get("next-step").addEventListener("click", () => goToStep(state.step + 1, true));
  get("approve-example").addEventListener("click", () => {
    if (!approvalNeeded()) return;
    state.approvals.add(state.step);
    const next = state.step + 1;
    state.playing = !reducedMotion.matches;
    goToStep(next, false);
    announce("Example approved. " + currentStep().title);
  });
  get("zoom-toggle").addEventListener("click", () => {
    state.zoomed = !state.zoomed;
    viewport.classList.toggle("is-zoomed", state.zoomed);
    get("zoom-toggle").setAttribute("aria-pressed", String(state.zoomed));
    get("zoom-label").textContent = state.zoomed ? "Overview" : "Close-up";
    if (state.zoomed) centerOnRole(state.selected);
    else { viewport.scrollLeft = 0; viewport.scrollTop = 0; }
    resizeCanvas();
  });

  function roundRect(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function line(points, color = "#637787", width = 1.25) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach((point) => ctx.lineTo(point[0], point[1]));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function ellipse(x, y, rx, ry, fill, stroke) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function hatch(x, y, width, height, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    for (let i = -height; i < width; i += 4) line([[x + i, y + height], [x + i + height, y]], color, .7);
    ctx.restore();
  }

  function drawPerson(x, y, role, time, pose, facing = 1) {
    const walking = pose === "walk";
    const seated = pose === "sit";
    const phase = time * 7.5;
    const sway = walking ? Math.sin(phase) * 1.4 : Math.sin(time * 1.4) * .5;
    const leg = walking ? Math.sin(phase) * 8 : 0;
    ctx.save();
    ctx.translate(x, y + sway);
    ctx.scale(1.08 * facing, 1.08);
    ellipse(0, 0, 20, 5.5, "#233e5114");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (seated) {
      line([[-9,-43], [-13,-18], [-11,-5]], "#677780", 10);
      line([[9,-43], [14,-18], [17,-5]], "#5e707d", 10);
    } else {
      line([[-8,-41],[-9 + leg * .35,-22],[-10 + leg,-5]], "#6d7c88", 10);
      line([[8,-41],[10 - leg * .35,-22],[10 - leg,-5]], "#5b6b77", 10);
    }
    ellipse(-11 + leg, -3, 8, 3.8, "#46515b", "#3e4a53");
    ellipse(13 - leg, -3, 8, 3.8, "#46515b", "#3e4a53");
    roundRect(-15, -89, 30, 48, 7, role.color, "#4e606d");
    hatch(-13,-86,26,42,"#f2f5f55c");
    line([[-1,-86],[-1,-44]],"#465d6a66",1);
    ctx.fillStyle = "#edf1ee";
    ctx.beginPath();
    ctx.moveTo(-8,-89); ctx.lineTo(0,-80); ctx.lineTo(8,-89); ctx.fill();
    if (role.mode === "board") line([[0,-79],[0,-56]],"#3d617d",3);
    const handWave = Math.sin(time * 11) * 2;
    if (seated) {
      line([[-12,-81],[-24,-80],[-21,-96 + handWave]],role.color,8);
      line([[12,-81],[25,-81],[28,-95 - handWave]],role.color,8);
      ellipse(-21,-97 + handWave,4,4,"#ded9cc","#6d7677");
      ellipse(28,-97 - handWave,4,4,"#ded9cc","#6d7677");
      if (role.mode === "draw") line([[29,-98 - handWave],[43,-116 - handWave]],"#4d6373",2);
    } else {
      line([[-13,-80],[-22,-61],[-20 - leg*.3,-44]],role.color,9);
      line([[13,-80],[23,-62],[18 + leg*.3,-46]],role.color,9);
      ellipse(-20 - leg*.3,-43,4,4,"#ded9cc","#6d7677");
      ellipse(18 + leg*.3,-44,4,4,"#ded9cc","#6d7677");
      if (walking || role.mode === "board") {
        roundRect(10,-66,18,23,2,"#e9f0f4","#668196");
        line([[14,-59],[24,-59]],"#8ca8ba",1);
        line([[14,-54],[22,-54]],"#8ca8ba",1);
      }
    }
    roundRect(-4,-98,8,12,3,"#e1dbcf","#6b787d");
    ellipse(0,-108,11.5,13,"#e4dfd2","#63717a");
    ctx.fillStyle = role.hair;
    ctx.beginPath();
    ctx.ellipse(-.5,-112,11.5,10.5,-.2,Math.PI*.9,Math.PI*2.15);
    ctx.lineTo(8,-105); ctx.lineTo(6,-110); ctx.lineTo(-5,-107); ctx.lineTo(-10,-101);
    ctx.closePath(); ctx.fill(); ctx.strokeStyle="#4a5962"; ctx.lineWidth=.8; ctx.stroke();
    hatch(-9,-120,17,10,"#d5dce055");
    if (!seated) {
      ellipse(3,-107,1.1,1.1,"#3f505b");
      line([[7,-104],[9,-100],[6,-100]],"#7e817b",.8);
      line([[3,-96],[7,-96]],"#7e817b",.8);
      if (role.name === "Quality check") {
        ellipse(-3,-107,3.4,3.2,null,"#485e6f");
        ellipse(5,-107,3.4,3.2,null,"#485e6f");
      }
    }
    if (role.name === "Crew & Logbook") {
      ctx.beginPath(); ctx.ellipse(0,-116,12,5.5,0,Math.PI,Math.PI*2); ctx.fillStyle="#536d83"; ctx.fill();
      line([[-10,-116],[13,-116]],"#3e566c",2);
    }
    ctx.restore();
  }

  function textLabel(text, x, y, active = false) {
    ctx.font = (active ? "600 " : "500 ") + "16px -apple-system, BlinkMacSystemFont, sans-serif";
    const width = ctx.measureText(text).width + 18;
    roundRect(x, y, width, 26, 3, active ? "#e7f1f8f5" : "#ffffffdb", active ? "#8cacc3" : "#c8d4dc");
    ctx.fillStyle = active ? "#2b628b" : "#4f6576";
    ctx.fillText(text, x + 9, y + 18);
    return {x, y, width, height:26};
  }

  function drawMonitor(key, time, active) {
    const glow = active ? "#edf8ffe8" : "#e8f0f5d9";
    const ink = active ? "#4a83ac" : "#869eae";
    if (key === "sales") {
      roundRect(226,252,77,45,1,glow);
      ctx.fillStyle=ink; ctx.font="600 8px sans-serif"; ctx.fillText("WhatsApp",231,262);
      const pulse=Math.floor(time*1.5)%4;
      for(let i=0;i<3;i++)roundRect(232+(i%2)*17,267+i*8,37+(i===pulse?5:0),5,2,i%2?"#bed5df":"#d3e1e9");
    }
    if (key === "booking") {
      roundRect(190,687,77,47,1,glow);
      for(let col=0;col<6;col++)line([[194+col*12,690],[194+col*12,730]],"#96afbf",.6);
      for(let row=0;row<4;row++)line([[194,693+row*10],[264,693+row*10]],"#96afbf",.6);
      roundRect(219,704,20,7,1,active?"#527fa2":"#9eb6c6");
      if(active && state.elapsed>2)roundRect(244,715,16,7,1,"#4473a0");
    }
    if (key === "finance" || key === "legal" || key === "qa") {
      const screen = {finance:[1243,466,75,37],legal:[1265,696,76,39],qa:[711,661,92,44]}[key];
      roundRect(...screen,1,glow);
      ctx.fillStyle=ink;ctx.font="600 8px sans-serif";ctx.fillText(key==="qa"?"RESULT CHECK":key==="legal"?"DOCUMENTS":"INVOICE",screen[0]+5,screen[1]+10);
      for(let row=0;row<3;row++){
        line([[screen[0]+15,screen[1]+17+row*8],[screen[0]+screen[2]-6,screen[1]+17+row*8]],ink,1);
        if(!active || state.elapsed>1+row*.7)line([[screen[0]+5,screen[1]+16+row*8],[screen[0]+8,screen[1]+19+row*8],[screen[0]+12,screen[1]+14+row*8]],"#5b8b79",1.5);
      }
    }
    if (key === "designer") {
      ctx.save(); ctx.translate(180,498); ctx.rotate(-.025);
      const points=[[0,23],[20,7],[89,7],[110,14],[120,26],[14,28],[0,23]];
      const visible=active?Math.min(1,state.elapsed/3.5):1;
      const count=Math.max(2,Math.ceil(points.length*visible));
      line(points.slice(0,count),active?"#4c789a":"#6a8499",1.6);
      line([[30,7],[38,-3],[75,-3],[91,7]],"#698ca6",1.1);
      for(let i=0;i<6;i++)line([[24+i*12,17],[30+i*12,23]],"#87a4ba",.6);
      ctx.restore();
    }
    if (key === "crew") {
      const progress=active?Math.min(1,state.elapsed/4):.5;
      line([[1178,333],[1290,333]],"#6394b7",1.4);
      line([[1220,316],[1220,347]],"#6394b7",1);
      if(progress>.5)line([[1310,313],[1318,323],[1335,303]],"#5d8977",2);
    }
    if (key === "pm") {
      const progress=active?Math.min(1,state.elapsed/4):.75;
      roundRect(563+progress*170,151,39,23,1,active?"#89adcce0":"#b6c9d8a0","#7899b2");
      line([[570+progress*170,158],[595+progress*170,158]],"#537da0",1);
      line([[570+progress*170,165],[590+progress*170,165]],"#537da0",1);
    }
  }

  function corridorPoint(key) {
    const [x,y] = roles[key].seat;
    if(key==="pm")return [1008,305];
    if(key==="office")return [488,590];
    if(key==="qa")return [1014,938];
    return [x<770?480:1022,y+3];
  }

  function taskRoute(from, to) {
    const start = roles[from].seat;
    const finish = roles[to].seat;
    if(from===to)return [start,finish];
    const a=corridorPoint(from);
    const b=corridorPoint(to);
    return [start,a,[a[0],625],[b[0],625],b,finish];
  }

  function pointAlong(points, progress) {
    const lengths = points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    let distance = lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,progress));
    for(let i=0;i<lengths.length;i++){
      if(distance<=lengths[i] || i===lengths.length-1){
        const t=lengths[i]?distance/lengths[i]:1;
        return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];
      }
      distance-=lengths[i];
    }
    return points.at(-1);
  }

  function drawTaskRoute() {
    const steps=stories[state.story].steps;
    const step=currentStep();
    const previous=state.step?steps[state.step-1].role:"office";
    if(previous===step.role || step.approval)return;
    const points=taskRoute(previous,step.role);
    ctx.save();
    ctx.setLineDash([4,7]);
    line(points,"#6795b05e",1.8);
    ctx.setLineDash([]);
    const phase=Math.min(1,state.elapsed/2.2);
    const eased=phase*phase*(3-2*phase);
    const [x,y]=pointAlong(points,eased);
    if(phase<1) {
      ellipse(x,y,19,10,"#6d9dbc20");
      roundRect(x-9,y-13,18,23,2,"#f7fcff","#4b83aa");
      line([[x-5,y-6],[x+5,y-6]],"#6095b7",1);
      line([[x-5,y-1],[x+3,y-1]],"#6095b7",1);
      line([[x-5,y+4],[x+5,y+4]],"#6095b7",1);
    }
    ctx.restore();
  }

  function actorPosition(key, index) {
    const role=roles[key];
    const [x,y]=role.seat;
    const active=currentStep().role===key;
    const phase=(state.clock+index*4.7)%48;
    if(key==="office") {
      const path=[[760,1055],[760,949],[490,949],[490,620],[558,620],[658,572]];
      if(state.clock<6) {
        const p=Math.min(1,state.clock/6);
        return {point:pointAlong(path,p),pose:p<1?"walk":"sit",facing:1};
      }
    }
    if(key==="pm") {
      const progress=(Math.sin(state.clock*.33)+1)/2;
      return {point:[740+progress*105,302],pose:"stand",facing:progress>.5?1:-1};
    }
    // Small departures use the open aisle beside each work area.
    if(!active && key!=="office" && phase>32 && phase<43) {
      const p=(phase-32)/11;
      const aisle=corridorPoint(key);
      const at=pointAlong([[x,y],[aisle[0],y+30],[aisle[0],y+55],[x,y]],p);
      return {point:at,pose:"walk",facing:x<770?1:-1};
    }
    return {point:[x,y],pose:"sit",facing:1};
  }

  function draw() {
    if(!ctx)return;
    const scale=canvas.width/WORLD_WIDTH;
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.clearRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    ctx.lineCap="round";
    ctx.lineJoin="round";
    const activeKey=currentStep().role;
    const activeRole=roles[activeKey];
    const halo=ctx.createRadialGradient(activeRole.seat[0],activeRole.seat[1]-55,10,activeRole.seat[0],activeRole.seat[1]-55,120);
    halo.addColorStop(0,approvalNeeded()?"#ba945326":"#5094c125");
    halo.addColorStop(1,"#ffffff00");
    ctx.fillStyle=halo;ctx.fillRect(activeRole.seat[0]-120,activeRole.seat[1]-175,240,240);
    Object.keys(roles).forEach((key)=>drawMonitor(key,state.clock,key===activeKey));
    drawTaskRoute();
    hitTargets=[];
    const actors=Object.entries(roles).map(([key,role],index)=>({key,role,...actorPosition(key,index)})).sort((a,b)=>a.point[1]-b.point[1]);
    actors.forEach((actor)=>{
      const [x,y]=actor.point;
      drawPerson(x,y,actor.role,state.clock+Object.keys(roles).indexOf(actor.key),actor.pose,actor.facing);
      if(actor.pose==="sit" && actor.role.chair && background.complete && background.naturalWidth) {
        const [cx,cy,cw,ch]=actor.role.chair;
        ctx.drawImage(background,cx,cy,cw,ch,cx,cy,cw,ch);
      }
      hitTargets.push({key:actor.key,x:x-40,y:y-140,width:80,height:150});
    });
    Object.entries(roles).forEach(([key,role])=>{
      const [x,y]=role.label;
      const box=textLabel(role.name,x,y,key===state.selected);
      hitTargets.push({key,...box});
    });
    if(state.elapsed>1.4 || !state.playing) {
      const [x,y]=activeRole.seat;
      const text=approvalNeeded()?"Human approval":activeRole.activity;
      const bx=Math.max(26,Math.min(1240,x-77));
      const by=Math.max(230,y-164);
      ctx.font="600 16px -apple-system, BlinkMacSystemFont, sans-serif";
      const width=ctx.measureText(text).width+24;
      roundRect(bx,by,width,31,4,approvalNeeded()?"#fcf5e9f5":"#f7fbfef5",approvalNeeded()?"#b89c75":"#7e9fb8");
      ctx.fillStyle=approvalNeeded()?"#95672d":"#376b91";ctx.fillText(text,bx+12,by+21);
      line([[bx+width/2,by+31],[x,y-128]],approvalNeeded()?"#b89c75":"#7e9fb8",1);
    }
    if(state.selected!==activeKey) {
      const [x,y]=roles[state.selected].seat;
      ctx.save();ctx.setLineDash([3,5]);ellipse(x,y-53,36,62,null,"#658fa8");ctx.restore();
    }
  }

  function resizeCanvas() {
    const width=canvas.clientWidth;
    const density=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(width*density));
    canvas.height=Math.max(1,Math.round(width*WORLD_HEIGHT/WORLD_WIDTH*density));
    draw();
  }

  let pointerDown;
  let pointerMoved = false;
  canvas.addEventListener("click",(event)=>{
    if (pointerMoved) { pointerMoved = false; return; }
    const rect=canvas.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width*WORLD_WIDTH;
    const y=(event.clientY-rect.top)/rect.height*WORLD_HEIGHT;
    const hit=hitTargets.findLast((item)=>x>=item.x&&x<=item.x+item.width&&y>=item.y&&y<=item.y+item.height);
    if(hit)selectRole(hit.key,true);
  });
  canvas.addEventListener("pointerdown",(event)=>{pointerDown=[event.clientX,event.clientY];pointerMoved=false;});
  canvas.addEventListener("pointerup",(event)=>{
    if(pointerDown)pointerMoved = Math.hypot(event.clientX-pointerDown[0],event.clientY-pointerDown[1])>12;
  });

  function tick(now) {
    frame=0;
    if(document.hidden || !state.visible || !state.playing)return;
    const delta=lastTime?Math.min((now-lastTime)/1000,.1):0;
    lastTime=now;
    state.clock+=delta;
    if(!approvalNeeded())state.elapsed+=delta;
    const finalStep = state.step === stories[state.story].steps.length - 1;
    if(state.elapsed >= (finalStep ? STEP_DURATION + 3 : STEP_DURATION)) {
      if(state.step<stories[state.story].steps.length-1) {
        goToStep(state.step+1,false);
      } else {
        const sequence = Object.keys(stories);
        selectStory(sequence[(sequence.indexOf(state.story) + 1) % sequence.length], false);
      }
    }
    if(now-lastPaint>32) {
      draw();updateProgress();lastPaint=now;
    }
    if(state.playing && !frame)frame=requestAnimationFrame(tick);
  }

  function requestFrame() {
    if(state.playing && state.visible && !frame && !document.hidden) {
      lastTime=0;
      frame=requestAnimationFrame(tick);
    }
  }

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden) { cancelAnimationFrame(frame);frame=0;lastTime=0; }
    else requestFrame();
  });
  reducedMotion.addEventListener("change",(event)=>{
    if(event.matches) {
      state.playing=false;
      cancelAnimationFrame(frame);frame=0;
      updateControls();draw();
    }
  });
  background.addEventListener("load",draw);
  new ResizeObserver(resizeCanvas).observe(get("office-world"));

  new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    if (state.visible) requestFrame();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }, { threshold: 0.01 }).observe(canvas);
  buildRoles();
  selectStory("charter",false);
  resizeCanvas();
})();

