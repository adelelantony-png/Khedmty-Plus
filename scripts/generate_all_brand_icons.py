import os
from PIL import Image, ImageOps, ImageDraw

src_path = r'C:\Users\AD_4_\Downloads\Documents\idad_khoddam_brand_assets\01-official-app-icon-reference.png'
base_web = r'D:\StPaul_Service_System\03_Web_Khedmty_Plus'
icons_dir = os.path.join(base_web, 'public', 'icons')
os.makedirs(icons_dir, exist_ok=True)

# 1. Load original image
im = Image.open(src_path).convert('RGBA')
print(f"Loaded master reference: {im.size}")

# The rounded icon boundary:
# Center is cx=782, cy=630, size approx 1120x1120
cx, cy = 782, 630
box_size = 1120
half = box_size // 2

# Crop the raw icon region
crop_box = (cx - half, cy - half, cx + half, cy + half)
raw_icon = im.crop(crop_box)

# Resample to 1024x1024 master
master_icon = raw_icon.resize((1024, 1024), Image.Resampling.LANCZOS)

# Save Master 1024
master_path_1024 = os.path.join(icons_dir, 'idad-khoddam-icon-1024.png')
master_icon.save(master_path_1024, 'PNG')
master_root = os.path.join(base_web, 'idad-khoddam-icon-1024.png')
master_icon.save(master_root, 'PNG')
print(f"Created master 1024x1024: {master_path_1024}")

# Resources folder for Capacitor / Android
resources_dir = os.path.join(base_web, 'resources')
os.makedirs(resources_dir, exist_ok=True)
master_icon.save(os.path.join(resources_dir, 'icon.png'), 'PNG')

# 2. PWA Standard Icons (192, 512)
icon_192 = master_icon.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(icons_dir, 'icon-192.png'), 'PNG')

icon_512 = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(os.path.join(icons_dir, 'icon-512.png'), 'PNG')

# 3. PWA Maskable Icon (512x512 with safe-zone)
# According to W3C, maskable icons must have the artwork within the central 80% circle (diameter 410px out of 512px)
# Deep navy background color is #071A38 / (7, 26, 56)
maskable_512 = Image.new('RGBA', (512, 512), (7, 26, 56, 255))
# Scale master icon to ~80% (410x410) and paste in center
inner_410 = master_icon.resize((410, 410), Image.Resampling.LANCZOS)
maskable_512.paste(inner_410, (51, 51), inner_410 if inner_410.mode == 'RGBA' else None)
maskable_path1 = os.path.join(icons_dir, 'icon-512-maskable.png')
maskable_path2 = os.path.join(icons_dir, 'icon-maskable-512.png')
maskable_512.save(maskable_path1, 'PNG')
maskable_512.save(maskable_path2, 'PNG')
print(f"Created PWA maskable: {maskable_path1}")

# 4. Apple Touch Icon (180x180)
apple_180 = master_icon.resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(os.path.join(icons_dir, 'apple-touch-icon.png'), 'PNG')
apple_180.save(os.path.join(base_web, 'public', 'apple-touch-icon.png'), 'PNG')

# 5. Favicons
fav_16 = master_icon.resize((16, 16), Image.Resampling.LANCZOS)
fav_16.save(os.path.join(icons_dir, 'favicon-16.png'), 'PNG')

fav_32 = master_icon.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(os.path.join(icons_dir, 'favicon-32.png'), 'PNG')

fav_48 = master_icon.resize((48, 48), Image.Resampling.LANCZOS)
fav_48.save(os.path.join(icons_dir, 'favicon-48.png'), 'PNG')
fav_48.save(os.path.join(base_web, 'public', 'favicon-48.png'), 'PNG')

# Multi-resolution favicon.ico (16, 32, 48)
fav_ico_path = os.path.join(base_web, 'public', 'favicon.ico')
fav_48.save(fav_ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Created multi-res favicon.ico: {fav_ico_path}")

# 6. Android Legacy Launcher Icons
# Directory structure: public/icons/android/res/
android_res = os.path.join(icons_dir, 'android', 'res')
densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

for folder, sz in densities.items():
    folder_path = os.path.join(android_res, folder)
    os.makedirs(folder_path, exist_ok=True)
    out_im = master_icon.resize((sz, sz), Image.Resampling.LANCZOS)
    out_im.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
    # Also save ic_launcher_round
    out_im.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')

# 7. Android Adaptive Icon (432x432 foreground with safe zone)
anydpi_folder = os.path.join(android_res, 'mipmap-anydpi-v26')
os.makedirs(anydpi_folder, exist_ok=True)

# Foreground 432x432 (central 66% is 288x288 safe zone)
adaptive_fg = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
inner_288 = master_icon.resize((288, 288), Image.Resampling.LANCZOS)
adaptive_fg.paste(inner_288, (72, 72), inner_288 if inner_288.mode == 'RGBA' else None)
adaptive_fg.save(os.path.join(anydpi_folder, 'ic_launcher_foreground.png'), 'PNG')
adaptive_fg.save(os.path.join(icons_dir, 'ic_launcher_foreground.png'), 'PNG')

# Adaptive icon XML definition
xml_content = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:color="#071A38"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'''
with open(os.path.join(anydpi_folder, 'ic_launcher.xml'), 'w', encoding='utf-8') as f:
    f.write(xml_content)

print("All icons successfully generated and verified!")
