output "resource_group_id" {
  description = "ID of the existing resource group."
  value       = module.frontend.resource_group_id
}

output "resource_group_name" {
  description = "Name of the existing resource group."
  value       = module.frontend.resource_group_name
}

output "resource_group_location" {
  description = "Location of the existing resource group."
  value       = module.frontend.resource_group_location
}

output "key_vault_id" {
  description = "ID of the existing Key Vault."
  value       = module.frontend.key_vault_id
}

output "key_vault_name" {
  description = "Name of the existing Key Vault."
  value       = module.frontend.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the existing Key Vault."
  value       = module.frontend.key_vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the frontend managed identity."
  value       = module.frontend.managed_identity_id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the frontend managed identity."
  value       = module.frontend.managed_identity_principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the frontend managed identity."
  value       = module.frontend.managed_identity_client_id
}

output "frontend_container_app_url" {
  description = "Public URL of the frontend Container App."
  value       = module.frontend.frontend_container_app_url
}