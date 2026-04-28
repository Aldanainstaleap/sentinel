variable "region" {
  description = "AWS region for the Vormir environment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name for resources in this project"
  type        = string
  default     = "sentinel"
}

# --- Variables for Data Sources ---

variable "vpc_id" {
  type    = string
  default = "vpc-5a9f5621"
}

variable "private_subnet_filter_name" {
  description = "The value of the 'Name' tag used to filter the private subnet"
  type        = string
  default     = "staging_private"
}

variable "api_security_group_filter_name" {
  description = "The value of the 'group-name' used to filter the API security group"
  type        = string
  default     = "API_group"
}

