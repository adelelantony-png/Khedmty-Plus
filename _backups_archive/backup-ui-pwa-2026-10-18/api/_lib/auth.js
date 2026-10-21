// api/_lib/auth.js - وسيط التحقق الأمني الموحد وإدارة الصلاحيات
// المجلدات والملفات التي تبدأ بـ _ لا تُنشر كدوال في Vercel، فهي للاستخدام الداخلي فقط.

const { getAuth } = require('./firebase');

/**
 * استخراج رمز التوكن (Bearer Token) من ترويسة الطلب
 */
function extractBearerToken(req) {
  if (!req || !req.headers) return null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

/**
 * التحقق من صحة التوكن وفك تشفيره باستخدام Firebase Admin Auth
 */
async function verifyAuth(req) {
  const token = extractBearerToken(req);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'لم يتم توفير رمز المصادقة (Bearer Token المطلوب في ترويسة Authorization)'
    };
  }

  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    // توحيد بنية بيانات المستخدم المستخرجة من الـ Custom Claims
    const role = decoded.role || (decoded.admin ? 'admin' : 'student');
    const code = decoded.code || decoded.uid;
    const perm = decoded.perm || decoded.permission || (role === 'admin' ? 'admin' : (role === 'servant' ? 'full' : 'student'));

    const user = {
      ...decoded,
      uid: decoded.uid,
      role: role,
      code: String(code).trim(),
      perm: perm
    };

    return {
      ok: true,
      user: user
    };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      error: 'رمز المصادقة غير صالح أو منتهي الصلاحية: ' + (error.message || 'فشل التحقق')
    };
  }
}

/**
 * التحقق مما إذا كان المستخدم يملك صلاحية الأدمن (أمين الخدمة)
 */
function isAdmin(user) {
  if (!user) return false;
  return user.role === 'admin' || user.perm === 'admin';
}

/**
 * التحقق مما إذا كان المستخدم من فريق الخدمة (خادم أو أمين خدمة)
 */
function isStaff(user) {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'servant' || user.perm === 'admin' || user.perm === 'full';
}

/**
 * التحقق من صلاحية الوصول لبيانات مخدوم معين:
 * مسموح فقط إذا كان الطالب هو صاحب الكود، أو كان الطالب خادماً/أدمن في الخدمة
 */
function canAccessStudent(user, targetStudentCode) {
  if (!user) return false;
  if (isStaff(user)) return true;

  const normalizedTarget = String(targetStudentCode || '').trim();
  const normalizedUserCode = String(user.code || '').trim();
  const normalizedUid = String(user.uid || '').trim();

  return Boolean(normalizedTarget && (normalizedUserCode === normalizedTarget || normalizedUid === normalizedTarget));
}

module.exports = {
  extractBearerToken,
  verifyAuth,
  isAdmin,
  isStaff,
  canAccessStudent
};
