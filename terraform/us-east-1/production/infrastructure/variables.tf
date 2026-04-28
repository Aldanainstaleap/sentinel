variable "region" {
  description = "AWS region for the production environment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name for resources in this project"
  type        = string
  default     = "sentinel"
}

# --- Variables para Data Sources ---

variable "vpc_id_production" {
  type    = string
  default = "vpc-01c27ae3eedaaa0df"
}

variable "private_subnet_filter_name" {
  description = "The value of the 'Name' tag used to filter the private subnet for production"
  type        = string
  default     = "services"
}

variable "api_security_group_filter_name" {
  description = "The value of the 'group-name' used to filter the API security group for production"
  type        = string
  default     = "private_api"
}
