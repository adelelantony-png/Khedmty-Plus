// tests/test_phase2_security_hardening.js - فحص تشديد الأمان ومكافحة هجمات التخمين والتوقيت
const assert = require('assert');
const { setMockAdmin } = require('../api/_lib/firebase.js');

// إعداد Mock لـ Firebase Admin
const mockFirestore = {
    collection: () => ({
        where: () => ({
            limit: () => ({
                get: async () => ({ empty: true, docs: [] })
            })
        }),
        doc: () => ({
            get: async () => ({ exists: false })
        })
    })
};

setMockAdmin({
    apps: [{}],
    auth: () => ({
        verifyIdToken: async () => ({ uid: 'test' }),
        createCustomToken: async (uid) => `mock_token_${uid}`
    }),
    firestore: () => mockFirestore
});

const login = require('../api/login.js');

console.log('====================================================');
console.log('🔒 فحص تشديد الأمان (Phase 2: Security & Auth Hardening)');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  [PASS] ${testName}`);
    } catch (err) {
        failedTests++;
        console.error(`  [FAIL] ${testName}`);
        console.error(`         ${err.message}`);
    }
}

async function runAsyncTest(testName, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`  [PASS] ${testName}`);
    } catch (err) {
        failedTests++;
        console.error(`  [FAIL] ${testName}`);
        console.error(`         ${err.message}`);
    }
}

function createMockReqRes({ method = 'POST', headers = {}, body = {} } = {}) {
    const req = {
        method,
        headers: Object.assign({ 'x-forwarded-for': '192.168.1.100' }, headers),
        body
    };

    const res = {
        statusCode: 200,
        headers: {},
        jsonData: null,
        ended: false,
        status(code) {
            this.statusCode = code;
            return this;
        },
        setHeader(key, val) {
            this.headers[key.toLowerCase()] = val;
            return this;
        },
        json(data) {
            this.jsonData = data;
            this.ended = true;
            return this;
        },
        end() {
            this.ended = true;
            return this;
        }
    };

    return { req, res };
}

async function main() {
    // 1. اختبارات مقارنة التوقيت الآمنة (timingSafeCompare)
    runTest('timingSafeCompare: مطابقة النصوص المتطابقة', () => {
        assert.strictEqual(login.timingSafeCompare('admin12345', 'admin12345'), true);
    });

    runTest('timingSafeCompare: رفض النصوص ذات الأطوال المختلفة بأمان تام', () => {
        assert.strictEqual(login.timingSafeCompare('short', 'much_longer_string_here'), false);
        assert.strictEqual(login.timingSafeCompare('1234567', '123456'), false);
    });

    runTest('timingSafeCompare: رفض النصوص المختلفة من نفس الطول', () => {
        assert.strictEqual(login.timingSafeCompare('abcde', 'abcdf'), false);
    });

    runTest('timingSafeCompare: معالجة المدخلات غير النصية بأمان بدون رمي استثناء', () => {
        assert.strictEqual(login.timingSafeCompare(null, 'secret'), false);
        assert.strictEqual(login.timingSafeCompare('secret', undefined), false);
        assert.strictEqual(login.timingSafeCompare({}, []), false);
    });

    // 2. اختبارات نظام مكافحة التخمين Brute-Force Rate Limiting
    runTest('مكافحة التخمين: تتبع المحاولات الخاطئة وحجب المحاولة السادسة بـ 429', () => {
        login.resetRateLimiter();
        const testKey = '192.168.1.50:attacker_test';

        // 5 محاولات فاشلة
        for (let i = 0; i < 5; i++) {
            const check = login.checkRateLimit(testKey);
            assert.strictEqual(check.allowed, true, `المحاولة ${i + 1} يجب أن تكون مسموحة`);
            login.recordFailedAttempt(testKey);
        }

        // المحاولة السادسة يجب حجبها
        const blockedCheck = login.checkRateLimit(testKey);
        assert.strictEqual(blockedCheck.allowed, false, 'يجب حجب المحاولة السادسة');
        assert.ok(blockedCheck.remainingSeconds > 0, 'يجب إرجاع وقت الانتظار المتبقي');

        // إعادة الضبط تلغي الحجب
        login.clearRateLimit(testKey);
        const afterClearCheck = login.checkRateLimit(testKey);
        assert.strictEqual(afterClearCheck.allowed, true, 'بعد إلغاء الحظر يجب أن تكون المحاولة مسموحة');
    });

    await runAsyncTest('مسار تسجيل الدخول الفعلي: إرجاع 429 مع رسالة عربية عند تجاوز الحد الأقصى', async () => {
        login.resetRateLimiter();
        const attackerIp = '10.0.0.99';

        // إرسال 5 طلبات خاطئة متتالية
        for (let i = 0; i < 5; i++) {
            const { req, res } = createMockReqRes({
                headers: { 'x-forwarded-for': attackerIp },
                body: { identifier: 'unknown_user_99', password: 'bad_password' }
            });
            await login(req, res);
            assert.strictEqual(res.statusCode, 401, `الطلب ${i + 1} يجب أن يرجع 401`);
        }

        // الطلب السادس يجب أن يرجع 429
        const { req: r6, res: s6 } = createMockReqRes({
            headers: { 'x-forwarded-for': attackerIp },
            body: { identifier: 'unknown_user_99', password: 'bad_password' }
        });
        await login(r6, s6);
        assert.strictEqual(s6.statusCode, 429, 'يجب أن يكون كود الاستجابة 429 Too Many Requests');
        assert.strictEqual(s6.jsonData.success, false);
        assert.ok(s6.jsonData.message.includes('تم تجاوز الحد الأقصى للمحاولات الخاطئة'), 'رسالة التحذير باللغة العربية');

        // تنظيف بعد الاختبار
        login.resetRateLimiter();
    });

    console.log('\n====================================================');
    console.log(`إجمالي الفحوصات: ${totalTests} | الناجحة: ${passedTests} | الفاشلة: ${failedTests}`);
    console.log('====================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Test Suite Failed Unexpectedly:', err);
    process.exit(1);
});
