#!/bin/bash

# QUICK START GUIDE - Dependency Updates for estore-api
# This script provides the commands for updating outdated dependencies
# Run these commands in sequence, testing after each phase

set -e  # Exit on error

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BLUE}║      estore-api DEPENDENCY UPDATE QUICK START SCRIPT      ║${RESET}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Function to print section headers
print_section() {
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${BLUE}$1${RESET}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# Function to run command with status
run_command() {
    echo -e "${BLUE}Running:${RESET} $1"
    if eval "$1"; then
        echo -e "${GREEN}✓ Success${RESET}\n"
        return 0
    else
        echo -e "${RED}✗ Failed${RESET}\n"
        return 1
    fi
}

# PREPARATION
print_section "PHASE 1: PREPARATION"
echo "Creating feature branch..."
run_command "git checkout -b chore/update-dependencies || git switch chore/update-dependencies"

echo "Verifying baseline (this may take a minute)..."
# Uncomment if you want to save baseline:
# run_command "npm run type-check > baseline-typecheck.txt 2>&1 || true"

# FIX EXISTING ERROR
print_section "PHASE 2: FIX EXISTING TYPESCRIPT ERROR"
echo -e "${YELLOW}File:${RESET} test/support/mocks/dtfs-storage-client.service.mock.ts:46"
echo -e "${YELLOW}Issue:${RESET} ReadableStream vs NodeJSReadableStream type mismatch"
echo ""
echo -e "${RED}⚠️  ACTION REQUIRED:${RESET}"
echo "   This error must be fixed before proceeding with dependency updates."
echo "   The fix likely involves:"
echo "   - Importing the correct Node.js stream type"
echo "   - Updating the mock to use NodeJSReadableStream"
echo "   - Or casting/adapting the mock value"
echo ""
read -p "Press Enter once you've fixed the error..."

echo "Verifying fix..."
if npm run type-check; then
    echo -e "${GREEN}✓ TypeScript error fixed${RESET}\n"
else
    echo -e "${RED}✗ TypeScript error still exists${RESET}"
    echo "   Please fix the error before continuing."
    exit 1
fi

# NESTJS CORE UPDATES
print_section "PHASE 3: UPDATE NESTJS CORE PACKAGES"
echo "Updating @nestjs/core @nestjs/common @nestjs/platform-express..."
run_command "npm update @nestjs/core@^12 @nestjs/common@^12 @nestjs/platform-express@^12 @nestjs/testing@^12 --save --legacy-peer-deps"

echo "Validating NestJS core updates..."
run_command "npm run build"
run_command "npm run type-check"

# TYPESCRIPT UPDATE
print_section "PHASE 4: UPDATE TYPESCRIPT"
echo "Installing TypeScript 7.0.2..."
run_command "npm install --save-dev typescript@^7.0.2 --legacy-peer-deps"

echo "Validating TypeScript update..."
run_command "npm run type-check"
run_command "npm run build"

# NESTJS ECOSYSTEM
print_section "PHASE 5: UPDATE NESTJS ECOSYSTEM PACKAGES"
echo "Updating @nestjs/config @nestjs/cache-manager @nestjs/axios @nestjs/passport @nestjs/swagger..."
run_command "npm update @nestjs/config@^12 @nestjs/cache-manager@^12 @nestjs/axios@^12 @nestjs/passport@^12 @nestjs/swagger@^12 --save --legacy-peer-deps"

echo "Installing @nestjs/schematics..."
run_command "npm install --save-dev @nestjs/schematics@^12 --legacy-peer-deps"

# TESTING PACKAGES
print_section "PHASE 6: UPDATE TESTING PACKAGES"
echo "Updating @types/supertest and nock..."
run_command "npm install --save-dev @types/supertest@^7.2.1 nock@^15.0.6 --legacy-peer-deps"

# CLEAN INSTALL
print_section "PHASE 7: CLEAN INSTALL"
echo "Removing node_modules and package-lock.json..."
run_command "rm -rf node_modules package-lock.json"

echo "Running clean npm install..."
run_command "npm install --legacy-peer-deps"

# COMPREHENSIVE VALIDATION
print_section "PHASE 8: COMPREHENSIVE VALIDATION"
echo "Running type check..."
run_command "npm run type-check"

echo "Building project..."
run_command "npm run build"

echo "Running linting..."
run_command "npm run lint"

echo "Running unit tests (this may take 2-3 minutes)..."
run_command "npm run unit-test"

echo "Running API tests..."
run_command "npm run api-test"

# FINAL STEPS
print_section "PHASE 9: FINALIZATION"
echo -e "${GREEN}✓ All validations passed!${RESET}\n"

echo "Summary of updates:"
echo "  ✓ Fixed existing TypeScript error"
echo "  ✓ Updated @nestjs/core 11.x → 12.x"
echo "  ✓ Updated @nestjs/common 11.x → 12.x"
echo "  ✓ Updated @nestjs/platform-express 11.x → 12.x"
echo "  ✓ Updated @nestjs/testing 11.x → 12.x"
echo "  ✓ Updated @nestjs/config 4.x → 12.x"
echo "  ✓ Updated @nestjs/cache-manager 3.x → 12.x"
echo "  ✓ Updated @nestjs/axios 4.x → 12.x"
echo "  ✓ Updated @nestjs/passport 10.x → 12.x"
echo "  ✓ Updated @nestjs/swagger 11.x → 12.x"
echo "  ✓ Updated @nestjs/schematics 11.x → 12.x"
echo "  ✓ Updated TypeScript 6.x → 7.x"
echo "  ✓ Updated @types/supertest 2.x → 7.x"
echo "  ✓ Updated nock 14.x → 15.x"
echo ""

echo -e "${YELLOW}Next steps:${RESET}"
echo "  1. Create commits:"
echo "     git add package.json package-lock.json"
echo "     git commit -m 'chore(deps): update all outdated dependencies'"
echo ""
echo "  2. Push and create pull request:"
echo "     git push origin chore/update-dependencies"
echo ""
echo "  3. Update CHANGELOG.md if needed"
echo ""
echo "  4. Add PR description (see DEPENDENCY_UPDATE_ANALYSIS.md for template)"
echo ""
echo -e "${GREEN}✓ Update complete!${RESET}"
