variable "name" {
  description = "Name of the User Assigned Managed Identity to create."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the identity."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group in which to create the identity."
  type        = string
}

variable "tags" {
  description = "Tags to apply to the identity."
  type        = map(string)
  default     = {}
}
