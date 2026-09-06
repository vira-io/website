(function bokehBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const palette = ["#2ee88c", "#22d3ee", "#5b7cfa", "#a25bfa", "#e35bd6"];
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
  }

  function makeParticles() {
    const count = Math.min(70, Math.floor((width * height) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 90 + 30,
      color: palette[Math.floor(Math.random() * palette.length)],
      speed: Math.random() * 0.15 + 0.03,
      drift: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.05 + 0.02,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gradient.addColorStop(0, p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0"));
      gradient.addColorStop(1, p.color + "00");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReducedMotion) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -p.r) {
          p.y = height + p.r;
          p.x = Math.random() * width;
        }
      }
    }
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      makeParticles();
      if (prefersReducedMotion) draw();
    }, 200);
  });
})();

(function navToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.style.display === "flex";
    links.style.display = isOpen ? "none" : "flex";
    if (!isOpen) {
      links.style.cssText =
        "display:flex; position:absolute; top:68px; left:0; right:0; flex-direction:column; background:#0b0d17; padding:20px 28px; border-bottom:1px solid rgba(255,255,255,0.08); gap:18px;";
    }
  });
})();

(function copyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = "Skopiowano";
        setTimeout(() => (btn.textContent = original), 1600);
      });
    });
  });
})();

(function activeNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .docs-nav a").forEach((a) => {
    const href = a.getAttribute("href").split("/").pop();
    if (href === path) a.classList.add("active");
  });
})();
