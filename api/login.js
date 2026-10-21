// api/login.js - مسار تسجيل الدخول الآمن وإصدار Custom Tokens عبر Firebase Admin
// الخدام: تسجيل الدخول عبر الاسم + كلمة المرور
// المخدومين: تسجيل الدخول عبر كود الامتحان + كلمة المرور
const crypto = require('crypto');
const { getAuth, getDb } = require('./_lib/firebase');

/**
 * التحقق من صحة المدخلات ورفض الحقول الفارغة
 */
function validateLoginInput(identifier, password) {
    const cleanId = String(identifier || '').trim();
    const cleanPwd = String(password || '').trim();

    if (!cleanId) {
        return { ok: false, status: 400, error: 'يرجى إدخال اسم الخادم أو كود الامتحان للمخدوم' };
    }
    if (!cleanPwd) {
        return { ok: false, status: 400, error: 'يرجى إدخال كلمة المرور أو رقم الهاتف' };
    }

    return { ok: true, identifier: cleanId, password: cleanPwd };
}

/**
 * دالة مساعدة لحساب هاش SHA-256 المتوافق مع بيانات الخدمة
 */
function hashPasswordSha256(password) {
    return crypto.createHash('sha256').update(String(password)).digest('hex');
}

/**
 * مقارنة آمنة ضد هجمات التوقيت Timing Attacks
 */
function timingSafeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * تحويل الأرقام العربية المشرقية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية (0123456789)
 */
function convertArabicDigits(str) {
    return String(str ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

/**
 * توحيد صيغة رقم الهاتف (إزالة كود مصر 20 أو الصفر في البداية وغير الأرقام)
 */
function normalizePhone(str) {
    if (!str) return '';
    const digitsOnly = convertArabicDigits(str).replace(/\D/g, '');
    return digitsOnly.replace(/^20|^2|^0/, '');
}

/**
 * مطابقة مرنة وآمنة لأرقام الهواتف (تدعم 01... و 201... والأرقام العربية والدولية)
 */
function phonesMatch(storedPhone, inputPhone) {
    const normStored = normalizePhone(storedPhone);
    const normInput = normalizePhone(inputPhone);
    if (!normStored || !normInput) return false;
    if (normStored === normInput) return true;
    // مطابقة آخر 9 أرقام في حال وجود بادئات إضافية (أرقام المحمول المصرية 10 أرقام بدون 0)
    if (normStored.length >= 9 && normInput.length >= 9) {
        return normStored.slice(-9) === normInput.slice(-9);
    }
    return false;
}

/**
 * التحقق من كلمة المرور ضد رقم الهاتف أو الهاش المشفر أو النص الصريح
 * (للمخدومين: رقم الهاتف أو رقم ولي الأمر هو كلمة المرور الرسمية المعتمدة)
 */
function verifyPassword(record, rawPassword) {
    if (!record || !rawPassword) return false;

    // 1. فحص رقم الهاتف أو رقم ولي الأمر (المطابقة المرنة للأرقام المصرية والدولية)
    if (phonesMatch(record.phone, rawPassword) || phonesMatch(record.parent_phone, rawPassword)) {
        return true;
    }

    // 2. فحص الهاش المشفر إن وُجد
    if (record.passwordHash) {
        const computed = hashPasswordSha256(rawPassword);
        if (timingSafeCompare(computed, record.passwordHash)) {
            return true;
        }
    }

    // 3. فحص كلمة المرور كنص صريح إن وُجد حقل password
    if (record.password && typeof record.password === 'string' && record.password === rawPassword) {
        return true;
    }

    return false;
}

/**
 * بناء الـ Custom Claims الرسمية لـ Firebase Auth
 */
function createLoginClaims(type, record, docId) {
    if (type === 'servant') {
        const role = (record.role === 'admin' || record.permission === 'admin') ? 'admin' : 'servant';
        const perm = record.permission || (role === 'admin' ? 'admin' : 'full');
        const code = String(record.code || docId).trim();
        return {
            uid: `servant_${code}`,
            claims: {
                role: role,
                code: code,
                perm: perm,
                name: record.name || ''
            }
        };
    }

    // student
    const code = String(record.code || record.id || docId).trim();
    return {
        uid: `student_${code}`,
        claims: {
            role: 'student',
            code: code,
            perm: 'student',
            name: record.name || '',
            level: record.level || record.stage || 'الفرقة الأولى'
        }
    };
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    const { identifier, password, action, phone_confirm } = req.body || {};
    const validation = validateLoginInput(identifier, password);
    if (!validation.ok) {
        return res.status(validation.status).json({ success: false, message: validation.error });
    }

    const cleanId = validation.identifier;
    const cleanPwd = validation.password;

    try {
        const db = getDb();
        const auth = getAuth();

        // 0. فحص أمين الخدمة الرئيسي (admin / عادل جورج) لمنع إقفال النظام
        const ADMIN_KEYS = ['admin', 'الأدمن', 'عادل جورج'];
        if (ADMIN_KEYS.includes(cleanId) || ADMIN_KEYS.includes(cleanId.toLowerCase())) {
            const adminPass = process.env.ADMIN_PASSWORD || '1234567';
            if (cleanPwd === adminPass) {
                const uid = 'servant_admin';
                const claims = {
                    role: 'admin',
                    code: 'admin',
                    perm: 'admin',
                    name: 'عادل جورج'
                };
                const customToken = await auth.createCustomToken(uid, claims);
                return res.status(200).json({
                    success: true,
                    customToken: customToken,
                    user: { uid, ...claims }
                });
            }
        }

        // 1. فحص الخدام: تسجيل الدخول بناء على الاسم (مع دعم الكود في حال استخدامه)
        let servantDoc = null;
        const servantsRef = db.collection('servants');
        
        // أ) البحث باسم الخادم أولاً
        const sByName = await servantsRef.where('name', '==', cleanId).limit(1).get();
        if (!sByName.empty) {
            servantDoc = sByName.docs[0];
        } else {
            // ب) البحث بكود الخادم كبديل
            const sByCode = await servantsRef.where('code', '==', cleanId).limit(1).get();
            if (!sByCode.empty) {
                servantDoc = sByCode.docs[0];
            }
        }

        if (servantDoc) {
            const servantData = servantDoc.data();
            const isMatch = verifyPassword(servantData, cleanPwd);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'اسم الخادم أو كلمة المرور غير صحيحة' });
            }

            const { uid, claims } = createLoginClaims('servant', servantData, servantDoc.id);
            const customToken = await auth.createCustomToken(uid, claims);

            return res.status(200).json({
                success: true,
                customToken: customToken,
                user: {
                    uid: uid,
                    ...claims
                }
            });
        }

        // 2. فحص المخدومين: تسجيل الدخول بناء على كود الامتحان + كلمة المرور / رقم الهاتف
        let studentDoc = null;
        const normCode = convertArabicDigits(cleanId).trim();
        const collectionsToTry = ['students', 'members'];

        for (const colName of collectionsToTry) {
            if (studentDoc) break;
            const ref = db.collection(colName);

            // أ) البحث بكود الامتحان كنص أصلي أو بعد تحويل الأرقام
            let snap = await ref.where('code', '==', cleanId).limit(1).get();
            if (snap.empty && normCode !== cleanId) {
                snap = await ref.where('code', '==', normCode).limit(1).get();
            }

            // ب) البحث بكود الامتحان كرقم
            if (snap.empty && !isNaN(normCode)) {
                snap = await ref.where('code', '==', Number(normCode)).limit(1).get();
            }

            if (!snap.empty) {
                studentDoc = snap.docs[0];
            } else {
                // ج) البحث بمعرف الوثيقة المباشر
                const directDoc = await ref.doc(cleanId).get();
                if (directDoc.exists) {
                    studentDoc = directDoc;
                } else if (normCode !== cleanId) {
                    const normDoc = await ref.doc(normCode).get();
                    if (normDoc.exists) {
                        studentDoc = normDoc;
                    }
                }
            }
        }

        if (studentDoc) {
            const studentData = studentDoc.data();

            // فحص كلمة المرور أو رقم الهاتف
            const isMatch = verifyPassword(studentData, cleanPwd);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'كود الامتحان أو كلمة المرور/الهاتف غير صحيحة' });
            }

            const { uid, claims } = createLoginClaims('student', studentData, studentDoc.id);
            const customToken = await auth.createCustomToken(uid, claims);

            return res.status(200).json({
                success: true,
                customToken: customToken,
                user: {
                    uid: uid,
                    ...claims
                }
            });
        }

        // 3. المستخدم غير موجود
        return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة: تأكد من كتابة اسم الخادم أو كود الامتحان وكلمة المرور' });

    } catch (error) {
        console.error('Login Handler Error:', error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في معالجة تسجيل الدخول' });
    }
};

// تصدير الدوال المساعدة لغرض الاختبارات المعزولة
module.exports.validateLoginInput = validateLoginInput;
module.exports.hashPasswordSha256 = hashPasswordSha256;
module.exports.timingSafeCompare = timingSafeCompare;
module.exports.verifyPassword = verifyPassword;
module.exports.createLoginClaims = createLoginClaims;
module.exports.convertArabicDigits = convertArabicDigits;
module.exports.normalizePhone = normalizePhone;
module.exports.phonesMatch = phonesMatch;

