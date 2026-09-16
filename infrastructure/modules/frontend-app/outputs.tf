output "resource_group_id" {
  description = "ID of the existing resource group."
  value       = data.azurerm_resource_group.existing.id
}

output "resource_group_name" {
  description = "Name of the existing resource group."
  value       = data.azurerm_resource_group.existing.name
}

output "resource_group_location" {
  description = "Location of the existing resource group."
  value       = data.azurerm_resource_group.existing.location
}

output "key_vault_id" {
  description = "ID of the existing Key Vault."
  value       = data.azurerm_key_vault.existing.id
}

output "key_vault_name" {
  description = "Name of the existing Key Vault."
  value       = data.azurerm_key_vault.existing.name
}

output "key_vault_uri" {
  description = "URI of the existing Key Vault."
  value       = data.azurerm_key_vault.existing.vault_uri
}

output "frontend_container_app_url" {
  description = "Public URL of the frontend Container App."
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "front_door_endpoint_url" {
  description = "Azure Front Door default-domain URL when enabled."
  value       = var.enable_front_door ? "https://${azurerm_cdn_frontdoor_endpoint.frontend[0].host_name}" : null
}

output "private_e2e_job_name" {
  description = "Private Playwright Container Apps Job name when enabled."
  value       = var.enable_private_e2e ? azurerm_container_app_job.private_e2e[0].name : null
}

output "managed_identity_id" {
  description = "Resource ID of the frontend managed identity."
  value       = module.managed_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the frontend managed identity."
  value       = module.managed_identity.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the frontend managed identity."
  value       = module.managed_identity.client_id
}

output "backend_container_app_fqdn" {
  description = "Internal backend FQDN used by the frontend."
  value       = data.azurerm_container_app.backend.ingress[0].fqdn
}