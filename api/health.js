// api/health.js - فحص أن Vercel يتصل بـ Firestore (يُستخدم في المرحلة 1 فقط)
// افتح: https://<موقعك>.vercel.app/api/health
const { getDb } = require('./_lib/firebase');

module.exports = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('_health').limit(1).get();   // قراءة فقط، لا تكتب شيئاً
    return res.status(200).json({ ok: true, firestore: 'connected' });
  } catch (e) {
    if (e.missing) return res.status(500).json({ ok: false, step: 'env', missing: e.missing });
    console.error('health check failed:', e);
    // 5 = قاعدة Firestore غير منشأة، 7 = صلاحيات، 16 = بيانات اعتماد خاطئة
    return res.status(500).json({ ok: false, step: 'firestore', code: e.code || null });
  }
};
