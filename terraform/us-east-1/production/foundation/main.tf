data "aws_caller_identity" "current" {}

terraform {
  backend "s3" {
    bucket         = "instaleap-terraform-state"
    key            = "us-east-1/production/sentinel-backend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = local.region
}

locals {
  region       = "us-east-1"
  project_name = "sentinel"
  environment  = "production"
  custom_tags = {
    Environment = local.environment
    Service     = local.project_name
    Unit        = "internal-tools"
  }
}
# --- IAM Role and Policy for Leap Management ---
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
  name               = "InstaleapsentinelRole"
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
      "arn:aws:secretsmanager:${local.region}:*:secret:production/leapdocs/rds/users/app*",
      "arn:aws:secretsmanager:${local.region}:*:secret:production/sentinel/*"
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
  name   = "InstaleapsentinelPolicy"
  role = aws_iam_role.sentinel_role.id
  policy = data.aws_iam_policy_document.sentinel_policy_doc.json
}

# --- Redis Cache ---
module "redis" {
  source  = "git::git@github.com:mercadoni/titan//modules/aws/elasticache/cluster?ref=v3.4.2"
  vpc     = data.aws_vpc.prod_vpc.id
  cluster = local.environment
  name    = locals.project_name
  tags    = local.custom_tags
}
