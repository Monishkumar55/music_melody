$ErrorActionPreference = "Stop"

$sdkDir = "E:\android-sdk"
$zipPath = "E:\cmdline-tools.zip"
$cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "=== Step 1: Setting up Android SDK at $sdkDir ==="
if (-not (Test-Path "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat")) {
    New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools" | Out-Null
    if (-not (Test-Path $zipPath)) {
        Write-Host "Downloading Android Command Line Tools..."
        Invoke-WebRequest -Uri $cmdlineUrl -OutFile $zipPath
    }
    Write-Host "Extracting Command Line Tools..."
    Expand-Archive -Path $zipPath -DestinationPath "$sdkDir\cmdline-tools-temp" -Force
    New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools\latest" | Out-Null
    Copy-Item -Path "$sdkDir\cmdline-tools-temp\cmdline-tools\*" -Destination "$sdkDir\cmdline-tools\latest" -Recurse -Force
    Remove-Item -Path "$sdkDir\cmdline-tools-temp" -Recurse -Force
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
}

Write-Host "=== Step 2: Auto-accepting Android SDK & NDK Licenses ==="
$licenseDir = "$sdkDir\licenses"
if (-not (Test-Path $licenseDir)) { New-Item -ItemType Directory -Force -Path $licenseDir | Out-Null }

Set-Content -Path "$licenseDir\android-sdk-license" -Value "89330172545f1541e15150d07370d9a6cdbea367`n24333f8a63718c309d67c6701702db068842356d`n84831b9409646a918e30573bab4c9c91346d8abd`nd9754551b780a0039f6371308a8039877770d576`n7a934639930f4a18b6d03835b0a3359d2314da10"
Set-Content -Path "$licenseDir\android-googletv-license" -Value "601007107780070f5199e287ff6727c726e57686"
Set-Content -Path "$licenseDir\android-sdk-preview-license" -Value "84831b9409646a918e30573bab4c9c91346d8abd"
Set-Content -Path "$licenseDir\android-sdk-arm-dbt-license" -Value "859f317696e35e2c974709d287c9213381a31365"
Set-Content -Path "$licenseDir\google-gdk-license" -Value "33b6a2b646279ee1704126d935607d0515670356"

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:ANDROID_HOME = $sdkDir
$sdkManager = "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Installing SDK & NDK packages..."
cmd /c "`"$sdkManager`" --sdk_root=`"$sdkDir`" `"platforms;android-34`" `"build-tools;34.0.0`" `"ndk;26.1.10909125`" `"platform-tools`""

Write-Host "=== Step 3: Setting local.properties in android project ==="
$androidProjDir = "E:\songstr\songstr\songstr\app\android"
$localProps = "$androidProjDir\local.properties"
Set-Content -Path $localProps -Value "sdk.dir=E:/android-sdk"

Write-Host "=== Step 4: Compiling Android APK ==="
Set-Location $androidProjDir
cmd /c "`"$env:JAVA_HOME\bin\java.exe`" -version"
& .\gradlew.bat assembleDebug

$generatedApk = "$androidProjDir\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $generatedApk) {
    $outDir = "E:\songstr\songstr\songstr\reports"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
    $finalApk = "$outDir\songstr-mobile.apk"
    Copy-Item -Path $generatedApk -Destination $finalApk -Force
    Write-Host "SUCCESS! APK created at: $finalApk"
} else {
    Write-Error "APK file not found after build!"
}
