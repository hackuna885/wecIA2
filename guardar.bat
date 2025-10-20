@echo off
git add .
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set "current_date=%%c-%%b-%%a"
)
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do (
    set "current_time=%%a-%%b-%%c"
)
git commit -m "%current_date% %current_time%"
git push -u origin master