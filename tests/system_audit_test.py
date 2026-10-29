import os
import sys
import re
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"
WORKSPACE = r"C:\Users\Admin\Downloads\karan_website"

PAGES = [
    "index.html",
    "work.html",
    "work-uniform-lab.html",
    "services.html",
    "collective.html",
    "contact.html"
]

def log(msg, status="INFO"):
    symbol = "OK" if status == "PASS" else ("FAIL" if status == "FAIL" else "*")
    print(f"[{symbol}] [{status}] {msg}")

def test_page_availability():
    log("Running TC-01: Page Availability and HTTP 200 checks", "INFO")
    all_passed = True
    for page in PAGES:
        url = f"{BASE_URL}/{page}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (SecurityAuditor/1.0)'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    log(f"HTTP 200 OK: {page}", "PASS")
                else:
                    log(f"Unexpected status {response.status}: {page}", "FAIL")
                    all_passed = False
        except Exception as e:
            log(f"Failed to load {page}: {e}", "FAIL")
            all_passed = False
    return all_passed

def test_seo_and_metadata():
    log("Running TC-02: SEO & Meta Tag Verification", "INFO")
    all_passed = True
    for page in PAGES:
        filepath = os.path.join(WORKSPACE, page)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Check canonical
        if '<link rel="canonical" href="https://thesocialkollab.com' in content:
            log(f"Canonical tag present in {page}", "PASS")
        else:
            log(f"Missing canonical tag in {page}", "FAIL")
            all_passed = False

        # Check OpenGraph image is absolute URL
        og_match = re.search(r'<meta property="og:image" content="([^"]+)"', content)
        if og_match and og_match.group(1).startswith("https://thesocialkollab.com/"):
            log(f"Absolute og:image present in {page}: {og_match.group(1)}", "PASS")
        else:
            log(f"Missing or relative og:image in {page}", "FAIL")
            all_passed = False

        # Check Twitter Card
        if '<meta name="twitter:card" content="summary_large_image">' in content:
            log(f"Twitter card metadata present in {page}", "PASS")
        else:
            log(f"Missing twitter:card in {page}", "FAIL")
            all_passed = False

    # Check robots.txt and sitemap.xml
    robots_path = os.path.join(WORKSPACE, "robots.txt")
    sitemap_path = os.path.join(WORKSPACE, "sitemap.xml")
    if os.path.exists(robots_path) and os.path.getsize(robots_path) > 0:
        log("robots.txt exists and is non-empty", "PASS")
    else:
        log("robots.txt missing or empty", "FAIL")
        all_passed = False

    if os.path.exists(sitemap_path) and os.path.getsize(sitemap_path) > 0:
        log("sitemap.xml exists and is non-empty", "PASS")
    else:
        log("sitemap.xml missing or empty", "FAIL")
        all_passed = False

    # Check JSON-LD in index.html
    index_path = os.path.join(WORKSPACE, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        idx_content = f.read()
    json_ld_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', idx_content, re.DOTALL)
    if json_ld_match:
        try:
            parsed = json.loads(json_ld_match.group(1))
            if parsed.get("@type") == "ProfessionalService" and parsed.get("name") == "The Social Kollab":
                log("Valid Schema.org ProfessionalService JSON-LD found in index.html", "PASS")
            else:
                log("Schema.org JSON-LD missing expected @type/name", "FAIL")
                all_passed = False
        except Exception as e:
            log(f"JSON-LD syntax error in index.html: {e}", "FAIL")
            all_passed = False
    else:
        log("JSON-LD script block missing from index.html", "FAIL")
        all_passed = False

    return all_passed

def test_prototype_pollution_hardening():
    log("Running TC-03: Prototype Pollution Defense Verification in script.js", "INFO")
    script_path = os.path.join(WORKSPACE, "script.js")
    with open(script_path, "r", encoding="utf-8") as f:
        js_code = f.read()

    # Verify hasOwnProperty checks
    patterns = [
        r"!Object\.prototype\.hasOwnProperty\.call\(\s*dossierData,\s*caseId\s*\)",
        r"Object\.prototype\.hasOwnProperty\.call\(\s*dossierData,\s*caseId\s*\)"
    ]
    all_found = True
    for pattern in patterns:
        if re.search(pattern, js_code):
            log(f"Found prototype defense pattern: {pattern}", "PASS")
        else:
            log(f"Missing prototype defense pattern: {pattern}", "FAIL")
            all_found = False

    # Check for direct unsafe dossierData[caseId] lookup without protection
    # Unsafe would be: if (dossierData[caseId])
    unsafe_matches = re.findall(r'if\s*\(\s*dossierData\[caseId\]\s*\)', js_code)
    if len(unsafe_matches) == 0:
        log("Zero unshielded `if (dossierData[caseId])` references detected", "PASS")
    else:
        log(f"Found {len(unsafe_matches)} unsafe direct accesses!", "FAIL")
        all_found = False

    return all_found

def test_secrets_scanning():
    log("Running TC-04: Static Code Secrets Scanning", "INFO")
    secret_patterns = [
        (r'(?i)api[_-]?key\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']', "API Key pattern"),
        (r'(?i)secret[_-]?key\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']', "Secret Key pattern"),
        (r'(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}', "Bearer token pattern"),
        (r'(?i)aws[_-]?(?:access|secret)', "AWS credential keyword"),
        (r'-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----', "Private key header")
    ]
    
    clean = True
    for root, dirs, files in os.walk(WORKSPACE):
        dirs[:] = [d for d in dirs if d not in [".git", "node_modules", ".gemini", ".agents"]]
        for fname in files:
            if not fname.endswith(('.html', '.js', '.css', '.json', '.xml', '.txt')):
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for pattern, desc in secret_patterns:
                        matches = re.findall(pattern, content)
                        if matches:
                            log(f"Potential secret found in {fname}: {desc}", "FAIL")
                            clean = False
            except Exception:
                pass

    if clean:
        log("Repository clean: 0 hardcoded secrets or sensitive tokens detected", "PASS")
    return clean

def test_security_headers_file():
    log("Running TC-05: _headers File Verification", "INFO")
    headers_path = os.path.join(WORKSPACE, "_headers")
    if not os.path.exists(headers_path):
        log("_headers file is missing", "FAIL")
        return False

    with open(headers_path, "r", encoding="utf-8") as f:
        content = f.read()

    required_headers = [
        "X-Frame-Options: DENY",
        "X-Content-Type-Options: nosniff",
        "Referrer-Policy: strict-origin-when-cross-origin",
        "Content-Security-Policy:"
    ]
    
    all_present = True
    for h in required_headers:
        if h in content:
            log(f"Header specification present: {h}", "PASS")
        else:
            log(f"Missing header specification: {h}", "FAIL")
            all_present = False

    return all_present

def main():
    print("=" * 60)
    print("THE SOCIAL KOLLAB - TRI-FACETED SECURITY & E2E TEST SUITE")
    print("=" * 60)

    results = {
        "TC-01 Page Availability": test_page_availability(),
        "TC-02 SEO & Metadata": test_seo_and_metadata(),
        "TC-03 Prototype Pollution Hardening": test_prototype_pollution_hardening(),
        "TC-04 Secrets Scanning": test_secrets_scanning(),
        "TC-05 Security Headers": test_security_headers_file()
    }

    print("=" * 60)
    print("SUMMARY OF TEST RESULTS:")
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    for test, res in results.items():
        status = "PASSED" if res else "FAILED"
        print(f"  {test:<40}: {status}")

    print("=" * 60)
    print(f"Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("=" * 60)

    if passed == total:
        print("ALL TESTS PASSED WITH 100% SUCCESS RATE")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
