@echo off
chcp 65001 >nul
echo ================================================================
echo   تشغيل حزم اختبارات نظام خدمتي برو (Khedmety-Plus)
echo ================================================================
set NODE_EXE=..\node-v24.16.0-win-x64\node.exe
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

echo [1/5] تشغيل اختبارات Batch A.1...
"%NODE_EXE%" test_batch_a1.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [2/5] تشغيل اختبارات التصميم Batch A Design...
"%NODE_EXE%" test_batch_a_design.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [3/5] تشغيل اختبارات الأمان المرحلة 1...
"%NODE_EXE%" test_phase1_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [4/5] تشغيل اختبارات الأمان والـ API المرحلة 3...
"%NODE_EXE%" test_phase3_security.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo [5/5] تشغيل اختبارات الواجهات والـ PWA والتنقل...
"%NODE_EXE%" test_ui_pwa.js
if %ERRORLEVEL% neq 0 ( echo فشل الاختبار! & pause & exit /b %ERRORLEVEL% )

echo.
echo ================================================================
echo   تهانينا! جميع الاختبارات الـ 178 نجحت بنسبة 100%% بنجاح تام!
echo ================================================================
pause