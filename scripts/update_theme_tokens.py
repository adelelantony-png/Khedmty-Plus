import re

theme_path = r'D:\StPaul_Service_System\03_Web_Khedmty_Plus\public\css\app-theme.css'

with open(theme_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update header comment
header_old = """/**
 * public/css/app-theme.css
 * Khedmety-Plus — نظام التصميم الموحد والتكيفي ULTRA PRO MAX"""

header_new = """/**
 * public/css/app-theme.css
 * إعداد خدام — نظام التصميم الموحد والهوية البصرية الرسمية
 * اجتماع القديس بولس الرسول لإعداد الخدام"""

if header_old in css:
    css = css.replace(header_old, header_new)

# 2. Add standardized design tokens directly inside :root
tokens_addition = """    /* ========================================================
       الهوية الملكية الرسمية: إعداد خدام (Official Brand Tokens)
       ======================================================== */
    --primary: #0C2461;
    --primary-hover: #071A38;
    --primary-light: #EEF2FF;
    --secondary: #D4AF37;
    --secondary-hover: #B8860B;
    --accent: #F59E0B;
    --accent-glow: rgba(212, 175, 55, 0.35);
    --bg-app: #F8FAFC;
    --surface: #FFFFFF;
    --surface-hover: #F8FAFC;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --border: #E2E8F0;
    --border-gold: rgba(212, 175, 55, 0.45);
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --info: #0284C7;

    /* تدرجات الهوية البصرية الرسمية */
    --brand-navy-950: #071A38;
    --brand-navy-900: #0A1E42;
    --brand-navy-800: #0C2461;
    --brand-navy-700: #15376E;
    --brand-gold-500: #D4AF37;
    --brand-gold-400: #F3C64F;
    --brand-gold-gradient: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #F5CE66 100%);
    --brand-navy-gradient: linear-gradient(135deg, #071A38 0%, #0C2461 50%, #15376E 100%);
    --brand-hero-gradient: linear-gradient(135deg, #071A38 0%, #0C2461 65%, #234E94 100%);
"""

if "--primary: #0C2461;" not in css:
    css = css.replace(":root {", ":root {\n" + tokens_addition)

# 3. Add Component Styles for Splash Screen, Program Grid, Stat Cards, Bottom Nav at end
components_css = """

/* ========================================================
   18. شاشة البدء الملكية الرسمية (Official Splash Screen Overlay)
   ======================================================== */
.idad-splash-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at 50% 25%, #15376E 0%, #0C2461 45%, #071A38 100%);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    transition: opacity 0.45s ease, visibility 0.45s ease;
    text-align: center;
    direction: rtl;
}

.idad-splash-overlay.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.idad-splash-logo-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 24px;
    animation: splashGlow 3s infinite alternate ease-in-out;
}

.idad-splash-logo {
    width: 100%;
    height: 100%;
    border-radius: 26px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 0 0 3px rgba(212, 175, 55, 0.4);
    object-fit: cover;
}

@keyframes splashGlow {
    0% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.3)); }
    100% { transform: scale(1.03); filter: drop-shadow(0 0 28px rgba(212, 175, 55, 0.7)); }
}

.idad-splash-title {
    color: #FFFFFF;
    font-size: 1.85rem;
    font-weight: 900;
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
    font-family: 'Cairo', 'Tajawal', sans-serif;
}

.idad-splash-sub {
    color: #CBD5E1;
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 18px 0;
}

.idad-splash-motto {
    color: #FDE047;
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0 0 32px 0;
    opacity: 0.92;
}

.idad-splash-spinner {
    width: 36px;
    height: 36px;
    border: 3.5px solid rgba(255, 255, 255, 0.15);
    border-top-color: #D4AF37;
    border-radius: 50%;
    animation: idadSpin 0.85s linear infinite;
}

@keyframes idadSpin {
    to { transform: rotate(360deg); }
}

/* ========================================================
   19. بطاقات النبض والبرنامج الرسمية (Program Grid & Stat Pills)
   ======================================================== */
.program-section-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 16px 0;
}

@media (min-width: 768px) {
    .program-section-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
    }
}

.program-card-btn {
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 18px;
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-decoration: none;
    color: #0F172A;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(12, 36, 97, 0.04);
    min-height: 110px;
}

.program-card-btn:hover {
    transform: translateY(-3px);
    border-color: #D4AF37;
    box-shadow: 0 10px 24px rgba(12, 36, 97, 0.1), 0 0 0 1px rgba(212, 175, 55, 0.3);
    color: #0C2461;
}

.program-card-btn .icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
    color: #B45309;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    margin-bottom: 10px;
    transition: transform 0.2s ease;
}

.program-card-btn:hover .icon-wrap {
    transform: scale(1.08);
}

.program-card-btn .card-title {
    font-size: 0.95rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.35;
}

/* ========================================================
   20. شريط الآية اليومية المبارك (Scripture Verse Banner)
   ======================================================== */
.scripture-banner-card {
    background: linear-gradient(135deg, #071A38 0%, #0C2461 60%, #15376E 100%);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 20px;
    padding: 20px 24px;
    color: #FFFFFF;
    position: relative;
    overflow: hidden;
    margin: 18px 0;
    box-shadow: 0 8px 24px rgba(7, 26, 56, 0.2);
}

.scripture-banner-card::before {
    content: '';
    position: absolute;
    top: -40px;
    left: -40px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
}

.scripture-banner-card .verse-text {
    font-family: 'Amiri', 'Cairo', serif;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.7;
    color: #F8FAFC;
    margin: 0 0 6px 0;
}

.scripture-banner-card .verse-ref {
    color: #FDE047;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;
}

/* ========================================================
   21. أزرار الهوية الموحدة (Unified Button System)
   ======================================================== */
.btn-gold {
    background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #F5CE66 100%) !important;
    color: #071A38 !important;
    border: none !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35) !important;
    transition: all 0.2s ease !important;
}

.btn-gold:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 22px rgba(212, 175, 55, 0.5) !important;
}

.btn-navy {
    background: linear-gradient(135deg, #071A38 0%, #0C2461 100%) !important;
    color: #FFFFFF !important;
    border: 1px solid rgba(212, 175, 55, 0.3) !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 14px rgba(12, 36, 97, 0.3) !important;
    transition: all 0.2s ease !important;
}

.btn-navy:hover {
    transform: translateY(-2px) !important;
    background: #071A38 !important;
    box-shadow: 0 8px 22px rgba(12, 36, 97, 0.45) !important;
    color: #FDE047 !important;
}
"""

if ".idad-splash-overlay" not in css:
    css += components_css

with open(theme_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("Successfully enhanced app-theme.css with official Idad Khoddam design system!")
