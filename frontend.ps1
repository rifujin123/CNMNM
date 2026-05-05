# Expo với tunnel (truyền --tunnel vào `expo start` qua npm).
$RepoRoot = $PSScriptRoot
Set-Location (Join-Path $RepoRoot "TravelBookingSystem")
npm start -- --tunnel
