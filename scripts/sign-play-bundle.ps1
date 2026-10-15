param([Parameter(Mandatory=$true)][string]$Bundle)
$ErrorActionPreference='Stop'
$resolvedBundle=(Resolve-Path -LiteralPath $Bundle).Path
if ([IO.Path]::GetExtension($resolvedBundle) -ne '.aab') { throw 'Select the unsigned Android App Bundle (.aab).' }
$signingDir=Join-Path $env:LOCALAPPDATA 'AmerikaSocial\android-signing'
$keyFile=Join-Path $signingDir 'amerika-upload.p12'
$passwordFile=Join-Path $signingDir 'password.dpapi'
if (-not (Test-Path -LiteralPath $keyFile)) { throw 'The local upload key is missing. Restore your secure key backup.' }
$jdkRoot=Join-Path $env:LOCALAPPDATA 'AmerikaSocial\android-build-tools\jdk'
$jdkHome=(Get-ChildItem -LiteralPath $jdkRoot -Directory | Select-Object -First 1).FullName
$jarsigner=Join-Path $jdkHome 'bin\jarsigner.exe'
$secret=Get-Content -LiteralPath $passwordFile | ConvertTo-SecureString
$credential=New-Object System.Management.Automation.PSCredential('upload',$secret)
$env:AMERIKA_SIGNING_PASSWORD=$credential.GetNetworkCredential().Password
try {
 & $jarsigner -keystore $keyFile -storetype PKCS12 -storepass:env AMERIKA_SIGNING_PASSWORD -keypass:env AMERIKA_SIGNING_PASSWORD -sigalg SHA256withRSA -digestalg SHA-256 $resolvedBundle amerika-upload
 if ($LASTEXITCODE -ne 0) { throw 'App Bundle signing failed.' }
 & $jarsigner -verify $resolvedBundle
 if ($LASTEXITCODE -ne 0) { throw 'App Bundle signature verification failed.' }
 Write-Output "Signed App Bundle: $resolvedBundle"
} finally { Remove-Item Env:AMERIKA_SIGNING_PASSWORD -ErrorAction SilentlyContinue }
