# المرحلة 1: تجهيز Firebase

الهدف: قاعدة Firestore جاهزة، وVercel قادر على الاتصال بها، وقواعد الأمان منشورة.

> تحذير: **لا ترسل ملف الـ JSON الخاص بالمفتاح ولا قيمة `private_key` لأي شخص أو أي دردشة،
> ولا ترفعه على GitHub.** هو مفتاح يعطي تحكماً كاملاً في قاعدة البيانات.

## 1) إنشاء المشروع
1. افتح https://console.firebase.google.com ثم **Add project**.
2. الاسم: `khedmety-pro` (أو أي اسم). **عطّل Google Analytics** (غير لازم).

## 2) إنشاء قاعدة Firestore
1. من القائمة: **Build ← Firestore Database ← Create database**.
2. اختر الموقع: `europe-west1` (بلجيكا) أو `me-central1` (الدوحة) لو ظاهر عندك. **لا يمكن تغييره بعد ذلك.**
3. اختر **Start in production mode** (يعني كل شيء مغلق حتى ننشر القواعد).

## 3) تفعيل Authentication
**Build ← Authentication ← Get started.** لا تفعّل أي مزوّد (Google أو Email)؛ نحتاج الخدمة نفسها فقط
لأننا سندخل المستخدمين بـ Custom Token في المرحلة 2.

## 4) نشر قواعد الأمان
1. **Firestore Database ← Rules**.
2. امسح المحتوى والصق محتوى ملف `firestore.rules` من هذا المشروع، ثم **Publish**.

## 5) تسجيل تطبيق الويب (للمرحلة 2)
1. **Project settings (أيقونة الترس) ← General ← Your apps ← أيقونة </> (Web)**.
2. الاسم: `khedmety-web`، **ولا تفعّل Firebase Hosting**، ثم **Register app**.
3. انسخ كتلة `firebaseConfig`. هذه القيم **ليست سرية** (مصممة لتكون في الواجهة)،
   ويمكنك إرسالها لي لأضعها في المشروع.

## 6) مفتاح الخادم (سري)
1. **Project settings ← Service accounts ← Generate new private key**، فيتنزل ملف JSON.
2. افتحه وخذ 3 قيم: `project_id` و `client_email` و `private_key`.

## 7) متغيرات Vercel
في Vercel: **Project ← Settings ← Environment Variables**، أضف (للبيئات Production و Preview):

| الاسم | القيمة |
|---|---|
| `FIREBASE_PROJECT_ID` | قيمة `project_id` |
| `FIREBASE_CLIENT_EMAIL` | قيمة `client_email` |
| `FIREBASE_PRIVATE_KEY` | قيمة `private_key` كاملة، من `-----BEGIN PRIVATE KEY-----` إلى `-----END PRIVATE KEY-----` |
| `ADMIN_API_ENABLED` | `false` |

ثم **Deployments ← ⋯ ← Redeploy** (المتغيرات لا تسري إلا على نشر جديد).
بعد ذلك احذف ملف الـ JSON من جهازك أو احفظه في مكان آمن خارج المشروع.

## 8) الفحص
ارفع ملفات هذه المرحلة على GitHub (انتظر نشر Vercel)، ثم افتح:

`https://<موقعك>.vercel.app/api/health`

| النتيجة | المعنى |
|---|---|
| `{"ok":true,"firestore":"connected"}` | كل شيء سليم |
| `step: "env"` مع قائمة `missing` | متغير ناقص أو لم تعد النشر بعد إضافته |
| `step: "firestore"` و `code: 5` | قاعدة Firestore لم تُنشأ (الخطوة 2) |
| `step: "firestore"` و `code: 16` أو `7` | المفتاح غير صحيح أو من مشروع آخر (راجع الخطوة 6 و7) |

## حدود الخطة المجانية (Spark)
تقريباً: 50 ألف قراءة و 20 ألف كتابة و 20 ألف حذف يومياً، وجيجا تخزين.
تكفي لخدمة بهذا الحجم إذا لم تقرأ اللوحة كل السجلات في كل فتح (نراعي ذلك في المرحلة 6).
