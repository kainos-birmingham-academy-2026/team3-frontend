output "key_vault_id" {
  description = "ID of the created Key Vault."
  value       = azurerm_key_vault.this.id
}

output "key_vault_name" {
  description = "Name of the created Key Vault."
  value       = azurerm_key_vault.this.name
}

output "key_vault_uri" {
  description = "URI of the created Key Vault, used by apps/SDKs to reference secrets."
  value       = azurerm_key_vault.this.vault_uri
}
