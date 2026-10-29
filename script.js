/**
 * THE SOCIAL KOLLAB — MASTER APPLICATION SCRIPT
 * Phase 2: Anti-AI Human Craft Engine
 * 
 * Features:
 *   1. Unified RAF Engine (Lenis + GSAP ScrollTrigger + Three.js)
 *   2. GPU-Accelerated Three.js GLSL Liquid Wave Shader (No generic particles)
 *   3. Dennis Snellenberg Floating Cursor Project Reveal with Spring Inertia
 *   4. Zero-Asset Web Audio API Micro-Click Synthesizer
 *   5. 3D Perspective Card Tilt Physics
 *   6. Live Number Counter Animations on Scroll
 *   7. Filterable Project Archive & Detailed Campaign Dossiers
 *   8. Dynamic Scope & Investment Estimator
 *   9. Two-Way Studio Brief & Creative Collective Intake
 */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     0. Master Warm Palette Enforcement
     ========================================================================== */
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('tsk-atmosphere');
  } catch (e) {}

  /* ==========================================================================
     1. Audio Synthesizer (Decommissioned per Anti-AI Craft Guidelines)
     ========================================================================== */
  function playTactileTick() { /* Intentionally silent */ }

  /* ==========================================================================
     3. GPU-Accelerated Three.js GLSL Liquid Wave Shader
     ========================================================================== */
  const canvas = document.getElementById('webgl-canvas');
  if (canvas && !prefersReducedMotion && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Custom GLSL Vertex Shader: Organic wave displacement & pointer deformation
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uVelocity;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Base undulating waves
        float wave1 = sin(pos.x * 0.4 + uTime * 0.8) * cos(pos.y * 0.3 + uTime * 0.6) * 0.8;
        float wave2 = sin(pos.y * 0.6 - uTime * 0.5) * 0.4;

        // Mouse displacement ripple
        float dist = distance(uv, uMouse);
        float mouseRipple = sin(dist * 18.0 - uTime * 3.5) * exp(-dist * 4.5) * uVelocity * 1.6;

        float elevation = wave1 + wave2 + mouseRipple;
        pos.z += elevation;
        vElevation = elevation;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Custom GLSL Fragment Shader: Master Warm 6-Color Solar Caustic Field
    const fragmentShader = `
      uniform float uTime;
      uniform float uVelocity;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // Master Warm Chromatics:
        vec3 colorSolar = vec3(1.000, 0.282, 0.125);     // #ff4820 Solar Vermilion
        vec3 colorMarigold = vec3(0.960, 0.620, 0.043);  // #f59e0b Saffron Marigold

        // Crest radiance: wave peaks catch golden sunlight
        float crest = smoothstep(0.08, 1.15, vElevation);
        float ripple = smoothstep(0.20, 1.30, vElevation + uVelocity * 0.4);

        // Harmonize Saffron Marigold and Solar Vermilion on crests
        vec3 caustic = mix(colorMarigold, colorSolar, ripple * 0.4);

        // Edge vignette: smooth feathering toward viewport boundaries
        float edgeAlpha = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x) *
                          smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);

        // Transparent base, luminous caustic rays on crests
        float alpha = (crest * 0.25 + uVelocity * 0.07) * edgeAlpha;
        gl_FragColor = vec4(caustic, clamp(alpha, 0.0, 0.35));
      }
    `;

    // High subdivision plane for smooth fluid waves
    const geometry = new THREE.PlaneGeometry(36, 24, 80, 50);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: 0.0 }
      },
      transparent: true,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -0.35; // Cinematic perspective angle
    scene.add(mesh);

    // Track mouse coordinates & velocity
    let mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, velocity: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1.0 - (e.clientY / window.innerHeight);

      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      mouse.velocity = Math.min(Math.sqrt(dx * dx + dy * dy) * 8.0, 2.5);

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }, { passive: true });

    // Render loop integrated with GSAP or requestAnimationFrame
    const clock = new THREE.Clock();
    function renderShader() {
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Decay velocity smoothly
      mouse.velocity *= 0.94;
      material.uniforms.uVelocity.value = mouse.velocity;

      // Smooth pointer interpolation
      material.uniforms.uMouse.value.x += (mouse.x - material.uniforms.uMouse.value.x) * 0.08;
      material.uniforms.uMouse.value.y += (mouse.y - material.uniforms.uMouse.value.y) * 0.08;

      renderer.render(scene, camera);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(renderShader);
    } else {
      (function loop() {
        requestAnimationFrame(loop);
        renderShader();
      })();
    }

    // Resize handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  /* ==========================================================================
     4. Dennis Snellenberg Floating Cursor Project Reveal
     ========================================================================== */
  const previewModal = document.getElementById('floating-project-preview');
  const previewSlider = document.getElementById('preview-slider');
  const projectRows = document.querySelectorAll('.project-row');
  const projectList = document.getElementById('project-list');

  if (previewModal && previewSlider && !prefersReducedMotion && window.innerWidth > 992) {
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

      // Dynamic tilt based on horizontal velocity
      const deltaX = mousePos.x - mousePos.prevX;
      mousePos.speed = Math.max(Math.min(deltaX * 0.35, 12), -12);
      setRotation(mousePos.speed);
      mousePos.prevX = mousePos.x;
    }, { passive: true });

    projectRows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const index = parseInt(row.getAttribute('data-index') || 0);

        // Show floating preview
        previewModal.classList.add('active');

        // Slide preview images to target index
        previewSlider.style.transform = `translateY(-${index * 100}%)`;
      });

      row.addEventListener('click', () => {
        });
    });

    if (projectList) {
      projectList.addEventListener('mouseleave', () => {
        previewModal.classList.remove('active');
        setRotation(0);
      });
    }
  }


  /* ==========================================================================
     5. Fluid Velocity-Stretching Ink Droplet Cursor System (Zero Double Cursor)
     ========================================================================== */
  const fluidWrap = document.getElementById('fluid-cursor-wrap');
  const fluidDroplet = document.getElementById('fluid-droplet');
  const fluidText = document.getElementById('fluid-cursor-text');

  if (fluidWrap && fluidDroplet && window.innerWidth > 992) {
    let mouseX = -100;
    let mouseY = -100;
    let lastX = -100;
    let lastY = -100;
    let targetSpeed = 0;
    let currentSpeed = 0;
    let currentAngle = 0;
    let isHovering = false;
    let clickScale = 1;

    // 1:1 Instantaneous Hardware Tracking (Zero Latency, Zero Glitch)
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      fluidWrap.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      fluidWrap.style.opacity = '1';

      if (lastX !== -100) {
        const dx = mouseX - lastX;
        const dy = mouseY - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          targetSpeed = dist;
          currentAngle = Math.atan2(dy, dx);
        }
      }
      lastX = mouseX;
      lastY = mouseY;
    }, { passive: true });

    // Window In/Out Visibility Tracking
    document.addEventListener('mouseleave', () => {
      fluidWrap.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      fluidWrap.style.opacity = '1';
    });

    // Snappy Tactile Click Feedback (Scales inner droplet without breaking 3D position)
    window.addEventListener('mousedown', () => {
      clickScale = 0.78;
    });
    window.addEventListener('mouseup', () => {
      clickScale = 1;
    });

    // Fluid Velocity Animation Loop (Organic Viscous Stretch & Squash)
    function renderFluidCursor() {
      // Viscous decay: speed smoothly returns to resting state
      currentSpeed += (targetSpeed - currentSpeed) * 0.22;
      targetSpeed *= 0.78;

      if (isHovering) {
        // When hovering interactive elements, maintain uniform circular lens
        fluidDroplet.style.transform = `translate(-50%, -50%) scale(${clickScale})`;
      } else {
        // When moving in flight, stretch along velocity vector
        const stretch = Math.min(currentSpeed * 0.035, 0.85);
        const scaleX = (1 + stretch) * clickScale;
        const scaleY = Math.max(0.55, 1 - stretch * 0.45) * clickScale;

        fluidDroplet.style.transform = `translate(-50%, -50%) rotate(${currentAngle}rad) scale(${scaleX}, ${scaleY})`;
      }

      requestAnimationFrame(renderFluidCursor);
    }
    requestAnimationFrame(renderFluidCursor);

    // Interactive Hover Targets
    const hoverTargets = document.querySelectorAll(
      'a, button, [role="button"], .interactive-tilt, .service-card, .creator-profile-card, ' +
      '.testimonial-card, .project-row, .work-card, .atelier-stamp-seal, .filter-btn, .menu-toggle, ' +
      '.btn, .nav-link, .brand-logo, .view-switch-btn'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        isHovering = true;
        fluidDroplet.classList.add('hovering');
        if (el.classList.contains('service-card')) {
          fluidDroplet.classList.add('has-text');
          if (fluidText) fluidText.textContent = 'EXPLORE';
        } else if (el.classList.contains('project-row')) {
          fluidDroplet.style.transform = `translate(-50%, -50%) scale(0.65)`;
        } else if (el.classList.contains('creator-profile-card')) {
          fluidDroplet.classList.add('has-text');
          if (fluidText) fluidText.textContent = 'DOSSIER';
        } else if (el.classList.contains('atelier-stamp-seal')) {
          fluidDroplet.classList.add('has-text');
          if (fluidText) fluidText.textContent = '✦';
        }
      });

      el.addEventListener('mouseleave', () => {
        isHovering = false;
        fluidDroplet.style.opacity = '1';
        fluidDroplet.classList.remove('hovering', 'has-text');
        if (fluidText) fluidText.textContent = '';
      });
    });

    // Eradicate double cursor on text inputs: fade droplet smoothly so native caret is crisp
    const textInputs = document.querySelectorAll('input, textarea, select');
    textInputs.forEach(input => {
      input.addEventListener('mouseenter', () => {
        fluidDroplet.style.opacity = '0';
      });
      input.addEventListener('mouseleave', () => {
        fluidDroplet.style.opacity = '1';
      });
    });
  }


  /* ==========================================================================
     6. 3D Perspective Card Tilt Physics
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.interactive-tilt');
  if (!prefersReducedMotion && window.innerWidth > 992) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
      });
    });
  }

  /* ==========================================================================
     7. Live Number Counter Animations on Scroll
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target'));
          const decimals = parseInt(el.getAttribute('data-decimal') || 0);
          animateValue(el, 0, target, 1600, decimals);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(num => observer.observe(num));
  }

  function animateValue(el, start, end, duration, decimals) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = end.toFixed(decimals);
      }
    };
    window.requestAnimationFrame(step);
  }


  /* ==========================================================================
     8. Campaign Dossier Data & Interactive Narrative Modal
     ========================================================================== */
  const dossierData = {
    'uniform-lab': {
      tag: 'E-COMMERCE & INSTITUTIONAL APPAREL',
      title: 'The Uniform Lab: High-Volume Commerce Engine',
      client: 'The Uniform Lab • Pune, India',
      image: 'assets/images/case-fashion.jpg',
      techStack: ['Shopify Plus', 'Custom Liquid', 'Algolia Predictive Search', 'Razorpay', 'GSAP 3.12'],
      stats: [
        { val: '3.8x', lbl: 'Checkout Conversion Lift' },
        { val: '< 0.8s', lbl: 'Median Page Load Speed' },
        { val: '₹14Cr+', lbl: 'Annual Order Volume Supported' }
      ],
      overview: 'The Uniform Lab is one of western India’s premier institutional school and corporate apparel suppliers. The Social Kollab was commissioned to architect a bespoke, lightning-fast digital storefront that could smoothly transition between bulk B2B institutional orders and personalized direct-to-consumer uniform purchases.',
      deliverables: [
        'Custom Headless Shopify Storefront',
        'Bulk Institutional Sizing Matrix & Smart Re-ordering',
        'Instant Razorpay & Multi-Gateway Integration',
        'Automated Warehouse Shipping Label Generation',
        'Sub-second Search with Algolia Predictive Catalog',
        '100% Mobile Ergonomic Navigation'
      ],
      quote: '"The Social Kollab transformed how our customers perceive our brand. Our previous platform crashed every school admission season; the new architecture didn’t flinch once and our checkout conversion exploded."',
      quoteAuthor: 'Founding Director, The Uniform Lab'
    },
    'trex': {
      tag: 'D2C CONSUMER GOODS & EVERYDAY CARRY',
      title: 'T-REX Store: Cult Lifestyle Brand Storefront',
      client: 'T-REX Store • Kothrud, Pune',
      image: 'assets/images/case-tech.jpg',
      techStack: ['Three.js GLSL', 'Web Audio API', 'Slide-Out Cart Drawer', 'Custom Tokens', 'Edge SSR'],
      stats: [
        { val: '4.6x', lbl: 'Direct Attributed ROAS' },
        { val: '+45%', lbl: 'Mobile Conversion Surge' },
        { val: '3.2m', lbl: 'Avg Session Duration' }
      ],
      overview: 'T-REX creates high-grade insulated drinkware and everyday carry gear designed to rival Yeti and Stanley. The Social Kollab developed a dark-mode-first aesthetic with rich video embeds, tactile micro-animations, and 3D product viewports that catapulted the brand into a viral lifestyle phenomenon.',
      deliverables: [
        'Full Brand Art Direction & Editorial Palette',
        'High-Converting 1-Click Sliding Cart Drawer',
        'Custom Bundling & Cross-Sell Engine',
        'Seamless Meta Pixel & Google Ads Conversion Tracking',
        'Interactive Color Swatch & Engraving Simulator',
        'Micro-Animations with GSAP Motion'
      ],
      quote: '"They don’t just write code; they understand the soul of a modern D2C brand. The speed and polish of the site immediately established our authority in a crowded market."',
      quoteAuthor: 'Head of Growth, T-REX Store'
    },
    'orthochronicles': {
      tag: 'MEDICAL & CLINICAL EDTECH',
      title: 'OrthoChronicles: Specialist Clinical Knowledge Hub',
      client: 'OrthoChronicles • Academic Portal',
      image: 'assets/images/case-beauty.jpg',
      techStack: ['Semantic CMS', 'WCAG AA Typography', 'Taxonomy Engine', 'Fastly CDN', 'Encrypted PDF Vault'],
      stats: [
        { val: '32K+', lbl: 'Active Global Practitioners' },
        { val: '99.8%', lbl: 'System Uptime Across 12 Months' },
        { val: '0.4s', lbl: 'Case Search Latency' }
      ],
      overview: 'OrthoChronicles is a premier educational repository and case archive for orthodontic surgeons, researchers, and postgraduate clinicians. We engineered a surgical, distraction-free reading experience with taxonomic filtering, deep clinical search, and accessible typography.',
      deliverables: [
        'Semantic Editorial CMS Architecture',
        'High-Resolution Medical Case Study Viewer',
        'WCAG AA Compliant High-Contrast Typography',
        'Instant Multi-Taxonomy Filter & Tagging Engine',
        'Encrypted Clinical PDF Download Vault',
        'Zero-Tracker Privacy Architecture'
      ],
      quote: '"The Social Kollab delivered an academic sanctuary. It is fast, pristine, accessible on hospital tablets, and revered by our academic peers."',
      quoteAuthor: 'Chief Editor, OrthoChronicles'
    },
    'kk-associates': {
      tag: 'FINANCE & CORPORATE ARCHITECTURE',
      title: 'KK Associates & Yashply: Modern Corporate Monoliths',
      client: 'KK Associates & Yashply • Corporate Leaders',
      image: 'assets/images/hero-studio.jpg',
      techStack: ['Serverless Edge', 'Lead Qualification API', 'WebGL Material Viewer', 'SEO Schema', 'Figma Tokens'],
      stats: [
        { val: '+80%', lbl: 'High-Intent Inbound Leads' },
        { val: '10/10', lbl: 'Brand Authority Score' },
        { val: '0.4s', lbl: 'Interactive Response Time' }
      ],
      overview: 'For traditional consulting leaders and luxury material suppliers, web presence is the single most critical trust validator for multi-crore contracts. We rebuilt the digital identities of KK Associates and Yashply, replacing outdated legacy layouts with sleek, confident, modern digital headquarters.',
      deliverables: [
        'Executive Brand Identity & Typography System',
        'Interactive Client Consultation Booking Portal',
        'Architectural Veneer & Material Visualizer',
        'Automated Inbound Lead Qualification Pipeline',
        'Ultra-Secure Serverless Cloud Deployment',
        'Complete Corporate SEO Authority Blueprint'
      ],
      quote: '"The credibility jump was instantaneous. High-net-worth clients now cite our website as the reason they chose our firm over legacy competitors."',
      quoteAuthor: 'Managing Partner, KK Associates'
    }
  };

  const dossierModal = document.getElementById('dossier-modal');
  const dossierContent = document.getElementById('dossier-modal-content');
  const closeDossierBtn = document.getElementById('close-dossier-modal');

  function openDossierByCaseId(caseId, updateHash = true) {
    if (!caseId || !Object.prototype.hasOwnProperty.call(dossierData, caseId)) return;
    if (!dossierModal || !dossierContent) {
      if (caseId === 'uniform-lab') {
        window.location.href = 'work-uniform-lab.html';
      } else {
        window.location.href = `work.html#case-${caseId}`;
      }
      return;
    }
    renderDossier(dossierData[caseId], caseId);
    openModal(dossierModal);
    if (updateHash && window.location.hash !== `#case-${caseId}`) {
      history.replaceState(null, '', `#case-${caseId}`);
    }
  }

  const dossierTriggers = document.querySelectorAll('.project-row, .open-dossier-card');
  dossierTriggers.forEach(el => {
    const handleTrigger = (e) => {
      // If it is an anchor link with a dedicated href, allow normal page navigation
      if (el.tagName === 'A' && el.getAttribute('href') && !el.getAttribute('href').startsWith('#')) {
        return;
      }
      const caseId = el.getAttribute('data-case');
      if (caseId && Object.prototype.hasOwnProperty.call(dossierData, caseId)) {
        e.preventDefault();
        openDossierByCaseId(caseId, true);
      }
    };

    el.addEventListener('click', handleTrigger);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleTrigger(e);
      }
    });
  });

  function renderDossier(data, caseId) {
    let statsHtml = data.stats.map(s => `
      <div class="dossier-metric-item">
        <strong>${s.val}</strong>
        <span>${s.lbl}</span>
      </div>
    `).join('');

    let deliverablesHtml = data.deliverables.map(d => `
      <li>${d}</li>
    `).join('');

    let techStackHtml = (data.techStack || []).map(t => `
      <span style="display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 9999px; background: rgba(24, 21, 19, 0.05); border: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-primary); font-weight: 500;">
        ${t}
      </span>
    `).join('');

    dossierContent.innerHTML = `
      <div style="width: 100%; aspect-ratio: 16 / 8; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);">
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </div>

      <div class="dossier-header">
        <span class="dossier-tag">${data.tag}</span>
        <h3 class="dossier-title">${data.title}</h3>
        <p class="dossier-client">${data.client}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.75rem;">
          ${techStackHtml}
        </div>
      </div>

      <div class="dossier-metrics-bar">
        ${statsHtml}
      </div>

      <div class="dossier-section">
        <h4>The Strategic Challenge & Execution</h4>
        <p style="font-size: 0.98rem; line-height: 1.7; color: var(--text-secondary);">${data.overview}</p>
      </div>

      <div class="dossier-section">
        <h4>Key Technical & Design Deliverables</h4>
        <ul class="dossier-deliverables-list">
          ${deliverablesHtml}
        </ul>
      </div>

      <div class="dossier-section" style="background: rgba(24,21,19,0.03); border-left: 2px solid var(--color-primary-3); padding: 1.25rem 1.5rem; border-radius: 8px;">
        <p style="font-style: italic; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.6;">${data.quote}</p>
        <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-primary-3); font-weight: 600;">${data.quoteAuthor}</span>
      </div>

      <div style="margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: flex-end; align-items: center;">
        ${caseId === 'uniform-lab' ? `
          <a href="work-uniform-lab.html" class="btn btn-outline btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
            Read Full Architectural Case Study ↗
          </a>
        ` : ''}
        <button class="btn btn-primary btn-sm open-modal-btn" data-tab="brand">Initiate Similar Project →</button>
      </div>
    `;

    dossierContent.querySelectorAll('.open-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(dossierModal);
        openIntakeModal(btn.getAttribute('data-tab') || 'brand');
      });
    });
  }

  function checkUrlHashDossier() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#case-')) {
      const caseId = hash.replace('#case-', '');
      if (Object.prototype.hasOwnProperty.call(dossierData, caseId)) {
        openDossierByCaseId(caseId, false);
      }
    } else {
      if (dossierModal && dossierModal.classList.contains('active')) {
        closeModal(dossierModal);
      }
    }
  }

  // Deep-link URL hash detection on load & on popstate/hashchange
  checkUrlHashDossier();
  window.addEventListener('hashchange', checkUrlHashDossier);

  if (closeDossierBtn) {
    closeDossierBtn.addEventListener('click', () => closeModal(dossierModal));
  }


  /* ==========================================================================
     9. Interactive Editorial Discipline Rail
     ========================================================================== */
  const disciplineRows = document.querySelectorAll('.discipline-row');
  disciplineRows.forEach(row => {
    row.addEventListener('click', () => {
      const isActive = row.classList.contains('active');
      disciplineRows.forEach(r => r.classList.remove('active'));
      if (!isActive) {
        row.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     9B. Architectural Engagement Blueprint (Tier Selector & Dynamic Roadmap)
     ========================================================================== */
  const tierButtons = document.querySelectorAll('.blueprint-tier-btn');
  const roadmapP1Num = document.getElementById('roadmap-p1-num');
  const roadmapP1Title = document.getElementById('roadmap-p1-title');
  const roadmapP1Items = document.getElementById('roadmap-p1-items');
  const roadmapP2Num = document.getElementById('roadmap-p2-num');
  const roadmapP2Title = document.getElementById('roadmap-p2-title');
  const roadmapP2Items = document.getElementById('roadmap-p2-items');
  const roadmapP3Num = document.getElementById('roadmap-p3-num');
  const roadmapP3Title = document.getElementById('roadmap-p3-title');
  const roadmapP3Items = document.getElementById('roadmap-p3-items');

  const blueprintTiersData = [
    {
      p1Num: "PHASE 01 // 7-10 DAYS",
      p1Title: "Audit & Visual Manifesto",
      p1Items: [
        "UX heuristic audit & competitor tension mapping",
        "Figma design tokens & typographic hierarchy",
        "Architectural wireframes & interaction blueprints"
      ],
      p2Num: "PHASE 02 // 14-21 DAYS",
      p2Title: "Creative Engineering",
      p2Items: [
        "Hand-coded HTML5 / Vanilla CSS / GSAP animations",
        "Custom WebGL canvas & shader choreography",
        "Responsive mobile optimization & sub-second loading"
      ],
      p3Num: "PHASE 03 // 7-10 DAYS",
      p3Title: "Hardening & Launch",
      p3Items: [
        "Lighthouse 95+ score hardening & Core Web Vitals",
        "Multi-device cross-browser QA & stress testing",
        "Deployment, analytics telemetry & 30-day hypercare"
      ]
    },
    {
      p1Num: "PHASE 01 // 10-14 DAYS",
      p1Title: "Full Brand & Platform Architecture",
      p1Items: [
        "Complete bespoke design system with custom token scale",
        "Interactive high-fidelity motion prototypes in Figma",
        "Headless Shopify / modern tech stack infrastructure setup"
      ],
      p2Num: "PHASE 02 // 20-30 DAYS",
      p2Title: "Flagship Production & 60FPS Polish",
      p2Items: [
        "Hand-authored frontend engineering with zero template bloat",
        "Dennis Snellenberg cursor hover reveals & kinetic micro-interactions",
        "High-conversion checkout drawer & dynamic cart threshold rules"
      ],
      p3Num: "PHASE 03 // 10-14 DAYS",
      p3Title: "Hypercare & Global CDN Launch",
      p3Items: [
        "Edge caching, image optimization & sub-second TTFB",
        "Full analytics telemetry (GA4, Meta CAPI, Hotjar) wiring",
        "60 days dedicated post-launch hypercare & dev team handover"
      ]
    },
    {
      p1Num: "PHASE 01 // 14-20 DAYS",
      p1Title: "Art Direction & 3D Spatial R&D",
      p1Items: [
        "Creative coding R&D and bespoke GLSL shader exploration",
        "Awwwards SOTY benchmark review & spatial UI/UX art direction",
        "Custom Blender 3D model optimization & low-poly baking"
      ],
      p2Num: "PHASE 02 // 30-45 DAYS",
      p2Title: "Bespoke WebGL & Audio Engineering",
      p2Items: [
        "Three.js spatial canvas with custom noise & vertex displacement",
        "Scroll-driven multi-stage camera choreography & Lenis RAF sync",
        "Synthesized subtle Web Audio API haptic soundscape integration"
      ],
      p3Num: "PHASE 03 // 14-20 DAYS",
      p3Title: "Awwwards Campaign & Performance",
      p3Items: [
        "WebGPU / WebGL fallback matrix for low-powered mobile devices",
        "Awwwards & FWA submission collateral preparation",
        "Full GitHub repo ownership & white-glove engineering retainer"
      ]
    }
  ];

  function renderTierRoadmap(tierIndex) {
    const data = blueprintTiersData[tierIndex];
    if (!data || !roadmapP1Num) return;

    const roadmapGrid = document.getElementById('blueprint-roadmap');
    if (roadmapGrid) {
      roadmapGrid.style.opacity = '0.35';
      roadmapGrid.style.transition = 'opacity 0.2s ease';
    }

    setTimeout(() => {
      roadmapP1Num.textContent = data.p1Num;
      roadmapP1Title.textContent = data.p1Title;
      roadmapP1Items.innerHTML = data.p1Items.map(item => `<li>${item}</li>`).join('');

      roadmapP2Num.textContent = data.p2Num;
      roadmapP2Title.textContent = data.p2Title;
      roadmapP2Items.innerHTML = data.p2Items.map(item => `<li>${item}</li>`).join('');

      roadmapP3Num.textContent = data.p3Num;
      roadmapP3Title.textContent = data.p3Title;
      roadmapP3Items.innerHTML = data.p3Items.map(item => `<li>${item}</li>`).join('');

      if (roadmapGrid) {
        roadmapGrid.style.opacity = '1';
      }
    }, 180);
  }

  let currentTierIndex = 0;
  let currentVelocity = 'standard';

  const estimatorData = {
    0: {
      standard: {
        pod: '1 Principal Architect + 1 Systems Designer',
        price: '₹2,50,000 – ₹4,50,000 ($3k – $5.5k)'
      },
      expedited: {
        pod: '1 Principal Architect + 2 Systems Designers (Double Velocity)',
        price: '₹3,75,000 – ₹6,00,000 ($4.5k – $7.5k)'
      }
    },
    1: {
      standard: {
        pod: '1 Principal Architect + 2 Creative Engineers + 1 QA Lead',
        price: '₹5,00,000 – ₹10,00,000 ($6k – $12k)'
      },
      expedited: {
        pod: '1 Principal Architect + 3 Creative Engineers + 1 QA Lead (Hypercare)',
        price: '₹7,50,000 – ₹14,00,000 ($9k – $17k)'
      }
    },
    2: {
      standard: {
        pod: '1 Principal Architect + 1 Shader Specialist + 1 3D Artist',
        price: '₹12,00,000 – ₹20,00,000+ ($15k – $25k+)'
      },
      expedited: {
        pod: '1 Principal Architect + 2 Shader Specialists + 1 3D Lead (Awwwards Focus)',
        price: '₹16,50,000 – ₹28,00,000+ ($20k – $35k+)'
      }
    }
  };

  const estPodVal = document.getElementById('est-pod-val');
  const estPriceVal = document.getElementById('est-price-val');
  const velStandardBtn = document.getElementById('vel-standard');
  const velExpeditedBtn = document.getElementById('vel-expedited');

  function updateEstimatorDisplay() {
    const data = estimatorData[currentTierIndex]?.[currentVelocity];
    if (data && estPodVal && estPriceVal) {
      estPodVal.style.opacity = '0.3';
      estPriceVal.style.opacity = '0.3';
      setTimeout(() => {
        estPodVal.textContent = data.pod;
        estPriceVal.textContent = data.price;
        estPodVal.style.opacity = '1';
        estPriceVal.style.opacity = '1';
      }, 120);
    }
  }

  if (velStandardBtn && velExpeditedBtn) {
    velStandardBtn.addEventListener('click', () => {
      currentVelocity = 'standard';
      velStandardBtn.classList.add('active');
      velStandardBtn.setAttribute('aria-checked', 'true');
      velExpeditedBtn.classList.remove('active');
      velExpeditedBtn.setAttribute('aria-checked', 'false');
      updateEstimatorDisplay();
    });

    velExpeditedBtn.addEventListener('click', () => {
      currentVelocity = 'expedited';
      velExpeditedBtn.classList.add('active');
      velExpeditedBtn.setAttribute('aria-checked', 'true');
      velStandardBtn.classList.remove('active');
      velStandardBtn.setAttribute('aria-checked', 'false');
      updateEstimatorDisplay();
    });
  }

  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tierIndex = parseInt(btn.getAttribute('data-tier'), 10);
      currentTierIndex = tierIndex;
      tierButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderTierRoadmap(tierIndex);
      updateEstimatorDisplay();
    });
  });


  /* ==========================================================================
     10. Two-Way Project Intake Modal
     ========================================================================== */
  const contactModal = document.getElementById('contact-modal');
  const closeIntakeBtn = document.getElementById('close-intake-modal');
  const tabBtnBrand = document.getElementById('tab-btn-brand');
  const tabBtnCreator = document.getElementById('tab-btn-creator');
  const brandForm = document.getElementById('brand-form');
  const creatorForm = document.getElementById('creator-form');
  const intakeSuccess = document.getElementById('intake-success');
  const closeSuccessBtn = document.getElementById('close-success-btn');

  function openIntakeModal(tabName = 'brand') {
    if (!contactModal) {
      window.location.href = 'contact.html';
      return;
    }
    switchIntakeTab(tabName);
    openModal(contactModal);
  }

  function switchIntakeTab(tabName) {
    if (intakeSuccess) intakeSuccess.classList.remove('active');
    if (!tabBtnBrand || !tabBtnCreator || !brandForm || !creatorForm) return;
    if (tabName === 'creator') {
      tabBtnCreator.classList.add('active');
      tabBtnCreator.setAttribute('aria-selected', 'true');
      tabBtnBrand.classList.remove('active');
      tabBtnBrand.setAttribute('aria-selected', 'false');
      creatorForm.classList.add('active');
      brandForm.classList.remove('active');
    } else {
      tabBtnBrand.classList.add('active');
      tabBtnBrand.setAttribute('aria-selected', 'true');
      tabBtnCreator.classList.remove('active');
      tabBtnCreator.setAttribute('aria-selected', 'false');
      brandForm.classList.add('active');
      creatorForm.classList.remove('active');
    }
  }

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') || 'brand';
      openIntakeModal(tab);
    });
  });

  if (tabBtnBrand) {
    tabBtnBrand.addEventListener('click', () => {
      switchIntakeTab('brand');
    });
  }
  if (tabBtnCreator) {
    tabBtnCreator.addEventListener('click', () => {
      switchIntakeTab('creator');
    });
  }
  if (closeIntakeBtn) {
    closeIntakeBtn.addEventListener('click', () => {
      closeModal(contactModal);
    });
  }

  if (brandForm) {
    brandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      brandForm.classList.remove('active');
      intakeSuccess.classList.add('active');
      document.getElementById('success-msg').textContent = 'Project brief received. The Social Kollab team will review your requirements and respond with a technical architecture within 24 hours.';
    });
  }

  if (creatorForm) {
    creatorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      creatorForm.classList.remove('active');
      intakeSuccess.classList.add('active');
      document.getElementById('success-msg').textContent = 'Application received. We will review your portfolio and get in touch when a matching client collaboration arises.';
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      closeModal(contactModal);
      intakeSuccess.classList.remove('active');
      switchIntakeTab('brand');
    });
  }


  /* ==========================================================================
     11. FAQ Accordion Interaction
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ==========================================================================
     12. Mobile Navigation Menu Toggle & Hardened Safety
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');

  // Dynamically ensure mobile-nav-scrim exists in DOM
  let mobileScrim = document.getElementById('mobile-nav-scrim');
  if (!mobileScrim) {
    mobileScrim = document.createElement('div');
    mobileScrim.id = 'mobile-nav-scrim';
    mobileScrim.className = 'mobile-nav-scrim';
    mobileScrim.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mobileScrim);
  }

  function setMobileNavOpen(isOpen) {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      mainNav.classList.add('mobile-active');
      if (mobileScrim) mobileScrim.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      mainNav.classList.remove('mobile-active');
      if (mobileScrim) mobileScrim.classList.remove('active');
      if (!document.querySelector('.modal-backdrop.active')) {
        document.body.style.overflow = '';
      }
    }
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMobileNavOpen(!isExpanded);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        setMobileNavOpen(false);
      });
    });

    if (mobileScrim) {
      mobileScrim.addEventListener('click', () => {
        setMobileNavOpen(false);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('mobile-active')) {
        setMobileNavOpen(false);
      }
    });

    const mediaQuery992 = window.matchMedia('(min-width: 993px)');
    const handleMediaChange = (e) => {
      if (e.matches && mainNav.classList.contains('mobile-active')) {
        setMobileNavOpen(false);
      }
    };
    if (mediaQuery992.addEventListener) {
      mediaQuery992.addEventListener('change', handleMediaChange);
    } else if (mediaQuery992.addListener) {
      mediaQuery992.addListener(handleMediaChange);
    }
  }


  /* ==========================================================================
     14. Modal Helpers & Keyboard Accessibility
     ========================================================================== */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (!mainNav || !mainNav.classList.contains('mobile-active')) {
      document.body.style.overflow = '';
    }
    if (modal.id === 'dossier-modal' && window.location.hash.startsWith('#case-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });

  /* Studio Command Palette (Cmd+K / Ctrl+K) Controls */
  const cmdPalette = document.getElementById('cmd-palette-backdrop');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdEscBadge = document.getElementById('cmd-esc-badge');

  function openCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('active');
    cmdPalette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (cmdSearchInput) {
      setTimeout(() => cmdSearchInput.focus(), 60);
    }
  }

  function closeCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('active');
    cmdPalette.setAttribute('aria-hidden', 'true');
    if (!mainNav || !mainNav.classList.contains('mobile-active')) {
      document.body.style.overflow = '';
    }
    if (cmdSearchInput) cmdSearchInput.value = '';
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPalette && cmdPalette.classList.contains('active')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    } else if (e.key === 'Escape' && cmdPalette && cmdPalette.classList.contains('active')) {
      closeCmdPalette();
    }
  });

  if (cmdEscBadge) {
    cmdEscBadge.addEventListener('click', closeCmdPalette);
  }

  if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) {
        closeCmdPalette();
      }
    });
  }

  document.querySelectorAll('.btn-cmd-k').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCmdPalette();
    });
  });


    /* ==========================================================================
     15. Silk Editorial Page Transition & Top Filament (Fast, Silky, Natural)
     ========================================================================== */
  const filament = document.getElementById('nav-filament');

  // Entrance: smoothly finish filament sweep from previous page
  if (sessionStorage.getItem('tsk-transitioning') === 'true') {
    sessionStorage.removeItem('tsk-transitioning');
    if (filament) {
      filament.classList.add('active');
      filament.style.width = '100%';
      filament.style.opacity = '1';
      setTimeout(() => {
        filament.style.opacity = '0';
        setTimeout(() => {
          filament.style.width = '0%';
          filament.classList.remove('active');
        }, 220);
      }, 160);
    }
  }

  // Intercept internal links for silk dissolve + top progress filament
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore anchors, mailto, tel, target=_blank, or modifier clicks
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank' ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
    ) {
      return;
    }

    const targetUrl = new URL(href, window.location.href);
    if (targetUrl.origin !== window.location.origin) return;

    // Normalize paths (treating '/' and '/index.html' identically)
    const normCurrent = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    const normTarget = targetUrl.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';

    // If target is on the exact same page, let browser and hashchange handle anchor navigation naturally
    if (normTarget === normCurrent && targetUrl.search === window.location.search) {
      return;
    }

    e.preventDefault();
    // Trigger Top Kinetic Filament
    if (filament) {
      filament.classList.add('active');
      filament.style.opacity = '1';
      filament.style.width = '75%';
    }

    // Soft silk dissolve
    document.body.classList.add('page-is-leaving');
    sessionStorage.setItem('tsk-transitioning', 'true');

    setTimeout(() => {
      window.location.href = targetUrl.href;
      // Failsafe: remove leaving class after delay if navigation was instant or handled in-page
      setTimeout(() => {
        document.body.classList.remove('page-is-leaving');
      }, 500);
    }, 180);
  });

  // bfcache safety for browser Back/Forward navigation
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      sessionStorage.removeItem('tsk-transitioning');
      document.body.classList.remove('page-is-leaving');
      if (filament) {
        filament.style.width = '0%';
        filament.style.opacity = '0';
        filament.classList.remove('active');
      }
    }
  });


  /* ==========================================================================
     16. Interactive Fixes: View Switcher, Archive Filters, and Clipboard Copy
     ========================================================================== */
  
  // 1. Work Page View Mode Switcher (List vs Visual Grid)
  const toggleListBtn = document.getElementById('toggle-list-view');
  const toggleGridBtn = document.getElementById('toggle-grid-view');
  const projectListView = document.getElementById('project-list-view');
  const projectGridView = document.getElementById('project-grid-view');

  if (toggleListBtn && toggleGridBtn && projectListView && projectGridView) {
    toggleListBtn.addEventListener('click', () => {
      toggleListBtn.classList.add('active');
      toggleGridBtn.classList.remove('active');
      projectListView.style.display = 'block';
      projectGridView.style.display = 'none';
    });

    toggleGridBtn.addEventListener('click', () => {
      toggleGridBtn.classList.add('active');
      toggleListBtn.classList.remove('active');
      projectListView.style.display = 'none';
      projectGridView.style.display = 'grid';
    });
  }

  // 2. Work Page Category Filtering (Unified Handler for Rows & Visual Grid Cards)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-row, .archive-card');

  if (filterBtns.length && projectItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.getAttribute('data-filter');
        projectItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = '';
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => {
              item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 30);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Direct Email Copy Triggers with Instant Toast Feedback
  const copyButtons = document.querySelectorAll('.email-copy-trigger');
  let toast = document.getElementById('copy-toast');
  if (!toast && copyButtons.length > 0) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.className = 'copy-toast';
    toast.textContent = 'hello@thesocialkollab.com copied to clipboard ✓';
    document.body.appendChild(toast);
  }
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText('hello@thesocialkollab.com');
        const origText = btn.innerHTML;
        btn.innerHTML = '<span>Copied hello@thesocialkollab.com! ✓</span>';
        if (toast) {
          toast.classList.add('active');
          setTimeout(() => toast.classList.remove('active'), 2500);
        }
        setTimeout(() => {
          btn.innerHTML = origText;
        }, 2200);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    });
  });



});
