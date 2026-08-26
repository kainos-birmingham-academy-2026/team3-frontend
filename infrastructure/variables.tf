variable "location" {
  description = "Azure region in which to create the resource group."
  type        = string
  default     = "UK South"
}

variable "environment" {
  description = "Deployment environment, set via TF_VAR_environment in the pipeline (dev, prod, ...)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "tags" {
  description = "Tags to apply to the resource group."
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}

variable "backend_api_url" {
  description = "Internal URL of the backend Container App managed by the backend team."
  type        = string

  validation {
    condition     = length(trimspace(var.backend_api_url)) > 0
    error_message = "backend_api_url must be provided by the backend deployment."
  }
}