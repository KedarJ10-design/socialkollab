import { PROJECTS } from "../data/studio-data.js";
import { initPlateDepth } from "./plate-depth.js";

const $ = (id) => document.getElementById(id);
const pulse = (el, cls, off) => { el.classList.remove(cls); if (!off) { void el.offsetWidth; el.classList.add(cls); } };
const byId = new Map(PROJECTS.map((p) => [p.id, p]));

function swapFrame(img, prev, media, p, off, valid) {
  const apply = () => {
    if (valid && !valid()) return;
    if (prev) { prev.src = img.getAttribute("src") || img.src; pulse(prev, "is-leaving", off); }
    img.src = p.specimen; img.alt = `${p.name} live website screenshot`;
    if (media) pulse(media, "is-revealing", off);
  };
  const pre = new Image(); pre.src = p.specimen;
  pre.complete || off ? apply() : (pre.onload = pre.onerror = apply);
}

function initHeroStage() {
  const btns = [...document.querySelectorAll("[data-stage-btn]")];
  const img = $("stage-img"), title = $("stage-title"), link = $("stage-live-link");
  if (!btns.length || !img || !title || !link) return;

  const wrap = document.querySelector(".stage-tabs"), media = $("stage-media"), prev = $("stage-img-prev");
  const sector = $("stage-sector"), loc = $("stage-location");
  const curBtn = () => btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0];
  let activeId = curBtn().dataset.stageBtn, swapGen = 0;

  const syncTab = (b) => {
    if (!wrap || !b) return;
    wrap.style.setProperty("--tab-x", `${b.offsetLeft}px`);
    wrap.style.setProperty("--tab-w", `${b.offsetWidth}px`);
    const wrapped = btns.some((x) => Math.abs(x.offsetTop - btns[0].offsetTop) > 4);
    wrap.style.setProperty("--tab-o", wrapped ? "0" : "1");
    wrap.classList.toggle("has-indicator", !wrapped);
  };

  syncTab(curBtn());
  setTimeout(() => wrap?.classList.add("is-ready"), 32);
  document.fonts?.ready.then(() => syncTab(curBtn()));
  addEventListener("resize", () => syncTab(curBtn()), { passive: true });

  btns.forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.stageBtn, p = id && id !== activeId ? byId.get(id) : null;
    if (!p) return;
    activeId = id;
    const gen = ++swapGen, off = matchMedia("(prefers-reduced-motion: reduce)").matches;
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    syncTab(b);
    swapFrame(img, prev, media, p, off, () => gen === swapGen);
    title.textContent = p.name;
    if (sector) sector.textContent = p.sectorLabel;
    if (loc) loc.textContent = p.location;
    link.href = p.url; link.textContent = `Visit ${p.domain} ↗`;
  }));
}

function initWorkSpotlightAndFilters() {
  const sBtns = [...document.querySelectorAll("[data-spotlight-btn]")];
  const img = $("spotlight-img"), prev = $("spotlight-img-prev"), media = $("spotlight-media");
  const title = $("spotlight-title"), summary = $("spotlight-summary"), idx = $("spotlight-index");
  const sector = $("spotlight-sector"), loc = $("spotlight-location"), link = $("spotlight-link");
  let activeSpot = sBtns[0]?.dataset.spotlightBtn || "", spotGen = 0;

  const selectSpot = (id) => {
    const p = id && id !== activeSpot ? byId.get(id) : null;
    if (!p || !img || !title) return;
    activeSpot = id;
    const gen = ++spotGen, off = matchMedia("(prefers-reduced-motion: reduce)").matches;
    sBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.spotlightBtn === id)));
    swapFrame(img, prev, media, p, off, () => gen === spotGen);
    if (idx) idx.textContent = `${p.index} · LIVE PRODUCTION`;
    if (sector) sector.textContent = p.sectorLabel;
    if (loc) loc.textContent = p.location;
    title.textContent = p.subname ? `${p.name} — ${p.subname}` : p.name;
    if (summary) summary.textContent = p.summary;
    if (link) { link.href = p.url; link.textContent = `Visit ${p.domain} ↗`; }
  };
  sBtns.forEach((b) => b.addEventListener("click", () => selectSpot(b.dataset.spotlightBtn)));

  const btns = [...document.querySelectorAll("[data-filter-btn]")];
  const cards = [...document.querySelectorAll("[data-project-card]")];
  const count = $("work-visible-count");
  if (!btns.length || !cards.length) return;
  btns.forEach((btn) => btn.addEventListener("click", () => {
    const cat = btn.dataset.filterBtn || "all";
    let n = 0;
    cards.forEach((c) => { const show = cat === "all" || c.dataset.category === cat; c.hidden = !show; if (show) n += 1; });
    sBtns.forEach((b) => { b.hidden = !(cat === "all" || b.dataset.category === cat); });
    const firstVis = sBtns.find((b) => !b.hidden);
    if (firstVis) selectSpot(firstVis.dataset.spotlightBtn);
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    if (count) count.textContent = String(n).padStart(2, "0");
  }));
}

initHeroStage();
initWorkSpotlightAndFilters();
initPlateDepth();
