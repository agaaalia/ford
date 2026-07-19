/* =============================================================================
   HAPPY BIRTHDAY DAVID — main script
   -----------------------------------------------------------------------------
   Structure of this file:
     1. Colour constants (mirrors the CSS custom properties in style.css —
        duplicated here because illustrations are turned into data-URI
        background images, and background images can't see page CSS variables)
     2. Illustration builders — return raw SVG markup strings for each landmark
     3. Landmark config — the 3 puzzles, in order
     4. Puzzle engine — builds the board + tray, handles drag/tap placement
     5. Completion sequence — glow, particles, doors, note, and the hand-off
        to the next landmark (or to the finale for the Eiffel Tower)
     6. Finale sequence — night transition, sparkle, falling envelope, letter
     7. Ambient bits — dust motes, boot-up
   ========================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     1. COLOUR CONSTANTS — keep in sync with the :root custom properties
     ------------------------------------------------------------------- */
  const C = {
    cream: "#FAF5EA",
    creamDeep: "#F1E9D8",
    beige: "#E4D9C4",
    beigeDark: "#C9B99B",
    dustyBlue: "#7E93A7",
    dustyBlueDeep: "#56728A",
    gold: "#C7A25C",
    goldSoft: "#E4C889",
    ink: "#4A4133",
    inkSoft: "#7A705E",
    white: "#FFFDF8",
    navy: "#12172A",
    navyDeep: "#0A0D18",
    navyMid: "#1E2740",
  };

  /* ---------------------------------------------------------------------
     2. ILLUSTRATION BUILDERS
     Each returns a self-contained SVG string, viewBox 0 0 400 300 (4:3,
     matching .building-wrap), drawn in a simple, clean, geometric style.
     No external images — everything is rects / circles / paths.
     ------------------------------------------------------------------- */

  // -- Landmark 1: V&A East Storehouse — a big, blocky concrete building
  //    with a grid of glazed windows.
  function svgStorehouse() {
    let windows = "";
    const cols = 6, rows = 3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 70 + c * 40;
        const y = 110 + r * 34;
        windows += `<rect x="${x}" y="${y}" width="26" height="22" rx="2" fill="${C.dustyBlue}" opacity="0.85"/>`;
      }
    }
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${C.creamDeep}"/>
      <rect width="400" height="200" fill="${C.cream}"/>
      <ellipse cx="80" cy="55" rx="34" ry="12" fill="${C.white}" opacity="0.7"/>
      <ellipse cx="300" cy="40" rx="26" ry="9" fill="${C.white}" opacity="0.6"/>
      <rect x="0" y="255" width="400" height="45" fill="${C.beige}"/>
      <rect x="50" y="95" width="300" height="165" fill="${C.beigeDark}"/>
      <rect x="50" y="95" width="300" height="14" fill="${C.inkSoft}"/>
      ${windows}
      <rect x="176" y="215" width="48" height="45" fill="${C.ink}"/>
      <rect x="188" y="225" width="24" height="35" fill="${C.dustyBlueDeep}" opacity="0.5"/>
      <rect x="130" y="255" width="140" height="6" fill="${C.gold}" opacity="0.7"/>
    </svg>`.trim();
  }

  // -- Landmark 2: Hampton Court Palace — Tudor brick facade, twisted
  //    chimneys, a gatehouse with turret roofs and a pennant flag.
  function svgHamptonCourt() {
    let arches = "";
    for (let i = 0; i < 7; i++) {
      const x = 46 + i * 44;
      arches += `<path d="M${x} 210 v-28 a12 12 0 0 1 24 0 v28 z" fill="${C.creamDeep}" opacity="0.9"/>`;
    }
    let chimneys = "";
    for (let i = 0; i < 4; i++) {
      const x = 90 + i * 70;
      chimneys += `
        <rect x="${x}" y="72" width="10" height="34" fill="${C.beigeDark}"/>
        <rect x="${x - 2}" y="70" width="14" height="6" fill="${C.inkSoft}"/>`;
    }
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${C.creamDeep}"/>
      <rect width="400" height="205" fill="${C.cream}"/>
      <ellipse cx="330" cy="50" rx="30" ry="10" fill="${C.white}" opacity="0.65"/>
      <rect x="0" y="255" width="400" height="45" fill="${C.beigeDark}" opacity="0.55"/>
      <path d="M20 262 q40 -18 80 0" stroke="${C.dustyBlueDeep}" stroke-width="4" fill="none" opacity="0.4"/>
      <path d="M300 264 q40 -16 80 0" stroke="${C.dustyBlueDeep}" stroke-width="4" fill="none" opacity="0.4"/>
      <rect x="40" y="106" width="320" height="150" fill="${C.beigeDark}"/>
      ${chimneys}
      <polygon points="150,106 250,106 200,58" fill="${C.gold}" opacity="0.85"/>
      <rect x="182" y="118" width="36" height="88" fill="${C.ink}"/>
      <path d="M182 118 h36 v-14 a18 18 0 0 0 -36 0 z" fill="${C.ink}"/>
      <line x1="200" y1="58" x2="200" y2="34" stroke="${C.inkSoft}" stroke-width="2"/>
      <polygon points="200,34 222,42 200,50" fill="${C.dustyBlueDeep}"/>
      ${arches}
      <rect x="40" y="106" width="320" height="10" fill="${C.inkSoft}" opacity="0.6"/>
    </svg>`.trim();
  }

  // -- Landmark 3 (puzzle stage, daytime): Eiffel Tower at golden hour.
  function svgEiffelDay() {
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${C.creamDeep}"/>
          <stop offset="1" stop-color="${C.dustyBlue}" stop-opacity="0.55"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#skyDay)"/>
      <rect x="0" y="250" width="400" height="50" fill="${C.beige}"/>
      <ellipse cx="90" cy="230" rx="24" ry="20" fill="${C.dustyBlueDeep}" opacity="0.35"/>
      <ellipse cx="320" cy="235" rx="20" ry="16" fill="${C.dustyBlueDeep}" opacity="0.3"/>
      <g fill="none" stroke="${C.inkSoft}" stroke-width="4" stroke-linejoin="round">
        <path d="M200 40 L150 250 M200 40 L250 250"/>
        <path d="M170 140 L230 140"/>
        <path d="M182 90 L218 90"/>
        <path d="M160 190 L240 190"/>
      </g>
      <rect x="160" y="184" width="80" height="10" fill="${C.gold}" opacity="0.8"/>
      <rect x="176" y="86" width="48" height="8" fill="${C.gold}" opacity="0.8"/>
      <line x1="200" y1="40" x2="200" y2="22" stroke="${C.inkSoft}" stroke-width="3"/>
    </svg>`.trim();
  }

  /* Landmark 3 (finale, night): the same tower silhouette, taller frame,
     drawn dark against a navy sky with small gold lights that twinkle
     using their own embedded CSS animation (works even off-screen). */
  function svgEiffelNight() {
    // viewBox is tall and narrow (~9:16) to match .tower-wrap's frame, so the
    // tower reads as genuinely towering rather than being letterboxed
    const spots = [
      [110, 35], [102, 65], [118, 65], [95, 100], [125, 100],
      [110, 130], [85, 175], [135, 175], [90, 230], [130, 230],
      [70, 290], [150, 290], [60, 340], [160, 340], [110, 300],
      [80, 250], [140, 250],
    ];
    let lights = "";
    spots.forEach(([x, y], i) => {
      const delay = (i * 0.24).toFixed(2);
      lights += `<circle class="tower-light" cx="${x}" cy="${y}" r="2.4" fill="${C.goldSoft}" style="animation-delay:${delay}s"/>`;
    });
    return `
    <svg viewBox="0 0 220 390" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <g fill="none" stroke="${C.navyMid}" stroke-width="6" stroke-linejoin="round">
        <path d="M110 30 L55 360 M110 30 L165 360"/>
        <path d="M85 165 L135 165"/>
        <path d="M95 85 L125 85"/>
        <path d="M70 300 L150 300"/>
      </g>
      <rect x="70" y="295" width="80" height="9" fill="${C.navy}"/>
      <rect x="85" y="160" width="50" height="8" fill="${C.navy}"/>
      <rect x="95" y="81" width="30" height="6" fill="${C.navy}"/>
      <line x1="110" y1="30" x2="110" y2="8" stroke="${C.navyMid}" stroke-width="3.5"/>
      ${lights}
    </svg>`.trim();
  }

  /* ---------------------------------------------------------------------
     3. LANDMARK CONFIG
     ------------------------------------------------------------------- */
  const LANDMARKS = [
    {
      eyebrow: "Landmark 1 of 3",
      title: "V&A East Storehouse",
      cols: 3,
      rows: 2,
      svg: svgStorehouse(),
      noteTitle: "Act I: Our First Date!",
      noteBody: "[I'll replace this with my own words.]",
      isFinal: false,
    },
    {
      eyebrow: "Landmark 2 of 3",
      title: "Hampton Court Palace",
      cols: 4,
      rows: 2,
      svg: svgHamptonCourt(),
      noteTitle: "Act II: Summer",
      noteBody: "[I'll replace this.]",
      isFinal: false,
    },
    {
      eyebrow: "Landmark 3 of 3",
      title: "Eiffel Tower",
      cols: 4,
      rows: 2,
      svg: svgEiffelDay(),
      isFinal: true,
    },
  ];

  let currentIndex = 0;

  /* ---------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const svgToDataUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  /* ---------------------------------------------------------------------
     4. PUZZLE ENGINE
     A landmark's illustration is sliced into a cols x rows grid using the
     classic CSS background-size/-position percentage trick, so pieces are
     just crops of one master image — no separate art assets needed.
     ------------------------------------------------------------------- */
  const els = {
    puzzleScreen: $("puzzleScreen"),
    puzzleEyebrow: $("puzzleEyebrow"),
    puzzleTitle: $("puzzleTitle"),
    buildingWrap: $("buildingWrap"),
    buildingIllustration: $("buildingIllustration"),
    board: $("board"),
    glowVeil: $("glowVeil"),
    risingParticles: $("risingParticles"),
    doors: $("doors"),
    trayWrap: document.querySelector(".tray-wrap"),
    tray: $("tray"),
    notePanel: $("notePanel"),
    noteCard: document.querySelector(".note-card"),
    noteTitle: $("noteTitle"),
    noteBody: $("noteBody"),
    continueBtn: $("continueBtn"),
  };

  let placedCount = 0;
  let totalPieces = 0;
  let selectedPiece = null; // for tap-to-place fallback

  function buildPuzzle(landmark) {
    // reset state
    placedCount = 0;
    totalPieces = landmark.cols * landmark.rows;
    selectedPiece = null;
    els.board.innerHTML = "";
    els.tray.innerHTML = "";
    els.board.style.gridTemplateColumns = `repeat(${landmark.cols}, 1fr)`;
    els.board.style.gridTemplateRows = `repeat(${landmark.rows}, 1fr)`;

    // header + illustration (ghost preview sits behind the board at low opacity)
    els.puzzleEyebrow.textContent = landmark.eyebrow;
    els.puzzleTitle.textContent = landmark.title;
    els.buildingIllustration.innerHTML = landmark.svg;
    els.buildingIllustration.style.opacity = "0.16";

    const bg = svgToDataUrl(landmark.svg);
    const order = shuffle([...Array(totalPieces).keys()]);

    // slots (drop targets), laid out by the grid but positioned so pieces
    // (which are pulled out of flow while dragging) can be measured reliably
    for (let i = 0; i < totalPieces; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = String(i);
      els.board.appendChild(slot);
    }

    // pieces, shuffled into the tray
    order.forEach((i) => {
      const r = Math.floor(i / landmark.cols);
      const c = i % landmark.cols;
      const wrapper = document.createElement("div");
      wrapper.className = "piece-tray-slot";

      const piece = document.createElement("div");
      piece.className = "piece";
      piece.dataset.index = String(i);
      piece.style.backgroundImage = bg;
      piece.style.backgroundSize = `${landmark.cols * 100}% ${landmark.rows * 100}%`;
      piece.style.backgroundPosition =
        `${landmark.cols > 1 ? (c / (landmark.cols - 1)) * 100 : 0}% ` +
        `${landmark.rows > 1 ? (r / (landmark.rows - 1)) * 100 : 0}%`;
      piece.tabIndex = 0;
      piece.setAttribute("role", "button");
      piece.setAttribute("aria-label", `Puzzle piece ${i + 1}`);

      attachPieceHandlers(piece);
      wrapper.appendChild(piece);
      els.tray.appendChild(wrapper);
    });
  }

  function attachPieceHandlers(piece) {
    let startX = 0, startY = 0, dragging = false, moved = false;
    let originParent = null;

    function pointerDown(e) {
      if (piece.classList.contains("piece-correct")) return;
      piece.setPointerCapture?.(e.pointerId);
      const rect = piece.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      moved = false;
      dragging = true;
      originParent = piece.parentElement;

      piece.style.position = "fixed";
      piece.style.left = rect.left + "px";
      piece.style.top = rect.top + "px";
      piece.style.width = rect.width + "px";
      piece.style.height = rect.height + "px";
      document.body.appendChild(piece);
      piece.classList.add("piece-dragging");

      window.addEventListener("pointermove", pointerMove);
      window.addEventListener("pointerup", pointerUp, { once: true });
    }

    function pointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      const rect = piece.getBoundingClientRect();
      piece.style.left = rect.left + dx + "px";
      piece.style.top = rect.top + dy + "px";
      startX = e.clientX;
      startY = e.clientY;
    }

    function pointerUp(e) {
      dragging = false;
      window.removeEventListener("pointermove", pointerMove);
      piece.classList.remove("piece-dragging");

      if (!moved) {
        // treat as a tap: toggle selection for tap-to-place
        revertToOrigin(piece, originParent);
        toggleSelect(piece);
        return;
      }
      attemptDrop(piece, e.clientX, e.clientY, originParent);
    }

    piece.addEventListener("pointerdown", pointerDown);

    // keyboard fallback: Enter/Space selects, then Enter/Space on a slot places it
    piece.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSelect(piece);
      }
    });
  }

  function toggleSelect(piece) {
    if (selectedPiece === piece) {
      piece.classList.remove("piece-selected");
      selectedPiece = null;
      return;
    }
    if (selectedPiece) selectedPiece.classList.remove("piece-selected");
    selectedPiece = piece;
    piece.classList.add("piece-selected");
    attachSlotTapFallback();
  }

  function attachSlotTapFallback() {
    els.board.querySelectorAll(".slot:not(.slot-filled)").forEach((slot) => {
      slot.onclick = () => {
        if (!selectedPiece) return;
        const originParent = selectedPiece.parentElement;
        selectedPiece.classList.remove("piece-selected");
        placeOrReject(selectedPiece, slot, originParent);
        selectedPiece = null;
      };
    });
  }

  function revertToOrigin(piece, originParent) {
    piece.style.position = "";
    piece.style.left = "";
    piece.style.top = "";
    piece.style.width = "";
    piece.style.height = "";
    originParent.appendChild(piece);
  }

  function attemptDrop(piece, clientX, clientY, originParent) {
    const slots = els.board.querySelectorAll(".slot:not(.slot-filled)");
    let target = null;
    slots.forEach((slot) => {
      const r = slot.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        target = slot;
      }
    });

    if (!target) {
      revertToOrigin(piece, originParent);
      return;
    }
    placeOrReject(piece, target, originParent);
  }

  function placeOrReject(piece, slot, originParent) {
    if (String(slot.dataset.index) === String(piece.dataset.index)) {
      // correct!
      piece.style.position = "";
      piece.style.left = "";
      piece.style.top = "";
      piece.style.width = "";
      piece.style.height = "";
      slot.appendChild(piece);
      slot.classList.add("slot-filled");
      piece.classList.add("piece-correct");
      piece.style.pointerEvents = "none";
      placedCount++;
      if (placedCount >= totalPieces) {
        onPuzzleSolved();
      }
    } else {
      // wrong slot — gentle shake, then back to the tray
      slot.classList.add("slot-shake");
      piece.classList.add("slot-shake");
      setTimeout(() => {
        slot.classList.remove("slot-shake");
        piece.classList.remove("slot-shake");
      }, 450);
      revertToOrigin(piece, originParent);
    }
  }

  /* ---------------------------------------------------------------------
     5. COMPLETION SEQUENCE (per puzzle)
     ------------------------------------------------------------------- */
  function spawnParticles() {
    for (let i = 0; i < 16; i++) {
      const mote = document.createElement("div");
      mote.className = "rise-mote";
      mote.style.left = 10 + Math.random() * 80 + "%";
      mote.style.animationDelay = (Math.random() * 1.4).toFixed(2) + "s";
      mote.style.animationDuration = (2.6 + Math.random() * 1.4).toFixed(2) + "s";
      els.risingParticles.appendChild(mote);
      setTimeout(() => mote.remove(), 4600);
    }
  }

  async function onPuzzleSolved() {
    const landmark = LANDMARKS[currentIndex];

    // fade the puzzle mechanics away, reveal the full illustration
    els.board.classList.add("solved");
    els.trayWrap.classList.add("solved");
    els.buildingIllustration.style.transition = "opacity 1s ease";
    els.buildingIllustration.style.opacity = "1";

    await wait(300);
    els.glowVeil.classList.add("active");
    spawnParticles();

    await wait(1200);
    els.buildingWrap.classList.add("zoom");
    els.doors.classList.add("active");
    await wait(350);
    els.doors.classList.add("open");

    if (landmark.isFinal) {
      // Eiffel Tower solved — skip the note/doors hand-off and go straight
      // into the dramatic night finale instead.
      await wait(1400);
      startFinale();
      return;
    }

    await wait(1600);
    els.noteTitle.textContent = landmark.noteTitle;
    els.noteBody.textContent = landmark.noteBody;
    els.notePanel.hidden = false;
  }

  async function goToNextLandmark() {
    // fold the note away
    els.noteCard.classList.add("note-folding");
    await wait(550);
    els.notePanel.hidden = true;
    els.noteCard.classList.remove("note-folding");

    // fade the current building out
    els.buildingWrap.classList.add("fade-out");
    await wait(900);

    // reset all the completion-state classes
    els.buildingWrap.classList.remove("zoom", "fade-out");
    els.doors.classList.remove("open", "active");
    els.glowVeil.classList.remove("active");
    els.board.classList.remove("solved");
    els.trayWrap.classList.remove("solved");
    els.buildingIllustration.style.transition = "none";

    currentIndex++;
    buildPuzzle(LANDMARKS[currentIndex]);

    // let the reset paint before fading the new scene in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.buildingIllustration.style.transition = "opacity 1.2s ease";
      });
    });
  }

  els.continueBtn.addEventListener("click", goToNextLandmark);

  /* ---------------------------------------------------------------------
     6. FINALE — night transition, sparkling tower, falling envelope, letter
     ------------------------------------------------------------------- */
  const finaleEls = {
    screen: $("finaleScreen"),
    stars: $("stars"),
    towerWrap: $("towerWrap"),
    envelope: $("envelope"),
    letterScreen: $("letterScreen"),
    letterBody: $("letterBody"),
  };

  function buildStars() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 70; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 70 + "%";
      star.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
      frag.appendChild(star);
    }
    finaleEls.stars.appendChild(frag);
  }

  async function startFinale() {
    els.puzzleScreen.hidden = true;
    finaleEls.screen.hidden = false;
    finaleEls.towerWrap.innerHTML = svgEiffelNight();
    buildStars();

    await wait(400);
    finaleEls.screen.classList.add("night");
    await wait(1800);
    finaleEls.screen.classList.add("sparkling");

    await wait(4000);
    finaleEls.envelope.hidden = false;
    finaleEls.envelope.classList.add("drop");
  }

  function openLetter() {
    finaleEls.envelope.classList.add("opened");
    setTimeout(() => {
      finaleEls.letterScreen.hidden = false;
    }, 300);
  }

  finaleEls.envelope.addEventListener("click", openLetter);
  finaleEls.envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLetter();
    }
  });

  /* ---------------------------------------------------------------------
     7. AMBIENT DUST + BOOT-UP
     ------------------------------------------------------------------- */
  function initDustField() {
    const field = $("dustField");
    const count = window.innerWidth < 640 ? 14 : 24;
    for (let i = 0; i < count; i++) {
      const mote = document.createElement("div");
      mote.className = "dust-mote";
      const size = 2 + Math.random() * 3;
      mote.style.width = size + "px";
      mote.style.height = size + "px";
      mote.style.left = Math.random() * 100 + "%";
      mote.style.top = 20 + Math.random() * 80 + "%";
      mote.style.setProperty("--dx", Math.random() * 60 - 30 + "px");
      mote.style.setProperty("--dy", -(120 + Math.random() * 160) + "px");
      mote.style.animationDuration = 9 + Math.random() * 10 + "s";
      mote.style.animationDelay = -(Math.random() * 10) + "s";
      field.appendChild(mote);
    }
  }

  // subtle parallax: the current scene drifts a couple of px against the
  // pointer, just enough to feel alive without being distracting
  function initParallax() {
    document.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (!els.puzzleScreen.hidden) {
        els.buildingIllustration.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }

  $("beginBtn").addEventListener("click", () => {
    $("introScreen").hidden = true;
    els.puzzleScreen.hidden = false;
    buildPuzzle(LANDMARKS[currentIndex]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.buildingIllustration.style.transition = "opacity 1.2s ease";
      });
    });
  });

  initDustField();
  initParallax();
})();
