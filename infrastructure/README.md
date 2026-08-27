# Frontend Infrastructure

Terraform deploys the frontend as a public Azure Container App. The frontend is
an Express server, so it calls the private backend from inside the shared
Container App Environment; browsers only connect to the public frontend.

## Environment roots

Small independent roots under `infrastructure/environments/` configure the
reusable `modules/frontend-app` module:

- `dev` retains the existing `dev/terraform.tfstate` state key.
- `prod` uses the separate `team3-frontend-prod.tfstate` state key.

Each root owns only its frontend identity, role assignments, and Container App.
Shared resources created by the backend Terraform are read as data sources.

Dev deploys the mutable `dev-latest` image tag. CI supplies the commit SHA as a
revision suffix so Azure Container Apps creates a new revision on every main
branch deployment. Production requires an immutable commit SHA or release tag
and rejects `latest` and `dev-latest`.

The dev root contains one-time `moved` declarations for existing frontend
resources and a `removed` declaration that releases the shared resource group
from frontend state without destroying it. A verified migration plan reports
`0 to add, 0 to change, 0 to destroy`.

The backend repository owns these shared resources for each environment:

- Resource group `rg-team3-prod`.
- Key Vault `kv-team3-prod`.
- Container App Environment `cae-team3-prod`.
- Backend Container App `ca-team3-backend-prod`.

The frontend production root owns:

- User-assigned identity `id-team3-frontend-prod`.
- `AcrPull` and `Key Vault Secrets User` role assignments for that identity.
- Public Container App `ca-team3-frontend-prod` on port `3000`.

The frontend receives the backend's internal FQDN as `API_BASE_URL` and reads
`session-secret` from the production Key Vault through its managed identity.

## Prerequisites

Before planning production:

- Deploy the backend production root and confirm its Container App is healthy.
- Add a strong `session-secret` to `kv-team3-prod` through an approved secret
  management process.
- Push the tested frontend image SHA or immutable release tag to
  `acraiacademy26.azurecr.io`.
- Grant the deployment identity `Contributor` on `rg-team3-prod`,
  `Role Based Access Control Administrator` on the production resource group
  and shared ACR, `Reader` on the shared ACR, and access to the remote state.

Do not put secret values in Terraform variables, state, committed files, or
command history.

## Production variables

| Variable | Purpose |
| --- | --- |
| `project_name` | Short name used in Azure resource names |
| `environment` | Must be `prod` |
| `location` | Azure region for frontend-owned resources |
| `acr_name` | Existing shared ACR name |
| `acr_resource_group_name` | Resource group containing the shared ACR |
| `image_tag` | Immutable, tested frontend image SHA or release version |
| `enable_admin_hiring` | Enables the frontend hiring feature; defaults to `false` |

## Local checks and plan

Authenticate with Azure and run from the repository root:

```bash
export TF_VAR_project_name=team3
export TF_VAR_environment=prod
export TF_VAR_location=uksouth
export TF_VAR_acr_name=acraiacademy26
export TF_VAR_acr_resource_group_name=rg-ai-academy-26
export TF_VAR_image_tag=<existing-tested-image-sha>
export TF_VAR_enable_admin_hiring=false

terraform -chdir=infrastructure/environments/prod init \
  -backend-config=backend.hcl
terraform fmt -check -recursive infrastructure
terraform -chdir=infrastructure/environments/prod validate
terraform -chdir=infrastructure/environments/prod plan
```

Production is not deployed by the current frontend workflow. Add a protected
production deployment job with manual approval before applying this root in CI.