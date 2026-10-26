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

echo [1/11] تشغيل اختبارات Batch A.1...
"%NODE_EXE%" test_batch_a1.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [2/11] تشغيل اختبارات التصميم Batch A Design...
"%NODE_EXE%" test_batch_a_design.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [3/11] تشغيل اختبارات الأمان المرحلة 1...
"%NODE_EXE%" test_phase1_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [4/11] تشغيل اختبارات الأمان والـ API المرحلة 3...
"%NODE_EXE%" test_phase3_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [5/11] تشغيل اختبارات الواجهات والـ PWA والتنقل...
"%NODE_EXE%" test_ui_pwa.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [6/11] تشغيل فحص صحة بناء الجملة لصفحة رصد الدرجات...
"%NODE_EXE%" test_syntax_grades.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [7/11] تشغيل اختبارات سلم الشرائح واستوديو الواقع...
"%NODE_EXE%" test_reality_curve_analytics.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [8/11] تشغيل المحاكاة العميقة للمنظومة ثلاثية الأركان...
"%NODE_EXE%" test_deep_simulation.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [9/11] تشغيل اختبارات الفلترة المتعددة لمعايير ومواد التقييم...
"%NODE_EXE%" test_multi_criteria_filtering.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [10/11] تشغيل اختبارات فلترة ملاحظات الجانب الروحي والنفسي...
"%NODE_EXE%" test_notes_filtering.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [11/11] تشغيل اختبارات تصدير الإكسيل (المعادلات الحية + الملاحظات + ملخص الأعداد)...
"%NODE_EXE%" test_excel_formulas_and_notes.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo.
echo ================================================================
echo   تهانينا! جميع الاختبارات الـ 11 نجحت بنسبة 100%% بنجاح تام!
echo ================================================================
pause
