output "frontend_container_app_url" {
  description = "Public URL of the production frontend Container App."
  value       = module.frontend.frontend_container_app_url
}

output "managed_identity_id" {
  description = "Resource ID of the production frontend managed identity."
  value       = module.frontend.managed_identity_id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the production frontend managed identity."
  value       = module.frontend.managed_identity_principal_id
}

output "backend_container_app_fqdn" {
  description = "Internal backend FQDN used by the production frontend."
  value       = module.frontend.backend_container_app_fqdn
}