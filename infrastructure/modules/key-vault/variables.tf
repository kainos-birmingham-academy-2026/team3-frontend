variable "name" {
  description = "Name of the Azure Key Vault to create."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Key Vault."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group in which to create the Key Vault."
  type        = string
}

variable "tenant_id" {
  description = "Azure AD tenant ID used for the Key Vault."
  type        = string
}

variable "sku_name" {
  description = "SKU for the Key Vault (standard or premium)."
  type        = string
  default     = "standard"

  validation {
    condition     = contains(["standard", "premium"], var.sku_name)
    error_message = "sku_name must be either \"standard\" or \"premium\"."
  }
}

variable "purge_protection_enabled" {
  description = "Whether purge protection is enabled on the Key Vault."
  type        = bool
  default     = true
}

variable "soft_delete_retention_days" {
  description = "Number of days that soft-deleted items are retained."
  type        = number
  default     = 7
}

variable "public_network_access_enabled" {
  description = "Whether the Key Vault is reachable over the public internet."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to the Key Vault."
  type        = map(string)
  default     = {}
}
