@echo off
chcp 65001 >nul
echo ================================================================
echo   رفع ونشر مشروع خدمتي برو على Vercel (Deployment Helper)
echo ================================================================
echo.
echo سيتم الآن تشغيل أداة Vercel الرسمية لنشر المشروع...
set NPX_EXE=..\node-v24.16.0-win-x64\npx.cmd
if not exist "%NPX_EXE%" (
    where npx >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set NPX_EXE=npx
    ) else (
        echo [خطأ] لم يتم العثور على Node / npx!
        pause
        exit /b 1
    )
)
"%NPX_EXE%" vercel
echo.
echo ================================================================
echo إذا أردت تثبيت النشر في الإنتاج الرسمي لاحقاً:
echo استخدم: ..\node-v24.16.0-win-x64\npx.cmd vercel --prod
echo ================================================================
pause