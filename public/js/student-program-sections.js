/**
 * public/js/student-program-sections.js
 * مكوّنات وأقسام البرنامج الرسمية لبوابة المخدومين والطلاب
 * 
 * مربوط بالكامل بـ WhatsApp Kiosk وخدمة الاستعلام التفاعلي (kiosk_view.py):
 * 1. الدورات التدريبية: كروت المقررات ونسب الإنجاز وفلاتر الحالات (مطابقة للمرجع البصري).
 * 2. الفعاليات والاجتماعات: عداد تنازلي للجمعة، جدول المحاضرات القادمة، واعتذار واتساب المسبق.
 * 3. المواد التعليمية وكشك الاستعلام: استدعاء المواد الـ 7 الرسمية حسب السنة الدراسية (الفرقة الأولى / الفرقة الثانية) مع كشك الواتساب.
 * 4. متابعة التقدم: لوحة التأهيل الشامل ونسبة الجاهزية للرسامة ومؤشرات الحضور والدرجات.
 */

(function () {
    'use strict';

    // 1. بيانات الكورسات المعتمدة
    var DEFAULT_COURSES = [
        {
            id: 'c1',
            title: 'أساسيات الخدمة الكنسية والرعاية',
            icon: 'fa-church',
            status: 'completed',
            statusLabel: 'مكتملة',
            progress: 100,
            lecturesCount: 6,
            lecturesAttended: 6,
            instructor: 'القمص بيشوي & أمين الخدمة',
            desc: 'مبادئ وأصول الرعاية الأرثوذكسية، روحانية الخادم، وأساليب الافتقاد الرعوي الفعال.'
        },
        {
            id: 'c2',
            title: 'القيادة المسيحية وإدارة الوقت',
            icon: 'fa-user-tie',
            status: 'in_progress',
            statusLabel: 'قيد الدراسة',
            progress: 30,
            lecturesCount: 4,
            lecturesAttended: 1,
            instructor: 'أ. مجدي عطية / د. رشا',
            desc: 'مهارات حل المشكلات، العمل الجماعي في أسرة الخدمة، وروح الاتضاع القيادي.'
        },
        {
            id: 'c3',
            title: 'الطقس الكنسي والألحان',
            icon: 'fa-cross',
            status: 'open',
            statusLabel: 'مفتوحة للتسجيل',
            progress: 0,
            lecturesCount: 4,
            lecturesAttended: 0,
            instructor: 'أ. جرجس / أ. بيشوي',
            desc: 'طقس القداس الباسيلي، أعياد الكنيسة السيدية، وألحان المناسبات الكنسية.'
        },
        {
            id: 'c4',
            title: 'دراسات في أسفار العهد الجديد',
            icon: 'fa-scroll',
            status: 'open',
            statusLabel: 'مفتوحة للتسجيل',
            progress: 0,
            lecturesCount: 4,
            lecturesAttended: 0,
            instructor: 'د. فليمون / أ. مجدي عطية',
            desc: 'دراسة تحليلية لرسائل القديس بولس الرسول وسفر أعمال الرسل.'
        }
    ];

    // 2. المواد الـ 7 الرسمية المعتمدة لكشك الاستعلام الذاتي (WhatsApp Kiosk & CRM DB)
    var OFFICIAL_KIOSK_DATA = {
        driveFolder: 'https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-',
        triggerWord: 'مواد',
        stages: {
            'الفرقة الأولى': [
          {
                    "id": "s1_m1",
                    "num": 1,
                    "title": "كورس الكتاب المقدس",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-book",
                    "teachers": "د. فليمون / أ. مجدي عطية",
                    "lectures": "4 محاضرات أساسية",
                    "term": "الترم الأول (بدءاً من الجمعة 13-11-2026)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- A - دراسات كتابية.pdf",
                    "replyText": "📖 *كورس الكتاب المقدس — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. فليمون / أ. مجدي عطية\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* الترم الأول (بدءاً من الجمعة 13-11-2026)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m2",
                    "num": 2,
                    "title": "كورس العقيدة الأرثوذكسية",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-cross",
                    "teachers": "أ. مجدي عطية / أ. جرجس",
                    "lectures": "4 محاضرات أساسية",
                    "term": "الترم الثاني (بدءاً من الجمعة 12-02-2027)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- B - دراسات عقيدية.pdf",
                    "replyText": "⛪ *كورس العقيدة الأرثوذكسية — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* أ. مجدي عطية / أ. جرجس\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* الترم الثاني (بدءاً من الجمعة 12-02-2027)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m3",
                    "num": 3,
                    "title": "كورس الطقس الكنسي",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-church",
                    "teachers": "أ. جرجس / أ. بيشوي",
                    "lectures": "4 محاضرات أساسية",
                    "term": "أيام الجمع الأساسية (الترم الثاني)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- C - دراسات طقسية.pdf",
                    "replyText": "🕯️ *كورس الطقس الكنسي — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* أ. جرجس / أ. بيشوي\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* أيام الجمع الأساسية (الترم الثاني)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m4",
                    "num": 4,
                    "title": "كورس تاريخ الكنيسة",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-monument",
                    "teachers": "م. سهير / م. رباب",
                    "lectures": "4 محاضرات أساسية",
                    "term": "أيام الجمع الأساسية (الترم الثاني)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- D - دراسات تاريخية.pdf",
                    "replyText": "📜 *كورس تاريخ الكنيسة — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* م. سهير / م. رباب\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* أيام الجمع الأساسية (الترم الثاني)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m5",
                    "num": 5,
                    "title": "كورس تنمية المهارات",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-bullseye",
                    "teachers": "د. رشا / د. مارسيل",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- G - دراسات تنمية المهارات.pdf",
                    "replyText": "🎯 *كورس تنمية المهارات — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. رشا / د. مارسيل\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m6",
                    "num": 6,
                    "title": "كورس تربوي وإدارة فصل",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-seedling",
                    "teachers": "د. رشا / أ. بيشوي",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- F - دراسات تربوية.pdf",
                    "replyText": "🌱 *كورس تربوي وإدارة فصل — الفرقة الأولى*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. رشا / أ. بيشوي\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s1_m7",
                    "num": 7,
                    "title": "كورس روحي وحياة خادم",
                    "stage": "الفرقة الأولى",
                    "icon": "fa-dove",
                    "teachers": "م. سهير / م. رباب",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الأول/- E - دراسات روحية.pdf",
                    "replyText": "✝️ *كورس روحي وحياة خادم (مشترك)*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* م. سهير / م. رباب\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          }
],
            'الفرقة الثانية': [
          {
                    "id": "s2_m1",
                    "num": 1,
                    "title": "كورس العقيدة الأرثوذكسية",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-cross",
                    "teachers": "أ. مجدي عطية / أ. جرجس",
                    "lectures": "4 محاضرات أساسية",
                    "term": "الترم الأول (بدءاً من الجمعة 13-11-2026)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- I - دراسات عقيدية.pdf",
                    "replyText": "⛪ *كورس العقيدة الأرثوذكسية — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* أ. مجدي عطية / أ. جرجس\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* الترم الأول (بدءاً من الجمعة 13-11-2026)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m2",
                    "num": 2,
                    "title": "كورس الكتاب المقدس",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-book",
                    "teachers": "د. فليمون / أ. مجدي عطية",
                    "lectures": "4 محاضرات أساسية",
                    "term": "الترم الثاني (بدءاً من الجمعة 12-02-2027)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- H - دراسات كتابية.pdf",
                    "replyText": "📖 *كورس الكتاب المقدس — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. فليمون / أ. مجدي عطية\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* الترم الثاني (بدءاً من الجمعة 12-02-2027)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m3",
                    "num": 3,
                    "title": "كورس الطقس الكنسي",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-church",
                    "teachers": "أ. جرجس / أ. بيشوي",
                    "lectures": "4 محاضرات أساسية",
                    "term": "أيام الجمع الأساسية (الترم الثاني)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- J - دراسات طقسية.pdf",
                    "replyText": "🕯️ *كورس الطقس الكنسي — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* أ. جرجس / أ. بيشوي\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* أيام الجمع الأساسية (الترم الثاني)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m4",
                    "num": 4,
                    "title": "كورس تاريخ الكنيسة",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-monument",
                    "teachers": "م. سهير / م. رباب",
                    "lectures": "4 محاضرات أساسية",
                    "term": "أيام الجمع الأساسية (الترم الثاني)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "",
                    "replyText": "📜 *كورس تاريخ الكنيسة — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* م. سهير / م. رباب\n📚 *عدد المحاضرات:* 4 محاضرات أساسية\n🗓️ *موعد الكورس:* أيام الجمع الأساسية (الترم الثاني)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m5",
                    "num": 5,
                    "title": "كورس تنمية المهارات",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-bullseye",
                    "teachers": "د. رشا / د. مارسيل",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- N - دراسات تنمية المهارات.pdf",
                    "replyText": "🎯 *كورس تنمية المهارات — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. رشا / د. مارسيل\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m6",
                    "num": 6,
                    "title": "كورس تربوي وإدارة فصل",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-seedling",
                    "teachers": "د. رشا / أ. بيشوي",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- M - دراسات تربوية.pdf",
                    "replyText": "🌱 *كورس تربوي وإدارة فصل — الفرقة الثانية*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* د. رشا / أ. بيشوي\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          },
          {
                    "id": "s2_m7",
                    "num": 7,
                    "title": "كورس روحي وحياة خادم",
                    "stage": "الفرقة الثانية",
                    "icon": "fa-dove",
                    "teachers": "م. سهير / م. رباب",
                    "lectures": "4 محاضرات",
                    "term": "التيرم الصيفي (أيام الثلاثاء الصيفية)",
                    "driveUrl": "https://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-",
                    "attachment": "I:/2021/2020/✠ Cross Coptic Library ✠/الخدمة والخدام/إعداد خدام/منهج البابا تواضروس إعداد خدام/المستوى الثاني/- L - دراسات روحية.pdf",
                    "replyText": "✝️ *كورس روحي وحياة خادم (مشترك)*\n━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 *فريق التدريس:* م. سهير / م. رباب\n📚 *عدد المحاضرات:* 4 محاضرات\n🗓️ *موعد الكورس:* التيرم الصيفي (أيام الثلاثاء الصيفية)\n\n📥 *رابط المنهج والمذكرات (Google Drive):*\nhttps://drive.google.com/drive/folders/1EO7WjD2tv5-0nID1xct0O5GRX7XWwQo-\n_(افتح الرابط وستجد ملف المادة متاحاً للتحميل داخل المجلد)_\n\n━━━━━━━━━━━━━━━━━━━━━\n💡 _للاستعلام عن مادة أخرى أرسل \"مواد\"_"
          }
]
        }
    };

    // استشعار وتحديد الفرقة الدراسية للطالب الحالي بذكاء
    window.OFFICIAL_KIOSK_DATA = OFFICIAL_KIOSK_DATA;

    function detectCurrentStudentStage() {
        try {
            var user = null;
            if (window.AuthClient && typeof AuthClient.getUser === 'function') {
                user = AuthClient.getUser();
            }
            if (!user) {
                var rawUser = localStorage.getItem('my_church_active_user') || 
                              sessionStorage.getItem('my_church_active_user') ||
                              localStorage.getItem('khedmety_auth_user');
                if (rawUser) user = JSON.parse(rawUser);
            }
            var rawStage = (user && (user.stage || user.level || user.grade)) || 
                           localStorage.getItem('student_level') || '';
            var str = String(rawStage).trim();
            if (str.includes('ثانية') || str.includes('ثانيه') || str.includes('2') || str.includes('المستوى الثاني')) {
                return 'الفرقة الثانية';
            }
        } catch (e) {}
        return 'الفرقة الأولى';
    }

    // دالة مساعدة لإنشاء وإظهار النافذة المنبثقة
    function showStudentModal(modalId, title, contentHtml) {
        var existing = document.getElementById(modalId);
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        var modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'k-modal-backdrop';
        modal.style.zIndex = '99999';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', title);

        modal.innerHTML = [
            '<div class="k-modal" style="max-width:560px; width:100%; max-height:90vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:24px; box-shadow:0 20px 60px rgba(7,26,56,0.35);">',
            '  <div class="k-modal-header" style="padding:16px 22px; background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); border-bottom:2px solid var(--k-border-gold, #D4AF37); display:flex; justify-content:space-between; align-items:center; margin:0;">',
            '    <h4 style="margin:0; font-size:1.15rem; font-weight:800; color:#FFF; display:flex; align-items:center; gap:8px;">' + title + '</h4>',
            '    <button type="button" class="k-modal-close" onclick="closeStudentModal(\'' + modalId + '\')" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#FDE047;">&times;</button>',
            '  </div>',
            '  <div class="k-modal-body" style="padding:18px 20px; overflow-y:auto; flex:1; background:var(--k-bg, #EEF3FB);">',
            contentHtml,
            '  </div>',
            '</div>'
        ].join('\n');

        modal.onclick = function (e) {
            if (e.target === modal) closeStudentModal(modalId);
        };

        document.body.appendChild(modal);
    }

    function closeStudentModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal && modal.parentNode) {
            modal.style.transition = 'opacity 0.2s ease';
            modal.style.opacity = '0';
            setTimeout(function () {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
            }, 200);
        }
    }
    window.closeStudentModal = closeStudentModal;

    // تبديل إظهار تفاصيل الكورس (Accordion)
    window.toggleSubjectDetails = function (elemId) {
        var el = document.getElementById(elemId);
        if (!el) return;
        if (el.style.display === 'none' || !el.style.display) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    };

    // ==============================================================
    // 1️⃣ الدورات التدريبية (Training Courses)
    // ==============================================================
    window.openStudentCoursesModal = function (activeFilter) {
        activeFilter = activeFilter || 'all';

        var filtered = DEFAULT_COURSES;
        if (activeFilter !== 'all') {
            filtered = DEFAULT_COURSES.filter(function (c) {
                return c.status === activeFilter;
            });
        }

        var chipsHtml = [
            '<div style="display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px;">',
            '  <button type="button" class="k-chip ' + (activeFilter === 'all' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'all\')">الكل (' + DEFAULT_COURSES.length + ')</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'in_progress' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'in_progress\')">قيد الدراسة</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'completed' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'completed\')">مكتملة</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'open' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'open\')">مفتوحة</button>',
            '</div>'
        ].join('\n');

        var listHtml = filtered.map(function (c) {
            var statusBadgeStyle = (c.status === 'completed') ? 'background:#DCFCE7; color:#15803D;' :
                                   (c.status === 'in_progress') ? 'background:#FEF3C7; color:#B45309;' : 'background:#EFF6FF; color:#1D4ED8;';

            return [
                '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:18px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.2s;">',
                '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">',
                '    <div style="display:flex; align-items:center; gap:10px;">',
                '      <div style="width:42px; height:42px; border-radius:12px; background:var(--k-surface-2, #FFF6DC); border:1px solid var(--k-border-gold, #D4AF37); display:flex; align-items:center; justify-content:center; color:var(--k-primary, #0B2A6B); font-size:1.15rem;">',
                '        <i class="fa-solid ' + c.icon + '"></i>',
                '      </div>',
                '      <div>',
                '        <strong style="font-size:0.95rem; color:var(--k-text, #071A38); display:block;">' + c.title + '</strong>',
                '        <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">' + c.instructor + '</small>',
                '      </div>',
                '    </div>',
                '    <span style="font-size:0.72rem; font-weight:800; padding:3px 10px; border-radius:999px; ' + statusBadgeStyle + '">' + c.statusLabel + '</span>',
                '  </div>',
                '  <p style="font-size:0.82rem; color:var(--k-text-muted, #64748B); margin:6px 0 10px 0; line-height:1.4;">' + c.desc + '</p>',
                '  <div style="display:flex; align-items:center; gap:10px;">',
                '    <div style="flex:1; height:8px; background:#F1F5F9; border-radius:999px; overflow:hidden;">',
                '      <div style="width:' + c.progress + '%; height:100%; background:linear-gradient(90deg, var(--k-primary, #0B2A6B), var(--k-accent, #D4AF37)); border-radius:999px;"></div>',
                '    </div>',
                '    <span style="font-size:0.78rem; font-weight:800; color:var(--k-primary, #0B2A6B);">' + c.progress + '%</span>',
                '  </div>',
                '</div>'
            ].join('\n');
        }).join('\n');

        if (filtered.length === 0) {
            listHtml = '<div style="text-align:center; padding:30px; color:#94A3B8;">لا توجد دورات في هذا التصنيف حالياً</div>';
        }

        var fullContent = chipsHtml + '<div style="max-height:55vh; overflow-y:auto;">' + listHtml + '</div>';
        showStudentModal('studentCoursesModal', '<i class="fa-solid fa-book-open" style="color:#D4AF37;"></i> الدورات والمقررات التدريبية', fullContent);
    };

    // ==============================================================
    // 2️⃣ الفعاليات والاجتماعات (Events & Friday Gatherings Agenda)
    // ==============================================================
    window.openStudentEventsModal = function () {
        var now = new Date();
        var nextFriday = new Date();
        var day = now.getDay();
        var daysUntilFriday = (5 - day + 7) % 7;
        if (daysUntilFriday === 0 && now.getHours() >= 14) daysUntilFriday = 7;
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        nextFriday.setHours(13, 0, 0, 0);

        var diffMs = Math.max(0, nextFriday - now);
        var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        var diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        var countdownText = (diffDays > 0 ? diffDays + ' يوم و ' : '') + diffHours + ' ساعة و ' + diffMins + ' دقيقة';

        var content = [
            '<div style="background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); color:#FFF; border-radius:20px; padding:20px; margin-bottom:16px; border:1.5px solid var(--k-border-gold, #D4AF37); box-shadow:0 8px 24px rgba(7,26,56,0.25);">',
            '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">',
            '    <span style="font-size:1.6rem;">⛪</span>',
            '    <span style="font-size:0.75rem; background:rgba(212,165,55,0.25); color:#FDE047; padding:3px 10px; border-radius:999px; border:1px solid rgba(212,165,55,0.4); font-weight:800;">اللقاء القادم</span>',
            '  </div>',
            '  <h4 style="margin:0 0 6px 0; font-size:1.1rem; font-weight:800; color:#FFF;">اجتماع إعداد الخدام الأسبوعي</h4>',
            '  <p style="margin:0 0 12px 0; font-size:0.85rem; color:#CBD5E1;">الجمعة في تمام 1:00 ظهراً &middot; كنيسة رئيس الملائكة ميخائيل والشهيد مارجرجس الروماني</p>',
            '  <div style="background:rgba(255,255,255,0.1); border-radius:12px; padding:10px; text-align:center;">',
            '    <small style="display:block; font-size:0.72rem; color:#FDE047; font-weight:700; margin-bottom:2px;">العد التنازلي لموعد اللقاء</small>',
            '    <strong style="font-size:1.15rem; color:#FFF; letter-spacing:0.5px;">⏳ ' + countdownText + '</strong>',
            '  </div>',
            '</div>',

            '<h5 style="font-size:0.95rem; font-weight:800; color:var(--k-primary, #0B2A6B); margin:16px 0 10px 0;"><i class="fa-solid fa-calendar-check text-warning me-1"></i> الفعاليات الكنسية القادمة</h5>',
            '<div style="display:flex; flex-direction:column; gap:10px;">',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">',
            '    <div style="background:#EFF6FF; color:#1D4ED8; font-weight:800; font-size:0.8rem; border-radius:10px; padding:8px 12px; text-align:center; min-width:60px;">الجمعة<br><small style="font-size:0.7rem;">القادمة</small></div>',
            '    <div style="flex:1;">',
            '      <strong style="font-size:0.88rem; color:var(--k-text, #071A38); display:block;">محاضرة: أسرار الكنيسة وطقس القداس</strong>',
            '      <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">القاعة الكبرى &middot; 1:00 م حتى 3:30 م</small>',
            '    </div>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">',
            '    <div style="background:#FEF3C7; color:#B45309; font-weight:800; font-size:0.8rem; border-radius:10px; padding:8px 12px; text-align:center; min-width:60px;">نوفمبر<br><small style="font-size:0.7rem;">2026</small></div>',
            '    <div style="flex:1;">',
            '      <strong style="font-size:0.88rem; color:var(--k-text, #071A38); display:block;">مؤتمر الخدمة السنوي واليوم الروحي</strong>',
            '      <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">بيت مريم &middot; التسجيل مفتوح لدى أمين الخدمة</small>',
            '    </div>',
            '  </div>',
            '</div>',

            '<div style="margin-top:16px; padding:12px; background:var(--k-surface-2, #FFF6DC); border:1px solid var(--k-border-gold, #D4AF37); border-radius:14px; text-align:center;">',
            '  <small style="display:block; font-size:0.78rem; color:var(--k-text, #071A38); font-weight:700; margin-bottom:6px;">هل سيتعذر عليك حضور الجمعة القادمة؟</small>',
            '  <a href="https://wa.me/?text=' + encodeURIComponent('سلام ونعمة.. أعتذر مقدماً عن عدم التمكن من حضور اجتماع إعداد الخدام الجمعة القادمة لظرف طارئ.') + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.82rem; padding:7px 16px; border-radius:999px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-weight:800;">',
            '    <i class="fa-brands fa-whatsapp"></i> إرسال عذر مسبق عبر واتساب 📲',
            '  </a>',
            '</div>'
        ].join('\n');

        showStudentModal('studentEventsModal', '<i class="fa-solid fa-calendar-days" style="color:#D4AF37;"></i> الفعاليات والاجتماعات الكنسية', content);
    };

    // ==============================================================
    // 3️⃣ المواد التعليمية وكشك الاستعلام (Educational Materials & Kiosk View)
    // ==============================================================
    window.toggleSubjectDetails = function (detailId) {
        var el = document.getElementById(detailId);
        if (!el) return;
        el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
    };

    // التبديل بين تبويب المواد والتبويب التفاعلي مع البوت
    window.switchKioskTab = function (tabName) {
        var subView = document.getElementById('kiosk-subjects-view');
        var botView = document.getElementById('kiosk-bot-view');
        var tabSubBtn = document.getElementById('kiosk-tab-subjects-btn');
        var tabBotBtn = document.getElementById('kiosk-tab-bot-btn');

        if (!subView || !botView) return;

        if (tabName === 'bot') {
            subView.style.display = 'none';
            botView.style.display = 'block';
            if (tabSubBtn) { 
                tabSubBtn.classList.remove('active'); 
                tabSubBtn.style.background = 'transparent'; 
                tabSubBtn.style.color = 'var(--k-text, #071A38)'; 
            }
            if (tabBotBtn) { 
                tabBotBtn.classList.add('active'); 
                tabBotBtn.style.background = 'var(--k-primary, #0B2A6B)'; 
                tabBotBtn.style.color = '#FFF'; 
            }
            var chatInput = document.getElementById('kiosk-chat-input');
            if (chatInput) setTimeout(function () { chatInput.focus(); }, 150);
        } else {
            botView.style.display = 'none';
            subView.style.display = 'block';
            if (tabBotBtn) { 
                tabBotBtn.classList.remove('active'); 
                tabBotBtn.style.background = 'transparent'; 
                tabBotBtn.style.color = 'var(--k-text, #071A38)'; 
            }
            if (tabSubBtn) { 
                tabSubBtn.classList.add('active'); 
                tabSubBtn.style.background = 'var(--k-primary, #0B2A6B)'; 
                tabSubBtn.style.color = '#FFF'; 
            }
        }
    };

    // سؤال البوت مباشرة عن مادة معينة من كارت المادة
    window.askKioskBotAboutSubject = function (subjectTitle, stage) {
        window.switchKioskTab('bot');
        setTimeout(function () {
            window.sendKioskBotMessage('كورس ' + subjectTitle + ' — ' + (stage || 'الفرقة الأولى'));
        }, 200);
    };

    // إرسال سؤال سريع بالضغط على الأزرار المقترحة
    window.sendKioskQuickQuery = function (queryText) {
        window.sendKioskBotMessage(queryText);
    };

    // إرسال محتوى حقل الإدخال في الشات
    window.sendKioskChatFromInput = function () {
        var input = document.getElementById('kiosk-chat-input');
        if (!input) return;
        var text = (input.value || '').trim();
        if (!text) return;
        input.value = '';
        window.sendKioskBotMessage(text);
    };

    // محرك المحادثة التفاعلي الذكي للبوت داخل البوابة (Live In-App Kiosk Chatbot)
    window.sendKioskBotMessage = function (userText) {
        var chatBox = document.getElementById('kiosk-chat-messages');
        if (!chatBox) return;

        var studentStage = detectCurrentStudentStage() || 'الفرقة الأولى';
        var studentName = (window.Auth && window.Auth.currentUser && window.Auth.currentUser.name) || 'مخدومنا المبارك';

        // 1. إضافة فقاعة المستخدم (User Bubble)
        var userBubble = document.createElement('div');
        userBubble.style.cssText = 'display:flex; justify-content:flex-end; margin-bottom:10px;';
        userBubble.innerHTML = [
            '<div style="background:#25D366; color:#FFF; padding:10px 14px; border-radius:16px 16px 3px 16px; max-width:85%; font-size:0.83rem; box-shadow:0 2px 6px rgba(37,211,102,0.25); text-align:right; font-weight:600; line-height:1.45;">',
            '  <div>' + userText + '</div>',
            '  <div style="font-size:0.65rem; color:rgba(255,255,255,0.8); text-align:left; margin-top:3px;"><i class="fa-solid fa-check-double"></i> الآن</div>',
            '</div>'
        ].join('');
        chatBox.appendChild(userBubble);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 2. إضافة مؤشر جاري الكتابة (Typing Indicator)
        var typingId = 'typing_' + Date.now();
        var typingEl = document.createElement('div');
        typingEl.id = typingId;
        typingEl.style.cssText = 'display:flex; justify-content:flex-start; margin-bottom:10px;';
        typingEl.innerHTML = [
            '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); padding:8px 12px; border-radius:16px 16px 16px 3px; font-size:0.75rem; color:var(--k-text-muted, #64748B); display:inline-flex; align-items:center; gap:6px;">',
            '  <i class="fa-solid fa-robot text-primary"></i> <span>جاري مراجعة الكشك والرد... ✍️</span>',
            '</div>'
        ].join('');
        chatBox.appendChild(typingEl);
        chatBox.scrollTop = chatBox.scrollHeight;

        // 3. تحليل السؤال بذكاء وتقديم الرد اللحظي بعد 400ms
        setTimeout(function () {
            var tEl = document.getElementById(typingId);
            if (tEl) tEl.remove();

            var norm = userText.replace(/[أإآءئؤ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase().trim();
            var replyTitle = '';
            var replyBody = '';
            var waDeepQuery = userText;
            var downloadLink = '';

            // فحص الفرقة المطلوبة
            var targetStage = studentStage;
            if (norm.includes('تانيه') || norm.includes('ثانيه') || norm.includes('ثانية')) {
                targetStage = 'الفرقة الثانية';
            } else if (norm.includes('اولي') || norm.includes('اولى') || norm.includes('أولى')) {
                targetStage = 'الفرقة الأولى';
            }

            var stageSubjects = OFFICIAL_KIOSK_DATA.stages[targetStage] || OFFICIAL_KIOSK_DATA.stages['الفرقة الأولى'];

            // مطابقة اسم المادة
            var matchedSubj = null;
            for (var i = 0; i < stageSubjects.length; i++) {
                var s = stageSubjects[i];
                var sNorm = s.title.replace(/[أإآءئؤ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
                if (norm.includes(sNorm) || sNorm.includes(norm) ||
                    (norm.includes('مقدس') && sNorm.includes('مقدس')) ||
                    (norm.includes('عقيد') && sNorm.includes('عقيد')) ||
                    (norm.includes('طقس') && sNorm.includes('طقس')) ||
                    (norm.includes('تاريخ') && sNorm.includes('تاريخ')) ||
                    (norm.includes('تربوي') && sNorm.includes('تربوي')) ||
                    (norm.includes('مهارات') && sNorm.includes('مهارات')) ||
                    (norm.includes('روحي') && sNorm.includes('روحي'))) {
                    matchedSubj = s;
                    break;
                }
            }

            if (matchedSubj) {
                replyTitle = '📚 مادة ' + matchedSubj.title + ' (' + targetStage + ')';
                replyBody = matchedSubj.replyText;
                downloadLink = matchedSubj.driveUrl;
                waDeepQuery = 'كورس ' + matchedSubj.title + ' — ' + targetStage;
            } else if (norm.includes('كارنيه') || norm.includes('كود') || norm.includes('qr') || norm.includes('باركود')) {
                replyTitle = '💳 كارنيه الحضور الذكي المعتمد (QR)';
                replyBody = 'سلام ونعمة يا ' + studentName + ' 🤍🕊️\n\nكارنيه الحضور الذكي الخاص بك مرمز برقم تسجيلك المعتمد للدخول بالكاميرا عند باب القاعة.\n\nيمكنك طلب إرسال صورة الكارنيه فوراً على رقمك عبر واتساب بالضغط بالأسفل!';
                waDeepQuery = 'كارنيهي';
            } else if (norm.includes('اعتذار') || norm.includes('عذر') || norm.includes('مش هقدر') || norm.includes('غياب')) {
                replyTitle = '🕊️ رادار رصد الأعذار الذكي';
                replyBody = 'سلام ونعمة يا ' + studentName + '.. تم استقبال رغبتك في تقديم عذر غياب عن اجتماع الجمعة.\n\nيمكنك تأكيد تسجيل العذر رسمياً في قاعدة بيانات الخدمة برابط مباشر لواتساب الخدمة:';
                waDeepQuery = 'اعتذار عن حضور اجتماع الجمعة القادمة لظروف خاصة';
            } else {
                // عرض قائمة المواد الـ 7 للمرحلة
                replyTitle = '📚 منهج ' + targetStage + ' المعتمد (الـ 7 مواد)';
                var lines = ['أهلاً بك يا ' + studentName + '.. إليك قائمة الـ 7 مواد المعتمدة:'];
                for (var j = 0; j < stageSubjects.length; j++) {
                    lines.push((j + 1) + '. ' + stageSubjects[j].title + ' (' + stageSubjects[j].teachers + ')');
                }
                lines.push('\n💡 _اكتب اسم أي مادة من القائمة أعلاه لعرض جدولها وتحميل مذكرتها فوراً!_');
                replyBody = lines.join('\n');
                downloadLink = OFFICIAL_KIOSK_DATA.driveFolder;
                waDeepQuery = 'مواد';
            }

            var botBubble = document.createElement('div');
            botBubble.style.cssText = 'display:flex; justify-content:flex-start; margin-bottom:12px;';
            
            var actionBtnsHtml = '';
            if (downloadLink) {
                actionBtnsHtml += '<a href="' + downloadLink + '" target="_blank" class="k-btn k-btn-primary" style="font-size:0.75rem; padding:6px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px;"><i class="fa-solid fa-cloud-arrow-down"></i> تحميل المذكرة 📥</a> ';
            }
            actionBtnsHtml += '<a href="https://wa.me/?text=' + encodeURIComponent(waDeepQuery) + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.75rem; padding:6px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:700;"><i class="fa-brands fa-whatsapp"></i> فتح في واتساب الخدمة 📲</a>';

            botBubble.innerHTML = [
                '<div style="background:var(--k-surface, #FFF); border:1.5px solid var(--k-border, #E2E8F0); border-radius:16px 16px 16px 3px; max-width:90%; padding:14px; box-shadow:0 3px 10px rgba(0,0,0,0.05); text-align:right;">',
                '  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; border-bottom:1px solid #F1F5F9; padding-bottom:6px;">',
                '    <div style="width:28px; height:28px; border-radius:50%; background:#0B2A6B; color:#D4AF37; display:flex; align-items:center; justify-content:center; font-size:0.85rem;"><i class="fa-solid fa-cross"></i></div>',
                '    <strong style="font-size:0.86rem; color:var(--k-primary, #0B2A6B);">' + replyTitle + '</strong>',
                '  </div>',
                '  <div style="font-size:0.8rem; color:var(--k-text, #1E293B); line-height:1.55; white-space:pre-wrap; margin-bottom:10px;">' + replyBody + '</div>',
                '  <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-start; margin-top:8px; border-top:1px dashed #E2E8F0; padding-top:8px;">' + actionBtnsHtml + '</div>',
                '  <div style="font-size:0.65rem; color:#94A3B8; text-align:left; margin-top:6px;">🤖 رد آلي معتمد من سيرفر كشك الخدمة</div>',
                '</div>'
            ].join('');

            chatBox.appendChild(botBubble);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 400);
    };

    window.openStudentMaterialsModal = function (selectedStage) {
        var studentDefaultStage = detectCurrentStudentStage();
        var qualificationScore = 78;
        var activeStage = selectedStage || studentDefaultStage;
        if (!OFFICIAL_KIOSK_DATA.stages[activeStage]) {
            activeStage = 'الفرقة الأولى';
        }

        var studentName = (window.Auth && window.Auth.currentUser && window.Auth.currentUser.name) || 'مخدومنا المبارك';
        var subjects = OFFICIAL_KIOSK_DATA.stages[activeStage] || [];

        // 1. شريط كشك الواتساب التفاعلي الذكي (مع أزرار التبديل للمحادثة المباشرة)
        var kioskBanner = [
            '<div style="background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); color:#FFF; border-radius:20px; padding:18px; margin-bottom:16px; border:1.5px solid var(--k-border-gold, #D4AF37); box-shadow:0 8px 20px rgba(7,26,56,0.25);">',
            '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">',
            '    <div style="display:flex; align-items:center; gap:10px;">',
            '      <div style="width:38px; height:38px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; color:#FFF; font-size:1.25rem;"><i class="fa-brands fa-whatsapp"></i></div>',
            '      <div>',
            '        <strong style="font-size:0.95rem; color:#FFF; display:block;">كشك الاستعلام الذاتي (WhatsApp Kiosk)</strong>',
            '        <small style="font-size:0.72rem; color:#CBD5E1;">متصل ومفعل تلقائياً مع سيرفر NewWhats</small>',
            '      </div>',
            '    </div>',
            '    <span style="font-size:0.7rem; font-weight:800; background:rgba(212,175,55,0.25); color:#FDE047; padding:3px 9px; border-radius:999px; border:1px solid rgba(212,175,55,0.4);">رد آلي فوري</span>',
            '  </div>',
            '  <p style="font-size:0.8rem; color:#E2E8F0; margin:8px 0 12px 0; line-height:1.45;">أرسل كلمة <strong>«مواد»</strong> أو اسم أي مادة من الـ 7 مواد في واتساب الخدمة للرد عليك آلياً وفورياً بملف المادة المعتمد وجدولها 📚</p>',
            '  <div style="display:flex; gap:8px; flex-wrap:wrap;">',
            '    <button type="button" onclick="switchKioskTab(\'bot\')" class="k-btn" style="flex:1; background:linear-gradient(135deg, #25D366 0%, #128C7E 100%); color:#FFF; font-size:0.82rem; padding:8px 14px; border-radius:10px; border:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; font-weight:800; box-shadow:0 4px 12px rgba(37,211,102,0.3); cursor:pointer;">',
            '      <i class="fa-solid fa-robot"></i> فتح كشك الاستعلام التفاعلي الآن 📲',
            '    </button>',
            '    <a href="' + OFFICIAL_KIOSK_DATA.driveFolder + '" target="_blank" class="k-btn" style="background:rgba(255,255,255,0.12); color:#FFF; font-size:0.82rem; padding:8px 14px; border-radius:10px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; font-weight:700; border:1px solid rgba(255,255,255,0.25);">',
            '      <i class="fa-solid fa-folder-open text-warning"></i> مجلد الملازم السحابي 📁',
            '    </a>',
            '  </div>',
            '</div>'
        ].join('\n');

        // 2. شريط التبديل بين وضع البطاقات ووضع المحادثة الذكية (Mode Switcher)
        var tabNavigation = [
            '<div style="display:flex; background:var(--k-surface-2, #F1F5F9); padding:4px; border-radius:12px; margin-bottom:14px; border:1px solid var(--k-border, #E2E8F0);">',
            '  <button type="button" id="kiosk-tab-subjects-btn" onclick="switchKioskTab(\'subjects\')" class="k-btn active" style="flex:1; background:var(--k-primary, #0B2A6B); color:#FFF; font-size:0.82rem; padding:7px 12px; border-radius:8px; border:none; font-weight:800; cursor:pointer; transition:all 0.2s;">',
            '    <i class="fa-solid fa-layer-group me-1"></i> قائمة المواد الـ 7 المعتمدة',
            '  </button>',
            '  <button type="button" id="kiosk-tab-bot-btn" onclick="switchKioskTab(\'bot\')" class="k-btn" style="flex:1; background:transparent; color:var(--k-text, #071A38); font-size:0.82rem; padding:7px 12px; border-radius:8px; border:none; font-weight:800; cursor:pointer; transition:all 0.2s;">',
            '    <i class="fa-solid fa-comments text-success me-1"></i> المحادثة التفاعلية الذكية (Chatbot)',
            '  </button>',
            '</div>'
        ].join('\n');

        // 3. أزرار اختيار السنة الدراسية (Stage Switcher Chips)
        var stageChips = [
            '<div style="display:flex; gap:8px; margin-bottom:14px; align-items:center;">',
            '  <span style="font-size:0.82rem; font-weight:800; color:var(--k-primary, #0B2A6B);">السنة الدراسية:</span>',
            '  <button type="button" class="k-chip ' + (activeStage === 'الفرقة الأولى' ? 'active' : '') + '" onclick="openStudentMaterialsModal(\'الفرقة الأولى\')" style="font-size:0.82rem; padding:6px 14px; border-radius:999px;">',
            '    🎓 الفرقة الأولى (7 مواد) ' + (studentDefaultStage === 'الفرقة الأولى' ? '⭐ فرقتك' : ''),
            '  </button>',
            '  <button type="button" class="k-chip ' + (activeStage === 'الفرقة الثانية' ? 'active' : '') + '" onclick="openStudentMaterialsModal(\'الفرقة الثانية\')" style="font-size:0.82rem; padding:6px 14px; border-radius:999px;">',
            '    🎓 الفرقة الثانية (7 مواد) ' + (studentDefaultStage === 'الفرقة الثانية' ? '⭐ فرقتك' : ''),
            '  </button>',
            '</div>'
        ].join('\n');

        // 4. قائمة المواد الـ 7 الكاملة للمرحلة المحددة
        var subjectsListHtml = subjects.map(function (s) {
            var detailsId = 'subj_detail_' + s.id;
            var waCourseQuery = 'كورس ' + s.title + ' — ' + activeStage;
            var waCourseUrl = 'https://wa.me/?text=' + encodeURIComponent(waCourseQuery);

            return [
                '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:18px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.2s;">',
                '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">',
                '    <div style="display:flex; align-items:center; gap:10px;">',
                '      <div style="width:40px; height:40px; border-radius:12px; background:var(--k-surface-2, #FFF6DC); border:1px solid var(--k-border-gold, #D4AF37); display:flex; align-items:center; justify-content:center; color:var(--k-primary, #0B2A6B); font-size:1.15rem;">',
                '        <i class="fa-solid ' + s.icon + '"></i>',
                '      </div>',
                '      <div>',
                '        <div style="display:flex; align-items:center; gap:6px;">',
                '          <span style="font-size:0.75rem; font-weight:800; background:var(--k-primary, #0B2A6B); color:#FFF; width:20px; height:20px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;">' + s.num + '</span>',
                '          <strong style="font-size:0.95rem; color:var(--k-text, #071A38);">' + s.title + '</strong>',
                '        </div>',
                '        <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B); display:block; margin-top:2px;">👨‍🏫 ' + s.teachers + '</small>',
                '      </div>',
                '    </div>',
                '    <span style="font-size:0.7rem; font-weight:800; background:#EFF6FF; color:#1D4ED8; padding:3px 8px; border-radius:6px; border:1px solid #BFDBFE;">' + s.lectures + '</span>',
                '  </div>',
                '  <div style="font-size:0.78rem; color:#475569; background:#F8FAFC; padding:8px 12px; border-radius:10px; margin:8px 0 10px 0; display:flex; align-items:center; gap:6px;">',
                '    <i class="fa-solid fa-clock text-muted"></i> <span>' + s.term + '</span>',
                '  </div>',
                '  <!-- الأكورديون للتفاصيل الرسمية للكورس من الكشك -->',
                '  <div id="' + detailsId + '" style="display:none; background:#FFFDF5; border:1px dashed #D4AF37; border-radius:12px; padding:12px; margin-bottom:10px; font-size:0.78rem; color:#334155; line-height:1.55; white-space:pre-wrap;">' + s.replyText + '</div>',
                '  <!-- أزرار الإجراءات التفاعلية المحدثة -->',
                '  <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">',
                '    <button type="button" onclick="toggleSubjectDetails(\'" + detailsId + "\')" class="k-btn" style="background:#F1F5F9; color:#334155; font-size:0.76rem; padding:6px 12px; border-radius:8px; border:1px solid #CBD5E1; cursor:pointer;">',
                '      <i class="fa-solid fa-circle-info text-primary"></i> المنهج والمحاضرات',
                '    </button>',
                '    <button type="button" onclick="askKioskBotAboutSubject(\'" + s.title + "\', \'" + activeStage + "\')" class="k-btn" style="background:#EFF6FF; color:#1D4ED8; font-size:0.76rem; padding:6px 12px; border-radius:8px; border:1px solid #BFDBFE; cursor:pointer; font-weight:700;">',
                '      <i class="fa-solid fa-robot"></i> اسأل البوت 💬',
                '    </button>',
                '    <a href="' + waCourseUrl + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.76rem; padding:6px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:700;">',
                '      <i class="fa-brands fa-whatsapp"></i> طلب من الكشك 📲',
                '    </a>',
                '    <a href="' + s.driveUrl + '" target="_blank" class="k-btn k-btn-primary" style="font-size:0.76rem; padding:6px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">',
                '      <i class="fa-solid fa-cloud-arrow-down"></i> تحميل المذكرة 📥',
                '    </a>',
                '  </div>',
                '</div>'
            ].join('\n');
        }).join('\n');

        // 5. واجهة المحادثة التفاعلية الحية مع البوت (Interactive Chatbot View)
        var botChatView = [
            '<div id="kiosk-bot-view" style="display:none;">',
            '  <!-- شريط حالة البوت الذكي -->',
            '  <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">',
            '    <div style="display:flex; align-items:center; gap:8px;">',
            '      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#22C55E; box-shadow:0 0 8px #22C55E;"></span>',
            '      <strong style="font-size:0.84rem; color:#166534;">روبوت كشك الخدمة الذكي متصل ومفعل فورياً</strong>',
            '    </div>',
            '    <span style="font-size:0.72rem; color:#15803D; font-weight:700;">سيرفر NewWhats 🟢</span>',
            '  </div>',
            '  <!-- صندوق الرسائل التفاعلية -->',
            '  <div id="kiosk-chat-messages" style="height:36vh; min-height:260px; overflow-y:auto; background:var(--k-surface-2, #F8FAFC); border:1px solid var(--k-border, #E2E8F0); border-radius:16px; padding:14px; margin-bottom:10px;">',
            '    <!-- رسالة ترحيب البوت المخصصة -->',
            '    <div style="display:flex; justify-content:flex-start; margin-bottom:12px;">',
            '      <div style="background:var(--k-surface, #FFF); border:1.5px solid var(--k-border, #E2E8F0); border-radius:16px 16px 16px 3px; max-width:90%; padding:14px; box-shadow:0 3px 10px rgba(0,0,0,0.04); text-align:right;">',
            '        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">',
            '          <div style="width:26px; height:26px; border-radius:50%; background:#0B2A6B; color:#D4AF37; display:flex; align-items:center; justify-content:center; font-size:0.78rem;"><i class="fa-solid fa-cross"></i></div>',
            '          <strong style="font-size:0.86rem; color:var(--k-primary, #0B2A6B);">مساعد كشك الاستعلام الذاتي</strong>',
            '        </div>',
            '        <p style="font-size:0.81rem; color:var(--k-text, #1E293B); margin:0; line-height:1.5;">سلام ونعمة يا <strong>' + studentName + '</strong> 🤍🕊️\nمرحلتك المسجلة: <strong>' + studentDefaultStage + '</strong> 🎓\nأنا بوت كشك الخدمة الآلي، اضغط على أي استفسار مقترح بالأسفل أو اكتب اسم المادة التي تبحث عنها:</p>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <!-- أزرار الاستعلام السريع المقترحة (Suggestion Chips) -->',
            '  <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:10px; scrollbar-width:thin;">',
            '    <button type="button" onclick="sendKioskQuickQuery(\'عرض مواد فرقتي الـ 7\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">📚 مواد فرقتي</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'كورس الكتاب المقدس\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">📖 كورس الكتاب المقدس</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'كورس العقيدة الأرثوذكسية\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">✝️ كورس العقيدة</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'كورس الطقس الكنسي\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">⛪ كورس الطقس</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'كورس تاريخ الكنيسة\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">📜 تاريخ الكنيسة</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'كارنيهي الذكي QR\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">💳 كارنيهي الذكي</button>',
            '    <button type="button" onclick="sendKioskQuickQuery(\'عذر غياب عن اجتماع الجمعة\')" class="k-chip" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap; border-radius:999px;">🕊️ عذر غياب</button>',
            '  </div>',
            '  <!-- شريط إدخال الرسالة للشات -->',
            '  <div style="display:flex; gap:8px;">',
            '    <input type="text" id="kiosk-chat-input" placeholder="اكتب سؤالك أو اسم المادة للبوت مباشرة..." onkeydown="if(event.key===\'Enter\') sendKioskChatFromInput()" style="flex:1; padding:9px 14px; border-radius:12px; border:1.5px solid var(--k-border, #CBD5E1); background:var(--k-surface, #FFF); color:var(--k-text, #071A38); font-size:0.83rem; outline:none;" />',
            '    <button type="button" onclick="sendKioskChatFromInput()" class="k-btn k-btn-primary" style="padding:9px 16px; border-radius:12px; font-weight:800; font-size:0.83rem; display:inline-flex; align-items:center; gap:5px; cursor:pointer;">',
            '      <span>إرسال</span> <i class="fa-solid fa-paper-plane"></i>',
            '    </button>',
            '  </div>',
            '</div>'
        ].join('\n');

        var subjectsViewHtml = [
            '<div id="kiosk-subjects-view">',
            stageChips,
            '<div style="max-height:55vh; overflow-y:auto; padding-right:2px;">' + subjectsListHtml + '</div>',
            '</div>'
        ].join('\n');

        var fullContent = kioskBanner + tabNavigation + subjectsViewHtml + botChatView;
        showStudentModal('studentMaterialsModal', '<i class="fa-solid fa-book-bible" style="color:#D4AF37;"></i> المواد التعليمية وكشك الاستعلام', fullContent);
    };

    // ==============================================================
    // 4️⃣ متابعة التقدم والتأهيل (Qualification Index & Progress)
    // ==============================================================
        window.openStudentProgressModal = function () {
        var studentDefaultStage = detectCurrentStudentStage();
        var content = [
            '<div style="background:var(--k-surface, #FFF); border:1.5px solid var(--k-border-gold, #D4AF37); border-radius:20px; padding:20px; margin-bottom:16px; text-align:center; box-shadow:0 4px 16px rgba(0,0,0,0.04);">',
            '  <span style="font-size:0.78rem; font-weight:800; background:var(--k-surface-2, #FFF6DC); color:var(--k-primary, #0B2A6B); padding:4px 12px; border-radius:999px; border:1px solid var(--k-border-gold, #D4AF37);">' + studentDefaultStage + ' &middot; دفعة القديس بولس</span>',
            '  <div style="margin:16px 0 10px 0;">',
            '    <span style="font-size:2.8rem; font-weight:900; color:var(--k-primary, #0B2A6B); line-height:1;">78%</span>',
            '    <small style="display:block; font-size:0.8rem; color:var(--k-text-muted, #64748B); font-weight:700; margin-top:4px;">مؤشر التأهيل العام للرسامة والخدمة</small>',
            '  </div>',
            '  <div style="height:10px; background:#F1F5F9; border-radius:999px; overflow:hidden; margin:0 auto 12px auto; max-width:280px;">',
            '    <div style="width:78%; height:100%; background:linear-gradient(90deg, var(--k-primary, #0B2A6B), var(--k-accent, #D4AF37)); border-radius:999px;"></div>',
            '  </div>',
            '  <p style="font-size:0.82rem; color:var(--k-text, #071A38); margin:0;">أنت على بُعد خطوات مباركة من إتمام متطلبات رسامة الخدام، واظب على حضور الجمعة والمحاضرات.</p>',
            '</div>',

            '<h5 style="font-size:0.92rem; font-weight:800; color:var(--k-primary, #0B2A6B); margin:14px 0 10px 0;"><i class="fa-solid fa-list-check text-warning me-1"></i> متطلبات التخرج المعتمدة</h5>',
            '<div style="display:flex; flex-direction:column; gap:8px;">',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">',
            '    <span style="font-size:0.85rem; color:var(--k-text, #071A38);"><i class="fa-solid fa-circle-check text-success me-1"></i> نسبة حضور اجتماعات الجمعة</span>',
            '    <strong style="font-size:0.85rem; color:#15803D;">85% (مستوفى ✔️)</strong>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">',
            '    <span style="font-size:0.85rem; color:var(--k-text, #071A38);"><i class="fa-solid fa-circle-check text-success me-1"></i> امتحانات المواد الـ 7 الأساسية</span>',
            '    <strong style="font-size:0.85rem; color:var(--k-primary, #0B2A6B);">ناجح في 5 / 7 مواد</strong>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">',
            '    <span style="font-size:0.85rem; color:var(--k-text, #071A38);"><i class="fa-solid fa-circle-check text-success me-1"></i> الانضباط الرعوي ومتابعة الاعتراف</span>',
            '    <strong style="font-size:0.85rem; color:#15803D;">منتظم ومحدث ✔️</strong>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">',
            '    <span style="font-size:0.85rem; color:var(--k-text, #071A38);"><i class="fa-solid fa-hourglass-half text-warning me-1"></i> التدريب الميداني وإعداد الدروس</span>',
            '    <strong style="font-size:0.85rem; color:#B45309;">قيد التقييم (الترم 2)</strong>',
            '  </div>',
            '</div>'
        ].join('\n');

        showStudentModal('studentProgressModal', '<i class="fa-solid fa-chart-line" style="color:#D4AF37;"></i> متابعة التقدم والتأهيل الكنسي', content);
    };

})();
