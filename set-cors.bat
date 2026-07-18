@echo off
set SUB=91f02e34-142c-44ab-9d4d-63ae40bec1a0
set RG=techcup
set SVC=techApi

for %%a in (communication identity-api logistic-service matches-service notification-service payment-service statistics-service teams-api tournament-service users-players-api) do (
  echo Setting CORS for %%a...
  az rest --method PUT --url "https://management.azure.com/subscriptions/%SUB%/resourceGroups/%RG%/providers/Microsoft.ApiManagement/service/%SVC%/apis/%%a/policies/policy?api-version=2022-08-01" --body "{"""properties""":{"""value""":"""<policies><inbound><cors allow-credentials=\"true\"><allowed-origins><origin>https://yellow-moss-04e0e530f.7.azurestaticapps.net</origin><origin>http://localhost:5173</origin></allowed-origins><allowed-methods><method>GET</method><method>POST</method><method>PUT</method><method>DELETE</method><method>PATCH</method><method>OPTIONS</method></allowed-methods><allowed-headers><header>*</header></allowed-headers></cors><base /></inbound></policies>""","""format""":"""xml"""}"
)
