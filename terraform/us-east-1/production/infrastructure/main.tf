terraform {
  backend "s3" {
    bucket         = "instaleap-terraform-state"
    key            = "us-east-1/production/sentinel/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.region
}

locals {
  environment = "production"
  custom_tags = {
    Environment = local.environment
    Service     = var.project_name
    Unit        = "internal-tools"
  }
}
data "aws_iam_role" "sentinel" {
  name = "InstaleapsentinelRole"
}

data "aws_ssm_parameters_by_path" "app_parameters" {
  path = "/itools/production/${var.project_name}/parameters/"
}

module "codepipeline" {
  source        = "git::git@github.com:mercadoni/titan//modules/aws/codepipeline/ecs?ref=v3.2.0"
  project_name  = var.project_name
  github_repo   = var.project_name
  github_branch = "stable"
  cluster_name  = local.environment
  service_name  = var.project_name
  pipeline_role_name = "pipeline_role"
  build_secrets = {
    NPM_TOKEN = "global/github/packages/token"
  }
  build_vpc_config = {
    vpc_id          = var.vpc_id_production
    subnets         = [var.private_subnet_filter_name]
    security_groups = [var.api_security_group_filter_name]
  }
}

module "ecs_service" {
  source       = "git::git@github.com:mercadoni/titan//modules/aws/ecs/service?ref=v2.10.0"
  vpc_id       = var.vpc_id_production
  service_name = var.project_name
  cluster_name = local.environment

  load_balancers = [{
    healthcheck_path  = "/health"
    subnets           = ["internet_facing"]
    security_groups   = ["public_api"]
    domain_name       = "instaleap.io"
    }]

  task = {
    subnets         = [var.private_subnet_filter_name]
    security_groups = [var.private_api_security_group_filter_name]
    cpu             = var.cpu
    memory          = var.memory
    max_instances   = 2
    role_arn        = data.aws_iam_role.sentinel.arn
  }

  containers = [{
    image              = "${module.codepipeline.ecr_repo.repository_url}:latest"
    cpu                = var.cpu
    memory             = var.memory
    memory_reservation = var.memory
    ports = {
      http    = 80,
      metrics = 8080
    }

    prometheus_metrics = {
      port     = 8080
      path     = "/metrics"
      job_name = var.project_name
    }

    secrets = {
      DB_CONFIG    = "production/leapdocs/rds/users/app",
      AUTH_CONFIG  = "production/sentinel/AUTH_CONFIG",
      AWS_CONFIG   = "production/sentinel/AWS_CONFIG",
      REDIS_CONFIG = "production/sentinel/REDIS_CONFIG",
      LLM_CONFIG   = "production/sentinel/LLM_CONFIG",
      SLACK_CONFIG = "production/sentinel/SLACK_CONFIG",
      JIRA_CONFIG  = "production/sentinel/JIRA_CONFIG"
    }

    environment = merge({
      PORT         = 80,
      ENVIRONMENT  = "production"
      SERVICE_NAME = "sentinel"
      PG_CONFIG = jsonencode({
        databaseName = "leapdocs"
        connectionPoolSettings = {
          max                     = 20
          idleTimeoutMillis       = 30000
          connectionTimeoutMillis = 2000
        },
        databaseSecretName = "production/leapdocs/rds/users/app"
      })
      },
    { for i, name in data.aws_ssm_parameters_by_path.app_parameters.names : upper(basename(name)) => data.aws_ssm_parameters_by_path.app_parameters.values[i] })
  }]

  tags = local.custom_tags
}
