# SentraSec Azure Free-Tier Deployment

This project is designed for:

- Azure Static Web Apps Free plan for the React site and API.
- Azure Cosmos DB free tier with `enableFreeTier: true`.
- One Cosmos DB database with 1,000 RU/s database-level throughput and five containers.

Run:

```powershell
az login
az group create --name sentrasec-rg --location eastus
az deployment group create --resource-group sentrasec-rg --template-file infra/main.bicep --parameters @infra/parameters.json
```

After deployment, add these Static Web App application settings:

```text
COSMOS_ENDPOINT
COSMOS_KEY
COSMOS_DATABASE=sentrasec
OAUTH_REDIRECT_BASE=https://your-static-web-app.azurestaticapps.net
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Cost guardrails:

- Keep only one Cosmos DB free-tier account per Azure subscription.
- Keep database throughput at or below 1,000 RU/s and storage below 25 GB.
- Keep Static Web Apps SKU as `Free`.
