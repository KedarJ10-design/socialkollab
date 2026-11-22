export function initPlateDepth() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
  const targets = [...document.querySelectorAll(".is-depth-target")];
  if (!targets.length) return;

  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const sv = (el, ps) => ps.forEach(([k, v]) => el.style.setProperty(k, v));
  const reset = (el) => {
    el.classList.remove("is-tilting");
    sv(el, [["--sun-x", "0px"], ["--sun-y", "0px"], ["--tilt-x", "0deg"], ["--tilt-y", "0deg"], ["--sx", "50%"], ["--sy", "50%"], ["--sheen-o", "0"]]);
    const st = el.closest(".solis-stage");
    if (st) { st.classList.remove("is-tilting"); sv(st, [["--sun-x", "0px"], ["--sun-y", "0px"]]); }
  };

  const map = new WeakMap();
  const bind = (el) => {
    if (map.has(el)) return;
    const st = el.closest(".solis-stage");
    const mv = (e) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = cl((e.clientX - r.left) / r.width, 0, 1), py = cl((e.clientY - r.top) / r.height, 0, 1);
      const sx = `${cl((px - 0.5) * 16, -8, 8).toFixed(2)}px`, sy = `${cl((py - 0.5) * 16, -8, 8).toFixed(2)}px`;
      el.classList.add("is-tilting");
      sv(el, [["--sun-x", sx], ["--sun-y", sy], ["--tilt-x", `${cl((0.5 - py) * 7, -3.5, 3.5).toFixed(2)}deg`], ["--tilt-y", `${cl((px - 0.5) * 7, -3.5, 3.5).toFixed(2)}deg`], ["--sx", `${(px * 100).toFixed(1)}%`], ["--sy", `${(py * 100).toFixed(1)}%`], ["--sheen-o", "1"]]);
      if (st) { st.classList.add("is-tilting"); sv(st, [["--sun-x", sx], ["--sun-y", sy]]); }
    };
    const lv = () => reset(el);
    const evs = [["pointermove", mv], ["pointerleave", lv], ["pointercancel", lv]];
    evs.forEach(([t, fn]) => el.addEventListener(t, fn, { passive: true }));
    map.set(el, evs);
  };

  const unbind = (el) => {
    const evs = map.get(el);
    if (!evs) return;
    evs.forEach(([t, fn]) => el.removeEventListener(t, fn));
    map.delete(el);
    reset(el);
  };

  const io = new IntersectionObserver((es) => es.forEach((en) => (en.isIntersecting ? bind(en.target) : unbind(en.target))), { rootMargin: "80px" });
  targets.forEach((t) => io.observe(t));
}
