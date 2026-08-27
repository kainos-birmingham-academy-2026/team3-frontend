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

variable "image_tag" {
  description = "Frontend container image tag. The CI pipeline sets this to the Git commit SHA."
  type        = string
  default     = "latest"
}

variable "tags" {
  description = "Tags to apply to the resource group."
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}
