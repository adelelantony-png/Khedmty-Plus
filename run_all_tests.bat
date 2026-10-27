@echo off
chcp 65001 >nul
echo ================================================================
echo   تشغيل حزم اختبارات نظام خدمتي برو (Khedmety-Plus)
echo ================================================================
set NODE_EXE=..\node-v24.16.0-win-x64\node.exe
if not exist "%NODE_EXE%" set NODE_EXE=..\02_WhatsApp_NewWhats\Backend_Node\node\node.exe
if not exist "%NODE_EXE%" (
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set NODE_EXE=node
    ) else (
        echo [خطأ] لم يتم العثور على Node.js المحمول ولا المثبت!
        pause
        exit /b 1
    )
)

echo [1/13] تشغيل اختبارات Batch A.1...
"%NODE_EXE%" test_batch_a1.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [2/13] تشغيل اختبارات التصميم Batch A Design...
"%NODE_EXE%" test_batch_a_design.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [3/13] تشغيل اختبارات الأمان المرحلة 1...
"%NODE_EXE%" test_phase1_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [4/13] تشغيل اختبارات الأمان والـ API المرحلة 3...
"%NODE_EXE%" test_phase3_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [5/13] تشغيل اختبارات الواجهات والـ PWA والتنقل...
"%NODE_EXE%" test_ui_pwa.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [6/13] تشغيل فحص صحة بناء الجملة لصفحة رصد الدرجات...
"%NODE_EXE%" test_syntax_grades.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [7/13] تشغيل اختبارات سلم الشرائح واستوديو الواقع...
"%NODE_EXE%" test_reality_curve_analytics.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [8/13] تشغيل المحاكاة العميقة للمنظومة ثلاثية الأركان...
"%NODE_EXE%" test_deep_simulation.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [9/13] تشغيل اختبارات الفلترة المتعددة لمعايير ومواد التقييم...
"%NODE_EXE%" test_multi_criteria_filtering.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [10/13] تشغيل اختبارات فلترة ملاحظات الجانب الروحي والنفسي...
"%NODE_EXE%" test_notes_filtering.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [11/13] تشغيل اختبارات تصدير الإكسيل (المعادلات الحية + الملاحظات + ملخص الأعداد)...
"%NODE_EXE%" test_excel_formulas_and_notes.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [12/13] تشغيل اختبارات ثبات وحفظ واسترجاع الدرجات العظمى للامتحانات الأربعة...
"%NODE_EXE%" test_exam_max_scores_persistence.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [13/14] تشغيل اختبارات جدول التوزيع التكراري للنسب والمواد (0%، 1-10%...)...
"%NODE_EXE%" test_subject_distribution_table.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [14/15] تشغيل اختبارات عزل الملاحظات الروحية (الشعر والاعتراف) مع الشفوي المعلق...
"%NODE_EXE%" test_spiritual_oral_pending_isolation.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [15/16] تشغيل اختبارات تبويب وفئة "لديهم ملاحظات" وشريط التبويبات السريعة...
"%NODE_EXE%" test_notes_tab_and_category.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [16/16] تشغيل اختبارات تبسيط وتطوير تجربة المستخدم الشاملة (الاستوديو، الرصد السريع، كارت 360، الترقيم)...
"%NODE_EXE%" test_ux_declutter_and_enhancements.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo.
echo ================================================================
echo   تهانينا! جميع الاختبارات الـ 16 نجحت بنسبة 100%% بنجاح تام!
echo ================================================================
pause
