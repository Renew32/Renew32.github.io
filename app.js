/* =========================================================
   Antoine. Immersive portfolio
   A procedural 3D jellyfish guides the visitor through the
   chapters: the camera follows the scroll, the ocean changes
   colour with a liquid wave, and ambient sound is generated
   live with the Web Audio API.
   ========================================================= */
import * as THREE from "three";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.innerWidth < 860;

/* ---------- toast ---------- */
const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

/* =========================================================
   Content
   ========================================================= */
const ICON = (n) => `assets/icons/${n}.svg`;
const icon = (x) => (x.startsWith("bi-") ? `<i class="bi ${x}"></i>` : `<img src="${ICON(x)}" alt="" />`);

const STACK = [
  { name: "AI", head: "bi-cpu", text: "Machine learning, NLP and LLM-powered features, from data prep to smart, useful products.", icons: ["tensorflow", "pytorch", "pandas", "jupyter"] },
  { name: "Python", head: "python", text: "Back ends with Django, automation scripts and data work, from quick prototypes to clean, tested code.", icons: ["django", "numpy", "pandas", "playwright"] },
  { name: "Java", head: "java", text: "Object-oriented design, Android apps and clean, tested software architecture.", icons: ["android", "firebase", "sqlite", "git"] },
  { name: "SQL", head: "bi-database-fill", text: "Data modeling, queries and dashboards with MySQL, PostgreSQL, SQL Server and Power BI.", icons: ["mysql", "postgresql", "microsoftsqlserver", "bi-bar-chart-fill"] },
  { name: "VibeCode", head: "bi-stars", text: "AI-assisted development: prompting, iterating and shipping polished products at high speed.", icons: ["vscode", "git", "githubactions", "bi-magic"] },
  { name: "Leadership", head: "bi-flag-fill", text: "Leading teams as Co-President of UOSSA: strategy, communication and bringing people together.", icons: ["bi-people-fill", "bi-chat-quote-fill", "bi-compass-fill", "bi-hourglass-split"] },
];
const TOOLS = ["C++", "C", "JavaScript", "React", "Node.js", "Django", "Android", "Playwright", "xUnit", "Power BI", "SQL Server", "AWS", "Docker", "Git", "Azure DevOps", "CI/CD", "Microsoft Office", "French (native)", "English (fluent)"];

const JOURNEY = [
  { date: "May 2026 to Aug 2026", role: "Web Content Management Assistant", org: "University of Ottawa", points: ["Updated and maintained website content and digital assets across multiple platforms.", "Optimized web pages for search engines and user experience."] },
  { date: "Jan 2026 to Apr 2026", role: "IT Support Technician", org: "University of Ottawa", points: ["Provided friendly, timely support to faculty and students, resolving hardware and software issues.", "Maintained clear documentation and explained solutions to a non-technical audience."] },
  { date: "Jan 2025 to Apr 2025", role: "Full-Stack Developer", org: "Chanas Assurances S.A.", points: ["Developed dynamic, responsive user interfaces with React.js.", "Built and consumed REST APIs connecting the React front end to a Django back end.", "Implemented Django back-end logic for data handling, form processing and validation, applying security best practices."] },
  { date: "Apr 2024 to Aug 2024", role: "Cybersecurity Consultant", org: "GlorySec", points: ["Assessed the client's security needs and recommended the most suitable tools and practices.", "Researched and compared security solutions to identify the best options.", "Presented clear recommendations to technical and non-technical stakeholders."] },
];
const LEAD = [
  { date: "Apr 2026 to Present", role: "Co-President", org: "UOSSA", points: ["Lead strategic initiatives and oversee association operations, fostering community engagement and cultural exchange."] },
  { date: "Sep 2025 to Apr 2026", role: "Director of Internal Communications", org: "UOSSA", points: ["Managed internal communications and coordinated member engagement, ensuring information flows well."] },
  { date: "Sep 2025 to Apr 2026", role: "VP Deputy Marketing & Communication", org: "UOISA", points: ["Supported marketing strategy and external communication to boost visibility and engagement."] },
];

const PROJECTS = [
  { kind: "Featured · Platform", title: "CampusConnect", text: "A platform that brings university students together: discover clubs, events and peers in one place, and make campus life feel connected. Designed and built end-to-end, from the data model to the interface.", tags: ["Full-Stack", "React", "Database", "UX"], art: { icon: "bi-mortarboard-fill", bg: "radial-gradient(circle at 50% 120%, #3ee6c4, #0b3d5a 70%)" } },
  { kind: "Community · Website", title: "UOSSA Website", text: "The official website of the student association I co-lead: events, team and resources for software engineering students.", tags: ["Frontend", "UI/UX", "Content"], art: { icon: "bi-people-fill", bg: "radial-gradient(circle at 50% 120%, #1fbf75, #053b35 70%)" } },
  { kind: "Business · Website", title: "Service Website", text: "A professional presentation platform for a service business.", tags: ["HTML", "CSS", "JS"], url: "https://canadianc.onrender.com", cta: "Visit site", art: { img: "assets/card/JOKO.webp", bg: "radial-gradient(circle at 50% 120%, #ff9e4a, #8a3b12 70%)" } },
  { kind: "Game", title: "Flip & Match", text: "An interactive memory mini-game built with React.", tags: ["React", "CSS"], url: "https://flipnmatch.onrender.com", cta: "Play", art: { img: "assets/card/JOKERV.webp", bg: "radial-gradient(circle at 50% 120%, #9b8cff, #2d2470 70%)" } },
  { kind: "E-commerce", title: "E-commerce Store", text: "An online shop for digital and physical goods.", tags: ["Node.js", "Full-Stack"], url: "https://thriftgaming.onrender.com", cta: "Visit store", art: { img: "assets/card/jOKHOLO.webp", bg: "radial-gradient(circle at 50% 120%, #3ee6c4, #0b4b47 70%)" } },
  { kind: "Data", title: "Sport Analytics", text: "Data visualization for sport analytics.", tags: ["Python", "Data Viz"], url: "https://analiz-aff7.onrender.com", cta: "Open app", art: { img: "assets/card/Rocketjok.webp", bg: "radial-gradient(circle at 50% 120%, #4e7cff, #0b1440 70%)" } },
  { kind: "Mobile", title: "Android App", text: "A full mobile app in Java with SQLite storage and Firebase real-time sync.", tags: ["Java", "Android", "Firebase"], art: { img: "assets/card/ab.webp", bg: "radial-gradient(circle at 50% 120%, #f6c896, #6b3f1c 70%)" } },
];

const INTERESTS = [
  { img: "Runner", alt: "Runner joker", title: "Sports & Data", text: "Stats, analytics and the numbers behind the game. It's why Analiz exists.", tag: "+ insights", kind: "chips" },
  { img: "Rough_Gem", alt: "Rough Gem joker", title: "Entrepreneurship", text: "Startups, product thinking and turning rough ideas into real value.", tag: "+ $1 per idea", kind: "money" },
  { img: "The_Hermit", alt: "The Hermit tarot card", title: "Finance", text: "Markets, investing and fintech: how money moves, and how tech is changing it.", tag: "x2 money", kind: "money" },
  { img: "Zodiac_Deck", alt: "Zodiac Deck", title: "The world of tomorrow", text: "How tech will reshape the way we live, learn and work, and how to help build it.", tag: "+ vision", kind: "chips" },
  { img: "Voucher", alt: "Spoon voucher", title: "AI & RAG", text: "Spoon-feeding LLMs the right context so their answers are useful, accurate and up to date.", tag: "x2 answers", kind: "mult" },
  { img: "Cloud_9", alt: "Cloud 9 joker", title: "Cloud", text: "AWS, Azure, Docker and CI/CD: shipping apps that scale without breaking a sweat.", tag: "+ scale", kind: "chips" },
  { img: "Superposition", alt: "Superposition joker", title: "Quantum Computing", text: "Qubits, superposition and the algorithms that could change computing.", tag: "+ curiosity", kind: "mult" },
];

/* =========================================================
   Sound: an ambient deep-sea bed made live with Web Audio
   ========================================================= */
const sound = { ctx: null, master: null, on: false, bubbleTimer: null };
function buildAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // brown noise through a breathing low-pass: the "ocean"
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = 0.6;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 220;
  lfo.connect(lfoGain).connect(lp.frequency);
  const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.55;
  noise.connect(lp).connect(noiseGain).connect(master);

  // a soft drone pad
  const pad = ctx.createGain(); pad.gain.value = 0.045;
  const padLp = ctx.createBiquadFilter(); padLp.type = "lowpass"; padLp.frequency.value = 600;
  [55, 82.4, 110.2, 164.8].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12;
    const g = ctx.createGain(); g.gain.value = i === 0 ? 1 : 0.5;
    const trem = ctx.createOscillator(); trem.frequency.value = 0.05 + i * 0.03;
    const tremG = ctx.createGain(); tremG.gain.value = 0.35;
    trem.connect(tremG).connect(g.gain);
    o.connect(g).connect(padLp);
    o.start(); trem.start();
  });
  padLp.connect(pad).connect(master);

  noise.start(); lfo.start();
  sound.ctx = ctx; sound.master = master;
  return true;
}
function blip(freq = 520, dur = 0.12, vol = 0.05) {
  if (!sound.on || !sound.ctx) return;
  const ctx = sound.ctx, t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 2.2, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(sound.master);
  o.start(t); o.stop(t + dur + 0.02);
}
function scheduleBubbles() {
  clearTimeout(sound.bubbleTimer);
  if (!sound.on) return;
  sound.bubbleTimer = setTimeout(() => {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) setTimeout(() => blip(260 + Math.random() * 500, 0.08 + Math.random() * 0.08, 0.025), i * 90);
    scheduleBubbles();
  }, 2200 + Math.random() * 4200);
}
const soundBtn = $("#soundToggle");
function setSound(on) {
  if (on && !sound.ctx && !buildAudio()) { toast("Sound is not supported in this browser."); return; }
  sound.on = on;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.innerHTML = `<span class="bars"><i></i><i></i><i></i></span>${on ? "Sound off" : "Sound on"}`;
  if (!sound.ctx) return;
  const t = sound.ctx.currentTime;
  if (on) {
    sound.ctx.resume();
    sound.master.gain.cancelScheduledValues(t);
    sound.master.gain.setTargetAtTime(0.55, t, 0.8);
    scheduleBubbles();
  } else {
    sound.master.gain.cancelScheduledValues(t);
    sound.master.gain.setTargetAtTime(0, t, 0.25);
    clearTimeout(sound.bubbleTimer);
  }
}
soundBtn.addEventListener("click", () => setSound(!sound.on));
setSound(false);
document.addEventListener("pointerover", (e) => {
  if (e.target.closest(".pill, .sq, .hotspot, .chapters a, .j-card")) blip(700, 0.06, 0.018);
});

/* =========================================================
   Text: split titles into words for the reveal
   ========================================================= */
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = p;
          inner.style.setProperty("--d", i++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(el);
}
$$(".split").forEach(splitWords);

const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) en.target.classList.add("in");
    else if (en.boundingClientRect.top > 0) en.target.classList.remove("in"); // replay when scrolling back up
  });
}, { threshold: 0.25 });
function startReveals() { $$(".split, .fade").forEach((el) => revealIO.observe(el)); }

/* =========================================================
   Entry gate
   ========================================================= */
const gate = $("#gate");
function enter(withSound) {
  if (withSound) setSound(true);
  gate.classList.add("leaving");
  document.body.classList.remove("is-gated");
  startReveals();
  setTimeout(() => gate.remove(), 1200);
}
$("#enterSound").addEventListener("click", () => enter(true));
$("#enterQuiet").addEventListener("click", () => enter(false));
if (location.hash && location.hash !== "#intro") enter(false); // deep links skip the gate

/* =========================================================
   Drawer (detail panels)
   ========================================================= */
const drawer = $("#drawer"), drawerBody = $("#drawerBody");
let lastFocus = null;
function openDrawer(html) {
  lastFocus = document.activeElement;
  drawerBody.innerHTML = html;
  drawer.scrollTop = 0;
  document.body.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
  setTimeout(() => $("#drawerClose").focus(), 50);
  blip(420, 0.18, 0.04);
}
function closeDrawer() {
  document.body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
$("#drawerClose").addEventListener("click", closeDrawer);
$("#backdrop").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

const tl = (items) => `<ol class="tl">${items.map((x) => `
  <li><time>${x.date}</time><h4>${x.role}</h4><p class="org">${x.org}</p>
  <ul>${x.points.map((p) => `<li>${p}</li>`).join("")}</ul></li>`).join("")}</ol>`;

const PANELS = {
  stack: () => `
    <span class="d-kicker">Skills</span>
    <h3 id="drawerTitle">The stack, <em>all wired together.</em></h3>
    <p class="d-lead">Six currents I work in every day, plus the tools behind them.</p>
    <div class="d-grid">${STACK.map((s) => `
      <div class="d-skill"><h4>${icon(s.head)} ${s.name}</h4><p>${s.text}</p>
      <div class="d-icons">${s.icons.map(icon).join("")}</div></div>`).join("")}</div>
    <p class="d-section">Also in the toolbox</p>
    <div class="chips">${TOOLS.map((t) => `<span>${t}</span>`).join("")}</div>`,
  journey: () => `
    <span class="d-kicker">Experience</span>
    <h3 id="drawerTitle">The journey <em>so far.</em></h3>
    <p class="d-lead">From cybersecurity to full-stack development, IT support and web content.</p>
    ${tl(JOURNEY)}
    <p class="d-section">Education</p>
    ${tl([{ date: "Sep 2023 to Present", role: "BASc Software Engineering (Co-op)", org: "University of Ottawa · Engineering Management & Entrepreneurship option", points: ["Databases and Algorithms, Computer Architecture, Object-Oriented Programming, Operating Systems, Software Quality Assurance."] }])}`,
  lead: () => `
    <span class="d-kicker">Leadership</span>
    <h3 id="drawerTitle">Moving <em>as one.</em></h3>
    <p class="d-lead">Giving students a voice and helping a community grow, while staying bilingual in French and English.</p>
    ${tl(LEAD)}`,
};
function projectPanel(i) {
  const p = PROJECTS[i];
  const art = p.art.img ? `<img src="${p.art.img}" alt="" />` : `<i class="bi ${p.art.icon}"></i>`;
  const link = p.url
    ? `<div class="cta"><a class="pill" href="${p.url}" target="_blank" rel="noopener">${p.cta}</a><a class="sq" href="${p.url}" target="_blank" rel="noopener" aria-label="${p.cta}"><i class="bi bi-arrow-up-right"></i></a></div>`
    : `<div class="cta"><button class="pill" data-soon>Coming soon</button></div>`;
  const prev = (i + PROJECTS.length - 1) % PROJECTS.length, next = (i + 1) % PROJECTS.length;
  return `
    <span class="d-kicker">Project ${i + 1} / ${PROJECTS.length} · ${p.kind}</span>
    <h3 id="drawerTitle">${p.title}</h3>
    <div class="d-project-art" style="background:${p.art.bg}">${art}</div>
    <div class="d-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    <p class="d-lead">${p.text}</p>
    ${link}
    <div class="d-nav"><button data-project="${prev}"><i class="bi bi-arrow-left"></i> ${PROJECTS[prev].title}</button><button data-project="${next}">${PROJECTS[next].title} <i class="bi bi-arrow-right"></i></button></div>`;
}
document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (open) { openDrawer(PANELS[open.dataset.open]()); return; }
  const proj = e.target.closest("[data-project]");
  if (proj) { openDrawer(projectPanel(+proj.dataset.project)); return; }
  if (e.target.closest("[data-soon]")) toast("Coming soon. Stay tuned!");
});

/* =========================================================
   Interests: a hand of Balatro cards
   ========================================================= */
const hand = $("#hand");
const n = INTERESTS.length;
hand.innerHTML = INTERESTS.map((c, i) => `
  <div class="j-slot" style="--i:${i - (n - 1) / 2}">
    <div class="j-card" tabindex="0" role="button" aria-pressed="false" aria-label="${c.title}">
      <div class="j-inner">
        <div class="j-front"><img src="assets/balatro/${c.img}.png" alt="${c.alt}" loading="lazy" /></div>
        <div class="j-back"><h4>${c.title}</h4><p>${c.text}</p><span class="j-tag ${c.kind}">${c.tag}</span></div>
      </div>
    </div>
  </div>`).join("");
$$(".j-card", hand).forEach((card) => {
  card.addEventListener("click", () => {
    const was = card.classList.contains("flipped");
    $$(".j-card.flipped", hand).forEach((o) => { o.classList.remove("flipped"); o.setAttribute("aria-pressed", "false"); });
    if (!was) { card.classList.add("flipped"); card.setAttribute("aria-pressed", "true"); blip(880, 0.1, 0.03); }
  });
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
});

/* =========================================================
   Co-op calculator
   ========================================================= */
const calc = { term: 4 };
const fmt = (v) => Math.round(v).toLocaleString("en-US");
const outs = { hours: $("#oHours"), features: $("#oFeatures"), bugs: $("#oBugs"), team: $("#oTeam"), coffee: $("#oCoffee") };
const shown = { hours: 0, features: 0, bugs: 0, team: 0, coffee: 0 };
let target = { ...shown }, calcRaf;
function computeCalc() {
  const h = +$("#rHours").value, team = +$("#rTeam").value, build = +$("#rBuild").value, coffee = +$("#rCoffee").value;
  $$(".range output").forEach((o) => {
    const inp = document.getElementById(o.getAttribute("for"));
    o.textContent = inp.id === "rBuild" ? `${inp.value}%` : inp.value;
  });
  const hours = calc.term * 4.33 * h * (build / 100);
  target = { hours, features: hours / 45, bugs: hours / 9, team, coffee: calc.term * 21 * coffee };
  cancelAnimationFrame(calcRaf);
  const from = { ...shown }, t0 = performance.now();
  const step = (t) => {
    const p = smooth(clamp((t - t0) / 600));
    for (const k in target) {
      shown[k] = lerp(from[k], target[k], p);
      outs[k].textContent = fmt(shown[k]) + (k === "hours" ? " hrs" : "");
    }
    if (p < 1) calcRaf = requestAnimationFrame(step);
  };
  calcRaf = requestAnimationFrame(step);
}
$$(".calc input").forEach((i) => i.addEventListener("input", computeCalc));
$$(".seg button").forEach((b) => b.addEventListener("click", () => {
  $$(".seg button").forEach((x) => x.classList.toggle("on", x === b));
  calc.term = +b.dataset.term;
  computeCalc();
}));
computeCalc();

/* ---------- connect ---------- */
$("#copyEmail").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("antoinemissoupg@gmail.com"); toast("Email copied, talk soon!"); }
  catch { location.href = "mailto:antoinemissoupg@gmail.com"; }
});
$("#year").textContent = new Date().getFullYear();

/* =========================================================
   Scroll keyframes: where the camera sits for each chapter
   ========================================================= */
// background: top, bottom, glow | jelly: body, rim | light: dark text on a pale sea
const KEYS = [
  { id: "intro",      anchor: () => 0,                                 cam: [0, 0.3, 6.6],    look: [0, -0.95, 0],  bg: ["#123a5e", "#050a18", "#2a8fb8"], jelly: ["#4fd1ff", "#c9fff4"], dim: 1 },
  { id: "skills",     anchor: () => centerOf("#skills .block"),       cam: [-3.0, -0.5, 4.6], look: [1.35, -1.0, 0], bg: ["#24145e", "#07051c", "#5a3bd0"], jelly: ["#8a6bff", "#e0d6ff"], dim: 1 },
  { id: "experience", anchor: () => centerOf("#experience .block"),   cam: [3.1, 1.6, 4.4],   look: [-1.45, -0.6, 0], bg: ["#5c1660", "#14041f", "#c0368f"], jelly: ["#ff5fc1", "#ffd6f2"], dim: 1 },
  { id: "leadership", anchor: () => centerOf("#leadership .block"),   cam: [-0.8, -4.4, 3.8], look: [1.15, -0.5, 0], bg: ["#f3eeff", "#cbbff5", "#ffffff"], jelly: ["#7a52ee", "#c4b2ff"], dim: 0.9, light: true },
  { id: "statement",  anchor: () => centerOf(".statement"),           cam: [0, 1.1, 10],      look: [0, -1.3, 0],   bg: ["#4a1663", "#12051f", "#b8358f"], jelly: ["#c050ff", "#ffe0ff"], dim: 0.75 },
  { id: "projects-a", anchor: () => topOf("#projects") + vh() * 0.25, cam: [1.3, -2.0, 4.1],  look: [0.15, -2.85, 0], bg: ["#3b1460", "#10041d", "#a03ad0"], jelly: ["#b04dff", "#f3d4ff"], dim: 1 },
  { id: "projects-b", anchor: () => bottomOf("#projects") - vh() * 1.3, cam: [-1.1, -2.3, 4.3], look: [0.2, -2.95, 0], bg: ["#3b1460", "#10041d", "#a03ad0"], jelly: ["#b04dff", "#f3d4ff"], dim: 1 },
  { id: "interests",  anchor: () => centerOf("#hand"),                cam: [0.6, 0.2, 10.5],  look: [-3.1, -1.2, 0], bg: ["#0c4250", "#03141b", "#1fa38f"], jelly: ["#2fe0c0", "#d2fff6"], dim: 0.8 },
  { id: "calculator", anchor: () => centerOf(".calc"),                cam: [-1.2, -0.6, 13],  look: [-3.8, -1.6, 0], bg: ["#22164f", "#080617", "#5b3bd6"], jelly: ["#7d5cff", "#ddd4ff"], dim: 0.55 },
  { id: "connect",    anchor: () => maxScroll(),                      cam: [0, 0.6, 6.2],     look: [0, -1.55, 0],  bg: ["#5b1f6e", "#150722", "#d0509f"], jelly: ["#ff7ad9", "#ffe4f7"], dim: 1 },
];
const vh = () => window.innerHeight;
const topOf = (s) => $(s).getBoundingClientRect().top + scrollY;
const bottomOf = (s) => { const r = $(s).getBoundingClientRect(); return r.bottom + scrollY; };
const centerOf = (s) => { const r = $(s).getBoundingClientRect(); return r.top + scrollY + r.height / 2 - vh() / 2; };
const maxScroll = () => document.documentElement.scrollHeight - vh();
let anchors = [], sectionTops = [];
function measure() {
  anchors = KEYS.map((k) => k.anchor());
  sectionTops = $$("#story > section").map((s) => ({ top: topOf("#" + s.id), ch: s.dataset.ch }));
  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
}
const col = (hex) => new THREE.Color(hex);
KEYS.forEach((k) => {
  k.c = { top: col(k.bg[0]), bot: col(k.bg[1]), glow: col(k.bg[2]), body: col(k.jelly[0]), rim: col(k.jelly[1]) };
});

/* =========================================================
   Three.js scene
   ========================================================= */
THREE.ColorManagement.enabled = false;
const canvas = $("#scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (err) {
  document.body.classList.add("no-webgl");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
const clock = new THREE.Clock();

/* ---------- ocean background with a liquid wave transition ---------- */
const bgMat = new THREE.ShaderMaterial({
  depthWrite: false, depthTest: false,
  uniforms: {
    uTopA: { value: new THREE.Color() }, uBotA: { value: new THREE.Color() }, uGlowA: { value: new THREE.Color() },
    uTopB: { value: new THREE.Color() }, uBotB: { value: new THREE.Color() }, uGlowB: { value: new THREE.Color() },
    uP: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
  fragmentShader: /* glsl */`
    varying vec2 vUv;
    uniform vec3 uTopA, uBotA, uGlowA, uTopB, uBotB, uGlowB;
    uniform float uP, uTime, uAspect;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    vec3 sea(vec3 top, vec3 bot, vec3 glow, vec2 uv, float t){
      vec3 c = mix(bot, top, smoothstep(0.0, 1.0, uv.y));
      vec2 a = vec2((uv.x - 0.5) * uAspect + 0.5, uv.y);
      float g1 = exp(-pow(distance(a, vec2(0.28 + 0.06*sin(t*0.13), 0.78)), 2.0) * 5.0);
      float g2 = exp(-pow(distance(a, vec2(0.78 + 0.05*cos(t*0.11), 0.32)), 2.0) * 7.0);
      c += glow * (g1 * 0.32 + g2 * 0.18);
      // soft light shafts from the surface
      float ray = pow(max(0.0, sin(uv.x * 11.0 + uv.y * 2.5 + t * 0.07)), 10.0) * 0.05 * smoothstep(0.2, 1.0, uv.y);
      c += top * ray * 2.0;
      return c;
    }
    void main(){
      vec2 uv = vUv;
      vec3 A = sea(uTopA, uBotA, uGlowA, uv, uTime);
      vec3 B = sea(uTopB, uBotB, uGlowB, uv, uTime);
      // the next chapter's water rises from below with a wavy surface
      float h = uP * 1.3 - 0.15
        + 0.035 * sin(uv.x * 7.0 * uAspect + uTime * 1.2)
        + 0.018 * sin(uv.x * 17.0 * uAspect - uTime * 1.9);
      float m = 1.0 - smoothstep(h - 0.004, h + 0.004, uv.y);
      vec3 c = mix(A, B, m);
      float edge = exp(-abs(uv.y - h) * 160.0) * step(0.001, uP) * step(uP, 0.999);
      c += vec3(1.0) * edge * 0.18;
      c += (hash(uv * 900.0 + uTime) - 0.5) / 255.0 * 2.0; // dither
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
bg.frustumCulled = false; bg.renderOrder = -10;
scene.add(bg);

/* ---------- the jellyfish ---------- */
const jelly = new THREE.Group();
scene.add(jelly);
const RIM_Y = Math.cos(Math.PI * 0.58);   // y of the bell rim on the unit sphere
const RIM_R = Math.sin(Math.PI * 0.58);
const shared = {
  uTime: { value: 0 }, uPulse: { value: 0 },
  uBody: { value: new THREE.Color("#4fd1ff") }, uRim: { value: new THREE.Color("#c9fff4") },
  uOpacity: { value: 1 }, uLight: { value: 0 },
};

const bellVert = /* glsl */`
  uniform float uTime, uPulse;
  varying vec3 vN; varying vec3 vView; varying float vR; varying float vAng;
  void main(){
    vec3 p = position;
    float r = 1.0 - clamp((p.y - ${RIM_Y.toFixed(4)}) / ${(1 - RIM_Y).toFixed(4)}, 0.0, 1.0); // 0 top, 1 rim
    float ang = atan(p.z, p.x);
    float c = uPulse;
    p.xz *= 1.0 - 0.16 * c * smoothstep(0.1, 1.0, r);
    p.xz *= 1.0 - 0.07 * pow(r, 6.0);
    p.y *= 0.78 * (1.0 + 0.1 * c);
    p.y += sin(ang * 16.0 + uTime * 1.5) * 0.022 * pow(r, 4.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vR = r; vAng = ang;
    gl_Position = projectionMatrix * mv;
  }`;
const bellFrag = /* glsl */`
  uniform vec3 uBody, uRim; uniform float uOpacity, uTime, uGonad, uLight;
  varying vec3 vN; varying vec3 vView; varying float vR; varying float vAng;
  void main(){
    vec3 n = normalize(vN);
    float fres = pow(1.0 - abs(dot(n, vView)), 2.0);
    float canals = smoothstep(0.93, 1.0, abs(sin(vAng * 4.0))) * (1.0 - vR * 0.4);
    float spots = smoothstep(0.75, 1.0, sin(vAng * 22.0 + vR * 30.0) * sin(vR * 40.0 - uTime * 0.5)) * 0.25 * vR;
    float gon = uGonad * smoothstep(0.55, 1.0, abs(sin(vAng * 2.0))) * smoothstep(0.12, 0.35, vR) * smoothstep(0.85, 0.5, vR);
    vec3 col = mix(uBody, uRim, fres);
    col += uRim * (canals * 0.5 + spots + gon * 0.9);
    col += uBody * 0.3 * (1.0 - vR);
    float a = 0.09 + fres * 0.72 + canals * 0.22 + spots * 0.6 + gon * 0.55 + (1.0 - vR) * 0.06;
    a *= mix(1.0, 1.25, uLight);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uOpacity);
  }`;
function bellMaterial(gonad) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uGonad: { value: gonad } },
    vertexShader: bellVert, fragmentShader: bellFrag,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
}
const bell = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 56, 0, Math.PI * 2, 0, Math.PI * 0.58), bellMaterial(0));
const inner = new THREE.Mesh(new THREE.SphereGeometry(0.62, 96, 40, 0, Math.PI * 2, 0, Math.PI * 0.55), bellMaterial(1));
inner.position.y = -0.04;
bell.renderOrder = 3; inner.renderOrder = 2;
jelly.add(inner, bell);

/* oral arms: frilly ribbons under the bell (displaced in the vertex shader) */
const ARM_LEN = 2.5;
const armGeo = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -ARM_LEN, 0)), 90, 0.075, 10, false);
for (let k = 0; k < 4; k++) {
  const ph = (k / 4) * Math.PI * 2 + 0.4;
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...shared, uPh: { value: ph } },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      uniform float uTime, uPulse, uPh;
      varying float vT; varying vec3 vN; varying vec3 vView;
      void main(){
        vec3 p = position;
        float t = clamp(-p.y / ${ARM_LEN.toFixed(2)}, 0.0, 1.0);
        vec2 radial = p.xz;
        float ang = atan(radial.y, radial.x);
        float frill = 1.0 + 0.55 * sin(t * 34.0 - uTime * 2.2 + ang * 3.0);
        radial *= (1.0 - 0.55 * t) * frill * (1.0 + 1.6 * t);
        vec2 base = vec2(cos(uPh), sin(uPh)) * (0.14 + t * 0.22);
        vec2 wave = vec2(sin(t * 4.0 - uTime * 1.1 + uPh), cos(t * 3.3 - uTime * 0.9 + uPh)) * 0.26 * t;
        p.xz = base + wave + radial;
        p.y = -0.1 - t * ${ARM_LEN.toFixed(2)} * (1.0 - 0.08 * uPulse);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal); vView = normalize(-mv.xyz); vT = t;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uBody, uRim; uniform float uOpacity;
      varying float vT; varying vec3 vN; varying vec3 vView;
      void main(){
        float fres = pow(1.0 - abs(dot(normalize(vN), vView)), 1.6);
        vec3 col = mix(uBody, uRim, fres * 0.8 + 0.1);
        float a = (0.16 + fres * 0.5) * (1.0 - vT * 0.75);
        gl_FragColor = vec4(col, a * uOpacity);
      }`,
  });
  const arm = new THREE.Mesh(armGeo, mat);
  arm.frustumCulled = false; arm.renderOrder = 1;
  jelly.add(arm);
}

/* tentacles: thin glowing lines hanging from the rim */
const TENT = 30, SEG = 110, TENT_LEN = 3.7;
const tentData = [];
{
  const pos = new Float32Array(TENT * SEG * 2 * 3);
  const aT = new Float32Array(TENT * SEG * 2), aAng = new Float32Array(TENT * SEG * 2), aPh = new Float32Array(TENT * SEG * 2), aLen = new Float32Array(TENT * SEG * 2);
  let v = 0;
  for (let k = 0; k < TENT; k++) {
    const ang = (k / TENT) * Math.PI * 2 + Math.random() * 0.05;
    const ph = Math.random() * Math.PI * 2;
    const len = TENT_LEN * (0.75 + Math.random() * 0.4);
    tentData.push({ ang, ph, len });
    for (let s = 0; s < SEG; s++) {
      for (const tt of [s / SEG, (s + 1) / SEG]) {
        aT[v] = tt; aAng[v] = ang; aPh[v] = ph; aLen[v] = len; v++;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  g.setAttribute("aAng", new THREE.BufferAttribute(aAng, 1));
  g.setAttribute("aPh", new THREE.BufferAttribute(aPh, 1));
  g.setAttribute("aLen", new THREE.BufferAttribute(aLen, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime, uPulse;
      attribute float aT, aAng, aPh, aLen;
      varying float vT;
      void main(){
        float t = aT;
        float sxz = (1.0 - 0.16 * uPulse) * 0.93 * ${RIM_R.toFixed(4)};
        float amp = 0.45 * t * t + 0.08 * t;
        vec3 p;
        p.x = cos(aAng) * sxz * (1.0 + 0.18 * t) + sin(t * 5.0 - uTime * 1.3 + aPh) * amp;
        p.z = sin(aAng) * sxz * (1.0 + 0.18 * t) + cos(t * 4.2 - uTime * 1.1 + aPh * 1.7) * amp;
        p.y = ${(RIM_Y * 0.78).toFixed(4)} * (1.0 + 0.1 * uPulse) - t * aLen;
        vT = t;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uBody, uRim; uniform float uOpacity;
      varying float vT;
      void main(){
        vec3 col = mix(uRim, uBody, vT);
        gl_FragColor = vec4(col, (1.0 - vT) * 0.6 * uOpacity);
      }`,
  });
  const lines = new THREE.LineSegments(g, mat);
  lines.frustumCulled = false;
  jelly.add(lines);
}
// same maths as the tentacle shader, in jelly space, for the project hotspots
function tentaclePoint(k, t, time, pulse, out) {
  const { ang, ph, len } = tentData[k];
  const sxz = (1 - 0.16 * pulse) * 0.93 * RIM_R;
  const amp = 0.45 * t * t + 0.08 * t;
  out.set(
    Math.cos(ang) * sxz * (1 + 0.18 * t) + Math.sin(t * 5 - time * 1.3 + ph) * amp,
    RIM_Y * 0.78 * (1 + 0.1 * pulse) - t * len,
    Math.sin(ang) * sxz * (1 + 0.18 * t) + Math.cos(t * 4.2 - time * 1.1 + ph * 1.7) * amp,
  );
  return out;
}

/* soft halo behind the bell */
const halo = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uBody; uniform float uOpacity, uLight; varying vec2 vUv;
      void main(){ float d = distance(vUv, vec2(0.5)); float a = exp(-d * d * 14.0) * 0.38 * (1.0 - uLight * 0.85);
      gl_FragColor = vec4(uBody * a * uOpacity, 1.0); }`,
  }),
);
halo.scale.setScalar(5.5);
halo.renderOrder = 0;
scene.add(halo);

/* ---------- marine snow ---------- */
const SNOW = isMobile() ? 900 : 1800;
{
  const p = new Float32Array(SNOW * 3), s = new Float32Array(SNOW);
  for (let i = 0; i < SNOW; i++) {
    p[i * 3] = (Math.random() - 0.5) * 26;
    p[i * 3 + 1] = (Math.random() - 0.5) * 22 - 1;
    p[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
    s[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  g.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  const snow = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { ...shared, uDpr: { value: 1 } }, transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime, uDpr; attribute float aS; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.05 + aS * 0.12) + 12.0, 22.0) - 12.0;
        p.x += sin(uTime * 0.2 + aS * 20.0) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.0 + aS * 2.6) * uDpr * (9.0 / -mv.z);
        vA = 0.25 + aS * 0.5;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uRim; uniform float uLight; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA;
        vec3 c = mix(uRim, vec3(0.32, 0.22, 0.6), uLight);
        gl_FragColor = vec4(c, a * 0.8);
      }`,
  }));
  snow.frustumCulled = false;
  scene.add(snow);
  snow.userData.dpr = snow.material.uniforms.uDpr;
  scene.userData.snow = snow;
}

/* ---------- project hotspots on the tentacles ---------- */
const HOT = [
  { k: 2, t: 0.46 }, { k: 7, t: 0.58 }, { k: 11, t: 0.4 }, { k: 15, t: 0.66 },
  { k: 19, t: 0.5 }, { k: 23, t: 0.72 }, { k: 27, t: 0.56 },
];
const hotWrap = $("#hotspots");
hotWrap.innerHTML = PROJECTS.map((p, i) =>
  `<button class="hotspot" data-project="${i}" aria-label="Project ${i + 1}: ${p.title}">${i + 1}<span class="tip">${p.title}</span></button>`).join("");
const hotEls = $$(".hotspot", hotWrap);
// a hotspot holds still while it is hovered or focused, so it is easy to click
hotEls.forEach((el) => {
  const hold = () => (el.dataset.hold = "1"), release = () => delete el.dataset.hold;
  el.addEventListener("pointerenter", hold); el.addEventListener("pointerleave", release);
  el.addEventListener("focus", hold); el.addEventListener("blur", release);
});
const tmpV = new THREE.Vector3();

/* =========================================================
   Resize, scroll, pointer
   ========================================================= */
let W = 0, H = 0;
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  if (renderer) {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    scene.userData.snow.userData.dpr.value = dpr;
  }
  camera.aspect = W / H;
  // keep the jellyfish framed on portrait screens
  camera.fov = W < H ? 58 : 40;
  camera.updateProjectionMatrix();
  bgMat.uniforms.uAspect.value = W / H;
  measure();
}
window.addEventListener("resize", resize);
window.addEventListener("load", measure);
if (document.fonts) document.fonts.ready.then(measure);

const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

/* chapter nav + section state */
const navLinks = $$(".chapters a");
let activeCh = "";
const progressBar = $("#progressBar");
function updateChrome(y) {
  const mid = y + vh() * 0.5;
  let ch = "intro";
  sectionTops.forEach((s) => { if (s.top <= mid) ch = s.ch; });
  if (ch !== activeCh) {
    activeCh = ch;
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.ch === ch));
  }
  progressBar.style.transform = `scaleX(${clamp(y / Math.max(1, maxScroll()))})`;
}

/* =========================================================
   Render loop
   ========================================================= */
const camPos = new THREE.Vector3(0, 0.3, 6.6), camLook = new THREE.Vector3(0, -0.95, 0);
const tgtPos = new THREE.Vector3(), tgtLook = new THREE.Vector3();
const cBody = new THREE.Color(), cRim = new THREE.Color();
let lightMix = 0, dimMix = 1, firstFrame = true;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime * (reduceMotion ? 0.35 : 1);
  const y = window.scrollY;

  // which pair of keyframes are we between?
  let i = 0;
  while (i < anchors.length - 2 && y >= anchors[i + 1]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const raw = clamp((y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]));
  const t = smooth(raw);

  // camera path
  tgtPos.set(lerp(a.cam[0], b.cam[0], t), lerp(a.cam[1], b.cam[1], t), lerp(a.cam[2], b.cam[2], t));
  tgtLook.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
  if (isMobile()) { tgtLook.x *= 0.25; tgtPos.x *= 0.6; tgtPos.z += 1.2; }
  tgtPos.x += pointer.x * 0.25; tgtPos.y -= pointer.y * 0.18;
  const follow = firstFrame ? 1 : 1 - Math.pow(0.0025, dt);
  camPos.lerp(tgtPos, follow); camLook.lerp(tgtLook, follow);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // ocean colours: the next chapter rises like a wave
  const p = smooth(clamp((raw - 0.18) / 0.64));
  const u = bgMat.uniforms;
  u.uTopA.value.copy(a.c.top); u.uBotA.value.copy(a.c.bot); u.uGlowA.value.copy(a.c.glow);
  u.uTopB.value.copy(b.c.top); u.uBotB.value.copy(b.c.bot); u.uGlowB.value.copy(b.c.glow);
  u.uP.value = p; u.uTime.value = time;

  // jellyfish colour + light/dark UI
  cBody.copy(a.c.body).lerp(b.c.body, p); cRim.copy(a.c.rim).lerp(b.c.rim, p);
  shared.uBody.value.copy(cBody); shared.uRim.value.copy(cRim);
  const lightTarget = lerp(a.light ? 1 : 0, b.light ? 1 : 0, p);
  lightMix = lerp(lightMix, lightTarget, firstFrame ? 1 : 0.12);
  shared.uLight.value = lightMix;
  document.body.classList.toggle("is-light", lightTarget > 0.5);
  dimMix = lerp(a.dim, b.dim, p);
  shared.uOpacity.value = dimMix;

  // swimming: quick contraction, slow relaxation
  const ph = (time * 0.34) % 1;
  const pulse = ph < 0.28 ? smooth(ph / 0.28) : 1 - smooth((ph - 0.28) / 0.72);
  shared.uPulse.value = pulse; shared.uTime.value = time;
  jelly.position.y = Math.sin(time * 0.45) * 0.14 + pulse * 0.06;
  jelly.rotation.y = time * 0.06;
  jelly.rotation.z = Math.sin(time * 0.3) * 0.06;
  jelly.updateMatrixWorld();
  halo.position.set(0, jelly.position.y - 0.1, 0);
  halo.quaternion.copy(camera.quaternion);

  // project hotspots (only around the projects chapter)
  const showHot = (a.id.startsWith("projects") || b.id.startsWith("projects")) &&
    !(a.id === "statement" && raw < 0.75) && !(b.id === "interests" && raw > 0.35);
  document.body.classList.toggle("show-hotspots", showHot);
  if (showHot) {
    HOT.forEach((h, j) => {
      tentaclePoint(h.k, h.t, time, pulse, tmpV).applyMatrix4(jelly.matrixWorld).project(camera);
      const vis = tmpV.z < 1;
      const el = hotEls[j];
      if (el.dataset.hold) return;
      // keep every number inside a safe area (clear of the top bar and the chapter box)
      const sx = clamp((tmpV.x * 0.5 + 0.5) * W, 230, W - 70);
      const sy = clamp((-tmpV.y * 0.5 + 0.5) * H, 110, H - 90);
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      el.style.visibility = vis ? "" : "hidden";
    });
  }

  updateChrome(y);
  if (renderer) renderer.render(scene, camera);
  firstFrame = false;
}

let running = true;
function loop() { if (!running) return; frame(); requestAnimationFrame(loop); }
document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) { clock.getDelta(); requestAnimationFrame(loop); }
  if (sound.ctx) { if (document.hidden) sound.ctx.suspend(); else if (sound.on) sound.ctx.resume(); }
});

resize();
requestAnimationFrame(loop);
