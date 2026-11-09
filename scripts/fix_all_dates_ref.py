file_path = r'public/js/dashboard/dashboard-radar.js'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

target = "renderRadarCopticFasting();"
if target in code:
    replacement = "renderRadarCopticFasting();\n\n        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();"
    # match CRLF or LF
    if "renderRadarCopticFasting();\r\n" in code:
        code = code.replace("renderRadarCopticFasting();\r\n", "renderRadarCopticFasting();\r\n\r\n        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();\r\n", 1)
    else:
        code = code.replace("renderRadarCopticFasting();\n", "renderRadarCopticFasting();\n\n        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();\n", 1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: Fixed allDates in dashboard-radar.js")
else:
    print("ERROR: Target not found")
