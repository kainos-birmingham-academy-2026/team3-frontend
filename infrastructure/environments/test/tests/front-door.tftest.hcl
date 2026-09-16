mock_provider "azurerm" {
  mock_resource "azurerm_cdn_frontdoor_profile" {
    defaults = {
      id            = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Cdn/profiles/test"
      resource_guid = "00000000-0000-0000-0000-000000000003"
    }
  }
  mock_resource "azurerm_cdn_frontdoor_endpoint" {
    defaults = {
      id        = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Cdn/profiles/test/afdEndpoints/frontend"
      host_name = "test.azurefd.net"
    }
  }
  mock_resource "azurerm_cdn_frontdoor_origin_group" {
    defaults = { id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Cdn/profiles/test/originGroups/frontend" }
  }
  mock_resource "azurerm_cdn_frontdoor_origin" {
    defaults = { id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.Cdn/profiles/test/originGroups/frontend/origins/frontend" }
  }
  mock_data "azurerm_resource_group" {
    defaults = { name = "rg-team3-test3", location = "uksouth" }
  }
  mock_data "azurerm_key_vault" {
    defaults = {
      id        = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.KeyVault/vaults/kv-team3-test3"
      vault_uri = "https://kv-team3-test3.vault.azure.net/"
    }
  }
  mock_data "azurerm_container_app_environment" {
    defaults = { id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.App/managedEnvironments/cae-team3-test3" }
  }
  mock_data "azurerm_container_registry" {
    defaults = {
      id           = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-shared/providers/Microsoft.ContainerRegistry/registries/shared"
      login_server = "shared.azurecr.io"
    }
  }
  mock_data "azurerm_container_app" {
    defaults = { ingress = [{ fqdn = "backend.internal.example.com" }] }
  }
  mock_data "azurerm_network_service_tags" {
    defaults = { ipv4_cidrs = ["192.0.2.0/24"] }
  }
}

override_module {
  target = module.frontend.module.managed_identity
  outputs = {
    id           = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.ManagedIdentity/userAssignedIdentities/frontend"
    principal_id = "00000000-0000-0000-0000-000000000001"
    client_id    = "00000000-0000-0000-0000-000000000002"
  }
}

variables {
  environment = "test3"
  image_tag   = "test-offline"
}

run "disabled_by_default" {
  command = plan
  assert {
    condition     = output.front_door_endpoint_url == null
    error_message = "Default callers must not get Front Door."
  }
}

run "protected_test3" {
  command = apply
  variables { enable_front_door = true }
  assert {
    condition     = output.front_door_endpoint_url != null
    error_message = "Enabled test3 must expose the Front Door endpoint."
  }
}

run "reject_test1" {
  command = plan
  variables {
    environment       = "test1"
    enable_front_door = true
  }
  expect_failures = [var.enable_front_door]
}

run "module_security_contract" {
  command = apply
  module {
    source = "../../modules/frontend-app"
  }
  variables {
    project_name            = "team3"
    location                = "uksouth"
    acr_name                = "shared"
    acr_resource_group_name = "rg-shared"
    enable_admin_hiring     = true
    enable_front_door       = true
  }
  override_module {
    target = module.managed_identity
    outputs = {
      id           = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-team3-test3/providers/Microsoft.ManagedIdentity/userAssignedIdentities/frontend"
      principal_id = "00000000-0000-0000-0000-000000000001"
      client_id    = "00000000-0000-0000-0000-000000000002"
    }
  }
  assert {
    condition     = azurerm_cdn_frontdoor_profile.frontend[0].sku_name == "Standard_AzureFrontDoor" && azurerm_cdn_frontdoor_origin.frontend[0].certificate_name_check_enabled && azurerm_cdn_frontdoor_origin.frontend[0].origin_host_header == azurerm_container_app.frontend.ingress[0].fqdn
    error_message = "Standard must preserve TLS hostname validation and Container Apps host routing."
  }
  assert {
    condition     = azurerm_cdn_frontdoor_route.frontend[0].forwarding_protocol == "HttpsOnly" && azurerm_cdn_frontdoor_route.frontend[0].https_redirect_enabled && length(azurerm_cdn_frontdoor_route.frontend[0].cache) == 0
    error_message = "Traffic must use HTTPS without caching personalised responses."
  }
  assert {
    condition     = length(azurerm_container_app.frontend.ingress[0].ip_security_restriction) == 1 && azurerm_container_app.frontend.ingress[0].ip_security_restriction[0].action == "Allow" && azurerm_container_app.frontend.ingress[0].ip_security_restriction[0].ip_address_range == "192.0.2.0/24"
    error_message = "Only service-tag CIDRs must be allowed at the origin."
  }
  assert {
    condition     = one([for entry in azurerm_container_app.frontend.template[0].container[0].env : entry.value if entry.name == "FRONT_DOOR_ID"]) == azurerm_cdn_frontdoor_profile.frontend[0].resource_guid
    error_message = "The frontend must validate this profile's ID."
  }
  assert {
    condition     = azurerm_cdn_frontdoor_origin_group.frontend[0].health_probe[0].path == "/healthz" && azurerm_cdn_frontdoor_origin_group.frontend[0].health_probe[0].protocol == "Https"
    error_message = "Health probes must use the HTTPS readiness path."
  }
}

run "reject_empty_service_tag" {
  command = plan
  module {
    source = "../../modules/frontend-app"
  }
  variables {
    project_name            = "team3"
    location                = "uksouth"
    acr_name                = "shared"
    acr_resource_group_name = "rg-shared"
    enable_admin_hiring     = true
    enable_front_door       = true
  }
  override_data {
    target = data.azurerm_network_service_tags.front_door[0]
    values = { ipv4_cidrs = [] }
  }
  expect_failures = [azurerm_container_app.frontend]
}