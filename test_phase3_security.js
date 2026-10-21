// test_phase3_security.js - اختبارات الأمان والوظائف المعزولة للمرحلة 3.1-B (12 حالة متكاملة)
// يتم تشغيل هذا الملف باستخدام Node.js المحمولة دون أي اتصال خارجي أو مساس بقاعدة البيانات
const assert = require('assert');
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');

console.log('================================================================');
console.log('🚀 بدء تشغيل حزمة الاختبارات الشاملة (المرحلة 3.1-B: 12 سيناريو)');
console.log('================================================================\n');

let total = 0;
let passed = 0;
let failed = 0;

function runTest(name, fn) {
    total++;
    try {
        fn();
        passed++;
        console.log(`  [PASS] ${name}`);
    } catch (e) {
        failed++;
        console.error(`  [FAIL] ${name}`);
        console.error(`         ${e.message}`);
    }
}

async function runAsyncTest(name, fn) {
    total++;
    try {
        await fn();
        passed++;
        console.log(`  [PASS] ${name}`);
    } catch (e) {
        failed++;
        console.error(`  [FAIL] ${name}`);
        console.error(`         ${e.message}`);
    }
}

// -------------------------------------------------------------
// محاكي الطلبات والاستجابات Mock Req/Res
// -------------------------------------------------------------
function createMockReqRes({ method = 'GET', headers = {}, body = {}, query = {} } = {}) {
    const req = { method, headers: Object.assign({}, headers), body, query };
    const res = {
        statusCode: 200,
        jsonData: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.jsonData = data; return this; }
    };
    return { req, res };
}

// -------------------------------------------------------------
// محاكي Firebase Admin
// -------------------------------------------------------------
const validTokens = {
    'admin_valid_token': { uid: 'servant_admin', role: 'admin', code: 'admin', perm: 'admin' },
    'servant_valid_token': { uid: 'servant_10', role: 'servant', code: '10', perm: 'full' },
    'student_a_token': { uid: 'student_101', role: 'student', code: '101', perm: 'student' },
    'student_b_token': { uid: 'student_102', role: 'student', code: '102', perm: 'student' }
};

const mockCreatedUsers = {};
const mockFirestoreData = {
    servants: {
        '10': { id: 10, code: '10', name: 'خادم تجريبي', phone: '01234567890', role: 'servant', permission: 'servant' }
    },
    students: {
        '101': { id: '101', code: '101', name: 'طالب اختباري 101', phone: '01000000000', level: 'الفرقة الأولى', points: 25 },
        '102': { id: '102', code: '102', name: 'طالب اختباري 102', phone: '01111111111', level: 'الفرقة الأولى', points: 30 }
    }
};

const mockAdmin = {
    apps: [{}],
    auth: () => ({
        verifyIdToken: async (token) => {
            if (token === 'expired_token') {
                const err = new Error('Firebase ID Token has expired.');
                err.code = 'auth/id-token-expired';
                throw err;
            }
            if (validTokens[token]) {
                return Object.assign({}, validTokens[token]);
            }
            throw new Error('رمز التوكن غير صالح أو تالف');
        },
        createCustomToken: async (uid, claims) => `mock_custom_token_${uid}`,
        getUser: async (uid) => {
            if (mockCreatedUsers[uid]) return mockCreatedUsers[uid];
            const err = new Error('User not found');
            err.code = 'auth/user-not-found';
            throw err;
        },
        createUser: async (props) => {
            mockCreatedUsers[props.uid] = Object.assign({}, props);
            return mockCreatedUsers[props.uid];
        },
        setCustomUserClaims: async (uid, claims) => {
            if (!mockCreatedUsers[uid]) mockCreatedUsers[uid] = { uid };
            mockCreatedUsers[uid].customClaims = claims;
        }
    }),
    firestore: Object.assign(() => ({
        collection: (col) => ({
            where: (field, op, val) => ({
                limit: () => ({
                    get: async () => {
                        if (col === 'servants' && field === 'name' && val === 'خادم تجريبي') {
                            const item = mockFirestoreData.servants['10'];
                            return { empty: false, docs: [{ id: '10', data: () => item }] };
                        }
                        if (col === 'students' && (field === 'code' || field === 'name') && val === '101') {
                            const item = mockFirestoreData.students['101'];
                            return { empty: false, docs: [{ id: '101', data: () => item }] };
                        }
                        return { empty: true, docs: [] };
                    }
                }),
                get: async () => ({ size: 0, forEach: () => {} })
            }),
            doc: (docId) => {
                if (docId === 'fail_forced_error') {
                    return {
                        get: async () => { throw new Error('Simulated database connection failure'); },
                        set: async () => { throw new Error('Simulated database write failure'); }
                    };
                }
                const foundItem = mockFirestoreData[col] && mockFirestoreData[col][docId];
                return {
                    get: async () => ({
                        exists: Boolean(foundItem),
                        data: () => foundItem || { points: 20, name: 'سجل تجريبي' }
                    }),
                    set: async (data, opts) => {
                        if (!mockFirestoreData[col]) mockFirestoreData[col] = {};
                        mockFirestoreData[col][docId] = opts && opts.merge && mockFirestoreData[col][docId]
                            ? Object.assign({}, mockFirestoreData[col][docId], data)
                            : data;
                        return { success: true };
                    },
                    collection: () => ({
                        doc: () => ({ set: async () => ({ success: true }) }),
                        get: async () => ({ size: 0, forEach: () => {} })
                    })
                };
            },
            add: async (data) => {
                if (data && (data.simulate_error || data.title === 'مادة عطل')) {
                    throw new Error('Simulated database insertion error');
                }
                return { id: 'new_id_generated' };
            }
        }),
        batch: () => ({ set: () => {}, commit: async () => {} })
    }), {
        FieldValue: { serverTimestamp: () => new Date() }
    })
};

const { setMockAdmin } = require('./api/_lib/firebase');
setMockAdmin(mockAdmin);

const AuthClient = require('./public/auth-client');
const adminApi = require('./api/admin');
const harvestApi = require('./api/harvest');
const spiritualApi = require('./api/spiritual_note');
const submitSheetApi = require('./api/submit_sheet');
const markPlanApi = require('./api/mark_plan_read');
const loginApi = require('./api/login');

(async () => {
    // -------------------------------------------------------------
    // الاختبار 1: تسجيل الدخول الصحيح (أدمن، خادم، طالب)
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 1: تسجيل الدخول الصحيح وإصدار Custom Tokens لجميع الأدوار', async () => {
        // 1. أمين الخدمة (Admin)
        const { req: rAdmin, res: sAdmin } = createMockReqRes({
            method: 'POST',
            body: { identifier: 'admin', password: '1234567' }
        });
        await loginApi(rAdmin, sAdmin);
        assert.strictEqual(sAdmin.statusCode, 200, 'دخول الأدمن ببيانات صحيحة يجب أن يرجع 200');
        assert.strictEqual(sAdmin.jsonData.success, true);
        assert.strictEqual(sAdmin.jsonData.user.role, 'admin');
        assert.ok(sAdmin.jsonData.customToken, 'يجب إصدار Custom Token للأدمن');

        // 2. خادم (Servant)
        const { req: rServant, res: sServant } = createMockReqRes({
            method: 'POST',
            body: { identifier: 'خادم تجريبي', password: '01234567890' }
        });
        await loginApi(rServant, sServant);
        assert.strictEqual(sServant.statusCode, 200, 'دخول الخادم ببيانات صحيحة يجب أن يرجع 200');
        assert.strictEqual(sServant.jsonData.success, true);
        assert.strictEqual(sServant.jsonData.user.role, 'servant');
        assert.ok(sServant.jsonData.customToken, 'يجب إصدار Custom Token للخادم');

        // 3. طالب (Student)
        const { req: rStudent, res: sStudent } = createMockReqRes({
            method: 'POST',
            body: { identifier: '101', password: '01000000000' }
        });
        await loginApi(rStudent, sStudent);
        assert.strictEqual(sStudent.statusCode, 200, 'دخول الطالب بكوده وهاتفه يجب أن يرجع 200');
        assert.strictEqual(sStudent.jsonData.success, true);
        assert.strictEqual(sStudent.jsonData.user.role, 'student');
        assert.ok(sStudent.jsonData.customToken, 'يجب إصدار Custom Token للطالب');
    });

    // -------------------------------------------------------------
    // الاختبار 2: فحص رفض بيانات الدخول الخاطئة والناقصة
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 2: رفض الحقول الناقصة وكلمات المرور الخاطئة في /api/login', async () => {
        // حقل المعرف ناقص
        const { req: r1, res: s1 } = createMockReqRes({ method: 'POST', body: { password: '123' } });
        await loginApi(r1, s1);
        assert.strictEqual(s1.statusCode, 400, 'غياب اسم المستخدم/الكود يجب أن يرجع 400');

        // حقل كلمة المرور ناقص
        const { req: r2, res: s2 } = createMockReqRes({ method: 'POST', body: { identifier: 'admin' } });
        await loginApi(r2, s2);
        assert.strictEqual(s2.statusCode, 400, 'غياب كلمة المرور يجب أن يرجع 400');

        // كلمة مرور خاطئة للأدمن
        const { req: r3, res: s3 } = createMockReqRes({ method: 'POST', body: { identifier: 'admin', password: 'wrong' } });
        await loginApi(r3, s3);
        assert.strictEqual(s3.statusCode, 401, 'كلمة المرور الخاطئة للأدمن يجب أن ترجع 401');

        // مستخدم غير موجود
        const { req: r4, res: s4 } = createMockReqRes({ method: 'POST', body: { identifier: 'unknown_user_999', password: '123' } });
        await loginApi(r4, s4);
        assert.strictEqual(s4.statusCode, 401, 'المستخدم غير الموجود يجب أن يرجع 401');
    });

    // -------------------------------------------------------------
    // الاختبار 3: توكن مفقود أو مزور أو منتهي
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 3: رفض التوكن المفقود والمزور والمنتهي في واجهات الـ API المحمية', async () => {
        // مفقود
        const { req: r1, res: s1 } = createMockReqRes({ method: 'GET', query: { code: '101', level: 'الفرقة الأولى' } });
        await harvestApi(r1, s1);
        assert.strictEqual(s1.statusCode, 401, 'التوكن المفقود يجب أن يرجع 401');

        // مزور
        const { req: r2, res: s2 } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer forged_fake_token_123' },
            query: { code: '101', level: 'الفرقة الأولى' }
        });
        await harvestApi(r2, s2);
        assert.strictEqual(s2.statusCode, 401, 'التوكن المزور يجب أن يرجع 401');

        // منتهي
        const { req: r3, res: s3 } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer expired_token' },
            query: { code: '101', level: 'الفرقة الأولى' }
        });
        await harvestApi(r3, s3);
        assert.strictEqual(s3.statusCode, 401, 'التوكن المنتهي يجب أن يرجع 401');
    });

    // -------------------------------------------------------------
    // الاختبار 4: التلاعب بالدور عبر localStorage
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 4: رفض localStorage المزيف بدور admin عند طلب API إدارية', async () => {
        const fakeUser = { role: 'admin', code: 'admin', name: 'مهاجم' };
        const mockStorage = {
            my_church_active_user: JSON.stringify(fakeUser),
            user_role: 'admin'
        };
        global.localStorage = { getItem: k => mockStorage[k] || null };
        global.sessionStorage = { getItem: () => null };

        // بدون توكن سحابي رسمي من السيرفر
        const { req, res } = createMockReqRes({
            method: 'POST',
            body: { action: 'save_settings', payload: { service_year_name: 'سنة مزورة' } }
        });
        await adminApi(req, res);
        assert.strictEqual(res.statusCode, 401, 'يجب رفض الطلب برمز 401 لأن التوثيق يعتمد على توكن السيرفر فقط');
    });

    // -------------------------------------------------------------
    // الاختبار 5: منع المخدوم من الوصول إلى بيانات مخدوم آخر (Cross-access)
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 5: منع الطالب من قراءة أو كتابة بيانات طالب آخر (403)', async () => {
        // طالب A (101) يطلب حصاد طالب B (102)
        const { req: rHarvest, res: sHarvest } = createMockReqRes({
            method: 'GET',
            headers: { authorization: 'Bearer student_a_token' },
            query: { code: '102', level: 'الفرقة الأولى' }
        });
        await harvestApi(rHarvest, sHarvest);
        assert.strictEqual(sHarvest.statusCode, 403, 'يجب منع الطالب من قراءة حصاد طالب آخر');

        // طالب A يسجل نوتة لطالب B
        const { req: rSpiritual, res: sSpiritual } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '102', date: '2026-10-17', baker: true }
        });
        await spiritualApi(rSpiritual, sSpiritual);
        assert.strictEqual(sSpiritual.statusCode, 403, 'يجب منع الطالب من تسجيل نوتة لطالب آخر');

        // طالب A يسلم شيت لطالب B
        const { req: rSheet, res: sSheet } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '102', subject: 'عقيدة', q1: 'أ', q2: 'ب' }
        });
        await submitSheetApi(rSheet, sSheet);
        assert.strictEqual(sSheet.statusCode, 403, 'يجب منع الطالب من تسليم شيت باسم طالب آخر');
    });

    // -------------------------------------------------------------
    // الاختبار 6: منع الخادم العادي من العمليات الإدارية
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 6: منع الخادم العادي (servant) من الإجراءات الإدارية المخصصة لأمين الخدمة (403)', async () => {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer servant_valid_token' },
            body: { action: 'save_settings', payload: { service_year_name: 'سنة الخدمة' } }
        });
        await adminApi(req, res);
        assert.strictEqual(res.statusCode, 403, 'الخادم العادي يجب أن يُمنع برمز 403');
    });

    // -------------------------------------------------------------
    // الاختبار 7: تسليم الشيتات والأنشطة الأكاديمية بنجاح
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 7: نجاح تسليم الشيت الأكاديمي للمخدوم المصادق عليه لنفسه', async () => {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '101', subject: 'عقيدة', q1: 'إجابة 1', q2: 'إجابة 2' }
        });
        await submitSheetApi(req, res);
        assert.strictEqual(res.statusCode, 200, 'تسليم الشيت للطالب الموثق يجب أن يرجع 200');
        assert.strictEqual(res.jsonData.success, true);
    });

    // -------------------------------------------------------------
    // الاختبار 8: تسجيل قراءة الخطة السنوية للكتاب المقدس
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 8: نجاح تسجيل قراءة الكتاب المقدس للمستخدم الموثق ومنع غير الموثق', async () => {
        // طالب مصادق
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer student_a_token' },
            body: { code: '101', month: '10', day: '18', reading: 'مزمور 1' }
        });
        await markPlanApi(req, res);
        assert.strictEqual(res.statusCode, 200, 'الطالب صاحب الكود يحق له تسجيل قراءته');
        assert.strictEqual(res.jsonData.success, true);

        // بدون توكن
        const { req: rNoAuth, res: sNoAuth } = createMockReqRes({
            method: 'POST',
            body: { code: '101', month: '10', day: '18', reading: 'مزمور 1' }
        });
        await markPlanApi(rNoAuth, sNoAuth);
        assert.strictEqual(sNoAuth.statusCode, 401, 'ممنوع تسجيل القراءة بدون توكن');
    });

    // -------------------------------------------------------------
    // الاختبار 9: معالجة أخطاء قاعدة البيانات بأمان دون كشف بيانات حساسة
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 9: استجابة آمنة برمز 500 ورسالة واضحة عند تعثر قاعدة البيانات', async () => {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer admin_valid_token' },
            body: { action: 'add_subject', payload: { level: 'الفرقة الأولى', title: 'مادة عطل', simulate_error: true } }
        });
        await adminApi(req, res);
        assert.strictEqual(res.statusCode, 500, 'عند تعثر الكتابة يجب إرجاع 500');
        assert.strictEqual(res.jsonData.success, false);
        assert.ok(res.jsonData.message, 'يجب تقديم رسالة خطأ واضحة دون كشف مسارات الخادم');
    });

    // -------------------------------------------------------------
    // الاختبار 10: اعتماد حساب خادم سحابياً وحفظ جلسة الأدمن
    // -------------------------------------------------------------
    await runAsyncTest('اختبار 10: تنفيذ create_servant_auth عبر السيرفر دون تبديل أو إسقاط جلسة الأدمن', async () => {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: 'Bearer admin_valid_token' },
            body: {
                action: 'create_servant_auth',
                payload: { servantId: 55, code: 'srv55', name: 'خادم جديد', permission: 'servant' }
            }
        });
        await adminApi(req, res);
        assert.strictEqual(res.statusCode, 200, 'اعتماد الخادم يجب أن يرجع 200 للأدمن');
        assert.strictEqual(res.jsonData.success, true);
        assert.strictEqual(res.jsonData.uid, 'srv_srv55');

        // التحقق من تعيين الـ Custom Claims للخادم
        const createdUser = mockCreatedUsers['srv_srv55'];
        assert.ok(createdUser, 'يجب إنشاء حساب الخادم في Firebase Auth');
        assert.strictEqual(createdUser.customClaims.role, 'servant');
        assert.strictEqual(createdUser.customClaims.code, 'srv55');

        // التحقق من عدم وجود createUserWithEmailAndPassword في كود المتصفح
        const dashHtml = fs.readFileSync('public/servant-dashboard.html', 'utf8');
        assert.ok(!dashHtml.includes('createUserWithEmailAndPassword'), 'ممنوع استدعاء createUserWithEmailAndPassword من المتصفح');
    });

    // -------------------------------------------------------------
    // الاختبار 11: الفحص التراجعي للضوابط الأمنية السابقة
    // -------------------------------------------------------------
    runTest('اختبار 11: الفحص التراجعي لضمان بقاء جميع ضوابط المرحلتين الأولى والثانية سليمة', () => {
        // 1. فحص public/auth-client.js
        const authClientJs = fs.readFileSync('public/auth-client.js', 'utf8');
        assert.ok(authClientJs.includes('isCloudAuthenticated'), 'يجب توفر isCloudAuthenticated');
        assert.ok(authClientJs.includes('setupTokenRefreshListener'), 'يجب توفر setupTokenRefreshListener');
        assert.ok(authClientJs.includes('enforceAuth'), 'يجب توفر enforceAuth');
        assert.ok(authClientJs.includes('logout'), 'يجب توفر logout');

        // 2. فحص تعطيل التسريب الجماعي في public/index.html
        const indexHtml = fs.readFileSync('public/index.html', 'utf8');
        assert.ok(!indexHtml.includes("db.collection('servants').get()"), 'ممنوع سحب مجموعة servants في الواجهة');

        // 3. فحص إزالة signInAnonymously من servant_spiritual_report.html
        const repHtml = fs.readFileSync('public/servant_spiritual_report.html', 'utf8');
        assert.ok(!repHtml.includes('signInAnonymously'), 'ممنوع استخدام signInAnonymously');

        // 4. فحص خروج موحد في logout.html
        const logoutHtml = fs.readFileSync('public/logout.html', 'utf8');
        assert.ok(logoutHtml.includes('auth-client.js'), 'logout.html يجب أن تضمن auth-client.js');
        assert.ok(logoutHtml.includes('AuthClient.logout'), 'logout.html يجب أن تستدعي AuthClient.logout');

        // 5. فحص إلغاء زيادة النقاط اليدوية غير الموثقة في spiritual_note.html
        const noteHtml = fs.readFileSync('public/spiritual_note.html', 'utf8');
        assert.ok(!noteHtml.includes("localStorage.setItem('student_points', currentPoints + 5)"), 'ممنوع التلاعب المباشر بنقاط المخدوم في النوتة');
    });

    // -------------------------------------------------------------
    // الاختبار 12: فحص سلامة بناء وتركيب JavaScript (Syntax & Integrity Check)
    // -------------------------------------------------------------
    runTest('اختبار 12: التحقق من سلامة البناء النحوي وخلو الملفات من أخطاء الـ Syntax', () => {
        const filesToValidate = [
            'api/admin.js',
            'api/login.js',
            'api/_lib/auth.js',
            'api/_lib/firebase.js',
            'public/auth-client.js'
        ];

        filesToValidate.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            try {
                new vm.Script(content, { filename: file });
            } catch (syntaxErr) {
                assert.fail(`خطأ نحوي (Syntax Error) في ${file}: ${syntaxErr.message}`);
            }
        });

        // التحقق من تواجد السكربتات المضمنة في صفحات HTML الرئيسية
        const htmlFiles = [
            'public/index.html',
            'public/logout.html',
            'public/sheet.html',
            'public/spiritual_note.html',
            'public/student.html',
            'public/harvest.html',
            'public/servant-dashboard.html',
            'public/servant_spiritual_report.html'
        ];

        htmlFiles.forEach(file => {
            const html = fs.readFileSync(file, 'utf8');
            assert.ok(html.length > 50, `الملف ${file} غير مكتمل أو فارغ`);
            assert.ok(html.includes('<html') && html.includes('</html>'), `الملف ${file} يفتقد بنية HTML السليمة`);
        });
    });

    // -------------------------------------------------------------
    // ملخص النتائج
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 نتيجة اختبارات المرحلة 3.1-B (12 حالة متكاملة):`);
    console.log(`   إجمالي الحالات: ${total}`);
    console.log(`   الناجحة: ${passed} ✅`);
    console.log(`   الفاشلة: ${failed} ❌`);
    console.log('================================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
