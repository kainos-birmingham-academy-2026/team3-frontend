module "frontend" {
  source = "../../modules/frontend-app"

  project_name            = var.project_name
  environment             = var.environment
  location                = var.location
  acr_name                = var.acr_name
  acr_resource_group_name = var.acr_resource_group_name
  image_tag               = var.image_tag
  revision_suffix         = var.container_revision_suffix
  enable_admin_hiring     = var.enable_admin_hiring
  tags = merge(var.tags, {
    environment = var.environment
  })
}

moved {
  from = module.managed_identity
  to   = module.frontend.module.managed_identity
}

moved {
  from = azurerm_role_assignment.acr_pull
  to   = module.frontend.azurerm_role_assignment.acr_pull
}

moved {
  from = azurerm_role_assignment.key_vault_secrets_user
  to   = module.frontend.azurerm_role_assignment.key_vault_secrets_user
}

moved {
  from = azurerm_container_app.frontend
  to   = module.frontend.azurerm_container_app.frontend
}

removed {
  from = module.resource_group

  lifecycle {
    destroy = false
  }
}