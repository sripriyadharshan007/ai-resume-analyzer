@echo off
setlocal
set "DIR=%~dp0"
set "MVN_CMD=%DIR%..\maven-dist\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%MVN_CMD%" (
    "%MVN_CMD%" %*
) else (
    echo [ERROR] Local Maven installation not found at %MVN_CMD%
    echo Please ensure the Maven download task has completed successfully.
    exit /b 1
)
endlocal
