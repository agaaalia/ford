/* =============================================================================
   HAPPY BIRTHDAY DAVID — main script
   A handcrafted-notebook interaction: three riddle puzzles, each page "turning"
   into the next, memory cards taped in rather than popped up, and a slow
   sunset-to-night finale. Written as small async functions rather than nested
   callbacks so the sequence of events reads top-to-bottom, the way it plays.

   Structure:
     1.  Palette constants (mirrors the CSS custom properties — duplicated
         because illustrations become data-URI background images, which
         can't see the page's CSS variables)
     2.  Illustration builders — SVG markup for each landmark
     3.  Chapter config — the 3 puzzles, riddle text, reveal name, note id
     4.  Small helpers ($ , wait, shuffle, random range, data-URI encode)
     5.  Puzzle engine — scattered pieces, drag physics, tap-to-place,
         progressive colourisation as pieces land
     6.  Completion sequence — pause, lift, glow, particles, name reveal,
         memory card unfold, page turn
     7.  Finale — sunset → blue hour → night, twinkling tower, envelope, letter
     8.  Ambient polish — dust motes, gentle parallax, notebook opening
   ========================================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     1. PALETTE — keep in sync with :root in style.css
     ------------------------------------------------------------------- */
  const C = {
    paper: "#F3EBDC",
    paperWarm: "#FBF6EC",
    charcoal: "#3E3A34",
    charcoalSoft: "#6E655A",
    dustyBlue: "#7E93A3",
    dustyBlueDeep: "#56728A",
    terracotta: "#C17A5B",
    terracottaSoft: "#D9A488",
    warmGrey: "#A79C8C",
    gold: "#C9A46A",
    goldSoft: "#E3C98C",
    white: "#FFFDF8",
    navy: "#171B2B",
    navyDeep: "#0A0D16",
    navyMid: "#232A42",
  };

  /* ---------------------------------------------------------------------
     2. ILLUSTRATION BUILDERS
     Each returns a self-contained SVG string, viewBox 0 0 400 300 (matches
     .puzzle-area's 4:3 frame). Pieces render these in full colour; the
     ghost copy underneath is desaturated via CSS filter and gradually
     un-desaturated as pieces land, so solving genuinely "colours in" the
     sketch rather than just revealing it.
     ------------------------------------------------------------------- */

  // Chapter One — V&A East Storehouse: a big, blocky concrete building
  // with a grid of glazed windows.
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
      <rect width="400" height="300" fill="${C.paperWarm}"/>
      <rect width="400" height="200" fill="${C.paper}"/>
      <ellipse cx="80" cy="55" rx="34" ry="12" fill="${C.white}" opacity="0.7"/>
      <ellipse cx="300" cy="40" rx="26" ry="9" fill="${C.white}" opacity="0.6"/>
      <rect x="0" y="255" width="400" height="45" fill="${C.warmGrey}" opacity="0.5"/>
      <rect x="50" y="95" width="300" height="165" fill="${C.terracottaSoft}"/>
      <rect x="50" y="95" width="300" height="14" fill="${C.charcoalSoft}"/>
      ${windows}
      <rect x="176" y="215" width="48" height="45" fill="${C.charcoal}"/>
      <rect x="188" y="225" width="24" height="35" fill="${C.dustyBlueDeep}" opacity="0.5"/>
      <rect x="130" y="255" width="140" height="6" fill="${C.gold}" opacity="0.7"/>
    </svg>`.trim();
  }

  // Chapter Two — Hampton Court Palace: Tudor brick facade, twisted
  // chimneys, a gatehouse with a turret roof and a pennant flag.
  function svgHamptonCourt() {
    let arches = "";
    for (let i = 0; i < 7; i++) {
      const x = 46 + i * 44;
      arches += `<path d="M${x} 210 v-28 a12 12 0 0 1 24 0 v28 z" fill="${C.paper}" opacity="0.9"/>`;
    }
    let chimneys = "";
    for (let i = 0; i < 4; i++) {
      const x = 90 + i * 70;
      chimneys += `
        <rect x="${x}" y="72" width="10" height="34" fill="${C.terracottaSoft}"/>
        <rect x="${x - 2}" y="70" width="14" height="6" fill="${C.charcoalSoft}"/>`;
    }
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${C.paper}"/>
      <rect width="400" height="205" fill="${C.paperWarm}"/>
      <ellipse cx="330" cy="50" rx="30" ry="10" fill="${C.white}" opacity="0.65"/>
      <rect x="0" y="255" width="400" height="45" fill="${C.warmGrey}" opacity="0.4"/>
      <path d="M20 262 q40 -18 80 0" stroke="${C.dustyBlueDeep}" stroke-width="4" fill="none" opacity="0.4"/>
      <path d="M300 264 q40 -16 80 0" stroke="${C.dustyBlueDeep}" stroke-width="4" fill="none" opacity="0.4"/>
      <rect x="40" y="106" width="320" height="150" fill="${C.terracotta}"/>
      ${chimneys}
      <polygon points="150,106 250,106 200,58" fill="${C.gold}" opacity="0.85"/>
      <rect x="182" y="118" width="36" height="88" fill="${C.charcoal}"/>
      <path d="M182 118 h36 v-14 a18 18 0 0 0 -36 0 z" fill="${C.charcoal}"/>
      <line x1="200" y1="58" x2="200" y2="34" stroke="${C.charcoalSoft}" stroke-width="2"/>
      <polygon points="200,34 222,42 200,50" fill="${C.dustyBlueDeep}"/>
      ${arches}
      <rect x="40" y="106" width="320" height="10" fill="${C.charcoalSoft}" opacity="0.6"/>
    </svg>`.trim();
  }

  // Chapter Three (puzzle stage, daytime) — Eiffel Tower at golden hour.
  function svgEiffelDay() {
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${C.paper}"/>
          <stop offset="1" stop-color="${C.dustyBlue}" stop-opacity="0.5"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#skyDay)"/>
      <rect x="0" y="250" width="400" height="50" fill="${C.warmGrey}" opacity="0.55"/>
      <ellipse cx="90" cy="230" rx="24" ry="20" fill="${C.dustyBlueDeep}" opacity="0.3"/>
      <ellipse cx="320" cy="235" rx="20" ry="16" fill="${C.dustyBlueDeep}" opacity="0.25"/>
      <g fill="none" stroke="${C.charcoalSoft}" stroke-width="4" stroke-linejoin="round">
        <path d="M200 40 L150 250 M200 40 L250 250"/>
        <path d="M170 140 L230 140"/>
        <path d="M182 90 L218 90"/>
        <path d="M160 190 L240 190"/>
      </g>
      <rect x="160" y="184" width="80" height="10" fill="${C.gold}" opacity="0.8"/>
      <rect x="176" y="86" width="48" height="8" fill="${C.gold}" opacity="0.8"/>
      <line x1="200" y1="40" x2="200" y2="22" stroke="${C.charcoalSoft}" stroke-width="3"/>
    </svg>`.trim();
  }

  // Finale (night) — the same tower, tall frame, dark against navy, with
  // scattered lights that twinkle on their own randomised timing.
  function svgEiffelNight() {
    const spots = [
      [110, 35], [102, 65], [118, 65], [95, 100], [125, 100],
      [110, 130], [85, 175], [135, 175], [90, 230], [130, 230],
      [70, 290], [150, 290], [60, 340], [160, 340], [110, 300],
      [80, 250], [140, 250],
    ];
    let lights = "";
    spots.forEach(([x, y], i) => {
      lights += `<circle class="tower-light" data-i="${i}" cx="${x}" cy="${y}" r="2.4" fill="${C.goldSoft}"/>`;
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
     3. CHAPTER CONFIG
     The building's name is withheld until the puzzle is solved — the
     board only ever shows the riddle prompt beforehand. Chapters 1 & 2
     each have a scrapbook note already sitting in the HTML; Chapter 3
     hands off to the finale instead.
     ------------------------------------------------------------------- */
  const RIDDLE = "Guess where this is";

  const CHAPTERS = [
    {
      label: "Chapter One",
      name: "V&A East Storehouse",
      cols: 3,
      rows: 2,
      svg: svgStorehouse(),
      noteId: "note-0",
      noteTitle: "Act I: Our First Date!",
      noteBody: `message will be pasted here`,
    },
    {
      label: "Chapter Two",
      name: "Hampton Court Palace",
      cols: 4,
      rows: 2,
      svg: svgHamptonCourt(),
      noteId: "note-1",
      noteTitle: "Act II: Summer",
      noteBody:  `message will be pasted here`,
    },
    {
      label: "Chapter Three",
      name: "Eiffel Tower",
      cols: 4,
      rows: 2,
      svg: svgEiffelDay(),
      noteId: null, // solving this one leads straight into the finale
      final: true,
    },
  ];

  let currentIndex = 0;

  /* ---------------------------------------------------------------------
     4. SMALL HELPERS
     ------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const rand = (min, max) => min + Math.random() * (max - min);
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const svgToDataUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  /* ---------------------------------------------------------------------
     Element references
     ------------------------------------------------------------------- */
  const els = {
    notebook: $("notebook"),
    introScreen: $("introScreen"),
    beginBtn: $("beginBtn"),

    puzzleScreen: $("puzzleScreen"),
    puzzleEyebrow: $("puzzleEyebrow"),
    puzzleTitle: $("puzzleTitle"),
    buildingWrap: $("buildingWrap"),
    buildingIllustration: $("buildingIllustration"),
    board: $("board"),
    glowVeil: $("glowVeil"),
    risingParticles: $("risingParticles"),
    trayWrap: document.querySelector(".tray-wrap"),
    tray: $("tray"),

    finaleScreen: $("finaleScreen"),
    stars: $("stars"),
    towerWrap: $("towerWrap"),
    envelope: $("envelope"),

    letterScreen: $("letterScreen"),
    letterPaper: $("letterPaper"),
    letterBody: $("letterBody"),

    dustField: $("dustField"),
  };

  /* ---------------------------------------------------------------------
     5. PUZZLE ENGINE
     One master illustration per chapter, sliced into a cols x rows grid
     with the standard CSS background-size/-position percentage trick, so
     pieces are simply crops of one image. Pieces scatter onto the page
     like loose papers (random rotation + drift, not a tidy grid), and
     dragging eases toward the pointer rather than snapping to it 1:1, for
     a slightly weighted, paper-like feel.
     ------------------------------------------------------------------- */
  let placedCount = 0;
  let totalPieces = 0;
  let selectedPiece = null; // tap-to-place fallback

  function buildPuzzle(chapter) {
    placedCount = 0;
    totalPieces = chapter.cols * chapter.rows;
    selectedPiece = null;

    els.board.innerHTML = "";
    els.tray.innerHTML = "";
    els.board.style.gridTemplateColumns = `repeat(${chapter.cols}, 1fr)`;
    els.board.style.gridTemplateRows = `repeat(${chapter.rows}, 1fr)`;

    els.puzzleEyebrow.textContent = chapter.label;
    els.puzzleTitle.textContent = RIDDLE;
    els.puzzleTitle.style.opacity = "1";

    els.buildingIllustration.innerHTML = chapter.svg;
    // starts as a flat graphite sketch — colour returns as pieces land
    els.buildingIllustration.style.transition = "none";
    els.buildingIllustration.style.filter = "grayscale(0.92) contrast(0.92) brightness(1.08) sepia(0.06)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.buildingIllustration.style.transition = "";
      });
    });

    const bg = svgToDataUrl(chapter.svg);
    const order = shuffle([...Array(totalPieces).keys()]);

    for (let i = 0; i < totalPieces; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = String(i);
      els.board.appendChild(slot);
    }

    order.forEach((i) => {
      const r = Math.floor(i / chapter.cols);
      const c = i % chapter.cols;

      const wrapper = document.createElement("div");
      wrapper.className = "piece-tray-slot";
      // true per-instance randomness, not a repeating CSS pattern — this
      // is what keeps a scattered desk from reading like a tidy grid
      wrapper.style.transform =
        `rotate(${rand(-9, 9).toFixed(1)}deg) translate(${rand(-4, 4).toFixed(1)}px, ${rand(-5, 5).toFixed(1)}px)`;

      const piece = document.createElement("div");
      piece.className = "piece";
      piece.dataset.index = String(i);
      piece.style.backgroundImage = bg;
      piece.style.backgroundSize = `${chapter.cols * 100}% ${chapter.rows * 100}%`;
      piece.style.backgroundPosition =
        `${chapter.cols > 1 ? (c / (chapter.cols - 1)) * 100 : 0}% ` +
        `${chapter.rows > 1 ? (r / (chapter.rows - 1)) * 100 : 0}%`;
      piece.tabIndex = 0;
      piece.setAttribute("role", "button");
      piece.setAttribute("aria-label", `Puzzle piece ${i + 1}`);

      attachPieceHandlers(piece, chapter);
      wrapper.appendChild(piece);
      els.tray.appendChild(wrapper);
    });
  }

  /* Interaction: pointer-drag with an eased "trailing paper" follow, or a
     tap-to-select / tap-to-place fallback for anyone who'd rather not
     drag. Both paths converge on the same placeOrReject() check. */
  function attachPieceHandlers(piece, chapter) {
    let startX = 0, startY = 0, dragging = false, moved = false;
    let originParent = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0, rafId = null;

    function followLoop() {
      // ease toward the pointer rather than snapping instantly — gives
      // the piece a little weight, like it's sliding across paper
      curX += (targetX - curX) * 0.35;
      curY += (targetY - curY) * 0.35;
      piece.style.left = curX + "px";
      piece.style.top = curY + "px";
      if (dragging) rafId = requestAnimationFrame(followLoop);
    }

    function pointerDown(e) {
      if (piece.classList.contains("piece-correct")) return;
      piece.setPointerCapture?.(e.pointerId);
      const rect = piece.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      moved = false;
      dragging = true;
      originParent = piece.parentElement;

      curX = targetX = rect.left;
      curY = targetY = rect.top;
      piece.style.position = "fixed";
      piece.style.left = rect.left + "px";
      piece.style.top = rect.top + "px";
      piece.style.width = rect.width + "px";
      piece.style.height = rect.height + "px";
      document.body.appendChild(piece);
      piece.classList.add("piece-dragging");
      rafId = requestAnimationFrame(followLoop);

      window.addEventListener("pointermove", pointerMove);
      window.addEventListener("pointerup", pointerUp, { once: true });
    }

    function pointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      targetX += dx;
      targetY += dy;
      startX = e.clientX;
      startY = e.clientY;
    }

    function pointerUp(e) {
      dragging = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", pointerMove);
      piece.classList.remove("piece-dragging");

      if (!moved) {
        revertToOrigin(piece, originParent);
        toggleSelect(piece);
        return;
      }
      attemptDrop(piece, e.clientX, e.clientY, originParent, chapter);
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
        placeOrReject(selectedPiece, slot, originParent, CHAPTERS[currentIndex]);
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

  function attemptDrop(piece, clientX, clientY, originParent, chapter) {
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
    placeOrReject(piece, target, originParent, chapter);
  }

  function placeOrReject(piece, slot, originParent, chapter) {
    if (String(slot.dataset.index) === String(piece.dataset.index)) {
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
      updateIllustrationProgress();
      if (placedCount >= totalPieces) onChapterSolved(chapter);
    } else {
      slot.classList.add("slot-shake");
      piece.classList.add("slot-shake");
      setTimeout(() => {
        slot.classList.remove("slot-shake");
        piece.classList.remove("slot-shake");
      }, 450);
      revertToOrigin(piece, originParent);
    }
  }

  // the sketch gradually regains colour as pieces land, not just at the end
  function updateIllustrationProgress() {
    const progress = totalPieces ? placedCount / totalPieces : 0;
    const gray = Math.max(0, 0.92 * (1 - progress));
    const contrast = 0.92 + progress * 0.08;
    const bright = 1.08 - progress * 0.08;
    const sepia = 0.06 * (1 - progress);
    els.buildingIllustration.style.filter =
      `grayscale(${gray.toFixed(2)}) contrast(${contrast.toFixed(2)}) brightness(${bright.toFixed(2)}) sepia(${sepia.toFixed(2)})`;
  }

  /* ---------------------------------------------------------------------
     6. COMPLETION SEQUENCE
     Pause → reveal the name → lift, shadow, glow, drifting dust → memory
     card unfolds (chapters 1–2) or the finale begins (chapter 3).
     ------------------------------------------------------------------- */
  function spawnParticles() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const mote = document.createElement("div");
      mote.className = "rise-mote";
      mote.style.left = rand(8, 88) + "%";
      mote.style.animationDelay = rand(0, 1.4).toFixed(2) + "s";
      mote.style.animationDuration = rand(2.6, 4.0).toFixed(2) + "s";
      els.risingParticles.appendChild(mote);
      setTimeout(() => mote.remove(), 4600);
    }
  }

  async function revealName(chapter) {
    els.puzzleTitle.style.transition = "opacity 0.45s ease";
    els.puzzleTitle.style.opacity = "0";
    await wait(450);
    els.puzzleTitle.textContent = chapter.name;
    els.puzzleTitle.style.opacity = "1";
    await wait(450);
  }

  async function onChapterSolved(chapter) {
    await wait(500); // a beat of stillness before anything moves

    await revealName(chapter);

    // lift the building off the page, shadow + colour handled by CSS
    els.buildingWrap.classList.add("zoom");
    els.trayWrap.classList.add("solved");
    els.tray.classList.add("solved");

    await wait(300);
    els.glowVeil.classList.add("active");
    spawnParticles();

    if (chapter.final) {
      await wait(1800);
      startFinale();
      return;
    }

    await wait(1400);
    unfoldNote(chapter);
  }

  function unfoldNote(chapter) {
    const note = $(chapter.noteId);
    note.querySelector(".note-title").textContent = chapter.noteTitle;
    note.querySelector(".note-body").textContent = chapter.noteBody;
    note.hidden = false;

    const continueBtn = note.querySelector(".continue-btn");
    continueBtn.addEventListener("click", () => goToNextChapter(note), { once: true });
  }

  async function goToNextChapter(note) {
    // fold the note back down
    note.classList.add("note-folding");
    await wait(500);
    note.hidden = true;
    note.classList.remove("note-folding");

    // turn the page — the current page rotates away on its spine, the
    // next chapter's content is swapped in once it's edge-on, then it
    // rotates back to reveal what's "underneath"
    els.puzzleScreen.classList.add("turning");
    await wait(850);

    els.buildingWrap.classList.remove("zoom");
    els.glowVeil.classList.remove("active");
    els.trayWrap.classList.remove("solved");
    els.tray.classList.remove("solved");

    currentIndex++;
    buildPuzzle(CHAPTERS[currentIndex]);

    els.puzzleScreen.classList.remove("turning");
  }

  /* ---------------------------------------------------------------------
     7. FINALE — sunset → blue hour → night (8s), sparkling tower,
     falling envelope, unfolding letter.
     ------------------------------------------------------------------- */
  const SUNSET_GRADIENT = `linear-gradient(180deg, ${C.terracottaSoft} 0%, ${C.dustyBlue} 60%, ${C.dustyBlueDeep} 100%)`;
  const BLUE_HOUR_GRADIENT = `linear-gradient(180deg, ${C.dustyBlueDeep} 0%, ${C.navyMid} 60%, ${C.navy} 100%)`;
  const NIGHT_GRADIENT = `linear-gradient(180deg, ${C.navyDeep} 0%, ${C.navy} 55%, ${C.navyMid} 100%)`;

  function buildStars() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 70; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = rand(0, 100) + "%";
      star.style.top = rand(0, 70) + "%";
      star.style.animationDelay = rand(0, 2.4).toFixed(2) + "s";
      star.style.animationDuration = rand(1.8, 3.2).toFixed(2) + "s";
      frag.appendChild(star);
    }
    els.stars.appendChild(frag);
  }

  function randomiseTowerLights() {
    els.towerWrap.querySelectorAll(".tower-light").forEach((light) => {
      light.style.animationDelay = rand(0, 3).toFixed(2) + "s";
      light.style.animationDuration = rand(1.2, 2.6).toFixed(2) + "s";
    });
  }

  async function startFinale() {
    els.puzzleScreen.hidden = true;
    els.finaleScreen.hidden = false;
    els.finaleScreen.style.background = SUNSET_GRADIENT;
    els.towerWrap.innerHTML = svgEiffelNight();
    buildStars();
    randomiseTowerLights();

    // sunset -> blue hour (first 4s)
    await wait(50);
    els.finaleScreen.style.transition = "background 4s ease";
    els.finaleScreen.style.background = BLUE_HOUR_GRADIENT;
    await wait(4000);

    // blue hour -> night (next 4s) — .night also fades in stars + darkens
    // the skyline via their own CSS transitions
    els.finaleScreen.classList.add("night");
    els.finaleScreen.style.transition = "background 4s ease";
    els.finaleScreen.style.background = NIGHT_GRADIENT;
    await wait(4000);

    els.finaleScreen.classList.add("sparkling");

    await wait(4000);
    els.envelope.hidden = false;
    els.envelope.classList.add("drop");
  }

  function openLetter() {
    els.envelope.classList.add("opened");
    setTimeout(() => {
      els.letterScreen.hidden = false;
    }, 300);
  }

  els.envelope.addEventListener("click", openLetter);
  els.envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLetter();
    }
  });

  /* ---------------------------------------------------------------------
     8. AMBIENT POLISH — dust motes, gentle parallax, notebook opening
     ------------------------------------------------------------------- */
  function initDustField() {
    const count = window.innerWidth < 640 ? 14 : 24;
    for (let i = 0; i < count; i++) {
      const mote = document.createElement("div");
      mote.className = "dust-mote";
      const size = rand(2, 5);
      mote.style.width = size + "px";
      mote.style.height = size + "px";
      mote.style.left = rand(0, 100) + "%";
      mote.style.top = rand(20, 100) + "%";
      mote.style.setProperty("--dx", rand(-30, 30).toFixed(0) + "px");
      mote.style.setProperty("--dy", -(rand(120, 280)).toFixed(0) + "px");
      mote.style.animationDuration = rand(9, 19) + "s";
      mote.style.animationDelay = -(rand(0, 10)) + "s";
      els.dustField.appendChild(mote);
    }
  }

  // a couple of px of drift against the pointer — just enough for the
  // current page to feel like it's sitting slightly above the desk
  function initParallax() {
    document.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (!els.puzzleScreen.hidden) {
        els.buildingIllustration.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (!els.letterScreen.hidden) {
        els.letterPaper.style.transform = `rotate(${(x * 0.15).toFixed(2)}deg)`;
      }
    });
  }

  // opening the notebook reuses the same page-turn motion that carries
  // the reader through every chapter after this — one signature gesture,
  // used consistently, rather than a separate one-off intro effect
  async function openNotebook() {
    els.introScreen.classList.add("turning");
    await wait(850);
    els.introScreen.hidden = true;
    els.puzzleScreen.hidden = false;
    buildPuzzle(CHAPTERS[currentIndex]);
  }

  els.beginBtn.addEventListener("click", openNotebook);

  initDustField();
  initParallax();
})();
