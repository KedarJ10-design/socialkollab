import { initSolisShadows } from "./solis-shadows.js?v=8";

const $ = (id) => document.getElementById(id), q = (s, p = document) => p.querySelector(s), qa = (s, p = document) => [...p.querySelectorAll(s)];
const rt = document.documentElement, mq = matchMedia("(prefers-reduced-motion: reduce)"), red = () => mq.matches;
const on = (el, ev, fn, o) => el.addEventListener(ev, fn, o), sa = (el, k, v) => el.setAttribute(k, v), sv = (k, v) => rt.style.setProperty(k, v), br = (el) => el.getBoundingClientRect(), tg = (el, c, f) => el?.classList.toggle(c, f);
if (!red() && typeof IntersectionObserver !== "undefined") rt.classList.add("js-ready");

function initThemeToggle() {
  const b = $("theme-toggle"), lb = $("theme-toggle-label"), mt = q('meta[name="theme-color"]');
  const isA = () => rt.getAttribute("data-theme") === "amber";
  const sy = (a) => {
    if (b) { sa(b, "aria-pressed", String(a)); sa(b, "aria-label", a ? "Switch to Daylight mode" : "Switch to Amber Dusk mode"); }
    if (lb) lb.textContent = a ? "Amber" : "Daylight";
    if (mt) sa(mt, "content", a ? "#111410" : "#F3ECE1");
  };
  const ap = (a) => { a ? sa(rt, "data-theme", "amber") : rt.removeAttribute("data-theme"); sy(a); };
  sy(isA());
  if (!b) return;
  on(b, "click", () => {
    const r = br(b), nx = !isA();
    sv("--vt-x", `${Math.round(r.left + r.width / 2)}px`); sv("--vt-y", `${Math.round(r.top + r.height / 2)}px`);
    const run = () => { ap(nx); try { localStorage.setItem("tsk-theme", nx ? "amber" : "daylight"); } catch {} };
    if (!red() && typeof document.startViewTransition === "function") {
      tg(rt, "is-theme-transition", true);
      document.startViewTransition(run).finished.catch(() => {}).finally(() => tg(rt, "is-theme-transition", false));
    } else run();
  });
  on(window, "pageshow", (e) => { if (e.persisted) try { ap(localStorage.getItem("tsk-theme") === "amber"); } catch {} });
}

function initScrollSunAndReveals() {
  const ns = qa("[data-reveal]"), ws = qa(".scrub-word"), cs = qa("[data-index-title]");
  const b1 = q(".manifesto-beat-1"), b2 = q(".manifesto-beat-2"), w1 = b1 ? qa(".scrub-word", b1) : [], w2 = b2 ? qa(".scrub-word", b2) : [];
  const pl = $("chapter-pill"), it = $("introduction-section"), hs = $("selected-work");
  const ht = q(".hscroll-track"), nr = q(".night-realm"), hd = q(".site-header"), ft = q(".site-footer");
  const cl = (v) => Math.max(0, Math.min(1, v));
  const hit = (els, a, b) => els.some((el) => { if (!el) return false; const r = br(el); return r.top <= a && r.bottom > b; });

  const sy = () => {
    const vh = Math.max(1, innerHeight), r = red(), mb = r || innerWidth < 960;
    const p = r ? 0 : cl(scrollY / Math.max(1, rt.scrollHeight - vh)), vp = r ? 0 : scrollY / vh;
    const ang = r ? -0.55 : (-0.65 + vp * 0.42 + p * 0.58), lo = Math.abs(Math.sin(ang)), sd = r ? 1 : (1 + Math.sin(vp * 0.72) * 0.28);
    sv("--sun-progress", r ? "0" : (p * 2 - 1).toFixed(3)); sv("--hero-p", r ? "0" : cl(vp).toFixed(3));
    sv("--sun-dx", `${(Math.sin(ang) * 26 * sd).toFixed(1)}px`); sv("--sun-dy", `${(13 + Math.cos(ang) * 13 * sd).toFixed(1)}px`);
    sv("--sun-dx-sm", `${(Math.sin(ang) * 9 * sd).toFixed(1)}px`); sv("--sun-dy-sm", `${(5 + Math.cos(ang) * 6 * sd).toFixed(1)}px`);
    sv("--sun-blur", `${(22 + lo * 18 + vp * 3.5).toFixed(1)}px`); sv("--veil-blur", `${(6.5 + lo * 4).toFixed(1)}px`);
    tg(rt, "is-scrolled", scrollY > 16);
    const hc = hd ? hd.offsetHeight * 0.65 : 52;
    tg(rt, "is-night-scroll", hit([nr, ft], hc, hc)); tg(rt, "is-night-canvas", hit([nr, ft], vh * 0.55, vh * 0.45));

    if (it && ws.length) {
      if (mb) { ws.forEach((w) => tg(w, "is-lit", true)); tg(b1, "is-active", true); tg(b1, "is-exited", false); tg(b2, "is-active", true); }
      else {
        const rc = br(it), mp = cl((vh * 0.45 - rc.top) / Math.max(1, rc.height - vh * 0.55));
        if (b1 && b2) {
          const t2 = mp >= 0.48, n1 = Math.round(cl(mp / 0.44) * w1.length), n2 = t2 ? Math.round(cl((mp - 0.5) / 0.42) * w2.length) : -1;
          tg(b1, "is-active", !t2); tg(b1, "is-exited", t2); tg(b2, "is-active", t2);
          w1.forEach((w, i) => tg(w, "is-lit", t2 || i <= n1)); w2.forEach((w, i) => tg(w, "is-lit", i <= n2));
        } else { const n = Math.round(mp * ws.length); ws.forEach((w, i) => tg(w, "is-lit", i <= n)); }
      }
    }
    if (hs && ht) { const rc = br(hs); sv("--hscroll-x", mb ? "0px" : `${(-cl(-rc.top / Math.max(1, rc.height - vh)) * Math.max(0, ht.scrollWidth - innerWidth + 64)).toFixed(1)}px`); }
    if (pl && cs.length) {
      let cur = cs[0].dataset.indexTitle || "Sunlit Studio";
      for (const s of cs) if (br(s).top <= vh * 0.42) cur = s.dataset.indexTitle || cur;
      if (pl.textContent !== cur) pl.textContent = cur;
    }
    if (scrollY + vh >= rt.scrollHeight - 24) ns.forEach((n) => { if (br(n).top < vh) tg(n, "is-revealed", true); });
  };
  sy(); on(window, "scroll", sy, { passive: true }); on(window, "resize", sy, { passive: true }); mq.addEventListener?.("change", sy);
  if (!ns.length) return;
  if (red() || typeof IntersectionObserver === "undefined") return ns.forEach((n) => n.classList.add("is-revealed"));
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-revealed"); io.unobserve(en.target); } }), { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  ns.forEach((n) => io.observe(n));
}

function initMobileDrawer() {
  const b = $("menu-toggle"), dr = $("mobile-drawer");
  if (!b || !dr) return;
  const sel = "a[href],button:not([disabled])", setO = (o) => { sa(b, "aria-expanded", String(o)); dr.hidden = !o; (o ? q(sel, dr) : b)?.focus(); };
  on(b, "click", () => setO(b.getAttribute("aria-expanded") !== "true"));
  on(dr, "click", (e) => { if (e.target.closest('a[href^="#"]')) setO(false); });
  on(document, "keydown", (e) => {
    if (dr.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); return setO(false); }
    if (e.key !== "Tab") return;
    const it = qa(sel, dr);
    if (!it.length) return;
    const a = it[0], z = it[it.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  on(window, "resize", () => { if (!dr.hidden && getComputedStyle(b).display === "none") { sa(b, "aria-expanded", "false"); dr.hidden = true; } });
}

function initContactForm() {
  const fm = $("project-brief-form"), st = $("form-status"), b = $("submit-brief-btn");
  if (!fm || !st || !b) return;
  const sh = (m, ok) => { st.textContent = m; st.className = `form-status ${ok ? "is-success" : "is-error"}`; st.hidden = false; };
  on(fm, "submit", async (e) => {
    e.preventDefault(); st.hidden = true;
    const d = new FormData(fm);
    if (d.get("bot-field")) return;
    const nm = String(d.get("name") || "").trim(), ct = String(d.get("contact") || "").trim(), br = String(d.get("brief") || "").trim();
    if (!nm || !ct || !br) return sh("Please complete your name, contact detail, and project summary.", false);
    b.disabled = true; sa(b, "data-loading", "true"); b.textContent = "Sending...";
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(d).toString() });
      if (!res.ok) throw 0;
      fm.reset(); sh("Brief received. Karan Chaturbhuj will reply within 24 hours.", true);
    } catch {
      const s = encodeURIComponent(`Project Brief - ${nm}`), bd = encodeURIComponent(`Name: ${nm}\nContact: ${ct}\nBusiness: ${d.get("business") || "N/A"}\n\n${br}`);
      location.href = `mailto:hello@thesocialkollab.com?subject=${s}&body=${bd}`;
      sh("Email draft opened to hello@thesocialkollab.com. You can also DM @thesocialkollab.", true);
    } finally { b.disabled = false; b.removeAttribute("data-loading"); b.textContent = "Send project brief"; }
  });
}

function initFaqMotion() {
  if (typeof CSS !== "undefined" && CSS.supports("interpolate-size", "allow-keywords") && CSS.supports("selector(::details-content)")) return;
  qa(".faq-item").forEach((d) => {
    const s = q(".faq-question", d), a = q(".faq-answer", d);
    if (!s || !a || !d.animate) return;
    let an;
    on(s, "click", (e) => {
      if (red()) return;
      e.preventDefault();
      const cl = d.open && !d.classList.contains("is-closing"), h0 = `${d.offsetHeight}px`, b = d.offsetHeight - d.clientHeight;
      an?.cancel(); d.style.overflow = "hidden";
      if (!cl) { d.classList.remove("is-closing"); d.open = true; } else d.classList.add("is-closing");
      an = d.animate({ height: [h0, `${s.offsetHeight + (cl ? 0 : a.offsetHeight) + b}px`] }, { duration: 340, easing: "cubic-bezier(.22,1,.36,1)" });
      an.onfinish = () => { d.open = !cl; d.classList.remove("is-closing"); d.style.overflow = ""; an = null; };
    });
  });
}

initThemeToggle(); initScrollSunAndReveals(); initMobileDrawer(); initContactForm(); initFaqMotion(); initSolisShadows();
