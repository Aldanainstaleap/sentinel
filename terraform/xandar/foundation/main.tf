terraform {
  backend "s3" {
    bucket         = "mercadoni-terraform-state"
    key            = "xandar/sentinel-backend/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = local.region
}

locals {
  region       = "us-east-1"
  project_name = "sentinel"
  environment  = "xandar"
  custom_tags = {
    Environment = local.environment
    Service     = "sentinel"
    Unit        = "internal-tools"
  }
}

# --- IAM Role and Policy for Nexus Management ---

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "sentinel_role" {
  name               = "MercadonisentinelRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "sentinel_policy_doc" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:UpdateSecret",
      "secretsmanager:PutSecretValue"
    ]

    resources = [
      "arn:aws:secretsmanager:${local.region}:*:secret:xandar/leapdocs/rds/users/app*",
      "arn:aws:secretsmanager:${local.region}:*:secret:xandar/sentinel/*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
      "ssm:PutParameter"
    ]

    resources = [
      "arn:aws:ssm:${local.region}:*:parameter/itools/${local.environment}/${local.project_name}/parameters/*"
    ]
  }
}

resource "aws_iam_role_policy" "sentinel_policy" {
  name   = "MercadonisentinelPolicy"
  role   = aws_iam_role.sentinel_role.id
  policy = data.aws_iam_policy_document.sentinel_policy_doc.json
}

# --- Redis Cache ---

data "aws_security_group" "redis_sg" {
  name = "redis"
}

resource "aws_elasticache_cluster" "redis_cache" {
  cluster_id           = "${local.environment}-${local.project_name}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name  = "staging"
  security_group_ids = [data.aws_security_group.redis_sg.id]

  transit_encryption_enabled = false
  tags                       = local.custom_tags
}
