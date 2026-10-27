/* ============================================================
   Happy Rose Day — script
   1. Endless falling petals in the background
   2. Random sweet messages on button click
   3. Burst of petals from the button on click
   ============================================================ */

"use strict";

/* ---------- 1. Endless falling petals ---------- */

const petalRain = document.getElementById("petal-rain");

// Random helper: pick a number between min and max (inclusive)
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Create one falling petal with random look and timing.
// The actual movement comes from the CSS "fall" animation; here we
// only set its size, position, speed and delay.
function createFallingPetal() {
  const petal = document.createElement("div");
  petal.className = "petal-drop";

  const size = randomBetween(10, 22); // px
  petal.style.width = size + "px";
  petal.style.height = size * 1.3 + "px";
  petal.style.left = randomBetween(0, 100) + "%";
  petal.style.animationDuration = randomBetween(7, 14) + "s";
  petal.style.animationDelay = -randomBetween(0, 14) + "s"; // negative: petals already mid-air on load

  petalRain.appendChild(petal);
}

// A modest number keeps the animation smooth on phones
const PETAL_COUNT = 18;
for (let i = 0; i < PETAL_COUNT; i++) {
  createFallingPetal();
}

/* ---------- 2. Random sweet messages ---------- */

const sweetMessages = [
  "Every rose I see reminds me of you — but none blooms as beautifully. 🌹",
  "If loving you were a petal, my rose would never stop blooming.",
  "You're the one rose in the garden of my life. Happy Rose Day!",
  "A rose may wilt in a week, but what I feel for you never will.",
  "Some people search for romance in poetry. I found mine in you.",
  "This rose can't smell as sweet as the thought of you.",
  "Roses are red, violets are blue — every bloom I pass still leads to you.",
  "One rose for the day, a thousand for the way you make me feel.",
  "You planted love in my heart, and it grows like a wild rose.",
  "If I had a rose for every time you made me smile, I'd walk through a garden forever.",
];

const messageEl = document.getElementById("sweet-message");
let lastMessageIndex = -1; // avoid showing the same message twice in a row

function showRandomMessage() {
  let index;
  do {
    index = Math.floor(Math.random() * sweetMessages.length);
  } while (index === lastMessageIndex);

  lastMessageIndex = index;

  // Fade out, swap text, then fade back in
  messageEl.classList.remove("visible");
  window.setTimeout(() => {
    messageEl.textContent = sweetMessages[index];
    messageEl.classList.add("visible");
  }, 200); // matches the CSS fade transition
}

/* ---------- 3. Burst of petals on click ---------- */

// Spawn a handful of petals that fly outward from a screen position.
function petalBurst(x, y) {
  const BURST_COUNT = 14;

  for (let i = 0; i < BURST_COUNT; i++) {
    const petal = document.createElement("div");
    petal.className = "petal-burst";

    // Random direction and distance via CSS custom properties
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(70, 160);
    petal.style.left = x + "px";
    petal.style.top = y + "px";
    petal.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    petal.style.setProperty("--dy", Math.sin(angle) * distance + "px");
    // Random per-petal timing so they don't move in lockstep
    petal.style.animationDuration = randomBetween(0.8, 1.4) + "s";

    document.body.appendChild(petal);

    // Clean up so the DOM doesn't grow forever
    petal.addEventListener("animationend", () => petal.remove());
  }
}

/* ---------- Wire up the button ---------- */

const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", () => {
  showRandomMessage();

  // Burst from the center of the button
  const rect = sendBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  petalBurst(centerX, centerY);
});
