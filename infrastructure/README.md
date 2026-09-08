# Frontend Infrastructure

Terraform deploys the frontend as a public Azure Container App. The frontend is
an Express server, so it calls the private backend from inside the shared
Container App Environment; browsers only connect to the public frontend.

## Environment roots

Small independent roots under `infrastructure/environments/` configure the
reusable `modules/frontend-app` module:

- `dev` uses `team3-frontend-dev.tfstate`.
- `test` uses the isolated `team3-frontend-test.tfstate` state key.
- `prod` uses the separate `team3-frontend-prod.tfstate` state key.

Each root owns only its frontend identity, role assignments, and Container App.
Shared resources created by the backend Terraform are read as data sources.
The backend and frontend deliberately use separate state keys even when they
deploy into the same resource group. They run from different repositories and
own different resources, so separate state avoids cross-workflow state locks
and prevents a frontend plan from changing backend-owned infrastructure. All
state keys remain centrally stored in the same Azure storage account and
`tfstate` container.

## Resource ownership

For each environment, the backend state owns the resource group, Key Vault,
Container Apps Environment, and backend Container App. The frontend reads those
resources as data sources and owns:

- User-assigned identity `id-team3-frontend-<env>`.
- `AcrPull` and `Key Vault Secrets User` role assignments for that identity.
- Public Container App `ca-team3-frontend-<env>` on port `3000`.

The frontend receives the backend's internal FQDN as `API_BASE_URL` and reads
`session-secret` from Key Vault through its managed identity. The dev root also
contains migration declarations that preserve existing frontend resource
addresses and release the shared resource group from frontend state without
destroying it.

## Images

Dev deploys `dev-<commit-sha>` and test deploys `test-<commit-sha>`. CI also
publishes matching `dev-latest` and `test-latest` convenience tags, but
Terraform deploys immutable commit tags. Production rejects `latest` and
`dev-latest`.

Registry cleanup is owned by the backend dev Terraform state because the ACR is
shared. A daily ACR Task removes old backend and frontend dev and test artifacts
independently of application deployment workflows; production tags are
excluded. CI disables unused Buildx provenance so new single-platform images do
not accumulate untagged OCI child manifests.

## Deployment workflow

The frontend workflow verifies that the matching backend Container App exists
before planning or applying Terraform.

- A frontend push to `main` builds and deploys dev when the backend exists.
- A successful backend dev deployment sends `backend-dev-deployed`, which
  builds and deploys frontend dev from its default branch.
- A manual backend test deployment sends `backend-test-deployed` with the
  resolved `frontend_ref`. The frontend tests that commit, publishes
  `test-<commit-sha>`, and deploys it to `rg-team3-test`.
- Pull requests run checks and a dev Terraform plan, but do not deploy.

Start an isolated test deployment from the backend repository's **CI** workflow
on `main`. Choose `main` for a ref when that application should use current
integrated code; choose a feature branch, tag, or SHA only for the application
change under test. The backend infrastructure README contains the complete
input table.

The selected frontend ref controls application code only. Terraform for the
test deployment is checked out from the frontend default branch.

Configure `FRONTEND_REPOSITORY_DISPATCH_TOKEN` in the backend repository as a
fine-grained token with Contents write permission on `team3-frontend`. GitHub's
built-in repository token cannot dispatch workflows in another repository.

The frontend workflow also requires `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID`, and `ACR_LOGIN_SERVER` repository secrets. Terraform
uses the Azure identity through OIDC; no long-lived Azure client secret is
required.

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

## Production status

Production is not deployed by the current frontend workflow. Before adding a
protected production deployment with manual approval:

- Complete and deploy the backend production platform first.
- Ensure `session-secret` exists in `kv-team3-prod`.
- Push an immutable tested frontend image.
- Grant the deployment identity access to the resource group, shared ACR, Key
  Vault RBAC, and remote state.

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
