// test_phase1_security.js - اختبارات الأمان المعزولة للمرحلة الأولى والثانية
// يتم تشغيل هذا الملف باستخدام النسخة المحمولة من Node.js بدون اتصال بأي سيرفر خارجي
const assert = require('assert');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('====================================================');
console.log('🚀 بدء تشغيل الاختبارات الأمنية المعزولة (Phases 1 & 2)');
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

function sha256(str) {
    return crypto.createHash('sha256').update(String(str)).digest('hex');
}

// إنشاء Mock Request و Response لاختبار الـ API Handlers
function createMockReqRes({ method = 'GET', headers = {}, body = {}, query = {} } = {}) {
    const req = {
        method,
        headers: Object.assign({}, headers),
        body,
        query
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

// إعداد Mock لـ Firebase Admin للاختبارات المعزولة
function createMockFirebaseAdmin() {
    const validTokens = {
        'admin_token': { uid: 'servant_admin', role: 'admin', code: 'admin', perm: 'admin' },
        'servant_token': { uid: 'servant_10', role: 'servant', code: '10', perm: 'full' },
        'student_a_token': { uid: 'student_101', role: 'student', code: '101', perm: 'student' },
        'student_b_token': { uid: 'student_102', role: 'student', code: '102', perm: 'student' }
    };

    const mockAuth = {
        verifyIdToken: async (token) => {
            if (validTokens[token]) {
                return Object.assign({}, validTokens[token]);
            }
            throw new Error('رمز التوكن غير صالح أو منتهي');
        },
        createCustomToken: async (uid, claims) => {
            return `mock_custom_token_for_${uid}`;
        }
    };

    // بيانات وهمية للاختبارات
    const mockServants = [
        { id: 's1', data: () => ({ name: 'عادل جورج', code: 'admin', role: 'admin', permission: 'admin', passwordHash: sha256('Adel#Pass2026') }) },
        { id: 's2', data: () => ({ name: 'مينا كمال', code: '20', role: 'servant', permission: 'full', passwordHash: sha256('Mina#Pass2026') }) }
    ];

    const mockStudents = [
        { id: '101', ref: { set: async () => {} }, data: () => ({ code: '101', name: 'مارك يوسف', phone: '201234567890', passwordHash: sha256('Mark#Pass101') }) },
        { id: '202', ref: { set: async (d) => {} }, data: () => ({ code: '202', name: 'بيتر حنا', phone: '01099887766', passwordHash: null }) },
        { id: '303', ref: { set: async () => {} }, data: () => ({ code: '303', name: 'كيرلس عماد', phone: '201122334455', parent_phone: '201599887766', passwordHash: null }) }
    ];

    const mockFirestore = {
        collection: (colName) => ({
            where: (field, op, val) => ({
                limit: (lim) => ({
                    get: async () => {
                        const strVal = String(val);
                        if (colName === 'servants') {
                            const matched = mockServants.filter(s => String(s.data()[field]) === strVal);
                            return { empty: matched.length === 0, docs: matched };
                        }
                        if (colName === 'students' || colName === 'members') {
                            const matched = mockStudents.filter(m => String(m.data()[field]) === strVal);
                            return { empty: matched.length === 0, docs: matched };
                        }
                        return { empty: true, docs: [] };
                    }
                }),
                get: async () => ({
                    forEach: (cb) => cb({ id: 'mock_doc', data: () => ({ title: 'Mock Subject', level: val }) }),
                    size: 1
                })
            }),
            doc: (docId) => ({
                ref: { set: async () => {} },
                get: async () => {
                    const std = mockStudents.find(s => s.id === docId);
                    if (std) return { exists: true, data: std.data, ref: std.ref };
                    return {
                        exists: true,
                        data: () => ({ points: 50, name: 'طالب اختباري' })
                    };
                },
                set: async (data, opts) => ({ success: true }),
                collection: (subCol) => ({
                    doc: (subId) => ({
                        set: async (data, opts) => ({ success: true })
                    }),
                    get: async () => ({
                        forEach: (cb) => cb({ data: () => ({ subject_name: 'عقيدة' }) }),
                        size: 2
                    })
                })
            }),
            add: async (data) => ({ id: 'new_subject_id' })
        }),
        batch: () => ({
            set: () => {},
            commit: async () => {}
        })
    };

    return {
        apps: [{}],
        auth: () => mockAuth,
        firestore: Object.assign(() => mockFirestore, {
            FieldValue: { serverTimestamp: () => new Date() }
        })
    };
}

// ==========================================
// Suite 1: فحص صياغة وتصدير ملفات الـ API
// ==========================================
console.log('--- 1. فحص سلامة صياغة وتصدير جميع ملفات الـ API ---');

const apiFiles = [
    'api/_lib/firebase.js',
    'api/_lib/auth.js',
    'api/public-config.js',
    'api/admin.js',
    'api/get_subjects.js',
    'api/harvest.js',
    'api/login.js',
    'api/mark_plan_read.js',
    'api/spiritual_note.js',
    'api/submit_sheet.js'
];

apiFiles.forEach(relPath => {
    runTest(`سلامة استيراد ${relPath}`, () => {
        const mod = require('./' + relPath);
        assert.ok(mod, `يجب أن يُصدر الملف كائناً أو دالة صالحة: ${relPath}`);
    });
});

runTest('صحة تصدير api/public-config.js كدالة CommonJS', () => {
    const handler = require('./api/public-config.js');
    assert.strictEqual(typeof handler, 'function', 'يجب أن يكون handler دالة قابلة للاستدعاء');
    const { req, res } = createMockReqRes({ method: 'GET' });
    handler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.jsonData && res.jsonData.apiKey, 'يجب أن يُرجع إعدادات فايربيز العامة');
});

// ==========================================
// Suite 2: فحص وسيط الأمان الموحد (api/_lib/auth.js)
// ==========================================
console.log('\n--- 2. فحص وسيط الأمان الموحد والصلاحيات (api/_lib/auth.js) ---');

const { setMockAdmin } = require('./api/_lib/firebase.js');
const mockAdmin = createMockFirebaseAdmin();
setMockAdmin(mockAdmin);

const auth = require('./api/_lib/auth.js');

runTest('استخراج Bearer Token من ترويسة الطلب', () => {
    assert.strictEqual(auth.extractBearerToken(null), null);
    assert.strictEqual(auth.extractBearerToken({ headers: {} }), null);
    assert.strictEqual(auth.extractBearerToken({ headers: { authorization: 'Basic 12345' } }), null);
    assert.strictEqual(auth.extractBearerToken({ headers: { authorization: 'Bearer secret_token_xyz' } }), 'secret_token_xyz');
    assert.strictEqual(auth.extractBearerToken({ headers: { Authorization: 'Bearer secret_token_abc' } }), 'secret_token_abc');
});

runTest('فحص دالة isAdmin لمختلف الأدوار', () => {
    assert.strictEqual(auth.isAdmin(null), false);
    assert.strictEqual(auth.isAdmin({ role: 'student' }), false);
    assert.strictEqual(auth.isAdmin({ role: 'servant', perm: 'full' }), false);
    assert.strictEqual(auth.isAdmin({ role: 'admin' }), true);
    assert.strictEqual(auth.isAdmin({ role: 'servant', perm: 'admin' }), true);
});

runTest('فحص دالة isStaff للخدام والأدمن', () => {
    assert.strictEqual(auth.isStaff(null), false);
    assert.strictEqual(auth.isStaff({ role: 'student' }), false);
    assert.strictEqual(auth.isStaff({ role: 'servant' }), true);
    assert.strictEqual(auth.isStaff({ role: 'admin' }), true);
});

runTest('فحص دالة canAccessStudent (عزل بيانات المخدومين ومنع التطفل)', () => {
    const studentA = { role: 'student', code: '101', uid: 'student_101' };
    const studentB = { role: 'student', code: '102', uid: 'student_102' };
    const servant = { role: 'servant', code: '10', uid: 'servant_10' };
    const adminUser = { role: 'admin', code: 'admin', uid: 'servant_admin' };

    assert.strictEqual(auth.canAccessStudent(studentA, '101'), true, 'الطالب يجب أن يصل لبياناته');
    assert.strictEqual(auth.canAccessStudent(studentA, '102'), false, 'ممنوع أن يصل الطالب لبيانات طالب آخر');
    assert.strictEqual(auth.canAccessStudent(servant, '101'), true, 'الخادم مصرح له بمتابعة المخدوم');
    assert.strictEqual(auth.canAccessStudent(adminUser, '101'), true, 'الأدمن مصرح له بالوصول لجميع المخدومين');
});

// ==========================================
// Suite 3: فحص أمان تسجيل الدخول وفق رغبة المستخدم (الخدام بالاسم، والمخدوم بكود الامتحان)
// ==========================================
console.log('\n--- 3. فحص تسجيل الدخول (الخدام بالاسم والمخدوم بكود الامتحان) ---');

const login = require('./api/login.js');

runTest('رفض اسم مستخدم أو كود فارغ', () => {
    const v = login.validateLoginInput('', 'secret123');
    assert.strictEqual(v.ok, false);
    assert.strictEqual(v.status, 400);
});

runTest('رفض كلمة مرور فارغة أو مسافات فقط', () => {
    const v1 = login.validateLoginInput('user1', '');
    assert.strictEqual(v1.ok, false);
    assert.strictEqual(v1.status, 400);

    const v2 = login.validateLoginInput('user1', '    ');
    assert.strictEqual(v2.ok, false);
    assert.strictEqual(v2.status, 400);
});

runTest('صحة تشفير ومقارنة الهاش TimingSafe', () => {
    const raw = 'StrongPass#2026';
    const hash = login.hashPasswordSha256(raw);
    assert.strictEqual(login.timingSafeCompare(hash, hash), true);
    assert.strictEqual(login.timingSafeCompare(hash, 'wrong_hash'), false);
    assert.strictEqual(login.verifyPassword({ passwordHash: hash }, raw), true);
    assert.strictEqual(login.verifyPassword({ passwordHash: hash }, 'WrongPass'), false);
});

runTest('فحص دقة تحويل الأرقام ومطابقة أرقام الهواتف المصرية والدولية والعربية', () => {
    // 1. تحويل الأرقام المشرقية
    assert.strictEqual(login.convertArabicDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
    assert.strictEqual(login.convertArabicDigits('كود ٣٠٣'), 'كود 303');

    // 2. توحيد صيغة الهاتف
    assert.strictEqual(login.normalizePhone('201012345678'), '1012345678');
    assert.strictEqual(login.normalizePhone('01012345678'), '1012345678');
    assert.strictEqual(login.normalizePhone('+20 10 1234 5678'), '1012345678');
    assert.strictEqual(login.normalizePhone('٠١٠١٢٣٤٥٦٧٨'), '1012345678');

    // 3. مطابقة الهواتف
    assert.strictEqual(login.phonesMatch('201012345678', '01012345678'), true);
    assert.strictEqual(login.phonesMatch('201012345678', '٠١٠١٢٣٤٥٦٧٨'), true);
    assert.strictEqual(login.phonesMatch('01012345678', '201012345678'), true);
    assert.strictEqual(login.phonesMatch('201012345678', '01111111111'), false);
    assert.strictEqual(login.phonesMatch(null, '01012345678'), false);
    assert.strictEqual(login.phonesMatch('201012345678', ''), false);
});

// فحص تسجيل دخول الأدمن الرئيسي
runAsyncTest('تسجيل دخول الأدمن الرئيسي (admin / عادل جورج) بنجاح', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: 'admin', password: '1234567' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.role, 'admin');
});

// فحص تدفق تسجيل دخول الخادم بالاسم
runAsyncTest('تسجيل دخول الخادم بالاسم + كلمة المرور بنجاح', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: 'عادل جورج', password: 'Adel#Pass2026' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.role, 'admin');
    assert.strictEqual(res.jsonData.user.name, 'عادل جورج');
});

// فحص تدفق تسجيل دخول المخدوم بكود الامتحان وكلمة المرور
runAsyncTest('تسجيل دخول المخدوم بكود الامتحان + كلمة المرور بنجاح', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '101', password: 'Mark#Pass101' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.role, 'student');
    assert.strictEqual(res.jsonData.user.code, '101');
});

// فحص دخول المخدوم برقم هاتفه كبديل آمن
runAsyncTest('تسجيل دخول المخدوم برقم هاتفه كبديل آمن قبل تعيين كلمة مرور', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '202', password: '01099887766' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.code, '202');
});

// فحص دخول المخدوم برقم الهاتف بصيغة 01 مقابل الرقم المخزن بصيغة واتساب 201
runAsyncTest('تسجيل دخول المخدوم برقم هاتفه المصري (01...) مقابل الرقم المخزن بصيغة واتساب (201...)', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '303', password: '01122334455' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.code, '303');
    assert.strictEqual(res.jsonData.user.name, 'كيرلس عماد');
});

// فحص تسجيل دخول المخدوم برقم هاتف ولي أمره المسجل
runAsyncTest('تسجيل دخول المخدوم برقم هاتف ولي أمره بنجاح', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '303', password: '01599887766' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.code, '303');
});

// فحص تسجيل دخول المخدوم بالأرقام العربية (المشرقية)
runAsyncTest('تسجيل دخول المخدوم بالأرقام العربية في كود الامتحان ورقم الهاتف', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '٣٠٣', password: '٠١١٢٢٣٣٤٤٥٥' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.code, '303');
});

// فحص قبول رقم هاتف المخدوم حتى لو كان لديه كلمة مرور مشفرة مسبقاً
runAsyncTest('تسجيل دخول المخدوم برقم الهاتف حتى مع وجود كلمة مرور مشفرة', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '101', password: '01234567890' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.user.code, '101');
});

// فحص رفض كلمة المرور الخاطئة برمز 401
runAsyncTest('رفض الدخول بكلمة مرور خاطئة (401)', async () => {
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { identifier: '202', password: 'WrongPassword' }
    });
    await login(req, res);
    assert.strictEqual(res.statusCode, 401);
});

// ==========================================
// Suite 4: اختبار حماية نقاط نهاية الـ APIs (Mock Requests)
// ==========================================
console.log('\n--- 4. اختبار حماية نقاط نهاية الـ APIs ومنع الوصول غير المصرح ---');

const adminHandler = require('./api/admin.js');
const getSubjectsHandler = require('./api/get_subjects.js');
const harvestHandler = require('./api/harvest.js');
const markPlanHandler = require('./api/mark_plan_read.js');
const spiritualHandler = require('./api/spiritual_note.js');
const submitSheetHandler = require('./api/submit_sheet.js');

async function testApiProtection(handler, method, defaultParams = {}) {
    const { req: r1, res: s1 } = createMockReqRes({ method, [method === 'GET' ? 'query' : 'body']: defaultParams });
    await handler(r1, s1);
    assert.strictEqual(s1.statusCode, 401, 'يجب رفض الطلب بدون توكن برمز 401');

    const { req: r2, res: s2 } = createMockReqRes({
        method,
        headers: { authorization: 'Bearer invalid_garbage_token' },
        [method === 'GET' ? 'query' : 'body']: defaultParams
    });
    await handler(r2, s2);
    assert.strictEqual(s2.statusCode, 401, 'يجب رفض التوكن غير الصالح برمز 401');
}

(async () => {
    await runAsyncTest('api/admin.js يرفض الطلبات بدون توكن (401)', async () => {
        await testApiProtection(adminHandler, 'POST', { action: 'save_settings' });
    });

    await runAsyncTest('api/admin.js يرفض محاولات المخدوم والطلب من غير الأدمن (403)', async () => {
        const { req: r1, res: s1 } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { action: 'save_settings' }
        });
        await adminHandler(r1, s1);
        assert.strictEqual(s1.statusCode, 403);

        const { req: r2, res: s2 } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer servant_token' },
            body: { action: 'save_settings' }
        });
        await adminHandler(r2, s2);
        assert.strictEqual(s2.statusCode, 403);
    });

    await runAsyncTest('api/admin.js يسمح للأدمن الموثق بتنفيذ العمليات (200)', async () => {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer admin_token' },
            body: { action: 'save_settings', payload: { service_year_name: 'سنة إعداد الخدام' } }
        });
        await adminHandler(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.jsonData.success, true);
    });

    await runAsyncTest('api/get_subjects.js حماية التوكن والصلاحيات', async () => {
        await testApiProtection(getSubjectsHandler, 'GET', { code: '101', level: 'الفرقة الأولى' });

        const { req: rCross, res: sCross } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer student_a_token' },
            query: { code: '102', level: 'الفرقة الأولى' }
        });
        await getSubjectsHandler(rCross, sCross);
        assert.strictEqual(sCross.statusCode, 403);

        const { req: rSelf, res: sSelf } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer student_a_token' },
            query: { code: '101', level: 'الفرقة الأولى' }
        });
        await getSubjectsHandler(rSelf, sSelf);
        assert.strictEqual(sSelf.statusCode, 200);
    });

    await runAsyncTest('api/harvest.js حماية التوكن والصلاحيات', async () => {
        await testApiProtection(harvestHandler, 'GET', { code: '101', level: 'الفرقة الأولى' });

        const { req: rCross, res: sCross } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer student_a_token' },
            query: { code: '102', level: 'الفرقة الأولى' }
        });
        await harvestHandler(rCross, sCross);
        assert.strictEqual(sCross.statusCode, 403);

        const { req: rSelf, res: sSelf } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer student_a_token' },
            query: { code: '101', level: 'الفرقة الأولى' }
        });
        await harvestHandler(rSelf, sSelf);
        assert.strictEqual(sSelf.statusCode, 200);
    });

    await runAsyncTest('api/submit_sheet.js حماية التوكن والصلاحيات', async () => {
        await testApiProtection(submitSheetHandler, 'POST', { code: '101', subject: 'عقيدة', q1: 'أ', q2: 'ب' });

        const { req: rCross, res: sCross } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '102', subject: 'عقيدة', q1: 'أ', q2: 'ب' }
        });
        await submitSheetHandler(rCross, sCross);
        assert.strictEqual(sCross.statusCode, 403);

        const { req: rSelf, res: sSelf } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '101', subject: 'عقيدة', q1: 'أ', q2: 'ب' }
        });
        await submitSheetHandler(rSelf, sSelf);
        assert.strictEqual(sSelf.statusCode, 200);
    });

    await runAsyncTest('api/spiritual_note.js حماية التوكن والصلاحيات', async () => {
        await testApiProtection(spiritualHandler, 'POST', { code: '101', date: '2026-10-17', baker: true });

        const { req: rCross, res: sCross } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '102', date: '2026-10-17', baker: true }
        });
        await spiritualHandler(rCross, sCross);
        assert.strictEqual(sCross.statusCode, 403);

        const { req: rSelf, res: sSelf } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '101', date: '2026-10-17', baker: true }
        });
        await spiritualHandler(rSelf, sSelf);
        assert.strictEqual(sSelf.statusCode, 200);
    });

    await runAsyncTest('api/mark_plan_read.js حماية التوكن والصلاحيات', async () => {
        await testApiProtection(markPlanHandler, 'POST', { code: '101', month: '10', day: '17', reading: 'مزمور 1' });

        const { req: rCross, res: sCross } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '102', month: '10', day: '17', reading: 'مزمور 1' }
        });
        await markPlanHandler(rCross, sCross);
        assert.strictEqual(sCross.statusCode, 403);

        const { req: rSelf, res: sSelf } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '101', month: '10', day: '17', reading: 'مزمور 1' }
        });
        await markPlanHandler(rSelf, sSelf);
        assert.strictEqual(sSelf.statusCode, 200);
    });

    // ==========================================
    // Suite 5: فحص واجهات المستخدم وقواعد Firestore
    // ==========================================
    console.log('\n--- 5. فحص واجهات المستخدم وقواعد Firestore المجهزة ---');

    runTest('تطابق واجهة index.html مع خيار اسم الخادم وكود الامتحان ومطابقة الهواتف', () => {
        const content = fs.readFileSync('public/index.html', 'utf8');
        assert.ok(content.includes('اسم الخادم (للخدام) أو كود الامتحان (للطلبة)'), 'يجب أن يوضح النموذج خيار اسم الخادم أو كود الامتحان');
        assert.ok(!content.includes("DEFAULT_ADMIN_PWD = '1234567'"), 'يجب عدم وجود 1234567');
        assert.ok(!content.includes("ADMIN_NAMES"), 'يجب عدم وجود مصفوفة ADMIN_NAMES');
        assert.ok(content.includes('phonesMatch'), 'يجب أن تحتوي الواجهة على دالة phonesMatch');
        assert.ok(content.includes('codesMatch'), 'يجب أن تحتوي الواجهة على دالة codesMatch');
        assert.ok(content.includes('checkStudentPassword'), 'يجب أن تحتوي الواجهة على دالة checkStudentPassword');
    });

    runTest('تأمين servant-dashboard.html ضد الدخول غير المصرح', () => {
        const content = fs.readFileSync('public/servant-dashboard.html', 'utf8');
        assert.ok(!content.includes("DEFAULT_ADMIN_PWD = '1234567'"), 'يجب عدم وجود 1234567 في لوحة الخدام');
        assert.ok(content.includes("enforceStaffAuthGate"), 'يجب وجود بوابة التحقق الأمني enforceStaffAuthGate');
    });

    runTest('تأمين admin_subjects.html وبث ترويسة Authorization', () => {
        const content = fs.readFileSync('public/admin_subjects.html', 'utf8');
        assert.ok(content.includes("enforceAdminAuth"), 'يجب وجود بوابة التحقق من دور الأدمن');
        assert.ok(content.includes("Authorization"), 'يجب إرسال ترويسة Authorization مع طلبات الأدمن');
    });

    runTest('تأمين student.html وبوابة التحقق من هوية المخدوم', () => {
        const content = fs.readFileSync('public/student.html', 'utf8');
        assert.ok(content.includes("enforceStudentAuth"), 'يجب وجود بوابة التحقق enforceStudentAuth');
    });

    runTest('فحص شمولية قواعد firestore.rules للـ Custom Claims ومجموعات الطلبة والخدام', () => {
        const rules = fs.readFileSync('firestore.rules', 'utf8');
        assert.ok(rules.includes("request.auth.token.get('role'"), 'يجب أن تعتمد القواعد على role من التوكن');
        assert.ok(rules.includes("match /students/{code}"), 'يجب حماية مجموعة students');
        assert.ok(rules.includes("match /members/{code}"), 'يجب حماية مجموعة members');
        assert.ok(rules.includes("daily_reading_logs"), 'يجب حماية قراءات الإنجيل');
        assert.ok(rules.includes("sheet_submissions"), 'يجب حماية الشيتات');
        assert.ok(rules.includes("daily_logs"), 'يجب حماية النوتة الروحية');
    });

    runTest('وجود واكتمال عميل المصادقة الموحد public/auth-client.js', () => {
        assert.ok(fs.existsSync('public/auth-client.js'), 'يجب وجود ملف auth-client.js');
        const content = fs.readFileSync('public/auth-client.js', 'utf8');
        assert.ok(content.includes('getToken'), 'يجب أن يحتوي على دالة getToken');
        assert.ok(content.includes('enforceAuth'), 'يجب أن يحتوي على دالة enforceAuth');
        assert.ok(content.includes('fetch:'), 'يجب أن يحتوي على دالة fetch الموثقة');
    });

    runTest('تكامل واجهات المخدومين الثلاث مع التوكن وعميل المصادقة', () => {
        const sheet = fs.readFileSync('public/sheet.html', 'utf8');
        const sheetsList = fs.readFileSync('public/sheets_list.html', 'utf8');
        const spiritual = fs.readFileSync('public/spiritual_note.html', 'utf8');

        assert.ok(sheet.includes('auth-client.js'), 'sheet.html يجب أن تدمج auth-client.js');
        assert.ok(sheetsList.includes('auth-client.js'), 'sheets_list.html يجب أن تدمج auth-client.js');
        assert.ok(spiritual.includes('auth-client.js'), 'spiritual_note.html يجب أن تدمج auth-client.js');
    });

    runTest('دعم تعيين وتغيير كلمة مرور المخدوم في لوحة الخدام', () => {
        const dash = fs.readFileSync('public/servant-dashboard.html', 'utf8');
        assert.ok(dash.includes('edit_m_password'), 'يجب توفير حقل تعديل كلمة مرور المخدوم');
        assert.ok(dash.includes('updatedFields.passwordHash'), 'يجب تشفير وتحديث هاش كلمة المرور');
    });

    runTest('وجود وتكامل ملف bible_plan.js لخطة قراءة الكتاب المقدس دون الحاجة لسيرفر خارجي', () => {
        assert.ok(fs.existsSync('public/bible_plan.js'), 'يجب وجود ملف bible_plan.js');
        const planJs = fs.readFileSync('public/bible_plan.js', 'utf8');
        assert.ok(planJs.includes('window.BIBLE_PLAN_DATA'), 'يجب أن يحدد كائن window.BIBLE_PLAN_DATA');

        const bibleHtml = fs.readFileSync('public/bible.html', 'utf8');
        const studentHtml = fs.readFileSync('public/student.html', 'utf8');
        const spiritualHtml = fs.readFileSync('public/spiritual_note.html', 'utf8');
        const servantSpiritual = fs.readFileSync('public/servant_spiritual_note.html', 'utf8');

        assert.ok(bibleHtml.includes('bible_plan.js'), 'bible.html يجب أن تدمج bible_plan.js');
        assert.ok(studentHtml.includes('bible_plan.js'), 'student.html يجب أن تدمج bible_plan.js');
        assert.ok(spiritualHtml.includes('bible_plan.js'), 'spiritual_note.html يجب أن تدمج bible_plan.js');
        assert.ok(servantSpiritual.includes('bible_plan.js'), 'servant_spiritual_note.html يجب أن تدمج bible_plan.js');
    });

    runTest('دعم تقسيم الإصحاحات التلقائي في bible.html للأسفار المدمجة', () => {
        const bibleHtml = fs.readFileSync('public/bible.html', 'utf8');
        assert.ok(bibleHtml.includes('prepareBibleData'), 'يجب وجود دالة prepareBibleData لتقسيم الإصحاحات');
    });

    // ==========================================
    // 6. فحص واختبار خطة قراءة الكتاب المقدس الديناميكية
    // ==========================================
    console.log('\n--- 6. فحص واختبار خطة قراءة الكتاب المقدس الديناميكية ---');

    const biblePlanModule = require('./public/bible_plan.js');

    runTest('دالة getBiblePlanReading تبدأ من التكوين 1 في تاريخ بداية الخدمة (Day 1)', () => {
        const day1 = biblePlanModule.getBiblePlanReading('2026-09-01', '2026-09-01', 'service_year');
        assert.ok(day1, 'يجب إرجاع كائن القراءة');
        assert.strictEqual(day1.dayNumber, 1, 'اليوم الأول يجب أن يكون 1');
        assert.strictEqual(day1.book, 'التكوين', 'السفر يجب أن يكون التكوين');
        assert.strictEqual(day1.chapter, 1, 'الإصحاح الأول');
    });

    runTest('دالة getBiblePlanReading تحسب اليوم التالي بتسلسل سليم (Day 2)', () => {
        const day2 = biblePlanModule.getBiblePlanReading('2026-09-02', '2026-09-01', 'service_year');
        assert.ok(day2);
        assert.strictEqual(day2.dayNumber, 2);
        assert.strictEqual(day2.book, 'التكوين');
        assert.strictEqual(day2.chapter, 4);
    });

    runTest('دالة getBiblePlanReading تحسب اليوم الحالي (Day 47)', () => {
        const day47 = biblePlanModule.getBiblePlanReading('2026-10-17', '2026-09-01', 'service_year');
        assert.ok(day47);
        assert.strictEqual(day47.dayNumber, 47);
        assert.strictEqual(day47.book, 'التثنية');
        assert.strictEqual(day47.chapter, 16);
    });

    runTest('نهاية دورة الخطة (Day 366: سفر الرؤيا) والتكرار السلس للسنة الجديدة', () => {
        const lastDay = biblePlanModule.getBiblePlanReading('2027-09-01', '2026-09-01', 'service_year');
        assert.ok(lastDay);
        assert.strictEqual(lastDay.dayNumber, 366);
        assert.strictEqual(lastDay.book, 'سفر الرؤيا');

        // اليوم 367 يلتف تلقائياً لليوم الأول
        const loopDay = biblePlanModule.getBiblePlanReading('2027-09-02', '2026-09-01', 'service_year');
        assert.ok(loopDay);
        assert.strictEqual(loopDay.dayNumber, 1);
        assert.strictEqual(loopDay.book, 'التكوين');
    });

    runTest('دعم النمط الثابت للتقويم الميلادي (calendar_year)', () => {
        const calReading = biblePlanModule.getBiblePlanReading('2026-10-17', '2026-09-01', 'calendar_year');
        assert.ok(calReading);
        assert.strictEqual(calReading.mode, 'calendar_year');
        assert.strictEqual(calReading.planKey, '10-17');
    });

    runTest('تكامل الخطة الديناميكية في واجهات العرض (bible.html و student.html)', () => {
        const bibleHtml = fs.readFileSync('public/bible.html', 'utf8');
        const studentHtml = fs.readFileSync('public/student.html', 'utf8');
        assert.ok(bibleHtml.includes('getBiblePlanReading'), 'bible.html يجب أن تستخدم getBiblePlanReading');
        assert.ok(studentHtml.includes('getBiblePlanReading'), 'student.html يجب أن تستخدم getBiblePlanReading');
    });

    runTest('تكامل إعداد نمط الخطة في لوحة الخدام (servant-dashboard.html)', () => {
        const dashHtml = fs.readFileSync('public/servant-dashboard.html', 'utf8');
        assert.ok(dashHtml.includes('id="setBiblePlanMode"'), 'يجب وجود قائمة اختيار نمط الخطة setBiblePlanMode');
        assert.ok(dashHtml.includes('settings.biblePlanMode'), 'يجب حفظ وقراءة biblePlanMode في الإعدادات');
    });

    // ==========================================
    // 7. فحص وتدقيق وتأمين شاشات الخدام والمخدومين (Phase 2 Audit)
    // ==========================================
    console.log('\n--- 7. فحص وتدقيق وتأمين شاشات الخدام والمخدومين (Phase 2) ---');

    const AuthClient = require('./public/auth-client.js');

    const protectedPages = [
        'servant-dashboard.html',
        'servant_followup.html',
        'servant_spiritual_report.html',
        'servant_spiritual_note.html',
        'servant_journal.html',
        'servant_help.html',
        'servant_migrate_attendance.html',
        'admin_subjects.html',
        'student.html',
        'student_attendance.html',
        'harvest.html',
        'sheet.html',
        'sheets_list.html',
        'spiritual_note.html',
        'bible.html',
        'barcode.html',
        'recover.html'
    ];

    runTest('جميع شاشات الخدام والمخدومين المحمية (17 صفحة) تدمج عميل المصادقة auth-client.js', () => {
        protectedPages.forEach(page => {
            const content = fs.readFileSync(path.join('public', page), 'utf8');
            assert.ok(content.includes('auth-client.js'), `${page} يجب أن تحتوي على <script src="auth-client.js">`);
            assert.ok(content.includes('enforceAuth') || content.includes('AuthClient'), `${page} يجب أن تطبق بوابة المصادقة`);
        });
    });

    runTest('تأمين شاشة متابعة السلوك الروحي للخدام servant_followup.html وبوابة الصلاحيات', () => {
        const followup = fs.readFileSync('public/servant_followup.html', 'utf8');
        assert.ok(followup.includes("AuthClient.enforceAuth(['servant', 'admin'])"), 'servant_followup.html يجب أن تفرض صلاحية servant أو admin');
    });

    runTest('تأمين شاشة استرجاع الدخول recover.html وحظر إعادة كلمة المرور للافتراضية بدون إذن', () => {
        const recover = fs.readFileSync('public/recover.html', 'utf8');
        assert.ok(recover.includes("AuthClient.enforceAuth(['admin'])"), 'recover.html يجب أن تقتصر على الأدمن فقط');
        assert.ok(!recover.includes("localStorage.removeItem(K.pwd);say('عادت كلمة المرور إلى 1234567"), 'يجب حظر إعادة تعيين كلمة المرور إلى 1234567');
    });

    runTest('رفض الزائر المجهول (بدون جلسة) وتوجيهه لصفحة الدخول index.html', () => {
        let redirectTarget = null;
        global.window = { location: { replace: url => { redirectTarget = url; } } };
        global.sessionStorage = { getItem: () => null, removeItem: () => {} };
        global.localStorage = { getItem: () => null, removeItem: () => {} };

        const isAuth = AuthClient.isAuthenticated();
        assert.strictEqual(isAuth, false, 'الزائر المجهول لا يجب أن يكون مصادقاً عليه');

        AuthClient.enforceAuth(['servant', 'admin']);
        assert.strictEqual(redirectTarget, 'index.html', 'يجب توجيهه لصفحة index.html');
    });

    runTest('منع تزوير الصلاحيات عبر وضع user_role=admin في localStorage', () => {
        let redirectTarget = null;
        global.window = { location: { replace: url => { redirectTarget = url; } } };
        const mockStore = { user_role: 'admin' };
        global.sessionStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };
        global.localStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };

        const role = AuthClient.getUserRole();
        assert.strictEqual(role, '', 'الدور يجب ألا يُستخرج من مفتاح loose user_role دون كائن جلسة نشط');

        const isAuth = AuthClient.isAuthenticated();
        assert.strictEqual(isAuth, false, 'يجب رفض الجلسة المزورة');

        AuthClient.enforceAuth(['admin']);
        assert.strictEqual(redirectTarget, 'index.html');
    });

    runTest('منع المخدوم (student) من دخول شاشات الخدام وإعادة توجيهه إلى student.html', () => {
        let redirectTarget = null;
        global.window = { location: { replace: url => { redirectTarget = url; } } };
        const studentUser = { role: 'student', code: '101', name: 'بيتر' };
        const mockStore = { my_church_active_user: JSON.stringify(studentUser), student_code: '101' };
        global.sessionStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };
        global.localStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };

        assert.strictEqual(AuthClient.isAuthenticated(), true);
        assert.strictEqual(AuthClient.getUserRole(), 'student');

        // يحاول دخول صفحة مخصصة للخدام
        const allowed = AuthClient.enforceAuth(['servant', 'admin']);
        assert.strictEqual(allowed, false);
        assert.strictEqual(redirectTarget, 'student.html', 'المخدوم يجب توجيهه إلى student.html');
    });

    runTest('منع الخادم العادي (servant) من دخول شاشات الإدارة الخاصة بالأدمن فقط', () => {
        let redirectTarget = null;
        global.window = { location: { replace: url => { redirectTarget = url; } } };
        const servantUser = { role: 'servant', name: 'خادم' };
        const mockStore = { my_church_active_user: JSON.stringify(servantUser) };
        global.sessionStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };
        global.localStorage = { getItem: k => mockStore[k] || null, removeItem: () => {} };

        assert.strictEqual(AuthClient.isAuthenticated(), true);
        assert.strictEqual(AuthClient.getUserRole(), 'servant');

        // يحاول دخول شاشة أدمن فقط
        const allowed = AuthClient.enforceAuth(['admin']);
        assert.strictEqual(allowed, false);
        assert.strictEqual(redirectTarget, 'index.html', 'الخادم العادي يمنع من شاشات الأدمن');
    });

    runTest('فحص دالة تسجيل الخروج الموحدة AuthClient.logout ومسح جميع مفاتيح الجلسة', () => {
        let redirected = null;
        global.window = { location: { replace: url => { redirected = url; } } };
        const keysRemoved = [];
        const dummyStore = {
            my_church_active_user: '{"role":"servant"}',
            auth_token: 'fake-token',
            user_role: 'servant',
            student_code: '101',
            student_name: 'بيتر'
        };
        global.localStorage = {
            removeItem: k => { keysRemoved.push(k); delete dummyStore[k]; }
        };
        global.sessionStorage = {
            removeItem: k => { delete dummyStore[k]; }
        };

        AuthClient.logout('index.html');
        assert.ok(keysRemoved.includes('my_church_active_user'), 'يجب مسح my_church_active_user');
        assert.ok(keysRemoved.includes('auth_token'), 'يجب مسح auth_token');
        assert.ok(keysRemoved.includes('user_role'), 'يجب مسح user_role');
        assert.ok(keysRemoved.includes('student_code'), 'يجب مسح student_code');
        assert.strictEqual(redirected, 'index.html');
    });

    // ==========================================
    // ملخص النتائج النهائي
    // ==========================================
    console.log('\n====================================================');
    console.log(`📊 النتيجة النهائية للاختبارات:`);
    console.log(`   إجمالي الاختبارات: ${totalTests}`);
    console.log(`   الناجحة: ${passedTests} ✅`);
    console.log(`   الفاشلة: ${failedTests} ❌`);
    console.log('====================================================');

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
