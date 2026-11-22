export function initSolisShadows() {
  const cv = document.getElementById("solis-shadow-canvas"), c = cv?.getContext("2d");
  if (!cv || !c) return;
  const rt = document.documentElement, { sin, cos, abs, max, min, round, PI } = Math;
  const mq = matchMedia("(prefers-reduced-motion: reduce)"), oc = document.createElement("canvas"), ox = oc.getContext("2d");
  let w = 480, h = 270, ow = 264, oh = 148, raf = 0, ld = 0, lt = 0, rtm = 0;
  let vis = 1, pv = !document.hidden, tx = 0, ty = 0, mx = 0, my = 0, tSp = 0, sp = 0, tVp = 0, vp = 0, nm = 0;
  const brs = [[1.04, -.04, 2.52, .42, 8, .3, .44, 1], [.93, -.08, 2.2, .36, 7, 1.9, .36, 0], [-.04, .06, .46, .38, 7, 3.4, .4, 1], [-.06, .38, .2, .32, 6, 4.7, .32, 0], [1.05, .5, 2.86, .35, 6, 1.2, .34, 0], [-.04, .84, -.34, .35, 7, 5.3, .38, 1], [1.04, .92, 3.44, .33, 6, 2.6, .34, 1]];
  const dk = () => rt.getAttribute("data-theme") === "amber" || rt.classList.contains("is-night-canvas");
  const rd = () => { const vh = max(1, innerHeight); tSp = min(1, max(0, scrollY / max(1, rt.scrollHeight - vh))); tVp = scrollY / vh; };
  const wr = (v, lo, hi) => { const s = hi - lo; return ((((v - lo) % s) + s) % s) + lo; };
  const rz = () => {
    w = max(320, min(560, round(innerWidth * .36))); h = max(180, min(320, round(innerHeight * .36)));
    ow = max(160, round(w * .55)); oh = max(90, round(h * .55));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    if (oc.width !== ow || oc.height !== oh) { oc.width = ow; oc.height = oh; }
  };
  const layer = (g, gw, gh, dp, t, ang, str, sx, sy) => {
    const pad = gh * .92, sc = dp ? 1 : .86, ry = dp ? .34 : .2, st = [];
    g.lineCap = "round"; g.lineWidth = max(1.4, gw * (dp ? .0052 : .0072)); g.beginPath();
    for (const [bx, by, ba, bl, n, ph, spd, d] of brs) if (d === dp) {
      const x0 = bx * gw + sx * sc, y0 = wr(by * gh - vp * gh * ry + sy * sc, -pad, gh + pad);
      const len = bl * max(gw, gh) * (.88 + str * .14), a = ba + sin(t * spd + ph) * .04 + sin(t * spd * 1.9 + ph * 1.4) * .016 + ang * (dp ? .36 : .26);
      const ex = x0 + cos(a) * len, ey = y0 + sin(a) * len, cx = (x0 + ex) * .5 - sin(a) * len * .13, cy = (y0 + ey) * .5 + cos(a) * len * .13;
      g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, ex, ey); st.push([x0, y0, cx, cy, ex, ey, len, a, n]);
    }
    g.stroke(); g.beginPath();
    for (const [x0, y0, cx, cy, ex, ey, len, a, n] of st) for (let i = 1; i <= n; i++) {
      const u = i / (n + .55), iv = 1 - u, px = iv * iv * x0 + 2 * iv * u * cx + u * u * ex, py = iv * iv * y0 + 2 * iv * u * cy + u * u * ey;
      const la = a + (i % 2 ? 1 : -1) * (.66 + sin(t * .42 + i + vp * .9) * .08), ll = len * (.26 - u * .08) * (.9 + str * .12), lw = ll * .31;
      const lx = px + cos(la) * ll, ly = py + sin(la) * ll, nx = -sin(la) * lw, ny = cos(la) * lw, mp = (px + lx) * .5, q = (py + ly) * .5;
      g.moveTo(px, py); g.quadraticCurveTo(mp + nx, q + ny, lx, ly); g.quadraticCurveTo(mp - nx, q - ny, px, py);
    }
    g.fill();
  };
  const rg = (x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  const draw = (t) => {
    lt = t; mx += (tx - mx) * .08; my += (ty - my) * .08; sp += (tSp - sp) * .14; vp += (tVp - vp) * .14; nm += ((dk() ? 1 : 0) - nm) * .12;
    const ang = -0.58 + vp * 0.42 + sp * 0.62, str = 1 + abs(ang) * 0.38, sx = mx * 14 - ang * w * 0.16 - vp * 32, sy = my * 8 + vp * 18;
    c.clearRect(0, 0, w, h);
    rg(w * (0.35 + (ang + 0.58) * 0.36) + mx * 14, h * (0.08 + abs(ang) * 0.14) + my * 8, 0, w * .56, [[0, `rgba(248,194,104,${(.115 - nm * .07).toFixed(3)})`], [.5, `rgba(214,110,32,${(.036 - nm * .022).toFixed(3)})`], [1, "rgba(248,194,104,0)"]]);
    const rgb = `${round(26 - 16 * nm)},${round(36 - 22 * nm)},${round(20 - 12 * nm)}`, f = 1 - nm * .52;
    if (ox) { ox.clearRect(0, 0, ow, oh); ox.fillStyle = ox.strokeStyle = `rgba(${rgb},${(.095 * f).toFixed(3)})`; layer(ox, ow, oh, 0, t, ang, str, sx * .55, sy * .55); c.drawImage(oc, -sin(ang) * 10 * str, (5 + abs(sin(ang)) * 6) * str, w, h); }
    c.fillStyle = c.strokeStyle = `rgba(${rgb},${(.12 * f).toFixed(3)})`; layer(c, w, h, 1, t, ang, str, sx, sy);
    c.globalCompositeOperation = "destination-out";
    rg(w * .5, h * .52, w * .1, w * .48, [[0, "rgba(0,0,0,.76)"], [.58, "rgba(0,0,0,.4)"], [1, "rgba(0,0,0,0)"]]);
    c.globalCompositeOperation = "source-over";
  };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  const loop = (now) => {
    if (!vis || !pv || mq.matches) { raf = 0; return; }
    if (now - ld >= (abs(tSp - sp) > 4e-4 || abs(tVp - vp) > 8e-4 || abs(tx - mx) > 3e-3 || abs(ty - my) > 3e-3 || abs((dk() ? 1 : 0) - nm) > 4e-3 ? 16 : 42)) { ld = now; draw(now * .001); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && vis && pv && !mq.matches) raf = requestAnimationFrame(loop); };
  const snap = () => { rd(); sp = tSp; vp = tVp; nm = dk() ? 1 : 0; draw(0); };
  const on = (el, ev, fn) => el.addEventListener(ev, fn, { passive: true });
  if (typeof IntersectionObserver !== "undefined") new IntersectionObserver((e) => { vis = e[0]?.isIntersecting ?? 1; vis ? start() : stop(); }, { rootMargin: "60px" }).observe(cv);
  on(document, "visibilitychange", () => { pv = !document.hidden; pv ? start() : stop(); });
  new MutationObserver(() => { draw(lt); start(); }).observe(rt, { attributes: true, attributeFilter: ["data-theme", "class"] });
  mq.addEventListener?.("change", () => (mq.matches ? (stop(), snap()) : start()));
  on(window, "scroll", () => { rd(); if (!mq.matches) start(); });
  on(window, "pointermove", (e) => { tx = e.clientX / max(1, innerWidth) * 2 - 1; ty = e.clientY / max(1, innerHeight) * 2 - 1; });
  const onRz = () => { clearTimeout(rtm); rtm = setTimeout(() => { rz(); rd(); draw(lt); }, 120); };
  typeof ResizeObserver !== "undefined" ? new ResizeObserver(onRz).observe(cv) : on(window, "resize", onRz);
  rz(); snap(); start();
}
