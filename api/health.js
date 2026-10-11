// api/health.js - فحص أن Vercel يتصل بـ Firestore (يُستخدم في المرحلة 1 فقط)
// افتح: https://<موقعك>.vercel.app/api/health
// لا يعرض أي قيمة سرية، فقط أسماء المتغيرات الموجودة وبيئة النشر.
const { getDb } = require('./_lib/firebase');

module.exports = async (req, res) => {
  const info = {
    vercelEnv: process.env.VERCEL_ENV || null,   // production أو preview أو development
    seen: Object.keys(process.env).filter(k => /^(FIREBASE|ADMIN_API)/.test(k)).sort()
  };
  try {
    const db = getDb();
    await db.collection('_health').limit(1).get();   // قراءة فقط، لا تكتب شيئاً
    return res.status(200).json(Object.assign({ ok: true, firestore: 'connected' }, info));
  } catch (e) {
    if (e.missing) return res.status(500).json(Object.assign({ ok: false, step: 'env', missing: e.missing }, info));
    console.error('health check failed:', e);
    // 5 = قاعدة Firestore غير منشأة، 7 = صلاحيات، 16 = بيانات اعتماد خاطئة
    return res.status(500).json(Object.assign({ ok: false, step: 'firestore', code: e.code || null }, info));
  }
};
