import os
import re
import sys
from html.parser import HTMLParser

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_FILES = [
    "index.html",
    "work.html",
    "services.html",
    "collective.html",
    "contact.html",
]
CSS_FILES = [
    os.path.join("styles", "main.css"),
    os.path.join("styles", "tokens.css"),
    os.path.join("styles", "layout.css"),
    os.path.join("styles", "components.css"),
]
JS_FILES = [
    os.path.join("scripts", "theme-init.js"),
    os.path.join("scripts", "main.js"),
    os.path.join("scripts", "work-preview.js"),
    os.path.join("scripts", "plate-depth.js"),
    os.path.join("scripts", "solis-shadows.js"),
]
NO_RAF_JS_FILES = {
    os.path.join("scripts", "theme-init.js"),
    os.path.join("scripts", "main.js"),
    os.path.join("scripts", "work-preview.js"),
    os.path.join("scripts", "plate-depth.js"),
}
REQUIRED_ASSETS = [
    os.path.join("assets", "brand", "favicon.svg"),
    os.path.join("assets", "brand", "sk-mark.svg"),
    os.path.join("assets", "specimens", "uniform-lab.svg"),
    os.path.join("assets", "specimens", "primo-global.svg"),
    os.path.join("assets", "specimens", "yash-ply.svg"),
    os.path.join("assets", "specimens", "trex-store.svg"),
    os.path.join("assets", "specimens", "orthochronicles.svg"),
    os.path.join("assets", "specimens", "kkassociates.svg"),
    os.path.join("assets", "specimens", "nav-manch.svg"),
    os.path.join("assets", "specimens", "uniform-lab.webp"),
    os.path.join("assets", "specimens", "primo-global.webp"),
    os.path.join("assets", "specimens", "yash-ply.webp"),
    os.path.join("assets", "specimens", "trex-store.webp"),
    os.path.join("assets", "specimens", "orthochronicles.webp"),
    os.path.join("assets", "specimens", "kkassociates.webp"),
    os.path.join("assets", "specimens", "nav-manch.webp"),
    os.path.join("assets", "atmosphere", "hero-daylight.webp"),
    os.path.join("assets", "atmosphere", "wakeup-sunlight.webp"),
    os.path.join("assets", "atmosphere", "prefooter-dusk.webp"),
]
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

CSS_MAX_LINES = 1250
CSS_MAX_BYTES = 60 * 1024    # 61440 bytes (< 60 KB)
JS_MAX_LINES = 480
JS_MAX_BYTES = 22 * 1024     # 22528 bytes (< 22 KB)
ASSET_MAX_BYTES = 120 * 1024 # 122880 bytes (<= 120 KB)

errors = []
passes = []


def to_ascii(msg):
    return str(msg).encode("ascii", "backslashreplace").decode("ascii")


def ok(msg):
    safe = to_ascii(msg)
    passes.append(safe)
    print(f"[OK]   {safe}")


def fail(msg):
    safe = to_ascii(msg)
    errors.append(safe)
    print(f"[FAIL] {safe}")


def read_text(rel_path):
    with open(os.path.join(WORKSPACE, rel_path), "r", encoding="utf-8") as fh:
        return fh.read()


class StructureParser(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=False)
        self.filename = filename
        self.stack = []
        self.ids = {}
        self.h1_count = 0
        self.inline_styles = 0
        self.inline_handlers = []
        self.executable_inline_scripts = []
        self.classes = set()
        self.local_refs = []
        self.missing_img_dims = []
        self.ext_links = {}
        self.in_head = False
        self.head_theme_init_pos = None
        self.head_theme_init_attrs = None
        self.head_main_css_pos = None
        self.head_seq = 0
        self.font_links = []
        self.has_theme_color_meta = False
        self.stray_tags = 0

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)
        line, _ = self.getpos()

        if tag == "head":
            self.in_head = True

        if tag not in VOID_TAGS:
            self.stack.append((tag, line))

        if tag == "h1":
            self.h1_count += 1

        if "style" in attr_map:
            self.inline_styles += 1

        for key in attr_map:
            if key and key.lower().startswith("on"):
                self.inline_handlers.append((tag, key, line))

        if "id" in attr_map and attr_map["id"]:
            elem_id = attr_map["id"]
            if elem_id in self.ids:
                fail(f"{self.filename}:{line} duplicate id '#{elem_id}' (first at line {self.ids[elem_id]})")
            else:
                self.ids[elem_id] = line

        if "class" in attr_map and attr_map["class"]:
            for cls in attr_map["class"].split():
                if cls:
                    self.classes.add(cls)

        if tag == "img":
            if "width" not in attr_map or "height" not in attr_map:
                self.missing_img_dims.append((attr_map.get("src", "?"), line))

        if tag == "meta":
            if (attr_map.get("name") or "").lower() == "theme-color" and (attr_map.get("content") or "").strip():
                self.has_theme_color_meta = True

        if tag == "script":
            src_val = (attr_map.get("src") or "").strip()
            stype = (attr_map.get("type") or "").strip().lower()
            if not src_val:
                if stype != "application/ld+json":
                    self.executable_inline_scripts.append((line, stype or "default"))
            elif self.in_head and src_val.split("?")[0] == "scripts/theme-init.js":
                self.head_seq += 1
                self.head_theme_init_pos = (self.head_seq, line)
                self.head_theme_init_attrs = attr_map

        if tag == "link":
            href_val = (attr_map.get("href") or "").strip()
            rel_val = (attr_map.get("rel") or "").strip().lower()
            if href_val.startswith("https://fonts.googleapis.com"):
                self.font_links.append(href_val)
            if self.in_head and "stylesheet" in rel_val and href_val.split("?")[0] == "styles/main.css":
                self.head_seq += 1
                self.head_main_css_pos = (self.head_seq, line)

        for ref_attr in ("href", "src"):
            val = attr_map.get(ref_attr, "")
            if not val or val.startswith(("http://", "https://", "mailto:", "data:", "#")):
                if tag == "a" and val.startswith("https://"):
                    self.ext_links[val] = attr_map.get("rel", "")
                continue
            target = val.split("#")[0].split("?")[0]
            if target:
                self.local_refs.append((target, line))

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        if tag in VOID_TAGS:
            return
        line, _ = self.getpos()
        if not self.stack or self.stack[-1][0] != tag:
            self.stray_tags += 1
            top = self.stack[-1] if self.stack else ("EMPTY", 0)
            fail(f"{self.filename}:{line} stray or mismatched closing </{tag}> (expected </{top[0]}> from line {top[1]})")
            return
        self.stack.pop()


def check_deleted_assets():
    removed = [
        os.path.join("assets", "images", "hero-studio.jpg"),
        os.path.join("assets", "images", "case-fashion.jpg"),
        os.path.join("assets", "images", "case-tech.jpg"),
        os.path.join("assets", "images", "case-beauty.jpg"),
        "cursor-lab.html",
        "work-uniform-lab.html",
        "anti_ai_transformation_plan.md",
        "styles.css",
        "script.js",
        os.path.join("tests", "five_skills_elevation_test.py"),
    ]
    still_there = [p for p in removed if os.path.exists(os.path.join(WORKSPACE, p))]
    if still_there:
        fail(f"Legacy poisoned files still exist: {', '.join(still_there)}")
    else:
        ok("All legacy AI-slop images, CSS/JS monoliths, and cursor-lab purged")


def check_html_and_collect_classes():
    used_classes = set()
    all_ext_links = {}
    required_ids_by_page = {
        "index.html": [
            "main-content", "theme-toggle", "theme-toggle-label",
            "menu-toggle", "mobile-drawer", "solis-shadow-canvas",
            "stage-media", "stage-img-prev", "stage-img", "stage-title",
            "stage-sector", "stage-location", "stage-live-link",
        ],
        "work.html": [
            "main-content", "theme-toggle", "theme-toggle-label",
            "menu-toggle", "mobile-drawer", "solis-shadow-canvas",
            "work-visible-count",
        ],
        "services.html": [
            "main-content", "theme-toggle", "theme-toggle-label",
            "menu-toggle", "mobile-drawer", "solis-shadow-canvas",
        ],
        "collective.html": [
            "main-content", "theme-toggle", "theme-toggle-label",
            "menu-toggle", "mobile-drawer", "solis-shadow-canvas",
        ],
        "contact.html": [
            "main-content", "theme-toggle", "theme-toggle-label",
            "menu-toggle", "mobile-drawer", "solis-shadow-canvas",
            "project-brief-form", "form-status", "submit-brief-btn",
        ],
    }

    theme_init_ok = True
    fonts_ok = True
    inline_script_ok = True
    inline_style_ok = True
    img_dims_ok = True
    local_refs_ok = True
    shadow_canvas_ok = True
    stage_prev_ok = True

    for page in HTML_FILES:
        path = os.path.join(WORKSPACE, page)
        if not os.path.exists(path):
            fail(f"Missing required HTML page: {page}")
            theme_init_ok = False
            fonts_ok = False
            shadow_canvas_ok = False
            continue
        html = read_text(page)
        parser = StructureParser(page)
        parser.feed(html)
        parser.close()

        if parser.stack:
            unclosed = ", ".join(f"<{t}>@{ln}" for t, ln in parser.stack)
            fail(f"{page} has unclosed tags: {unclosed}")
        elif parser.stray_tags == 0:
            ok(f"{page}: zero stray or unclosed HTML tags")

        if parser.h1_count != 1:
            fail(f"{page}: expected exactly 1 <h1>, found {parser.h1_count}")

        if parser.inline_styles > 0:
            inline_style_ok = False
            fail(f"{page}: found {parser.inline_styles} inline style attributes (violates strict CSP)")

        if parser.inline_handlers:
            inline_script_ok = False
            fail(f"{page}: found inline event handler(s): {parser.inline_handlers}")

        if parser.executable_inline_scripts:
            inline_script_ok = False
            fail(f"{page}: found executable inline <script> tag(s) (only application/ld+json allowed): {parser.executable_inline_scripts}")

        if parser.missing_img_dims:
            img_dims_ok = False
            fail(f"{page}: <img> missing width/height: {parser.missing_img_dims}")

        if "alert(" in html:
            fail(f"{page}: contains forbidden alert() dialog")

        if not parser.has_theme_color_meta:
            fail(f"{page}: missing <meta name=\"theme-color\" content=\"...\">")

        # Zero-FOUC head load order gate: scripts/theme-init.js BEFORE styles/main.css
        if parser.head_theme_init_pos is None:
            theme_init_ok = False
            fail(f"{page}: missing <script src=\"scripts/theme-init.js\"> in <head>")
        elif parser.head_main_css_pos is None:
            theme_init_ok = False
            fail(f"{page}: missing <link rel=\"stylesheet\" href=\"styles/main.css\"> in <head>")
        else:
            if parser.head_theme_init_pos[0] >= parser.head_main_css_pos[0]:
                theme_init_ok = False
                fail(
                    f"{page}: scripts/theme-init.js (line {parser.head_theme_init_pos[1]}) "
                    f"must load BEFORE styles/main.css (line {parser.head_main_css_pos[1]})"
                )
            ti_attrs = parser.head_theme_init_attrs or {}
            if "defer" in ti_attrs or "async" in ti_attrs or (ti_attrs.get("type") or "").lower() == "module":
                theme_init_ok = False
                fail(f"{page}: scripts/theme-init.js must be synchronous blocking (no defer/async/module)")

        # Typography contract: Fraunces (SOFT + WONK) + DM Sans
        joined_fonts = " ".join(parser.font_links)
        if not (
            "Fraunces" in joined_fonts
            and "SOFT" in joined_fonts
            and "WONK" in joined_fonts
            and ("DM+Sans" in joined_fonts or "DM Sans" in joined_fonts)
        ):
            fonts_ok = False
            fail(f"{page}: Google Fonts link missing Fraunces (SOFT/WONK) or DM Sans")

        # Required DOM hooks per page
        missing_ids = [req_id for req_id in required_ids_by_page.get(page, []) if req_id not in parser.ids]
        if missing_ids:
            if "solis-shadow-canvas" in missing_ids:
                shadow_canvas_ok = False
            if page == "index.html" and "stage-img-prev" in missing_ids:
                stage_prev_ok = False
            fail(f"{page}: missing required DOM id(s): {missing_ids}")

        for ref, line in parser.local_refs:
            ref_path = os.path.join(WORKSPACE, ref.replace("/", os.sep))
            if not os.path.exists(ref_path):
                local_refs_ok = False
                fail(f"{page}:{line} broken local reference '{ref}'")

        used_classes.update(parser.classes)
        all_ext_links.update(parser.ext_links)

    if theme_init_ok:
        ok("All 5 HTML pages load synchronous scripts/theme-init.js before styles/main.css")
    if fonts_ok:
        ok("All 5 HTML pages load Fraunces (SOFT/WONK) and DM Sans cleanly")
    if shadow_canvas_ok:
        ok("All 5 HTML pages include #solis-shadow-canvas dappled sunlight hero wall")
    if stage_prev_ok:
        ok("index.html includes #stage-img-prev dual-layer hero image transition hook")
    if inline_script_ok:
        ok("Zero executable inline <script> tags and zero inline event handlers across all 5 pages")
    if inline_style_ok:
        ok("Zero inline style=\"\" attributes across all 5 pages")
    if img_dims_ok:
        ok("All <img> tags specify explicit width and height attributes")
    if local_refs_ok:
        ok("All local href/src references resolve to existing workspace files")

    return used_classes, all_ext_links


def check_css(used_classes):
    total_lines = 0
    total_bytes = 0
    defined_tokens = set()
    referenced_tokens = set()
    defined_classes = set()
    raw_color_violations = False
    forbidden_css_violations = False
    all_css_no_comments = []

    hex_pattern = re.compile(r"#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})(?![a-zA-Z0-9_-])")
    rgba_pattern = re.compile(r"\brgba?\s*\(")

    for css_rel in CSS_FILES:
        full_path = os.path.join(WORKSPACE, css_rel)
        if not os.path.exists(full_path):
            fail(f"Missing stylesheet: {css_rel}")
            return
        content = read_text(css_rel)
        lines = content.splitlines()
        total_lines += len(lines)
        total_bytes += os.path.getsize(full_path)

        if "!important" in content:
            forbidden_css_violations = True
            fail(f"{css_rel}: contains forbidden !important override")
        if "backdrop-filter" in content:
            forbidden_css_violations = True
            fail(f"{css_rel}: contains forbidden backdrop-filter")
        if re.search(r"cursor\s*:\s*none", content):
            forbidden_css_violations = True
            fail(f"{css_rel}: contains forbidden cursor: none")

        clean_no_comments = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
        all_css_no_comments.append(clean_no_comments)

        if css_rel != os.path.join("styles", "tokens.css"):
            hex_hits = hex_pattern.findall(clean_no_comments)
            rgba_hits = rgba_pattern.findall(clean_no_comments)
            if hex_hits:
                raw_color_violations = True
                fail(f"{css_rel}: raw hex color(s) outside tokens.css: {hex_hits}")
            if rgba_hits:
                raw_color_violations = True
                fail(f"{css_rel}: raw rgb/rgba color(s) outside tokens.css: {rgba_hits}")

        defined_tokens.update(re.findall(r"(--[a-zA-Z0-9_-]+)\s*:", clean_no_comments))
        referenced_tokens.update(re.findall(r"var\(\s*(--[a-zA-Z0-9_-]+)", clean_no_comments))
        defined_classes.update(re.findall(r"\.([a-zA-Z_-][a-zA-Z0-9_-]*)", clean_no_comments))

    if not forbidden_css_violations:
        ok("Zero !important, zero backdrop-filter, and zero cursor: none in CSS")

    if total_lines >= CSS_MAX_LINES:
        fail(f"CSS line budget exceeded: {total_lines} lines (limit < {CSS_MAX_LINES})")
    else:
        ok(f"CSS line budget passed: {total_lines} lines (< {CSS_MAX_LINES})")

    if total_bytes >= CSS_MAX_BYTES:
        fail(f"CSS byte budget exceeded: {total_bytes} bytes (limit < {CSS_MAX_BYTES})")
    else:
        ok(f"CSS size budget passed: {total_bytes} bytes (< {CSS_MAX_BYTES // 1024} KB)")

    undefined_tokens = sorted(referenced_tokens - defined_tokens)
    if undefined_tokens:
        fail(f"Undefined CSS custom properties: {undefined_tokens}")
    elif not raw_color_violations:
        ok("Zero undefined CSS tokens and zero raw hex/rgba outside tokens.css")

    # Daylight Dual-Theme & Typography gates in CSS
    tokens_css = read_text(os.path.join("styles", "tokens.css"))
    amber_match = re.search(r'\[data-theme\s*=\s*"amber"\]\s*\{([^}]*)\}', tokens_css, flags=re.DOTALL)
    if not amber_match:
        fail('styles/tokens.css missing [data-theme="amber"] dual-theme token block')
    else:
        amber_body = amber_match.group(1)
        required_amber_tokens = ["--color-bg", "--color-text", "--color-accent", "--specimen-filter"]
        missing_amber = [t for t in required_amber_tokens if t not in amber_body]
        if missing_amber:
            fail(f'styles/tokens.css [data-theme="amber"] missing token(s): {missing_amber}')
        else:
            ok('styles/tokens.css defines [data-theme="amber"] Circadian Amber Dusk tokens')

    if "Fraunces" in tokens_css and "DM Sans" in tokens_css:
        ok("styles/tokens.css configures Fraunces display and DM Sans UI font tokens")
    else:
        fail("styles/tokens.css missing Fraunces or DM Sans font family tokens")

    combined_css = "\n".join(all_css_no_comments)
    if re.search(r'font-variation-settings\s*:[^;]*SOFT[^;]*WONK|font-variation-settings\s*:[^;]*WONK[^;]*SOFT', combined_css):
        ok("Fraunces font-variation-settings (SOFT + WONK) verified in CSS")
    else:
        fail("CSS missing Fraunces font-variation-settings calibrating SOFT and WONK")

    main_css = read_text(os.path.join("styles", "main.css"))
    if "@view-transition" in main_css and "navigation: none" in main_css:
        ok("Cross-document @view-transition with reduced-motion disable verified")
    else:
        fail("styles/main.css missing @view-transition or reduced-motion disable")

    if "theme-radial" in main_css and "is-theme-transition" in main_css and "clip-path: circle(" in main_css:
        ok("styles/main.css defines circular theme-radial View Transition")
    else:
        fail("styles/main.css missing circular theme-radial View Transition (theme-radial / is-theme-transition / clip-path: circle)")

    if "@layer utilities" in main_css and main_css.find("@layer utilities") < main_css.rfind("prefers-reduced-motion"):
        ok("Global prefers-reduced-motion override sits in highest-priority @layer utilities")
    else:
        fail("styles/main.css reduced-motion override must live inside @layer utilities")

    if "overflow-x: clip" in main_css:
        ok("styles/main.css uses sticky-safe overflow-x: clip")
    else:
        fail("styles/main.css missing sticky-safe overflow-x: clip")

    comp_css = read_text(os.path.join("styles", "components.css"))
    if "html.js-ready [data-reveal]" in comp_css and ".is-revealed" in comp_css:
        ok("styles/components.css defines progressive html.js-ready [data-reveal] reveal system")
    else:
        fail("styles/components.css missing progressive html.js-ready [data-reveal] / .is-revealed rules")

    missing_classes = sorted(used_classes - defined_classes)
    if missing_classes:
        fail(f"HTML classes missing in styles/*.css: {missing_classes}")
    else:
        ok(f"All {len(used_classes)} HTML classes have 100% parity in styles/*.css")


def check_js_and_assets():
    total_lines = 0
    total_bytes = 0
    js_hygiene_ok = True

    for js_rel in JS_FILES:
        full_path = os.path.join(WORKSPACE, js_rel)
        if not os.path.exists(full_path):
            fail(f"Missing script: {js_rel}")
            return
        content = read_text(js_rel)
        total_lines += len(content.splitlines())
        total_bytes += os.path.getsize(full_path)

        if js_rel in NO_RAF_JS_FILES and "requestAnimationFrame" in content:
            js_hygiene_ok = False
            fail(f"{js_rel}: contains forbidden requestAnimationFrame loop")
        if "alert(" in content:
            js_hygiene_ok = False
            fail(f"{js_rel}: contains forbidden alert()")
        if 'setAttribute("style"' in content or "setAttribute('style'" in content:
            js_hygiene_ok = False
            fail(f"{js_rel}: forbidden setAttribute('style') violates strict CSP")

    if total_lines >= JS_MAX_LINES:
        fail(f"JS line budget exceeded: {total_lines} lines (limit < {JS_MAX_LINES})")
    else:
        ok(f"JS line budget passed: {total_lines} lines (< {JS_MAX_LINES}) across 5 scripts")

    if total_bytes >= JS_MAX_BYTES:
        fail(f"JS byte budget exceeded: {total_bytes} bytes (limit < {JS_MAX_BYTES})")
    else:
        ok(f"JS size budget passed: {total_bytes} bytes (< {JS_MAX_BYTES // 1024} KB) across 5 scripts")

    if js_hygiene_ok:
        ok("Zero requestAnimationFrame in core 4 scripts, zero alert(), and zero CSP-unsafe setAttribute('style') in JS")

    # Verify scripts/solis-shadows.js RAF guardrails
    solis_js = read_text(os.path.join("scripts", "solis-shadows.js"))
    missing_guards = [
        g for g in ("IntersectionObserver", "visibilitychange", "prefers-reduced-motion")
        if g not in solis_js
    ]
    if missing_guards:
        fail(f"scripts/solis-shadows.js missing required RAF guard(s): {missing_guards}")
    else:
        ok("scripts/solis-shadows.js gates animation with IntersectionObserver, visibilitychange, and prefers-reduced-motion")

    # Verify scripts/theme-init.js behavior contract
    theme_init = read_text(os.path.join("scripts", "theme-init.js"))
    if (
        "localStorage" in theme_init
        and "tsk-theme" in theme_init
        and "data-theme" in theme_init
        and "amber" in theme_init
        and "try" in theme_init
        and "catch" in theme_init
    ):
        ok("scripts/theme-init.js safely reads localStorage('tsk-theme') inside try/catch for zero-FOUC amber init")
    else:
        fail("scripts/theme-init.js missing try/catch localStorage('tsk-theme') -> data-theme='amber' logic")

    missing_assets = [p for p in REQUIRED_ASSETS if not os.path.exists(os.path.join(WORKSPACE, p))]
    if missing_assets:
        fail(f"Missing required SVG asset(s): {missing_assets}")
    else:
        ok(f"All {len(REQUIRED_ASSETS)} required brand and client specimen SVGs present")

    assets_dir = os.path.join(WORKSPACE, "assets")
    oversized = []
    asset_count = 0
    for root, _, files in os.walk(assets_dir):
        for fname in files:
            asset_count += 1
            size = os.path.getsize(os.path.join(root, fname))
            if size > ASSET_MAX_BYTES:
                oversized.append((fname, size))
    if oversized or asset_count == 0:
        fail(f"Asset check issue: count={asset_count}, oversized={oversized}")
    else:
        ok(f"All {asset_count} assets are <= 120 KB")


def check_truth_and_anti_slop(ext_links):
    banned_words = [
        "flagship", "atelier", "bespoke", "protocol", "monolith",
        "hypercare", "syndicate", "anti-ai", "dennis snellenberg",
        "justinmind", "lumina organics", "aurora atelier",
        "karan malhotra", "3.8x", "14cr", "4.6x", "32k+", "+80%", "$r_",
        "cdnjs.cloudflare.com", "three.min.js", "gsap.min.js", "lenis",
        "e-ink", "dc-1", "backlight", "tablet computer",
    ]
    banned_emojis = [
        "\u26a1", "\U0001f50d", "\U0001f4cb",
        "\u2600", "\u263e", "\u263d", "\U0001f319",
    ]
    scan_targets = (
        HTML_FILES
        + CSS_FILES
        + JS_FILES
        + [os.path.join("data", "studio-data.js")]
        + [p for p in REQUIRED_ASSETS if p.endswith(".svg") and os.path.exists(os.path.join(WORKSPACE, p))]
    )

    slop_hits = []
    for rel in scan_targets:
        full_path = os.path.join(WORKSPACE, rel)
        if not os.path.exists(full_path):
            continue
        text = read_text(rel)
        lowered = text.lower()
        for word in banned_words:
            if word in lowered:
                slop_hits.append(f"{rel}: banned term '{word}'")
        for em in banned_emojis:
            if em in text:
                slop_hits.append(f"{rel}: banned emoji {repr(em)}")

    if slop_hits:
        fail("Anti-slop / anti-cosplay violations found: " + "; ".join(slop_hits))
    else:
        ok("Zero AI-slop jargon, zero hardware cosplay terms, zero fake KPIs, zero banned CDNs, zero UI emojis")

    required_urls = [
        "https://www.instagram.com/thesocialkollab/",
        "https://theuniformlab.in",
        "https://primoglobal.in",
        "https://yashply.in",
        "https://thetrexstore.com",
        "https://orthochronicles.com",
        "https://kkassociate.com",
        "https://navmanchnews.com",
    ]
    url_ok = True
    for url in required_urls:
        if url not in ext_links:
            url_ok = False
            fail(f"Missing verified outbound link: {url}")
        elif "noopener" not in ext_links[url] or "noreferrer" not in ext_links[url]:
            url_ok = False
            fail(f"Outbound link missing rel='noopener noreferrer': {url}")
    if url_ok:
        ok("All 7 verified client URLs + official Instagram linked with rel='noopener noreferrer'")

    idx = read_text("index.html")
    if "TheSocialKollab" in idx and "Karan Chaturbhuj" in idx:
        ok("Canonical branding 'TheSocialKollab' and founder 'Karan Chaturbhuj' verified")
    else:
        fail("Missing canonical 'TheSocialKollab' or 'Karan Chaturbhuj' in index.html")


def check_security_headers():
    for cfg in ("netlify.toml", "vercel.json", "_headers"):
        content = read_text(cfg)
        if "script-src 'self'" not in content:
            fail(f"{cfg}: missing strict script-src 'self'")
        elif "cdnjs.cloudflare.com" in content or "'unsafe-inline'" in content:
            fail(f"{cfg}: still permits unsafe-inline or legacy CDN")
        elif "frame-ancestors 'none'" not in content:
            fail(f"{cfg}: missing frame-ancestors 'none'")
        else:
            ok(f"{cfg}: strict CSP and frame-ancestors hardened")

    for rcfg in ("netlify.toml", "vercel.json"):
        rc = read_text(rcfg)
        if "/work-uniform-lab" in rc and "/cursor-lab" in rc:
            ok(f"{rcfg}: permanent redirects configured for removed legacy URLs")
        else:
            fail(f"{rcfg}: missing legacy redirects")


def check_daylight_reverse_engineered_architecture(used_classes):
    idx = read_text("index.html")
    required_daylight_hooks = [
        "brand-mark", "header-island", "chapter-pill", "hero-window",
        "introduction-section", "sun-phase-motif", "scrub-word",
        "peripheral-constellation", "hscroll-track", "pillar-strip",
        "night-realm", "dive-card", "split-sticky-title", "proof-note",
        "proof-avatar", "proof-domains", "sun-emblem", "glance-strip",
        "prefooter-wordmark", "btn-amber-wide",
    ]
    missing_hooks = [h for h in required_daylight_hooks if h not in idx]
    if missing_hooks:
        fail(f"index.html missing reverse-engineered Daylight architecture hook(s): {missing_hooks}")
    else:
        ok("index.html implements all reverse-engineered daylightcomputer.com spatial, motif, and scrollytelling mechanics")

    # Verify real .webp website images are used in index.html, work.html, and data/studio-data.js
    work_html = read_text("work.html")
    studio_data = read_text(os.path.join("data", "studio-data.js"))
    webp_slugs = [
        "uniform-lab.webp", "primo-global.webp", "yash-ply.webp",
        "trex-store.webp", "orthochronicles.webp", "kkassociates.webp", "nav-manch.webp",
    ]
    missing_webp_refs = [
        s for s in webp_slugs
        if s not in idx or s not in work_html or s not in studio_data
    ]
    if missing_webp_refs:
        fail(f"Missing real .webp website screenshot reference(s) in HTML/data: {missing_webp_refs}")
    else:
        ok("All 7 live client websites use real high-resolution .webp screenshots across index.html, work.html, and studio-data.js")

    # Verify zero crooked card rotations in components.css
    comp_css = read_text(os.path.join("styles", "components.css"))
    layout_css = read_text(os.path.join("styles", "layout.css"))
    if re.search(r"\.(?:folio-card|peripheral-note|proof-note)[^{]*\{[^}]*rotate\s*\(", comp_css):
        fail("styles/components.css still contains crooked rotate() transforms on cards")
    else:
        ok("Zero crooked rotate() transforms on .folio-card, .peripheral-note, and .proof-note cards")

    if re.search(r"\.folio-meta\s*\{[^}]*flex-wrap\s*:\s*nowrap", comp_css) and re.search(r"\.dive-illustration\s*\{[^}]*min-height\s*:\s*0", comp_css):
        ok("Single-line .folio-meta (flex-wrap: nowrap) and non-clipping .dive-illustration (min-height: 0) enforced")
    else:
        fail("styles/components.css missing .folio-meta flex-wrap: nowrap or .dive-illustration min-height: 0")

    if ":root.is-scrolled .site-header" in layout_css and ".stage-tabs.is-ready::before" in comp_css:
        ok("Scrolled top header scrim and zero-FOUC .stage-tabs.is-ready::before indicator verified")
    else:
        fail("Missing :root.is-scrolled .site-header scrim or .stage-tabs.is-ready::before transition gate")

    # Verify Sunlit Sandstone, Botanical Olive-Forest & Terracotta-Amber palette tokens and v5 Daylight architecture
    tokens_css = read_text(os.path.join("styles", "tokens.css"))
    if "#F3ECE1" in tokens_css and "#223B2D" in tokens_css and "#C85214" in tokens_css and "#111410" in tokens_css and "#F5A623" in tokens_css:
        ok("Sunlit Sandstone & Terracotta-Amber palette (#F3ECE1 / #223B2D / #C85214 / #111410 / #F5A623) verified in tokens.css")
    else:
        fail("styles/tokens.css missing Sunlit Sandstone & Terracotta-Amber palette tokens (#F3ECE1, #223B2D, #C85214, #111410, #F5A623)")

    idx_html = read_text("index.html")
    if (
        "?v=5" in idx_html
        and "hero-daylight.webp" in idx_html
        and "wakeup-sunlight.webp" in idx_html
        and "prefooter-dusk.webp" in idx_html
        and "dusk-bridge" in idx_html
        and "manifesto-beat-2" in idx_html
    ):
        ok("v5 cache-busted assets, 3 atmospheric photos, dual-beat manifesto, and dusk bridge verified in index.html")
    else:
        fail("index.html missing required v5 cache-busting, atmospheric photography, dual-beat manifesto, or dusk-bridge hooks")

    services_html = read_text("services.html")
    collective_html = read_text("collective.html")
    contact_html = read_text("contact.html")
    subpage_checks = [
        ("work.html", "work-spotlight" in work_html),
        ("services.html marquee", "marquee-track" in services_html),
        ("services.html #specs", "specs-banner" in services_html and "specs-ledger" in services_html),
        ("collective.html charter", "studio-charter" in collective_html),
        ("contact.html FAQ modules", "faq-jump-grid" in contact_html and "faq-notebook" in contact_html),
    ]
    failed_subpages = [name for name, passed in subpage_checks if not passed]
    if failed_subpages:
        fail(f"Missing reverse-engineered Daylight subpage module(s): {failed_subpages}")
    else:
        ok("All 4 Daylight subpage modules verified across work.html, services.html, collective.html, and contact.html")

    banned_generic_grids = {"principles-grid", "cap-grid", "process-grid"}
    still_used = sorted(banned_generic_grids & used_classes)
    if still_used:
        fail(f"Generic grid class(es) still present in HTML: {still_used}")
    else:
        ok("Zero generic box grids (.principles-grid, .cap-grid, .process-grid) across all 5 HTML pages")


def main():
    print("============================================================")
    print("THESOCIALKOLLAB - DAYLIGHT LIVING SHADOWS SHIP AUDIT")
    print("============================================================")
    check_deleted_assets()
    used_classes, ext_links = check_html_and_collect_classes()
    check_css(used_classes)
    check_js_and_assets()
    check_truth_and_anti_slop(ext_links)
    check_security_headers()
    check_daylight_reverse_engineered_architecture(used_classes)
    print("============================================================")
    print(f"Passed: {len(passes)} | Failed: {len(errors)}")
    print("============================================================")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
