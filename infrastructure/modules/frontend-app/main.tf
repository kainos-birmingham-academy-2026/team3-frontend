locals {
  resource_group_name         = "rg-${var.project_name}-${var.environment}"
  key_vault_name              = "kv-${var.project_name}-${var.environment}"
  managed_identity_name       = "id-${var.project_name}-frontend-${var.environment}"
  container_environment_name  = "cae-${var.project_name}-${var.environment}"
  backend_container_app_name  = "ca-${var.project_name}-backend-${var.environment}"
  frontend_container_app_name = "ca-${var.project_name}-frontend-${var.environment}"
}

data "azurerm_resource_group" "existing" {
  name = local.resource_group_name
}

data "azurerm_key_vault" "existing" {
  name                = local.key_vault_name
  resource_group_name = data.azurerm_resource_group.existing.name
}

data "azurerm_container_app_environment" "existing" {
  name                = local.container_environment_name
  resource_group_name = data.azurerm_resource_group.existing.name
}

data "azurerm_container_app" "backend" {
  name                = local.backend_container_app_name
  resource_group_name = data.azurerm_resource_group.existing.name
}

data "azurerm_container_registry" "shared" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

module "managed_identity" {
  source = "../user-assigned-identity"

  name                = local.managed_identity_name
  location            = var.location
  resource_group_name = data.azurerm_resource_group.existing.name
  tags                = var.tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
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
  name                         = local.frontend_container_app_name
  container_app_environment_id = data.azurerm_container_app_environment.existing.id
  resource_group_name          = data.azurerm_resource_group.existing.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [module.managed_identity.id]
  }

  registry {
    server   = data.azurerm_container_registry.shared.login_server
    identity = module.managed_identity.id
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${data.azurerm_key_vault.existing.vault_uri}secrets/session-secret"
    identity            = module.managed_identity.id
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    revision_suffix = var.revision_suffix
    min_replicas    = 1
    max_replicas    = 1

    container {
      name   = "frontend"
      image  = "${data.azurerm_container_registry.shared.login_server}/team3-frontend:${var.image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "API_BASE_URL"
        value = "https://${data.azurerm_container_app.backend.ingress[0].fqdn}"
      }

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name  = "FEATURE_ADMIN_HIRING_ENABLED"
        value = tostring(var.enable_admin_hiring)
      }
    }
  }

  tags = var.tags

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
  ]
}