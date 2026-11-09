const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('public/js/dashboard/dashboard-radar.js', 'utf-8');

// Setup mock browser environment
const domElements = {};
function mockElement(id) {
    if (!domElements[id]) {
        domElements[id] = {
            id,
            textContent: '',
            innerHTML: '',
            style: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            setAttribute: () => {},
            addEventListener: () => {}
        };
    }
    return domElements[id];
}

const sandbox = {
    window: {
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
        getElementById: id => mockElement(id),
        createElement: tag => mockElement(tag),
        querySelectorAll: () => [],
        body: mockElement('body')
    },
    localStorage: {
        getItem: key => null,
        setItem: () => {}
    },
    sessionStorage: {
        getItem: key => null,
        setItem: () => {}
    },
    console: console,
    members: [
        { id: '1', code: '101', name: 'مينا كمال', stage: 'سنة أولى', gender: 'بنين', phone: '01011111111' },
        { id: '2', code: '102', name: 'بيتر سامي', stage: 'سنة ثانية', gender: 'بنين', phone: '01022222222' }
    ],
    servants: [],
    attendanceRecord: {
        '2026-11-06': [
            { id: '1', code: '101', attended: true, communion: true },
            { id: '2', code: '102', attended: false }
        ]
    },
    activeSelectedDate: '2026-11-06',
    settings: { serviceStart: '2026-11-06' },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    escapeHtml: (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
};

sandbox.window = sandbox;

try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    console.log('[PASS] dashboard-radar.js evaluated successfully');

    // Call renderRadarDashboard
    if (typeof sandbox.renderRadarDashboard === 'function') {
        sandbox.renderRadarDashboard();
        console.log('[PASS] renderRadarDashboard() executed without ReferenceError!');
        console.log('Attended count KPI:', domElements['radar_kpiMeetingAttended']?.textContent);
        console.log('Total members KPI:', domElements['radar_kpiTotalMembers']?.textContent);
        console.log('Liturgy percentage KPI:', domElements['radar_kpiLiturgyPct']?.textContent);
    } else {
        throw new Error('renderRadarDashboard is not a function');
    }

    console.log('ALL RADAR RUNTIME CHECKS PASSED 100%!');
} catch (err) {
    console.error('[FAIL] Runtime test failed:', err);
    process.exit(1);
}
