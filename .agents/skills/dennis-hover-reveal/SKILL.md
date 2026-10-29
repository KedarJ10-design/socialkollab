---
name: dennis-hover-reveal
description: >-
  Implement the signature Dennis Snellenberg floating cursor-tracking project reveal interaction.
  Trigger on phrases like "Dennis Snellenberg hover", "cursor project reveal", "floating image preview",
  "project list image trail", "magnetic media hover", or when designing an award-winning creative portfolio.
---

# Dennis Snellenberg Hover Reveal — Cursor-Tracking Media Preview Skill

This skill teaches how to implement the iconic **Dennis Snellenberg Hover Reveal** interaction (also known on Awwwards and Codrops as the *Cursor-Tracking Media Preview* or *Portfolio Image Trail*). 

This interaction is the gold standard of modern creative agency and developer portfolios. Instead of boring static card grids, projects are presented in an editorial typography list. Hovering over any project row dynamically reveals a floating, tilted image card that sticks to and smoothly trails the cursor with spring physics and inertia.

---

## 1. Core Mechanics & Architecture

```
User Pointer Movement ──► GSAP quickTo (X, Y) ──► Floating Modal (translate(-50%, -50%))
                                │
                          Delta Velocity ───────► Dynamic Tilt (rotateZ ±8° to ±12°)
                                │
Hover Project Row (Index) ──────┴───────────────► Image Slider translateY(-index * 100%)
```

1. **Floating Container (`fixed` position, `pointer-events: none`):**
   - Centered on cursor via `transform: translate(-50%, -50%)`.
   - Scaled down to `0.8` and `opacity: 0` when inactive; scales to `1.0` and `opacity: 1` when active.
2. **GSAP `quickTo` Interpolation:**
   - Instead of re-creating tweens on every `mousemove`, use `gsap.quickTo` for `left`, `top`, and `rotation` for locked 60/120 FPS performance.
3. **Dynamic Angular Inertia (Tilt):**
   - Calculate horizontal pointer delta (`deltaX = mouseX - prevX`).
   - Map `deltaX` to a tilt angle (clamped to $\pm 10^\circ$).
4. **Stacked Image Slider:**
   - All project preview images live inside a vertically stacked slider container (`.preview-slider`).
   - Hovering row with `data-index="N"` sets `.preview-slider` to `translateY(-N * 100%)` with smooth exponential easing.

---

## 2. Standard HTML Markup Pattern

```html
<div class="project-showcase-wrap" id="project-showcase">
  
  <!-- Floating Cursor-Following Media Preview Modal -->
  <div class="floating-project-preview" id="floating-project-preview" aria-hidden="true">
    <div class="preview-slider" id="preview-slider">
      <div class="preview-slide"><img src="project-1.jpg" alt="Project 1"></div>
      <div class="preview-slide"><img src="project-2.jpg" alt="Project 2"></div>
      <div class="preview-slide"><img src="project-3.jpg" alt="Project 3"></div>
      <div class="preview-slide"><img src="project-4.jpg" alt="Project 4"></div>
    </div>
    <div class="preview-pill" id="preview-pill">VIEW PROJECT ↗</div>
  </div>

  <!-- Editorial Typography Project List -->
  <div class="project-list" id="project-list">
    
    <div class="project-row" data-index="0" data-id="project-1">
      <div class="project-num">01 /</div>
      <div class="project-name-wrap">
        <h3 class="project-name">Project Name One</h3>
        <span class="project-category-tag">E-Commerce • Headless Shopify</span>
      </div>
      <div class="project-impact">
        <span class="impact-metric">3.8x</span>
        <span class="impact-label">Conv. Surge</span>
      </div>
      <div class="project-arrow">↗</div>
    </div>

    <div class="project-row" data-index="1" data-id="project-2">
      <div class="project-num">02 /</div>
      <div class="project-name-wrap">
        <h3 class="project-name">Project Name Two</h3>
        <span class="project-category-tag">Design System • WebGL Experience</span>
      </div>
      <div class="project-impact">
        <span class="impact-metric">95+</span>
        <span class="impact-label">Lighthouse</span>
      </div>
      <div class="project-arrow">↗</div>
    </div>

  </div>
</div>
```

---

## 3. Standard CSS Implementation

```css
/* Container & Layout */
.project-showcase-wrap {
  position: relative;
  width: 100%;
}

/* Floating Media Preview Card (Fixed to Viewport, Follows Cursor) */
.floating-project-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 440px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  pointer-events: none;
  z-index: 9990;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.85);
  transform-origin: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 35px 80px -15px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.18);
  background: #0f1118;
  transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.floating-project-preview.active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* Image Slider Stack */
.preview-slider {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.preview-slide {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

/* Positioning each slide vertically by index * 100% */
.preview-slide:nth-child(1) { top: 0%; }
.preview-slide:nth-child(2) { top: 100%; }
.preview-slide:nth-child(3) { top: 200%; }
.preview-slide:nth-child(4) { top: 300%; }

.preview-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Floating Action Badge */
.preview-pill {
  position: absolute;
  bottom: 1.25rem;
  right: 1.25rem;
  padding: 0.4rem 0.95rem;
  background: rgba(6, 7, 10, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  font-family: monospace;
  font-size: 0.72rem;
  color: #d4af37;
  letter-spacing: 0.08em;
  z-index: 2;
}

/* Project Row Typography */
.project-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.project-row {
  display: grid;
  grid-template-columns: 80px 1fr auto 60px;
  align-items: center;
  padding: 2.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background-color 0.3s ease, padding 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
  padding-left: 2.25rem;
  padding-right: 2.25rem;
}

/* Mobile Fallback: Hide Floating Card on Touchscreens */
@media (pointer: coarse), (max-width: 992px) {
  .floating-project-preview {
    display: none !important;
  }
}
```

---

## 4. Standard JavaScript / GSAP Implementation

```javascript
import gsap from 'gsap';

export function initDennisHoverReveal() {
  const previewModal = document.getElementById('floating-project-preview');
  const previewSlider = document.getElementById('preview-slider');
  const projectRows = document.querySelectorAll('.project-row');
  const projectList = document.getElementById('project-list');

  // Disable on mobile/touch or reduced motion
  if (!previewModal || !previewSlider || window.innerWidth <= 992) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let mousePos = { x: 0, y: 0, prevX: 0, speed: 0 };

  // GSAP quickTo setters for 60fps spring interpolation
  const setX = gsap.quickTo(previewModal, 'left', { duration: 0.5, ease: 'power3.out' });
  const setY = gsap.quickTo(previewModal, 'top', { duration: 0.5, ease: 'power3.out' });
  const setRotation = gsap.quickTo(previewModal, 'rotation', { duration: 0.4, ease: 'power2.out' });

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    setX(mousePos.x);
    setY(mousePos.y);

    // Dynamic tilt calculation based on horizontal delta
    const deltaX = mousePos.x - mousePos.prevX;
    mousePos.speed = Math.max(Math.min(deltaX * 0.35, 12), -12);
    setRotation(mousePos.speed);
    mousePos.prevX = mousePos.x;
  }, { passive: true });

  // Hover over project items
  projectRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      const index = parseInt(row.getAttribute('data-index') || 0);

      // Show floating preview
      previewModal.classList.add('active');

      // Slide image stack to target index
      previewSlider.style.transform = `translateY(-${index * 100}%)`;
    });
  });

  // Hide preview when mouse exits the project list area
  if (projectList) {
    projectList.addEventListener('mouseleave', () => {
      previewModal.classList.remove('active');
      setRotation(0);
    });
  }
}
```

---

## 5. Anti-AI Craft Checklist for this Skill
- [ ] Ensure `pointer-events: none` is set on `.floating-project-preview` so it does not block clicks on the text rows.
- [ ] Use `gsap.quickTo` instead of creating new tweens on `mousemove` to avoid frame drops.
- [ ] Include dynamic angular tilt (`rotateZ`) proportional to cursor velocity for physical inertia.
- [ ] Always provide a clean mobile media-query fallback (`display: none` on touch devices).
