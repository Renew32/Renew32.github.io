/* =========================================================
   Antoine. interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* =======================================================
     Bubbles (canvas): rise, wobble, slow down near the cursor
     and pop with a click, a tap or a quick swipe.
     ======================================================= */
  const canvas = $("#bubbles");
  const ctx = canvas.getContext("2d");
  const popCountEl = $("#popCount");
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let bubbles = [], particles = [];
  let pops = 0;
  const mouse = { x: -999, y: -999 };

  function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeBubble(x, y, r) {
    r = r || 4 + Math.random() * Math.random() * 26;
    return {
      x: x ?? Math.random() * W,
      y: y ?? H + r + Math.random() * H,
      r,
      vy: 0.25 + Math.random() * 0.6 + (30 - r) * 0.012,
      phase: Math.random() * Math.PI * 2,
      amp: 0.3 + Math.random() * 0.8,
      a: 0.35 + Math.random() * 0.45,
      vx: 0,
    };
  }

  function seedBubbles() {
    const target = Math.round(clamp((W * H) / 38000, 14, 46));
    bubbles = Array.from({ length: target }, () => {
      const b = makeBubble();
      b.y = Math.random() * H; // start spread over the screen
      return b;
    });
  }

  function drawBubble(b, deep) {
    const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
    if (deep) {
      g.addColorStop(0, `rgba(220,255,247,${0.55 * b.a})`);
      g.addColorStop(0.6, `rgba(141,251,224,${0.12 * b.a})`);
      g.addColorStop(1, `rgba(141,251,224,${0.45 * b.a})`);
    } else {
      g.addColorStop(0, `rgba(255,255,255,${0.85 * b.a})`);
      g.addColorStop(0.6, `rgba(159,227,208,${0.14 * b.a})`);
      g.addColorStop(1, `rgba(15,179,162,${0.38 * b.a})`);
    }
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = deep ? `rgba(141,251,224,${0.5 * b.a})` : `rgba(15,179,162,${0.35 * b.a})`;
    ctx.stroke();
    // highlight
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.38, b.y - b.r * 0.38, b.r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.75 * b.a})`;
    ctx.fill();
  }

  function popBubble(i) {
    const b = bubbles[i];
    const n = 10 + Math.round(b.r / 2);
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2;
      const sp = 1.5 + Math.random() * 2.5;
      particles.push({ x: b.x + Math.cos(ang) * b.r, y: b.y + Math.sin(ang) * b.r, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1 });
    }
    bubbles[i] = makeBubble();
    pops++;
    popCountEl.textContent = pops;
    if (pops === 10) toast("🫧 10 bubbles popped, you're a natural!");
    if (pops === 50) toast("🐠 50 pops! Antoine would hire you.");
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(48, now - last) / 16.67;
    last = now;
    ctx.clearRect(0, 0, W, H);
    const deep = document.body.classList.contains("is-deep");

    for (const b of bubbles) {
      b.phase += 0.02 * dt;
      // near the cursor a bubble slows down and leans in, so it is easy to catch
      const dx = mouse.x - b.x, dy = mouse.y - b.y;
      const d2 = dx * dx + dy * dy, R = 110;
      let slow = 1;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 1;
        slow = 0.25 + 0.75 * (d / R);
        b.vx += (dx / d) * 0.04;
      }
      b.vx *= 0.94;
      b.x += (Math.sin(b.phase) * b.amp * slow + b.vx) * dt;
      b.y -= b.vy * slow * dt;
      if (b.y < -b.r * 2) Object.assign(b, makeBubble());
      drawBubble(b, deep);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= 0.035 * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6 * p.life + 0.4, 0, Math.PI * 2);
      ctx.fillStyle = deep ? `rgba(141,251,224,${p.life})` : `rgba(15,179,162,${p.life})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(tick);
  }

  let rafId;
  resizeCanvas();
  seedBubbles();
  if (!reduceMotion) rafId = requestAnimationFrame(tick);
  else { bubbles.forEach((b) => drawBubble(b, false)); }

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    if (document.hidden) cancelAnimationFrame(rafId);
    else { last = performance.now(); rafId = requestAnimationFrame(tick); }
  });

  let lastTrail = 0;
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const now = performance.now();
    if (finePointer && !reduceMotion && now - lastTrail > 140 && bubbles.length < 90) {
      lastTrail = now;
      const b = makeBubble(e.clientX + (Math.random() - 0.5) * 10, e.clientY, 2 + Math.random() * 5);
      b.vy = 0.8 + Math.random();
      bubbles.push(b);
      // keep the population bounded: trail bubbles retire once they leave
      setTimeout(() => { const i = bubbles.indexOf(b); if (i > -1 && bubbles.length > 50) bubbles.splice(i, 1); }, 6000);
    }
  }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });

  // a bubble counts as hit inside a generous halo around it
  const hitRadius = (b) => Math.max(b.r + 22, 30);
  function popAt(x, y) {
    let hit = false;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const dx = x - b.x, dy = y - b.y, R = hitRadius(b);
      if (dx * dx + dy * dy <= R * R) { popBubble(i); hit = true; }
    }
    return hit;
  }
  // a quick swipe of the mouse through a bubble pops it too
  let lastMove = { x: 0, y: 0, t: 0 };
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    const speed = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / Math.max(1, now - lastMove.t);
    lastMove = { x: e.clientX, y: e.clientY, t: now };
    if (speed < 1.6) return;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      if (b.r < 6) continue; // ignore the tiny trail bubbles
      const dx = e.clientX - b.x, dy = e.clientY - b.y;
      if (dx * dx + dy * dy <= (b.r + 8) * (b.r + 8)) popBubble(i);
    }
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    const hit = popAt(e.clientX, e.clientY);
    if (!hit && !e.target.closest("a, button, input, textarea, label, .flip-card, .j-card")) {
      for (let k = 0; k < 4; k++) {
        const b = makeBubble(e.clientX + (Math.random() - 0.5) * 30, e.clientY + (Math.random() - 0.5) * 20, 3 + Math.random() * 9);
        b.vy = 1 + Math.random() * 1.2;
        bubbles.push(b);
        setTimeout(() => { const i = bubbles.indexOf(b); if (i > -1 && bubbles.length > 50) bubbles.splice(i, 1); }, 7000);
      }
    }
  });

  /* ---------- Custom cursor bubble ---------- */
  const cursor = $(".cursor-bubble");
  if (finePointer && !reduceMotion) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("active");
    }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("big", !!e.target.closest("a, button, .flip-card, .chip, .skill-card"));
    });
    const follow = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    };
    follow();
  }

  /* =======================================================
     Reveal on scroll
     ======================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal, .t-item").forEach((el) => io.observe(el));

  /* ---------- Typed roles ---------- */
  const typedEl = $("#typed");
  const roles = ["Software Engineering Student", "Full-Stack Developer", "AI & Vibe Coder", "Co-President @ UOSSA", "Problem Solver"];
  if (!reduceMotion) {
    let r = 0, c = roles[0].length, deleting = true;
    const loop = () => {
      if (deleting) {
        c--;
        typedEl.textContent = roles[r].slice(0, c);
        if (c <= 0) { deleting = false; r = (r + 1) % roles.length; }
        return setTimeout(loop, 38);
      }
      c++;
      typedEl.textContent = roles[r].slice(0, c);
      if (c >= roles[r].length) { deleting = true; return setTimeout(loop, 1900); }
      setTimeout(loop, 70);
    };
    setTimeout(loop, 2200);
  }

  /* ---------- Flip card (tap support) ---------- */
  const flip = $("#flipCard");
  flip.addEventListener("click", (e) => { if (!e.target.closest("a")) flip.classList.toggle("flipped"); });
  // interest cards: one flipped at a time, click or tap to flip
  $$(".j-card").forEach((c) => {
    c.addEventListener("click", () => {
      const was = c.classList.contains("flipped");
      $$(".j-card.flipped").forEach((o) => { o.classList.remove("flipped"); o.setAttribute("aria-pressed", "false"); });
      if (!was) { c.classList.add("flipped"); c.setAttribute("aria-pressed", "true"); }
    });
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
  });
  flip.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip.classList.toggle("flipped"); } });

  /* =======================================================
     Navigation
     ======================================================= */
  const nav = $("#nav");
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
    navLinks.classList.remove("open"); burger.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
  }));

  const linkMap = new Map($$(".nav-link").map((a) => [a.getAttribute("href").slice(1), a]));
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        linkMap.forEach((a) => a.classList.remove("active"));
        linkMap.get(en.target.id)?.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["home", "skills", "experience", "projects", "connect"].forEach((id) => { const s = document.getElementById(id); if (s) sectionIO.observe(s); });

  /* =======================================================
     Skills: icon marquee
     ======================================================= */
  const ICON = (n) => `assets/icons/${n}.svg`;
  const tools = [
    { n: "Python", i: "python", g: "lang" },
    { n: "Java", i: "java", g: "lang" },
    { n: "C++", i: "cplusplus", g: "lang" },
    { n: "C", i: "c", g: "lang" },
    { n: "JavaScript", i: "javascript", g: "lang" },
    { n: "SQL", b: "bi-database-fill", g: "lang" },
    { n: "HTML5", i: "html5", g: "lang" },
    { n: "CSS3", i: "css3", g: "lang" },
    { n: "React", i: "react", g: "tool" },
    { n: "Node.js", i: "nodejs", g: "tool" },
    { n: "Django", i: "django", g: "tool" },
    { n: "Android", i: "android", g: "tool" },
    { n: "Playwright", i: "playwright", g: "tool" },
    { n: "xUnit", b: "bi-check2-circle", g: "tool" },
    { n: "Power BI", b: "bi-bar-chart-fill", g: "tool" },
    { n: "SQL Server", i: "microsoftsqlserver", g: "tool" },
    { n: "MySQL", i: "mysql", g: "tool" },
    { n: "PostgreSQL", i: "postgresql", g: "tool" },
    { n: "AWS", i: "amazonwebservices", g: "tool" },
    { n: "Docker", i: "docker", g: "tool" },
    { n: "Git", i: "git", g: "tool" },
    { n: "Azure DevOps", i: "azuredevops", g: "tool" },
    { n: "CI/CD", i: "githubactions", g: "tool" },
    { n: "Firebase", i: "firebase", g: "tool" },
    { n: "Microsoft Office", b: "bi-microsoft", g: "tool" },
    { n: "Leadership", b: "bi-flag-fill", g: "soft" },
    { n: "Communication", b: "bi-chat-quote-fill", g: "soft" },
    { n: "Team Collaboration", b: "bi-people-fill", g: "soft" },
    { n: "Problem-Solving", b: "bi-puzzle-fill", g: "soft" },
    { n: "Strategic Planning", b: "bi-compass-fill", g: "soft" },
    { n: "Time Management", b: "bi-hourglass-split", g: "soft" },
    { n: "Customer Service", b: "bi-emoji-smile-fill", g: "soft" },
    { n: "French (native)", b: "bi-translate", g: "soft" },
    { n: "English (fluent)", b: "bi-globe2", g: "soft" },
  ];

  const marquee = $("#marqueeTrack");
  const mIcons = tools.filter((t) => t.i).map((t) => `<img src="${ICON(t.i)}" alt="" title="${t.n}" loading="lazy" />`).join("");
  marquee.innerHTML = mIcons + mIcons; // duplicated for a seamless loop

  /* ---------- 3D tilt + spotlight ---------- */
  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg) translateZ(0)`;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
        card.style.transform = "";
        setTimeout(() => (card.style.transition = ""), 600);
      });
    });

    /* Magnetic buttons */
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  /* Ripple on buttons */
  $$(".btn").forEach((btn) => btn.addEventListener("click", (e) => {
    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
  }));

  /* =======================================================
     Experience tabs
     ======================================================= */
  const tabs = $$(".tab");
  const indicator = $(".tab-indicator");
  function moveIndicator(tab) {
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
  }
  function showGroup(group) {
    $$(".t-item").forEach((it) => {
      const on = it.dataset.group === group;
      it.classList.toggle("gone", !on);
      if (on) { it.classList.remove("in"); void it.offsetWidth; requestAnimationFrame(() => it.classList.add("in")); }
    });
    onScroll();
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => { t.classList.toggle("active", t === tab); t.setAttribute("aria-selected", String(t === tab)); });
    moveIndicator(tab);
    showGroup(tab.dataset.tab);
  }));
  // initial state: professional only
  $$('.t-item[data-group="lead"]').forEach((it) => it.classList.add("gone"));

  /* ---------- Count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, to = +el.dataset.to, t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = clamp((t - t0) / dur);
        el.textContent = Math.round(ease(p) * to);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".count").forEach((el) => countIO.observe(el));

  /* =======================================================
     Scroll-driven scene (progress, depth, glow title,
     laptop lid, horizontal gallery, timeline water)
     ======================================================= */
  const progressEl = $("#scrollProgress");
  const depthFill = $("#depthFill");
  const depthValue = $("#depthValue");
  const toTop = $("#toTop");
  const projects = $("#projects");
  const glowTitle = $("#glowTitle");
  const featureCopy = $("#featureCopy");
  const laptop = $("#laptop");
  const hgallery = $("#hgallery");
  const hTrack = $("#hTrack");
  const hProgress = $("#hProgress");
  const timeline = $("#timeline");
  const timelineWater = $("#timelineWater");
  const MAX_DEPTH = 200;
  let hMax = 0;

  function sizeGallery() {
    hMax = Math.max(0, hTrack.scrollWidth - window.innerWidth);
    hgallery.style.height = `${hMax + window.innerHeight * 1.15}px`;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docMax = document.documentElement.scrollHeight - vh;

    progressEl.style.width = `${clamp(y / docMax) * 100}%`;
    nav.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 700);

    // depth: dive until the end of Projects, then resurface
    const projBottom = projects.offsetTop + projects.offsetHeight - vh;
    let depth;
    if (y <= projBottom) depth = clamp(y / Math.max(1, projBottom)) * MAX_DEPTH;
    else depth = (1 - clamp((y - projBottom) / Math.max(1, docMax - projBottom))) * MAX_DEPTH;
    depthFill.style.height = `${(depth / MAX_DEPTH) * 100}%`;
    depthValue.textContent = `${Math.round(depth)} m`;

    const pr = projects.getBoundingClientRect();
    document.body.classList.toggle("is-deep", pr.top < 70 && pr.bottom > 70);

    // glowing title dims as the featured content rises over it (video-like)
    const fcTop = featureCopy.getBoundingClientRect().top;
    const g = clamp((fcTop - vh * 0.3) / (vh * 0.42));
    glowTitle.style.setProperty("--g", ease(g).toFixed(3));
    // ...then fades away completely once the laptop has passed it
    const lb = laptop.getBoundingClientRect().bottom;
    glowTitle.style.setProperty("--out", clamp((lb - vh * 0.15) / (vh * 0.45)).toFixed(3));

    // laptop lid opens as it enters the viewport
    const lt = laptop.getBoundingClientRect().top;
    const open = clamp((vh * 1.0 - lt) / (vh * 0.6));
    laptop.style.setProperty("--open", ease(open).toFixed(3));

    // horizontal gallery
    const hr = hgallery.getBoundingClientRect();
    const hp = clamp(-hr.top / Math.max(1, hgallery.offsetHeight - vh));
    hTrack.style.transform = `translate3d(${-hp * hMax}px,0,0)`;
    hProgress.style.width = `${hp * 100}%`;

    // timeline water level
    const tr = timeline.getBoundingClientRect();
    timelineWater.style.height = `${clamp((vh * 0.65 - tr.top) / tr.height) * 100}%`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    resizeCanvas();
    sizeGallery();
    moveIndicator($(".tab.active"));
    onScroll();
  });
  window.addEventListener("load", () => { sizeGallery(); moveIndicator($(".tab.active")); onScroll(); });
  sizeGallery();
  moveIndicator($(".tab.active"));
  update();
  if (reduceMotion) laptop.style.setProperty("--open", "1");

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* =======================================================
     Let's Connect
     ======================================================= */
  const EMAIL = "antoinemissoupg@gmail.com";
  $("#copyEmail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast("📋 Email copied, talk soon!");
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  });

  $$("[data-soon]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    toast("🚧 Live link coming soon!");
  }));

  $("#messageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const subject = encodeURIComponent(f.subject.value.trim());
    const body = encodeURIComponent(`${f.message.value.trim()}\n\n${f.name.value.trim()}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    toast("🍾 Your bottle is on its way!");
  });
})();
