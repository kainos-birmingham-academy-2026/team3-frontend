output "resource_group_id" {
  description = "ID of the created resource group."
  value       = module.resource_group.resource_group_id
}

output "resource_group_name" {
  description = "Name of the created resource group."
  value       = module.resource_group.resource_group_name
}

output "resource_group_location" {
  description = "Azure location of the created resource group."
  value       = var.location
}

output "storage_account_name" {
  description = "Name of the created Azure Storage account."
  value       = azurerm_storage_account.this.name
}

output "storage_account_primary_blob_endpoint" {
  description = "Primary Blob service endpoint for the created Azure Storage account."
  value       = azurerm_storage_account.this.primary_blob_endpoint
}

output "key_vault_id" {
  description = "ID of the pre-existing Key Vault."
  value       = data.azurerm_key_vault.existing.id
}

output "key_vault_name" {
  description = "Name of the pre-existing Key Vault."
  value       = data.azurerm_key_vault.existing.name
}

output "key_vault_uri" {
  description = "URI of the pre-existing Key Vault, used to reference secrets from the Container App."
  value       = data.azurerm_key_vault.existing.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the frontend's User Assigned Managed Identity."
  value       = module.managed_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the frontend's User Assigned Managed Identity, used for role assignments."
  value       = module.managed_identity.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the frontend's User Assigned Managed Identity."
  value       = module.managed_identity.client_id
}