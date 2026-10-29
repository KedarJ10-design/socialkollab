# Rule: Anti-AI Human Craft Invariants for Web & 3D Design

## Core Mandate
Every interface produced in this codebase must pass the "Human Craft Test" and reject generative AI tropes. The output must reflect the caliber of industry-defining creative studios (Locomotive, Active Theory, Basement Studio, Dennis Snellenberg, Immersive Garden).

## Banned AI Tropes (Strict Prohibitions)
1. **NO Generic 3D Particles:** Never use a random cloud of floating dots/spheres as a substitute for 3D craft. 3D must be purposeful: a physical interactive mesh (glass/chrome with transmission, roughness, and spring physics), an interactive GLSL liquid/chromatic distortion shader, or a scroll-choreographed camera rig.
2. **NO Equal-Width 3-Card Bento Grids:** Do not chop content into identical rounded rectangles with line-art icons in boxes. Use asymmetric editorial layouts, interactive typography lists with cursor-following media reveals, or magazine column flows.
3. **NO Single Italic Word Gimmicks:** Avoid swapping a single word in a headline to an italic serif unless the entire typographic system is rooted in editorial print typography.
4. **NO ChatGPT Corporate Jargon:** Never generate copy like "Crafting digital monoliths", "Unleash your potential", or "Where brands meet creators". Write with technical candor, punchy brevity, or dry creative wit.
5. **NO Emojis as UI Icons:** Never use emojis (✨, ⚡, 🚀, 🎯) in place of bespoke SVG vectors or typographic indicators.
6. **NO Uniform Easing:** Never use linear or default ease-in-out transitions. Always use spring physics (`CustomEase` in GSAP or exponential ease-out) with mass, stiffness, and damping.

## Required Human Craft Invariants
1. **Interactive Media Rail on Hover:** When presenting portfolios or case studies, use an interactive typography list where hovering over a project title reveals a floating media card that tracks the cursor with spring physics and inertia (Dennis Snellenberg pattern).
2. **Material Realism & Textures:** Always incorporate subtle tactile elements, such as an SVG procedural film grain noise overlay (`feTurbulence`) at 2–4% opacity to break the flat plastic look of digital screens.
3. **Extreme Typographic Contrast:** Pair oversized display headlines (`clamp(3.5rem, 8vw, 8rem)`) with ultra-fine, restrained technical metadata (`0.75rem` monospace).
4. **Tactile Micro-Interactions:** Buttons and interactive items must have physical weight—magnetic pull on approach, inner border glares, and tactile micro-audio feedback via Web Audio API.
5. **Native Scrolling First**: Never implement artificial smooth scroll libraries (Lenis, Locomotive) that hijack user mouse wheel or trackpad physics. Always rely on native browser 1:1 hardware scrolling for instant responsiveness, low latency, and zero scroll lag.
6. **Strict 6-Color Palette Discipline**: Every project design system must be strictly bounded to an exact color architecture: 3 Primary Colors (Canvas, Ink, Signature Action) + 3 Supporting Colors (Surfaces, Harmonic Accent, Muted Typography). Zero rogue hex codes. All borders, shadows, inputs, badges, and WebGL uniforms must derive mathematically from these 6 tokens.
7. **Archival Warmth & Spatial Depth**: Never use stark, blinding off-whites (>97% luminance) for light-mode backgrounds. Calibrate the primary canvas to rich, warm archival paper (~88–90% lightness, e.g., `#ECE4D5`). Create physical 3D depth through multi-layer atmospheric lighting (radial solar glows), optical perimeter vignettes, physical paper card elevation, and multi-stop warm shadows.
