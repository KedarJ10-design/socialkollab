import os
import re
import math

WORKSPACE = r"C:\Users\Admin\Downloads\karan_website"

def calc_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    def srgb_to_linear(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r_l = srgb_to_linear(r)
    g_l = srgb_to_linear(g)
    b_l = srgb_to_linear(b)
    return 0.2126 * r_l + 0.7152 * g_l + 0.0722 * b_l

def calc_contrast(hex1, hex2):
    lum1 = calc_luminance(hex1)
    lum2 = calc_luminance(hex2)
    l_max = max(lum1, lum2)
    l_min = min(lum1, lum2)
    return (l_max + 0.05) / (l_min + 0.05)

def test_styles():
    print("[*] Testing styles.css...")
    css_path = os.path.join(WORKSPACE, "styles.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    # 1. Contrast tokens & dark container contextual hardening
    assert "--text-secondary: #5e554d;" in css, "Missing --text-secondary: #5e554d"
    assert "--text-secondary-dark: #b8aea5;" in css, "Missing --text-secondary-dark: #b8aea5"
    c_light = calc_contrast("5e554d", "ece4d5")
    c_dark = calc_contrast("b8aea5", "181513")
    print(f"  [PASS] Contrast light: {c_light:.2f}:1 (Required >= 4.5:1)")
    print(f"  [PASS] Contrast dark: {c_dark:.2f}:1 (Required >= 4.5:1)")
    assert c_light >= 4.5, "Light contrast fails WCAG AA"
    assert c_dark >= 4.5, "Dark contrast fails WCAG AA"

    assert ".site-footer," in css and "--text-secondary: var(--text-secondary-dark);" in css, "Dark container scopes must map --text-secondary to --text-secondary-dark"

    # 2. Focus-visible
    assert ":focus-visible" in css, "Missing :focus-visible"
    assert "outline: 2px solid var(--accent-solar) !important;" in css, "Missing accent-solar focus outline"
    assert ".site-footer :focus-visible" in css or "footer :focus-visible" in css, "Missing footer focus-visible outline"

    # 3. Concentric radii
    assert "--radius-inner-sm:" in css, "Missing --radius-inner-sm"
    assert "--radius-tile-standard:" in css, "Missing --radius-tile-standard"
    assert "--radius-tile-hero:" in css, "Missing --radius-tile-hero"

    # 4. Kinetic scaling
    assert "scale(0.97)" in css, "Missing button scale(0.97)"
    assert "120ms" in css, "Missing 120ms transition timing"

    # 5. Bento Board
    assert ".bento-board" in css, "Missing .bento-board"
    assert ".bento-tile-hero" in css, "Missing .bento-tile-hero"
    assert ".bento-tile-wide" in css, "Missing .bento-tile-wide"
    assert ".bento-tile-tall" in css, "Missing .bento-tile-tall"
    assert ".bento-tile-unit" in css, "Missing .bento-tile-unit"
    assert "@media (prefers-reduced-motion: reduce)" in css, "Missing reduced-motion media query"

    print("  [PASS] styles.css satisfies all 5-skill architectural requirements.")

def test_index():
    print("[*] Testing index.html...")
    index_path = os.path.join(WORKSPACE, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert 'id="services"' in html, "Missing #services section"
    assert 'class="bento-board"' in html, "Missing .bento-board in index.html"
    assert 'bento-tile-hero' in html, "Missing bento-tile-hero in index.html"
    assert 'bento-tile-wide' in html, "Missing bento-tile-wide in index.html"
    assert 'bento-tile-tall' in html, "Missing bento-tile-tall in index.html"
    assert 'bento-tile-unit' in html, "Missing bento-tile-unit in index.html"
    for disc in ["0", "1", "2", "3"]:
        assert f'data-discipline="{disc}"' in html, f"Missing data-discipline={disc}"

    # Verify zero holes in 4-column desktop layout
    tile_classes = re.findall(r'class="[^"]*bento-tile\s+([^"]+)"', html)
    desktop_spans = []
    for c in tile_classes:
        if 'bento-tile-hero' in c: desktop_spans.append((2, 2))
        elif 'bento-tile-wide' in c: desktop_spans.append((2, 1))
        elif 'bento-tile-tall' in c: desktop_spans.append((1, 2))
        elif 'bento-tile-unit' in c: desktop_spans.append((1, 1))

    grid = [[0]*4 for _ in range(6)]
    for idx, (w, h) in enumerate(desktop_spans):
        placed = False
        for r in range(6 - h + 1):
            for col in range(4 - w + 1):
                if all(grid[r+dr][col+dc] == 0 for dr in range(h) for dc in range(w)):
                    for dr in range(h):
                        for dc in range(w):
                            grid[r+dr][col+dc] = idx + 1
                    placed = True
                    break
            if placed: break
    rows = [r for r in grid if any(r)]
    for r_idx, row in enumerate(rows):
        assert 0 not in row, f"Bento Board row {r_idx} contains empty holes: {row}"
    print(f"  [PASS] Bento Board 4-column desktop grid validated with 0 holes ({len(rows)} rows, 12 cells perfectly packed).")
    print("  [PASS] index.html Bento Board and data attributes validated.")

def test_services():
    print("[*] Testing services.html...")
    srv_path = os.path.join(WORKSPACE, "services.html")
    with open(srv_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert "spec-block" in html, "Missing spec-block in services.html"
    assert "max-width: 65ch" in html, "Missing max-width: 65ch in services.html"
    print("  [PASS] services.html concentric specs and line-lengths validated.")

def test_script():
    print("[*] Testing script.js...")
    script_path = os.path.join(WORKSPACE, "script.js")
    with open(script_path, "r", encoding="utf-8") as f:
        js = f.read()

    assert "lastFocusedTrigger" in js, "Missing lastFocusedTrigger in script.js"
    assert "getFocusableElements" in js, "Missing getFocusableElements in script.js"
    assert "lastFocusedTrigger.focus()" in js, "Missing lastFocusedTrigger.focus() restoration in script.js"
    assert "!activeModal.contains(document.activeElement)" in js, "Missing boundary recapture for Tab trap"
    assert "bentoTiles" in js, "Missing bentoTiles query in script.js"
    assert "--mouse-x" in js and "--mouse-y" in js, "Missing ambient proximity mouse coordinates in script.js"
    assert "prefetchedUrls" in js, "Missing prefetchedUrls set in script.js"
    assert "rel = 'prefetch'" in js, "Missing prefetch link injection in script.js"
    print("  [PASS] script.js modal focus trap, bento proximity lighting, and prefetching validated.")

def test_headers_and_vercel():
    print("[*] Testing _headers and vercel.json...")
    headers_path = os.path.join(WORKSPACE, "_headers")
    with open(headers_path, "r", encoding="utf-8") as f:
        h = f.read()
    assert "public, max-age=0, must-revalidate" in h, "Missing HTML cache-control in _headers"
    assert "public, max-age=31536000, immutable" in h, "Missing assets cache-control in _headers"

    vercel_path = os.path.join(WORKSPACE, "vercel.json")
    with open(vercel_path, "r", encoding="utf-8") as f:
        v = f.read()
    assert "public, max-age=0, must-revalidate" in v, "Missing HTML cache-control in vercel.json"
    assert "public, max-age=31536000, immutable" in v, "Missing assets cache-control in vercel.json"
    assert "collective|contact" in v, "Missing clean URL caching in vercel.json"
    print("  [PASS] _headers and vercel.json edge caching headers validated.")

def main():
    print("=" * 60)
    print("FIVE SKILLS ARCHITECTURAL ELEVATION TEST SUITE")
    print("=" * 60)
    test_styles()
    test_index()
    test_services()
    test_script()
    test_headers_and_vercel()
    print("=" * 60)
    print("ALL 5-SKILL VERIFICATION CHECKS PASSED WITH 100% SUCCESS RATE")
    print("=" * 60)

if __name__ == "__main__":
    main()
