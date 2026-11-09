with open('public/sw.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace header comment if needed
c = c.replace(
    "Service Worker الفائق لمنظومة Khedmty-Plus (Ultra Offline Engine v3.0)",
    "Service Worker الفائق لمنظومة إعداد خدام (Ultra Offline Engine v8.0)\n * اجتماع القديس بولس الرسول لإعداد الخدام"
)

# Replace icon list in PRECACHE_ASSETS
old_target = """    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/favicon-48.png',
    './icons/apple-touch-icon.png'"""

new_replacement = """    './favicon.ico',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './icons/icon-maskable-512.png',
    './icons/idad-khoddam-icon-1024.png',
    './icons/favicon-16.png',
    './icons/favicon-32.png',
    './icons/favicon-48.png',
    './icons/apple-touch-icon.png'"""

c = c.replace(old_target.replace('\n', '\r\n'), new_replacement.replace('\n', '\r\n'))
c = c.replace(old_target, new_replacement)

with open('public/sw.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated sw.js successfully!")
