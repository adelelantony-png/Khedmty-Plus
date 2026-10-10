// api/_lib/firebase.js - تهيئة مشتركة لـ Firebase Admin
// المجلدات والملفات التي تبدأ بـ _ لا تُنشر كدوال في Vercel، فهي للاستخدام الداخلي فقط.
const admin = require('firebase-admin');

function readPrivateKey() {
  let k = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
  k = k.replace(/^"|"$/g, '');      // يزيل علامات التنصيص لو لصقت مع القيمة
  k = k.replace(/\\n/g, '\n');      // يحوّل \n المكتوبة نصاً إلى أسطر حقيقية
  return k || undefined;
}

// تهيئة كسولة: لا ترمي خطأً عند الاستيراد حتى لو المتغيرات ناقصة
function getAdmin() {
  if (!admin.apps.length) {
    const missing = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']
      .filter(k => !process.env[k]);
    if (missing.length) {
      const e = new Error('متغيرات بيئة ناقصة: ' + missing.join(', '));
      e.missing = missing;
      throw e;
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: readPrivateKey()
      })
    });
  }
  return admin;
}

module.exports = { getAdmin, getDb: () => getAdmin().firestore() };
