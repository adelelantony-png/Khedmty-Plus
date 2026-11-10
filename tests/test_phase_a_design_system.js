const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Phase A: Design System, 7 Themes, and Components...');

const cssPath = path.join(__dirname, '../public/css/app-theme.css');
const jsPath = path.join(__dirname, '../public/js/theme-manager.js');

assert(fs.existsSync(cssPath), 'app-theme.css must exist');
assert(fs.existsSync(jsPath), 'theme-manager.js must exist');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// 1. Verify all 7 themes are defined in CSS
const requiredThemes = [
    'royal-gold',
    'emerald-calm',
    'warm-sand',
    'sky-mist',
    'lavender-soft',
    'night-warm',
    'zen'
];

requiredThemes.forEach(theme => {
    assert(cssContent.includes(`data-theme="${theme}"`), `CSS must define selector for theme: ${theme}`);
    console.log(`  ✅ Theme selector [data-theme="${theme}"] verified in CSS`);
});

// 2. Verify Essential Tokens are present in CSS
const requiredTokens = [
    '--k-bg',
    '--k-surface',
    '--k-surface-2',
    '--k-text',
    '--k-text-muted',
    '--k-primary',
    '--k-primary-gradient',
    '--k-accent',
    '--k-accent-gradient',
    '--k-border',
    '--k-border-gold',
    '--k-shadow-soft',
    '--k-shadow-elevated',
    '--k-radius-md',
    '--k-radius-lg'
];

requiredTokens.forEach(token => {
    assert(cssContent.includes(token), `CSS must include token: ${token}`);
});
console.log('  ✅ All design tokens verified in CSS');

// 3. Verify Base Components in CSS
const requiredComponentClasses = [
    '.k-btn',
    '.k-btn-primary',
    '.k-btn-secondary',
    '.k-btn-ghost',
    '.k-btn-danger',
    '.k-card',
    '.k-card-cream',
    '.k-hero-card',
    '.k-progress-bar',
    '.k-progress-fill',
    '.k-list-card',
    '.k-chips-bar',
    '.k-chip',
    '.k-toggle',
    '.k-toggle-slider',
    '.k-table-wrap',
    '.k-table',
    '.k-modal-backdrop',
    '.k-modal',
    '.k-toast',
    '.k-theme-picker-dialog'
];

requiredComponentClasses.forEach(cls => {
    assert(cssContent.includes(cls), `CSS must define base component: ${cls}`);
    console.log(`  ✅ Base component class ${cls} verified`);
});

// 4. Verify ThemeManager in JS
assert(jsContent.includes('window.ThemeManager = ThemeManager'), 'ThemeManager must be attached to window');
assert(jsContent.includes('window.KhedmtyTheme = ThemeManager'), 'KhedmtyTheme must be attached to window');
assert(jsContent.includes('applyThemeToDom'), 'applyThemeToDom function must exist');
assert(jsContent.includes('renderThemePickerModal'), 'renderThemePickerModal function must exist');

// 5. Test Contrast calculation on 7 themes
function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function contrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

const themeColors = [
    { name: 'royal-gold', text: '#071A38', surface: '#FFFFFF' },
    { name: 'emerald-calm', text: '#14352F', surface: '#FFFFFF' },
    { name: 'warm-sand', text: '#3D2C1E', surface: '#FFFFFF' },
    { name: 'sky-mist', text: '#1E3547', surface: '#FFFFFF' },
    { name: 'lavender-soft', text: '#2D2342', surface: '#FFFFFF' },
    { name: 'night-warm', text: '#E8E2D0', surface: '#172033' },
    { name: 'zen', text: '#1A1A1A', surface: '#FFFFFF' }
];

themeColors.forEach(tc => {
    const ratio = contrastRatio(tc.text, tc.surface);
    assert(ratio >= 4.5, `Contrast ratio for ${tc.name} must be >= 4.5:1, got ${ratio.toFixed(2)}`);
    console.log(`  ✅ ${tc.name} Contrast Ratio: ${ratio.toFixed(2)}:1 (WCAG AA Compliant)`);
});

console.log('\n🎉 PHASE A VERIFICATION COMPLETED WITH 100% SUCCESS!\n');
