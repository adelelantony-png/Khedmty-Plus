// إعدادات تطبيق الويب في Firebase (مشروع khedmety-plus).
// هذه القيم عامة وليست سرية، ومصممة لتكون في الواجهة.
// الحماية الحقيقية تأتي من قواعد الأمان (firestore.rules) ومن تسجيل الدخول.
// ملاحظة: لا نستخدم databaseURL لأن النظام الجديد يعتمد Firestore فقط.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBm6ScIpi6LUzcfDOAYELae1Paz4Xh9L4c",
  authDomain: "khedmety-plus.firebaseapp.com",
  projectId: "khedmety-plus",
  storageBucket: "khedmety-plus.firebasestorage.app",
  messagingSenderId: "25101228841",
  appId: "1:25101228841:web:3164821d165014a1e2b538"
};

/**
 * دالة مساعدة معتمدة لتهيئة قاعدة بيانات Firestore وتفعيل الحفظ غير المتصل (Offline Persistence)
 * مع دعم مزامنة النوافذ المتعددة (synchronizeTabs: true) بأمان
 */
window.initKhedmtyFirestore = function (customApp) {
  if (typeof firebase === 'undefined' || !firebase.firestore) return null;
  var app = customApp || (firebase.apps && firebase.apps.length > 0 ? firebase.app() : firebase.initializeApp(window.FIREBASE_CONFIG));
  var db = app.firestore();

  if (!window._khedmtyPersistenceInitialized) {
    window._khedmtyPersistenceInitialized = true;
    if (typeof db.enablePersistence === 'function') {
      db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
        if (err.code === 'failed-precondition') {
          console.warn('تنبيه: كاش فايربيز يعمل في وضع التبويب الفردي');
        } else if (err.code === 'unimplemented') {
          console.warn('تنبيه: المتصفح الحالي لا يدعم التخزين المحلي المستمر دون اتصال');
        } else {
          console.warn('تعذر تفعيل وضع عدم الاتصال:', err.message);
        }
      });
    }
  }
  return db;
};
