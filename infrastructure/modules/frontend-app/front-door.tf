resource "azurerm_cdn_frontdoor_profile" "frontend" {
  count = var.enable_front_door ? 1 : 0

  name                = "afd-${var.project_name}-frontend-${var.environment}"
  resource_group_name = data.azurerm_resource_group.existing.name
  sku_name            = "Standard_AzureFrontDoor"
  tags                = var.tags
}

resource "azurerm_cdn_frontdoor_endpoint" "frontend" {
  count = var.enable_front_door ? 1 : 0

  name                     = "afd-${var.project_name}-frontend-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.frontend[0].id
  tags                     = var.tags
}

resource "azurerm_cdn_frontdoor_origin_group" "frontend" {
  count = var.enable_front_door ? 1 : 0

  name                     = "frontend"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.frontend[0].id

  load_balancing {
    additional_latency_in_milliseconds = 0
    sample_size                        = 4
    successful_samples_required        = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "frontend" {
  count = var.enable_front_door ? 1 : 0

  name                          = "frontend-container-app"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.frontend[0].id
  host_name                     = azurerm_container_app.frontend.ingress[0].fqdn
  origin_host_header            = azurerm_container_app.frontend.ingress[0].fqdn
  http_port                     = 80
  https_port                    = 443

  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "frontend" {
  count = var.enable_front_door ? 1 : 0

  name                          = "frontend"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.frontend[0].id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.frontend[0].id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.frontend[0].id]
  patterns_to_match             = ["/*"]
  supported_protocols           = ["Http", "Https"]
  forwarding_protocol           = "HttpsOnly"
  https_redirect_enabled        = true
  link_to_default_domain        = true
}