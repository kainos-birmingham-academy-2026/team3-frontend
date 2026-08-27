variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "location" {
  description = "Azure region in which to create frontend-owned resources."
  type        = string
}

variable "acr_name" {
  description = "Name of the existing shared Azure Container Registry."
  type        = string
}

variable "acr_resource_group_name" {
  description = "Name of the resource group containing the shared Azure Container Registry."
  type        = string
}

variable "image_tag" {
  description = "ACR image tag for the frontend Container App."
  type        = string
}

variable "revision_suffix" {
  description = "Optional suffix used to create a distinct Container App revision."
  type        = string
  default     = null
}

variable "enable_admin_hiring" {
  description = "Whether the admin hiring feature is enabled in the frontend."
  type        = bool
}

variable "tags" {
  description = "Tags to apply to frontend-owned resources."
  type        = map(string)
  default     = {}
}