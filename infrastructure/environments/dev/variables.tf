variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
  default     = "team3"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"

  validation {
    condition     = var.environment == "dev"
    error_message = "The development root requires environment to be dev."
  }
}

variable "location" {
  description = "Azure region in which to create frontend-owned resources."
  type        = string
  default     = "UK South"
}

variable "acr_name" {
  description = "Name of the existing shared Azure Container Registry."
  type        = string
  default     = "acraiacademy26"
}

variable "acr_resource_group_name" {
  description = "Name of the resource group containing the shared Azure Container Registry."
  type        = string
  default     = "rg-ai-academy-26"
}

variable "image_tag" {
  description = "ACR image tag for the frontend Container App."
  type        = string
  default     = "dev-latest"
}

variable "container_revision_suffix" {
  description = "Optional unique suffix that forces a new Container App revision."
  type        = string
  default     = null
}

variable "enable_admin_hiring" {
  description = "Whether the admin hiring feature is enabled in the frontend."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to frontend-owned resources."
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}