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
  enable_front_door       = var.enable_front_door
  enable_private_e2e      = var.enable_private_e2e
  e2e_image_tag           = var.e2e_image_tag
  tags = merge(var.tags, {
    environment = var.environment
  })
}
