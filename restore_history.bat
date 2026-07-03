@echo off
echo ===================================================
echo Restoring Antigravity 2.0 chat history to IDE...
echo ===================================================
echo.
echo Please ensure the IDE is closed before proceeding.
echo.
pause

set "SRC_DIR=C:\Users\pipeo\.gemini\antigravity"
set "DST_DIR=C:\Users\pipeo\.gemini\antigravity-ide"

echo.
echo Copying root configuration files (index, settings, state)...
robocopy "%SRC_DIR%" "%DST_DIR%" *.* /R:1 /W:1

echo Copying conversations...
robocopy "%SRC_DIR%\conversations" "%DST_DIR%\conversations" /E /R:1 /W:1

echo Copying brain data...
robocopy "%SRC_DIR%\brain" "%DST_DIR%\brain" /E /R:1 /W:1

echo Copying implicit settings/logs...
robocopy "%SRC_DIR%\implicit" "%DST_DIR%\implicit" /E /R:1 /W:1

echo Copying prompting configurations...
robocopy "%SRC_DIR%\prompting" "%DST_DIR%\prompting" /E /XO /R:1 /W:1

echo Copying knowledge items...
robocopy "%SRC_DIR%\knowledge" "%DST_DIR%\knowledge" /E /XO /R:1 /W:1

echo Copying scratch files...
robocopy "%SRC_DIR%\scratch" "%DST_DIR%\scratch" /E /XO /R:1 /W:1

echo Copying HTML artifacts...
robocopy "%SRC_DIR%\html_artifacts" "%DST_DIR%\html_artifacts" /E /XO /R:1 /W:1

echo Copying annotations...
robocopy "%SRC_DIR%\annotations" "%DST_DIR%\annotations" /E /XO /R:1 /W:1

echo Copying context state...
robocopy "%SRC_DIR%\context_state" "%DST_DIR%\context_state" /E /XO /R:1 /W:1

echo Copying browser recordings...
robocopy "%SRC_DIR%\browser_recordings" "%DST_DIR%\browser_recordings" /E /XO /R:1 /W:1

echo Copying code tracker data...
robocopy "%SRC_DIR%\code_tracker" "%DST_DIR%\code_tracker" /E /XO /R:1 /W:1

echo Copying playground files...
robocopy "%SRC_DIR%\playground" "%DST_DIR%\playground" /E /XO /R:1 /W:1

echo.
echo ===================================================
echo Restore complete. You may now reopen the IDE.
echo ===================================================
pause
