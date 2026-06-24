# SentraSec

SentraSec is a React + Azure Static Web Apps security intelligence prototype with package-based scanning, browser-safe device telemetry, welcome-email hooks, OAuth handoff endpoints, Cosmos DB persistence, and Azure free-tier infrastructure.

## Stack

- React 18 + Vite
- Recharts dashboard charts
- Azure Static Web Apps Free plan
- Azure Functions API under `api/`
- Azure Cosmos DB free tier with database-level 1,000 RU/s and 25 GB included storage

## Local Build

```powershell
npm install
npm run build

cd api
npm install
npm audit --audit-level=high
```

## Azure Free-Tier Deploy

1. Sign in:

```powershell
az login
```

2. Create resource group:

```powershell
az group create --name sentrasec-rg --location eastus
```

3. Deploy infrastructure:

```powershell
az deployment group create --resource-group sentrasec-rg --template-file infra/main.bicep --parameters @infra/parameters.json
```

4. In GitHub, add this repository secret for the workflow:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN
```

5. Add Static Web App application settings:

```text
COSMOS_ENDPOINT
COSMOS_KEY
COSMOS_DATABASE=sentrasec
OAUTH_REDIRECT_BASE
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

## API Endpoints

- `POST /api/email/welcome`
- `POST /api/security/session`
- `POST /api/agent/install`
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`
- `GET|POST /api/auth/google`
- `GET|POST /api/auth/microsoft`

## Cost Guardrails

- Keep Static Web Apps SKU on `Free`.
- Use only one Cosmos DB free-tier account per Azure subscription.
- Keep Cosmos DB at or below 1,000 RU/s and 25 GB storage.
- Do not enable paid Azure add-ons until billing is reviewed.
