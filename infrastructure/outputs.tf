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