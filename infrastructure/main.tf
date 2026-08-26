terraform {
  required_version = ">= 1.5.0"

  # backend-config (resource_group_name, storage_account_name, container_name, key) supplied
  # via `terraform init -backend-config=environments/<env>-backend.tfvars` so each environment
  # gets its own state file without editing this block.
  backend "azurerm" {
    use_azuread_auth = true
    use_oidc         = true
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

  }
}

# Auth via OIDC using ARM_USE_OIDC and Azure service principal environment variables.
provider "azurerm" {
  features {}
}

locals {
  # "prod" reuses the same code; only var.environment changes per pipeline run.
  resource_group_name   = "rg-team3-${var.environment}"
  key_vault_name        = "kv-team3-${var.environment}"
  identity_name         = "id-team3-frontend-${var.environment}"
  container_environment = "cae-team3-${var.environment}"
  acr_name              = "acraiacademy26"
  acr_login_server      = "${local.acr_name}.azurecr.io"
}

module "resource_group" {
  source = "./modules/resource-group"

  name     = local.resource_group_name
  location = var.location
  tags = merge(var.tags, {
    environment = var.environment
  })
}

moved {
  from = azurerm_resource_group.this
  to   = module.resource_group.azurerm_resource_group.this
}

# Pre-existing vault created by the backend; secrets are added manually in the Azure portal.
data "azurerm_key_vault" "existing" {
  name                = local.key_vault_name
  resource_group_name = local.resource_group_name
}

data "azurerm_container_app_environment" "existing" {
  name                = local.container_environment
  resource_group_name = local.resource_group_name
}

data "azurerm_container_registry" "existing" {
  name                = local.acr_name
  resource_group_name = local.resource_group_name
}

# Frontend-specific identity; role assignments granting ACR/Key Vault access come next.
module "managed_identity" {
  source = "./modules/user-assigned-identity"

  name                = local.identity_name
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.existing.id
  role_definition_name = "AcrPull"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_role_assignment" "key_vault_secrets_user" {
  scope                = data.azurerm_key_vault.existing.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.managed_identity.principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_container_app" "frontend" {
  name                         = "ca-team3-frontend-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.existing.id
  resource_group_name          = module.resource_group.resource_group_name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [module.managed_identity.id]
  }

  registry {
    server   = local.acr_login_server
    identity = module.managed_identity.id
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${data.azurerm_key_vault.existing.vault_uri}secrets/session-secret"
    identity            = module.managed_identity.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = "${local.acr_login_server}/team3-frontend:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "API_BASE_URL"
        value = var.backend_api_url
      }

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name  = "FEATURE_ADMIN_HIRING_ENABLED"
        value = "true"
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = merge(var.tags, {
    environment = var.environment
  })

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
  ]
}
