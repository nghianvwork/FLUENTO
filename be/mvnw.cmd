@REM Licensed to the Apache Software Foundation (ASF)
@REM Maven Wrapper script for Windows
@echo off

@setlocal

set WRAPPER_DIR="%~dp0.mvn\wrapper"
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties
set DOWNLOAD_URL="https://repo1.maven.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
set MAVEN_PROJECTBASEDIR=%~dp0

@REM Find java.exe
if defined JAVA_HOME (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
    if exist "%JAVA_HOME%\bin\java.exe" goto javaOk
)

set JAVA_EXE=java.exe
java.exe -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto javaOk

echo.
echo ERROR: Java is not installed or JAVA_HOME is not set.
echo Please install Java 17+: https://adoptium.net/
echo.
goto error

:javaOk
@REM Download maven-wrapper.jar if not exists
if exist %WRAPPER_JAR% goto runWrapper

echo Maven Wrapper JAR not found. Downloading...
if not exist %WRAPPER_DIR% mkdir %WRAPPER_DIR%

@REM Try curl first (available on Windows 10+)
where curl >NUL 2>&1
if %ERRORLEVEL% equ 0 (
    curl -sL -o %WRAPPER_JAR% %DOWNLOAD_URL%
    if exist %WRAPPER_JAR% goto runWrapper
)

@REM Try PowerShell as fallback
powershell -Command "Invoke-WebRequest -Uri %DOWNLOAD_URL% -OutFile %WRAPPER_JAR%" >NUL 2>&1
if exist %WRAPPER_JAR% goto runWrapper

@REM Try certutil as last resort
certutil -urlcache -split -f %DOWNLOAD_URL% %WRAPPER_JAR% >NUL 2>&1
if exist %WRAPPER_JAR% goto runWrapper

echo ERROR: Could not download maven-wrapper.jar
echo Please download manually from:
echo   %DOWNLOAD_URL%
echo And place it in: %WRAPPER_DIR%
goto error

:runWrapper
set MAVEN_CMD_LINE_ARGS=%*
"%JAVA_EXE%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  -jar %WRAPPER_JAR% %MAVEN_CMD_LINE_ARGS%
if %ERRORLEVEL% neq 0 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

cmd /C exit /B %ERROR_CODE%
