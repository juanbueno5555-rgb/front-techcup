$subscription = "91f02e34-142c-44ab-9d4d-63ae40bec1a0"
$rg = "techcup"
$service = "techApi"
$apis = @("communication","identity-api","logistic-service","matches-service","notification-service","payment-service","statistics-service","teams-api","tournament-service","users-players-api")

$policy = [System.IO.File]::ReadAllText("$PSScriptRoot\cors-body.json")

foreach ($api in $apis) {
  Write-Host "Setting CORS for $api..."
  $url = "https://management.azure.com/subscriptions/$subscription/resourceGroups/$rg/providers/Microsoft.ApiManagement/service/$service/apis/$api/policies/policy?api-version=2022-08-01"
  az rest --method PUT --url "$url" --body "$policy" --output none
  if ($?) { Write-Host "  OK" } else { Write-Host "  FAILED" }
}
