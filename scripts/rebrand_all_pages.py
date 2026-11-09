import os
import glob
import re

PUBLIC_DIR = r"D:\StPaul_Service_System\03_Web_Khedmty_Plus\public"

FAVICON_BLOCK = """    <meta name="theme-color" content="#071A38">
    <meta name="apple-mobile-web-app-title" content="إعداد خدام">
    <meta name="application-name" content="إعداد خدام">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="48x48" href="icons/favicon-48.png">
    <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16.png">
    <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">"""

def rebrand_html(file_path):
    filename = os.path.basename(file_path)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig_content = content
    changes = []

    # 1. Update theme-color if present
    content = re.sub(
        r'<meta\s+name=["\']theme-color["\']\s+content=["\'][^"\']+["\']\s*/?>',
        '<meta name="theme-color" content="#071A38">',
        content,
        flags=re.IGNORECASE
    )

    # 2. Update apple-mobile-web-app-title if present
    content = re.sub(
        r'<meta\s+name=["\']apple-mobile-web-app-title["\']\s+content=["\'][^"\']+["\']\s*/?>',
        '<meta name="apple-mobile-web-app-title" content="إعداد خدام">',
        content,
        flags=re.IGNORECASE
    )

    # 3. Ensure favicon links exist
    if 'rel="icon"' in content or 'rel="apple-touch-icon"' in content:
        # replace existing favicon tags with standardized block if not index.html / student.html / servant-dashboard.html (already done)
        if filename not in ['index.html', 'student.html', 'servant-dashboard.html']:
            # Replace apple-touch-icon tag if present
            content = re.sub(r'<link\s+rel=["\']apple-touch-icon["\'][^>]*>', '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">', content)
            # Ensure favicon.ico and favicon-48.png are present
            if 'favicon.ico' not in content:
                content = content.replace('<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
                                          '<link rel="icon" type="image/x-icon" href="favicon.ico">\n    <link rel="icon" type="image/png" sizes="48x48" href="icons/favicon-48.png">\n    <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">')

    # 4. Title rebrand
    def title_repl(match):
        t = match.group(1)
        # replace legacy names
        t = t.replace('خدمتي برو', 'إعداد خدام')
        t = t.replace('خدمتي +', 'إعداد خدام')
        t = t.replace('خدمتي', 'إعداد خدام')
        t = t.replace('KHIDMETY PRO', 'إعداد خدام')
        t = t.replace('KHEDMETY PLUS', 'إعداد خدام')
        t = t.replace('PAULUS', 'إعداد خدام')
        if 'إعداد خدام' not in t and 'إعداد الخدام' not in t:
            t = f"{t} | إعداد خدام"
        return f"<title>{t}</title>"

    content = re.sub(r'<title>(.*?)</title>', title_repl, content, flags=re.DOTALL)

    # 5. Public visible texts (replace 'خدمتي برو' with 'إعداد خدام' outside scripts/keys)
    # Safe text replacements
    content = content.replace("نظام خدمتي برو", "منصة إعداد خدام")
    content = content.replace("تطبيق خدمتي برو", "تطبيق إعداد خدام")
    content = content.replace("خدمتي برو الذكي", "منصة إعداد خدام الذكية")
    content = content.replace("خدمتي برو", "إعداد خدام")
    content = content.replace("خدمتي +", "إعداد خدام")
    content = content.replace("KHIDMETY PRO", "إعداد خدام")

    if content != orig_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[UPDATED] {filename}")
    else:
        print(f"[UNCHANGED] {filename}")

if __name__ == "__main__":
    html_files = sorted(glob.glob(os.path.join(PUBLIC_DIR, "*.html")))
    print(f"Scanning and rebranding {len(html_files)} HTML pages in {PUBLIC_DIR}...")
    for f in html_files:
        rebrand_html(f)
    print("All pages successfully audited and rebranded!")
