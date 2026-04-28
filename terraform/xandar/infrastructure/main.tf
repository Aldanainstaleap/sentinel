terraform {
  backend "s3" {
    bucket         = "mercadoni-terraform-state"
    key            = "xandar/sentinel/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.region
}

locals {
  environment = "xandar"
  custom_tags = {
    Environment = local.environment
    Service     = var.project_name
    Unit        = "internal-tools"
  }
}

data "aws_iam_role" "sentinel" {
  name = "MercadonisentinelRole"
}
data "aws_ssm_parameters_by_path" "app_parameters" {
  path = "/itools/xandar/${var.project_name}/parameters/"
}

module "codepipeline" {
  source        = "git::git@github.com:mercadoni/titan//modules/aws/codepipeline/ecs?ref=v3.2.0"
  project_name  = var.project_name
  github_repo   = var.project_name
  github_branch = "development"
  cluster_name  = local.environment
  service_name  = var.project_name
  pipeline_role_name = "pipeline_role"
  build_secrets = {
    NPM_TOKEN = "global/github/packages/token"
  }
  build_vpc_config = {
    vpc_id          = var.vpc_id
    subnets         = [var.private_subnet_filter_name]
    security_groups = [var.api_security_group_filter_name]
  }
  
}

module "ecs_service" {
  source       = "git::git@github.com:mercadoni/titan//modules/aws/ecs/service?ref=v2.10.0"
  vpc_id       = var.vpc_id
  service_name = var.project_name
  cluster_name = local.environment

  load_balancers = [{
    healthcheck_path = "/health"
    subnets          = ["staging_internet"]
    security_groups  = ["alb_group"]
    domain_name      = "xandar.instaleap.io"
  }]

  task = {
    subnets         = [var.private_subnet_filter_name]
    security_groups = [var.api_security_group_filter_name]
    cpu             = 256
    memory          = 512
    max_instances   = 2
    role_arn        = data.aws_iam_role.sentinel.arn
  }

  containers = [{
    image              = "${module.codepipeline.ecr_repo.repository_url}:latest"
    cpu                = 256
    memory             = 512
    memory_reservation = 256
    ports = {
      http    = 80,
      metrics = 8080
    }

    prometheus_metrics = {
      port     = 8080
      path     = "/metrics"
      job_name = "leap"
    }

    secrets = {
      DB_CONFIG    = "xandar/leapdocs/rds/users/app",
      AUTH_CONFIG  = "xandar/sentinel/AUTH_CONFIG",
      AWS_CONFIG   = "xandar/sentinel/AWS_CONFIG",
      REDIS_CONFIG = "xandar/sentinel/REDIS_CONFIG",
      LLM_CONFIG   = "xandar/sentinel/LLM_CONFIG",
      SLACK_CONFIG = "xandar/sentinel/SLACK_CONFIG",
      JIRA_CONFIG  = "xandar/sentinel/JIRA_CONFIG"
    }

    environment = merge({
      PORT         = 80,
      ENVIRONMENT  = "xandar"
      SERVICE_NAME = "sentinel"
      PG_CONFIG = jsonencode({
        databaseName = "leapdocs"
        connectionPoolSettings = {
          max                     = 20
          idleTimeoutMillis       = 30000
          connectionTimeoutMillis = 2000
        },
        databaseSecretName = "xandar/leapdocs/rds/users/app"
      })
      },
    { for i, name in data.aws_ssm_parameters_by_path.app_parameters.names : upper(basename(name)) => data.aws_ssm_parameters_by_path.app_parameters.values[i] })
  }]

  tags = local.custom_tags
}
