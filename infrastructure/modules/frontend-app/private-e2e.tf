resource "azurerm_container_app_job" "private_e2e" {
  count = var.enable_private_e2e ? 1 : 0

  name                         = "caj-${var.project_name}-private-e2e-${var.environment}"
  location                     = var.location
  resource_group_name          = data.azurerm_resource_group.existing.name
  container_app_environment_id = data.azurerm_container_app_environment.existing.id
  replica_timeout_in_seconds   = 300
  replica_retry_limit          = 0

  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [module.managed_identity.id]
  }

  registry {
    server   = data.azurerm_container_registry.shared.login_server
    identity = module.managed_identity.id
  }

  secret {
    name                = "database-url"
    identity            = module.managed_identity.id
    key_vault_secret_id = "${data.azurerm_key_vault.existing.vault_uri}secrets/database-url"
  }

  template {
    container {
      name   = "private-e2e"
      image  = "${data.azurerm_container_registry.shared.login_server}/team3-frontend:${var.e2e_image_tag}"
      cpu    = 1
      memory = "2Gi"

      env {
        name  = "PLAYWRIGHT_BASE_URL"
        value = "https://${azurerm_cdn_frontdoor_endpoint.frontend[0].host_name}"
      }

      env {
        name  = "API_BASE_URL"
        value = "https://${data.azurerm_container_app.backend.ingress[0].fqdn}"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name  = "E2E_PRIVATE_RUNNER"
        value = "true"
      }

      env {
        name  = "E2E_SKIP_DATABASE_RESET"
        value = "true"
      }
    }
  }

  lifecycle {
    precondition {
      condition     = var.enable_front_door
      error_message = "The private Playwright job requires Front Door so it can reach the protected frontend origin."
    }

    precondition {
      condition     = var.e2e_image_tag != null
      error_message = "The private Playwright job requires an immutable e2e_image_tag."
    }
  }

  tags = var.tags

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.key_vault_secrets_user,
    azurerm_container_app.frontend,
  ]
}