output "id" {
  description = "Resource ID of the User Assigned Managed Identity, used to attach it to other resources (e.g. Container Apps)."
  value       = azurerm_user_assigned_identity.this.id
}

output "principal_id" {
  description = "Object (principal) ID of the identity, used as the target of role assignments."
  value       = azurerm_user_assigned_identity.this.principal_id
}

output "client_id" {
  description = "Client ID of the identity, used by apps/SDKs to authenticate as this identity."
  value       = azurerm_user_assigned_identity.this.client_id
}

output "name" {
  description = "Name of the created identity."
  value       = azurerm_user_assigned_identity.this.name
}
