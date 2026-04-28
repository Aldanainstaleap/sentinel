# Terraform

This directory contains Terraform configurations for managing the project's infrastructure as code. The infrastructure is organized by environment and further divided into architectural layers.

## Structure

The configuration is split into specific environments:

- **`us-east-1/production/`**: Contains configurations for the Production environment hosted in the `us-east-1` region.
- **`xandar/`**: Contains configurations for the Xandar (Development/Staging) environment.

### Architectural Layers

Within each environment, the infrastructure is separated into two distinct layers to manage dependencies and lifecycle differences:

- **`foundation/`**: Contains long-lived, stateful, or base resources.

  - **Resources**: Redis (ElastiCache), IAM Roles, and Security Groups.
  - **Purpose**: These resources rarely change and provide the bedrock for the application.

- **`infrastructure/`**: Contains application-specific, stateless, or deployment resources.
  - **Resources**: ECS Services, Task Definitions, CodePipeline, and Load Balancer configurations.
  - **Purpose**: These resources are updated frequently (e.g., during deployments) and depend on the foundation layer.

## Environments

### Production (`us-east-1`)

The production environment is configured for high availability and stability.

- **Branch**: Deploys from the `stable` branch.
- **State**: Stored in `instaleap-terraform-state` (us-east-1).

### Xandar (`xandar`)

The development/staging environment used for testing and integration.

- **Branch**: Deploys from the `development` branch.
- **State**: Stored in `mercadoni-terraform-state` (us-west-2).

## Important Note for New Projects

When adapting this Terraform configuration for a new project, it is crucial to perform the following steps:

1.  **Rename Project-Specific Resources**: Search for all occurrences of "sentinel" (the current project name) and replace them with the name of your new project. This includes resource names, tags, S3 keys, and IAM role names.

2.  **Create AWS Secrets**: This configuration relies on secrets stored in AWS Secrets Manager. You must create the corresponding secrets in your AWS account for the new project.

    - **Required Secrets**: `db_config`, `auth_config`, `llm_config`, `slack_config`, and `jira_config`.

3.  **Review and Customize Variables**: Carefully review the `variables.tf` files in both `foundation` and `infrastructure` directories. Adjust them to match your requirements, specifically:
    - VPC IDs and Subnet filters.
    - Security Group names.
    - CPU/Memory allocations for ECS tasks.
