terraform {
  required_version = ">= 1.5.0"

  # backend-config (resource_group_name, storage_account_name, container_name, key) supplied
  # via `terraform init -backend-config=environments/<env>-backend.tfvars` so each environment
  # gets its own state file without editing this block.
  backend "azurerm" {
    use_azuread_auth = true
    use_oidc         = true
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Auth via OIDC using ARM_USE_OIDC and Azure service principal environment variables.
provider "azurerm" {
  features {}
}

locals {
  # "prod" reuses the same code; only var.environment changes per pipeline run.
  resource_group_name         = "rg-team3-${var.environment}"
  storage_account_name_prefix = "stmhadi${var.environment}"
  key_vault_name              = "kv-team3-${var.environment}"
}

module "resource_group" {
  source = "./modules/resource-group"

  name     = local.resource_group_name
  location = var.location
  tags = merge(var.tags, {
    environment = var.environment
  })
}

moved {
  from = azurerm_resource_group.this
  to   = module.resource_group.azurerm_resource_group.this
}

# Pre-existing vault created by the backend; secrets are added manually in the Azure portal.
data "azurerm_key_vault" "existing" {
  name                = local.key_vault_name
  resource_group_name = local.resource_group_name
}

resource "random_string" "storage_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "azurerm_storage_account" "this" {
  name                     = "${local.storage_account_name_prefix}${random_string.storage_suffix.result}"
  resource_group_name      = module.resource_group.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  https_traffic_only_enabled      = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

  tags = merge(var.tags, {
    environment = var.environment
  })
}