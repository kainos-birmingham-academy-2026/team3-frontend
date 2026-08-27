module "frontend" {
  source = "../../modules/frontend-app"

  project_name            = var.project_name
  environment             = var.environment
  location                = var.location
  acr_name                = var.acr_name
  acr_resource_group_name = var.acr_resource_group_name
  image_tag               = var.image_tag
  enable_admin_hiring     = var.enable_admin_hiring
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}