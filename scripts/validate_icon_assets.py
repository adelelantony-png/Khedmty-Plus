import os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

base_web = r'D:\StPaul_Service_System\03_Web_Khedmty_Plus'
icons_dir = os.path.join(base_web, 'public', 'icons')
android_res = os.path.join(icons_dir, 'android', 'res')

inventory = [
    # Master
    (os.path.join(icons_dir, 'idad-khoddam-icon-1024.png'), (1024, 1024), 'PNG', 'Master Icon Source'),
    (os.path.join(base_web, 'idad-khoddam-icon-1024.png'), (1024, 1024), 'PNG', 'Root Master Icon Source'),
    (os.path.join(base_web, 'resources', 'icon.png'), (1024, 1024), 'PNG', 'Capacitor/Native Master Resource'),
    # PWA
    (os.path.join(icons_dir, 'icon-192.png'), (192, 192), 'PNG', 'PWA Standard Launcher (192px)'),
    (os.path.join(icons_dir, 'icon-512.png'), (512, 512), 'PNG', 'PWA Splash / Hi-Res (512px)'),
    (os.path.join(icons_dir, 'icon-512-maskable.png'), (512, 512), 'PNG', 'PWA Maskable Adaptive (512px)'),
    (os.path.join(icons_dir, 'icon-maskable-512.png'), (512, 512), 'PNG', 'PWA Maskable Backward-Compat'),
    # Apple
    (os.path.join(icons_dir, 'apple-touch-icon.png'), (180, 180), 'PNG', 'iOS Apple Touch Icon (180px)'),
    (os.path.join(base_web, 'public', 'apple-touch-icon.png'), (180, 180), 'PNG', 'iOS Root Apple Touch Icon'),
    # Favicon
    (os.path.join(icons_dir, 'favicon-16.png'), (16, 16), 'PNG', 'Favicon Small Tab (16px)'),
    (os.path.join(icons_dir, 'favicon-32.png'), (32, 32), 'PNG', 'Favicon Standard Tab (32px)'),
    (os.path.join(icons_dir, 'favicon-48.png'), (48, 48), 'PNG', 'Favicon Large / Android Shortcut (48px)'),
    (os.path.join(base_web, 'public', 'favicon-48.png'), (48, 48), 'PNG', 'Favicon Root 48px'),
    (os.path.join(base_web, 'public', 'favicon.ico'), (48, 48), 'ICO', 'Multi-Res Desktop Favicon.ico'),
    # Android Legacy Launcher
    (os.path.join(android_res, 'mipmap-mdpi', 'ic_launcher.png'), (48, 48), 'PNG', 'Android mdpi (48px)'),
    (os.path.join(android_res, 'mipmap-hdpi', 'ic_launcher.png'), (72, 72), 'PNG', 'Android hdpi (72px)'),
    (os.path.join(android_res, 'mipmap-xhdpi', 'ic_launcher.png'), (96, 96), 'PNG', 'Android xhdpi (96px)'),
    (os.path.join(android_res, 'mipmap-xxhdpi', 'ic_launcher.png'), (144, 144), 'PNG', 'Android xxhdpi (144px)'),
    (os.path.join(android_res, 'mipmap-xxxhdpi', 'ic_launcher.png'), (192, 192), 'PNG', 'Android xxxhdpi (192px)'),
    # Android Adaptive
    (os.path.join(android_res, 'mipmap-anydpi-v26', 'ic_launcher_foreground.png'), (432, 432), 'PNG', 'Android Adaptive Foreground (432px)'),
    (os.path.join(icons_dir, 'ic_launcher_foreground.png'), (432, 432), 'PNG', 'Android Adaptive Root Foreground'),
]

print(f"{'Filename':<35} | {'Dimensions':<12} | {'Format':<6} | {'Usage':<35} | {'Validation'}")
print("-" * 110)

all_ok = True
for path, expected_dim, expected_fmt, usage in inventory:
    fname = os.path.basename(path)
    if not os.path.exists(path):
        print(f"{fname:<35} | {'MISSING':<12} | {'-':<6} | {usage:<35} | [FAIL] MISSING")
        all_ok = False
        continue

    try:
        im = Image.open(path)
        actual_dim = im.size
        actual_fmt = im.format
        if actual_fmt == 'ICO':
            dim_ok = True
        else:
            dim_ok = (actual_dim == expected_dim)
        fmt_ok = (actual_fmt == expected_fmt)

        if dim_ok and fmt_ok and os.path.getsize(path) > 0:
            status = "[PASS] VERIFIED"
        else:
            status = f"[FAIL] MISMATCH (got {actual_dim}, {actual_fmt})"
            all_ok = False

        dim_str = f"{actual_dim[0]}x{actual_dim[1]}"
        print(f"{fname:<35} | {dim_str:<12} | {actual_fmt:<6} | {usage:<35} | {status}")
    except Exception as e:
        print(f"{fname:<35} | {'CORRUPT':<12} | {'-':<6} | {usage:<35} | [FAIL] {e}")
        all_ok = False

if all_ok:
    print("\nALL 21 ICON ASSETS 100% VALIDATED AND VERIFIED!")
else:
    print("\nSOME ASSETS FAILED VALIDATION!")
