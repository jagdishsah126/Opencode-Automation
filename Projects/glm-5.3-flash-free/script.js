/* ============================================================
   Happy Tihar 🪔 — script.js
   Behaviour: scroll-story reveals, click-to-light diyos,
   seven-coloured tika reveal, personalized wish, random
   blessings with a celebratory petal/sparkle burst.
   No internet, no libraries.
   ============================================================ */

"use strict";

/* ---------- 1. Reveal story scenes as they scroll in ---------- */
const scenes = document.querySelectorAll(".scene");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target); // reveal once is enough
      }
    });
  },
  { threshold: 0.15 }
);
scenes.forEach((scene) => revealObserver.observe(scene));

/* ---------- 2. Particle burst: petals + gold sparks ---------- */
const fxLayer = document.getElementById("fx");
const PETAL_COLORS = ["#ffb703", "#fb8500", "#ffd166", "#e85d04", "#ff4d6d"];

/** Fire a burst of petals and sparks from screen coordinates (x, y). */
function burst(x, y, count = 24) {
  for (let i = 0; i < count; i++) {
    const bit = document.createElement("span");
    const isPetal = Math.random() < 0.55;
    bit.className = isPetal ? "petal" : "spark";

    // Send each piece flying in its own radial direction
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    bit.style.left = x + "px";
    bit.style.top = y + "px";
    bit.style.setProperty("--dx", (Math.cos(angle) * dist).toFixed(1) + "px");
    bit.style.setProperty("--dy", (Math.sin(angle) * dist - 40).toFixed(1) + "px"); // slight upward bias
    bit.style.setProperty("--rot", Math.round(Math.random() * 720 - 360) + "deg");
    bit.style.setProperty("--dur", (0.9 + Math.random() * 0.9).toFixed(2) + "s");
    bit.style.setProperty("--s", (isPetal ? 9 + Math.random() * 10 : 3 + Math.random() * 5).toFixed(1) + "px");

    // Marigold petals get a random petal colour; sparks keep their gold CSS
    if (isPetal) {
      const colour = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      bit.style.background = `radial-gradient(circle at 30% 30%, #ffe6a1, ${colour})`;
    }

    fxLayer.appendChild(bit);
    bit.addEventListener("animationend", () => bit.remove()); // clean up after flight
  }
}

/** Centre point of a DOM element, for aiming bursts. */
function centerOf(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

/* ---------- 3. Light the diyos ---------- */
const diyos = Array.from(document.querySelectorAll(".lamp .diyo"));
const lampCountEl = document.getElementById("lamp-count");
const lampMessage = document.getElementById("lamp-message");
let litCount = 0;

function updateLampCounter() {
  lampCountEl.textContent =
    litCount < diyos.length
      ? `${litCount} of ${diyos.length} diyos lit`
      : `${diyos.length} of ${diyos.length} diyos lit ✨`;
}

diyos.forEach((diyo) => {
  diyo.addEventListener("click", () => {
    if (diyo.classList.contains("lit")) return; // already burning
    diyo.classList.add("lit");
    litCount++;
    updateLampCounter();
    burst(...centerOf(diyo), 14);

    // All five lit → reveal the hidden blessing line + a big burst
    if (litCount === diyos.length) {
      lampMessage.classList.add("reveal");
      burst(...centerOf(lampMessage), 40);
    }
  });
});
updateLampCounter();

/* ---------- 4. Bhai Tika: apply the seven colours ---------- */
const forehead = document.getElementById("forehead");
const tikaBtn = document.getElementById("tika-btn");
const tikaBlessing = document.getElementById("tika-blessing");

tikaBtn.addEventListener("click", () => {
  if (forehead.classList.contains("applied")) return; // one blessing per brother
  forehead.classList.add("applied");                  // dots pop in, staggered by CSS
  tikaBlessing.classList.add("reveal");
  burst(...centerOf(forehead), 22);
  tikaBtn.textContent = "Blessed ✨";
  tikaBtn.disabled = true;
});

/* ---------- 5. Personalized wish: remember the recipient's name ---------- */
const nameInput = document.getElementById("name-input");
const nameSlots = document.querySelectorAll(".name-slot");

function applyName() {
  const name = nameInput.value.trim();
  nameSlots.forEach((slot) => (slot.textContent = name || "dear one"));
}
nameInput.addEventListener("input", applyName);
applyName();

/* ---------- 6. "Send a Tihar Wish": random blessing + celebration ---------- */
const blessings = [
  "May every dark corner of your days find a flame.",
  "May prosperity come looking for your door, the way Laxmi does.",
  "May the crow always take his bite before sorrow finds your table.",
  "May someone garland you on the days you least expect it.",
  "May your ledger of small joys overflow this year.",
  "May your lamps burn brighter than your worries.",
  "May the goddess arrive through every window you forgot to close.",
  "May loyalty like a dog's find its way back to you, doubled.",
  "May what you give each day return tenfold, like the cow's milk.",
  "May seven colours always be drawn around your name.",
  "May your hearth stay warm, your debts stay small, your people stay near.",
  "May the road ahead be lit — and if it isn't, may you be the flame.",
];
const blessingEl = document.getElementById("blessing");
const sendBtn = document.getElementById("send-btn");
let lastBlessingIndex = -1;

/** Pick a random blessing, never the same one twice in a row. */
function randomBlessing() {
  let index;
  do {
    index = Math.floor(Math.random() * blessings.length);
  } while (blessings.length > 1 && index === lastBlessingIndex);
  lastBlessingIndex = index;
  return blessings[index];
}

sendBtn.addEventListener("click", () => {
  // Swap in a fresh blessing with a pop
  blessingEl.textContent = randomBlessing();
  blessingEl.classList.remove("pop");
  void blessingEl.offsetWidth; // force reflow so the animation can restart
  blessingEl.classList.add("pop");

  // Celebrate!
  const [x, y] = centerOf(sendBtn);
  burst(x, y, 46);
});
