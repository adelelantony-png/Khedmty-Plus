// scripts/update_nav.js
const fs = require('fs');
const path = require('path');

const navPath = path.resolve(__dirname, '..', 'public', 'js', 'dashboard', 'dashboard-navigation.js');
let code = fs.readFileSync(navPath, 'utf8');

const startMarker = 'function showGroup(g) {';
const endMarker = "bar.addEventListener('click'";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found!');
    process.exit(1);
}

const replacement = `function showGroup(g, autoSwitch = true) {
current = g;
refresh();
fab.href = 'servant_help.html?g=' + g;
try {
  if (typeof sessionStorage !== 'undefined') {
    const uk = (window.AuthClient && typeof AuthClient.getUser === 'function' && AuthClient.getUser()?.id) || 
    (typeof currentUser !== 'undefined' && currentUser && currentUser.id) || 'guest';
    sessionStorage.setItem('khedmety_group_' + uk, g);
  }
} catch (e) {}

// One-Click Auto Switch: عند الضغط على المجموعة تفتح أول خاصية مفعلة تلقائياً!
if (autoSwitch && typeof window.switchTab === 'function') {
  const visibleBtns = [...tabs.querySelectorAll('.tab-btn:not(.grp-hidden)')].filter(b => b.style.display !== 'none');
  const hasActive = visibleBtns.some(b => b.classList.contains('active'));
  if (!hasActive && visibleBtns.length > 0) {
    const firstBtn = visibleBtns[0];
    const m = (firstBtn.getAttribute('onclick') || '').match(/switchTab\\('(\\w+)'/);
    if (m && m[1]) {
      window.switchTab(m[1], firstBtn);
    }
  }
}
}\n\n`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync(navPath, code, 'utf8');
console.log('✅ dashboard-navigation.js updated with One-Click Auto Switch!');
