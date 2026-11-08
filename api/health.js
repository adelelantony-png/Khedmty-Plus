// api/health.js - فحص اتصال الخادم وقاعدة البيانات
const { getDb } = require('./_lib/firebase');

module.exports = async (req, res) => {
  const env = process.env.VERCEL_ENV || 'development';
  try {
    const db = getDb();
    await db.collection('_health').limit(1).get(); // قراءة فقط، لا تكتب شيئاً
    return res.status(200).json({ ok: true, firestore: 'connected', env });
  } catch (e) {
    console.error('health check failed:', e && e.message ? e.message : e);
    return res.status(500).json({ ok: false, error: 'خدمة فحص الصحة غير متاحة حالياً' });
  }
};
