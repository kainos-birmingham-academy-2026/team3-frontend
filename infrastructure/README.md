# Frontend Infrastructure

Terraform deploys the frontend as a public Azure Container App. The frontend is
an Express server, so it calls the private backend from inside the shared
Container App Environment; browsers only connect to the public frontend.

## Environment roots

Small independent roots under `infrastructure/environments/` configure the
reusable `modules/frontend-app` module:

- `dev` uses `team3-frontend-dev.tfstate`.
- `test` is a reusable root for `test1`, `test2`, and `test3`,
  using the isolated `team3-frontend-<slot>.tfstate` state key.
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

## Azure Front Door

Dev and every test root require Azure Front Door Standard. The frontend module
creates a profile, default-domain endpoint, frontend origin group, enabled
frontend origin, and HTTPS-only route for each environment. Terraform exposes
the resulting `azurefd.net` URL as `front_door_endpoint_url`. The shared module
remains configurable so production is unaffected.

Origin protection combines Container Apps ingress Allow rules for the current
`AzureFrontDoor.Backend` IPv4 CIDRs with frontend middleware that validates
`X-Azure-FDID` against the profile ID supplied by Terraform. Neither control
is sufficient alone. The CIDRs are read from Azure at plan time; an empty list
fails the plan. Public IPv6 origin connectivity is not enabled by this policy.
The public hostname still exists, but direct clients should be denied.

CIDRs are not a live service-tag binding. Review and reapply each dev and test
environment regularly (at least weekly) to incorporate Azure range changes. No
scheduled refresh is installed by this change.
Subnet NSGs are not a substitute: public ingress on external workload-profile
environments bypasses the subnet. See Microsoft's
[origin security guidance](https://learn.microsoft.com/en-us/azure/frontdoor/origin-security)
and [Container Apps networking restrictions](https://learn.microsoft.com/en-us/azure/container-apps/firewall-integration).

Initial deployment can cause a short interruption while origin restrictions and
Front Door propagate. Direct public origin access remains intentionally denied.

The HTTPS HEAD probe uses `/healthz` behind the same profile guard. It checks
frontend process readiness, not backend/database health. No route cache block
is configured, so personalised responses are not cached by Front Door. Custom
domains and WAF policies remain out of scope. Front Door Standard has ongoing
profile and usage charges while provisioned.

Before completing the rollout, check HTTPS and HTTP-to-HTTPS redirection at
`front_door_endpoint_url`, login/session persistence, and dynamic pages. From
outside Azure Front Door, both direct-origin requests and direct requests with
a forged correct `X-Azure-FDID` must be denied. Verify another Front Door
profile cannot use this origin, and check the `/healthz` probe is healthy.
These are required live checks; mocked tests do not establish network isolation.

Offline checks: `terraform -chdir=infrastructure/environments/test test
-filter=tests/front-door.tftest.hcl` and
`npx vitest run test/middleware/frontDoor.test.ts`.

## Test3 private E2E runner

Set `TEST3_PRIVATE_E2E_ENABLED` to `true` only after Front Door is enabled for
test3. The test deployment then creates and runs
`caj-team3-private-e2e-test3` in the Container Apps environment. Its Playwright
image reaches the protected frontend through Front Door and reaches the backend
and PostgreSQL through the private environment.

The job runs the Chromium registration and sign-in journey only. It creates
unique test users and deletes those users after each test, but explicitly does
not run `prisma migrate reset`; destructive schema resets remain isolated to
local or dedicated test databases. The deployment workflow polls the job and
fails when its execution does not succeed. Inspect Container Apps job logs for
the execution name reported by CI when diagnosing a failure.

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
  resolved `frontend_ref` and `test_environment`. The frontend validates the
  slot, tests that commit, publishes `test-<commit-sha>`, and deploys it to
  `rg-team3-<slot>`. Missing or unsupported slot payloads fail validation.
- Pull requests run checks and a dev Terraform plan, but do not deploy.

Before the first deployment, tear down and recreate each disposable dev and test
resource group, including frontend resources in their separate Terraform state.
Start an isolated test deployment from the backend repository's **CI** workflow
on `main`. Choose `main` for a ref when that application should use current
integrated code; choose a feature branch, tag, or SHA only for the application
change under test. The backend infrastructure README contains the complete
input table.

Select the slot only in the backend workflow; the frontend receives it
automatically. Each slot has separate state and deployment concurrency, while
commit-tagged images can be shared. Merge this frontend support before enabling
numbered slots in the backend repository. Existing legacy state is unchanged,
but legacy `test` deployments are no longer supported. Avoid Test deployments
between the two repository merges.

For local numbered-slot deployments, override both the environment and state
key. The checked-in `backend.hcl` and variable default now target `test1`.
Reinitialise any locally cached legacy backend before planning. After setting the
required image tag and Azure authentication:

```bash
export TF_VAR_environment=test2
terraform -chdir=infrastructure/environments/test init -reconfigure \
  -backend-config=backend.hcl \
  -backend-config="key=team3-frontend-${TF_VAR_environment}.tfstate"
```

Do not use `-migrate-state` to switch slots or reuse another slot's state key.
The backend lifecycle starts `test1` on weekday mornings and deletes all test
slots in the evening; `test2` and `test3` are started manually when needed.

To accept future slots such as `test4` and `test5`, extend the CI dispatch
allowlist and the Test Terraform `environment` validation list. The backend
must also update its dropdowns, allowlists and scheduled cleanup list. No new
Terraform directories are required; state keys and resource names are dynamic.

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
