# Git Hub Actions (GHA) 🚀
GitHub Actions has been widely used to define custom workflows (using YAML syntax) to build, test, lint and deploy out code directly from our public GitHub repositories.

## Infrastructure
This GitHub Actions workflow is responsible for creating and configuring the supporting infrastructure for the APIM (API Management) ESTORE project using Azure CLI bash scripting.

The workflow consists of two jobs:

setup: Sets up environment variables, including the product, environment, timezone, and target variables. It defines output variables for the environment and timezone, which are used by the base job.

base: Creates the base infrastructure required for an APIM deployment. It configures Azure CLI extensions and uses Azure CLI commands to create various Azure resources, including a resource group, log analytics workspace, container registry, container app environment, container app, and API management instance. It also sets environment tags and prints out the state of the VNET peering connection.

The workflow follows the standard Azure naming convention and consumes several Azure services, including Azure resource group, Azure container registry, Azure container app environment, Azure container app, Azure API management, and Azure log analytics workspace.

The workflow is triggered when a push event occurs on the infrastructure branch, and the file path matches .github/workflows/infrastructure.yml.

The workflow also includes additional jobs for container app configuration (ca) and APIM configuration (apim), which are dependent on the base job.

Note that the workflow utilizes Azure CLI commands and makes use of Azure credentials stored as secrets.

Please note that this is a template for a GitHub Actions workflow, and its functionality may vary depending on the specific configurations and requirements of the APIM (ESTORE) project.

## Deployment
### Script
#### CICD 📝

This Bash script represents a Continuous Integration and Continuous Deployment (CICD) process.

#### Color Variables

- `RED` 🟥: Represents the color code for red.
- `GREEN` 🟩: Represents the color code for green.
- `BLUE` 🔵: Represents the color code for blue.
- `YELLOW` 🟨: Represents the color code for yellow.
- `NC` ⬛: Represents the color code for no color (default).

#### User Input

The script prompts the user to select an option from the following:

- `${YELLOW}0. Infrastructure 🔧${NC}`
- `${BLUE}1. Deployment 🧪${NC}`
- `${RED}2. ACR Purge 🗑️${NC}`

#### Option Handling

Based on the user's selection, the script performs the following actions:


### GHA
This workflow is triggered on push events to the `dev`, `staging`, and `production` branches, and specific file modifications.

#### Environment Variables

- `PRODUCT` 📦: Represents the name of the product ("apim").
- `ENVIRONMENT` 🌍: Represents the name of the environment, which is retrieved from the GitHub ref name.
- `TIMEZONE` 🕒: Specifies the timezone as "Europe/London."
- `FROM` 📁: Represents a base artifact, with the value "latest."

#### Jobs

##### 1. Setup 🔧

- This job sets up deployment variables.
- It runs on a self-hosted runner with the "APIM" and "deployment" labels.
- Outputs:
  - `product`: Contains the value of the `PRODUCT` environment variable.
  - `environment`: Contains the value of the `ENVIRONMENT` environment variable.
  - `timezone`: Contains the value of the `TIMEZONE` environment variable.
- Steps:
  - Environment 🧪: Displays the environment set to the `ENVIRONMENT` value.
  - Timezone 🌐: Displays the timezone set to the `TIMEZONE` value.

##### 2. MDM 📦️

- This job represents the deployment of the MDM (Master Data Management) micro-service.
- Depends on the successful completion of the **Setup** job.
- Environment: Uses the `environment` output from the **Setup** job.
- Environment Variables:
  - `NAME` 📁: Represents the name of the micro-service ("mdm").
  - `ENVIRONMENT` 🌍: Represents the environment name.
- Runs on a self-hosted runner with the "APIM" and "deployment" labels.
- Steps:
  1. Repository 🗃️: Checks out the repository using the `actions/checkout` action.
  2. Azure 🔐: Authenticates with Azure using the `azure/login` action.
  3. CLI 📝: Sets up CLI commands to retrieve various Azure resources and store them as environment variables.
  4. Defaults ✨: Uses the Azure CLI to configure default settings.
  5. ACR 🔐: Logs in to an Azure Container Registry (ACR) using the `azure/docker-login` action.
  6. Artifacts 🗃️: Builds and pushes Docker images to the ACR.
  7. Revisions 🔀: Uses the Azure CLI to update a container application with the new image and set environment variables.
  8. Import ⬇️: Imports an API specification to an Azure API Management (APIM) service.

## Test
The provided code is a GitHub Actions workflow file (test.yml) responsible for running various test suites upon the creation of a pull request. The workflow consists of the following jobs:

* setup: This job sets up the test infrastructure and defines environment variables. It runs on an Ubuntu environment and outputs the environment and timezone values.
* unit-tests: This job performs unit tests using Jest. It depends on the setup job and runs on Ubuntu. It sets the timezone, checks out the repository, sets up Node.js, installs dependencies using npm ci, and executes the unit tests using the command "npm run unit-test."
* api-tests: This job performs API tests using Jest. It also depends on the setup job and runs on Ubuntu. It sets the timezone, checks out the repository, sets up Node.js, installs dependencies using npm ci, and executes the API tests using the command "npm run api-test."
* e2e-tests: This job performs end-to-end (E2E) tests using Jest. It depends on the setup job and runs on Ubuntu. It sets the timezone, checks out the repository, sets up Node.js, installs dependencies using npm ci, starts Docker containers using docker-compose, and executes the E2E tests using the command "npm run e2e-test."

Each job runs in parallel, and the subsequent jobs depend on the completion of the setup job.

## Lint
The provided code appears to be a GitHub Actions workflow file for running lint quality assurance (QA) checks on a repository when a pull request is made to the main branch. Let's break down the different sections and steps:

name and run-name: These are labels for the workflow.

* on: This section specifies when the workflow should be triggered, in this case, when a pull request is made to the main branch and specific paths (src/** and test/**) are modified.
* env: This section defines environment variables used within the workflow. It sets the environment to "qa," the timezone to "Europe/London," and the Node.js version to ${{ vars.NODE_VERSION }}, which seems to be a variable that should be defined elsewhere.
* jobs: This section defines the different jobs that will run as part of the workflow.
    * a. setup: This job sets up the test infrastructure. It runs on an Ubuntu latest runner and has steps for setting the environment and timezone.
    * b. lint: This job performs the linting. It runs on an Ubuntu latest runner and depends on the setup job. It includes steps for setting the timezone, checking out the repository, setting up Node.js, installing dependencies with npm ci, and running the linting command with npm run lint.

Overall, this workflow sets up a QA process for linting the code in the repository when a pull request is made. It ensures that the code adheres to defined linting rules.

## Publish
The workflow defines a job named release that runs on an Ubuntu environment (ubuntu-latest). The job consists of a single step, which uses the `google-github-actions/release-please-action` to handle the release process.

The with block provides configuration options for the release-please-action. Here's an explanation of the provided options:

release-type: node: Specifies the release type as a Node.js project.
package-name: uk-export-finance/estore-api: Specifies the name of the package or project being released.
changelog-types: Defines the different types of changes (features, bug fixes, chores, and documentation) to be included in the generated changelog. Each type has a corresponding section in the changelog.

