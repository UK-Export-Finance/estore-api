# Dependency Update Checklist

## Pre-Update Tasks
- [ ] Create feature branch: `git checkout -b chore/update-dependencies`
- [ ] Document baseline:
  ```bash
  npm run type-check > baseline-typecheck.txt 2>&1
  npm run unit-test > baseline-unit-tests.txt 2>&1
  npm run api-test > baseline-api-tests.txt 2>&1
  ```
- [ ] Review NestJS 12 release notes
- [ ] Check Node.js compatibility for new versions
- [ ] Backup package.json and package-lock.json

---

## Phase 1: Fix Existing TypeScript Error

### File to Fix
- **Location:** `test/support/mocks/dtfs-storage-client.service.mock.ts`
- **Line:** 46
- **Error:** `ReadableStream` vs `NodeJSReadableStream` type mismatch
- **Action:** 
  ```typescript
  // Current (line 46):
  when(this.fileShareClient.download).calledWith().mockResolvedValueOnce(file);
  
  // May need:
  // - Import proper stream type from Node.js
  // - Cast the mock value
  // - Update mock to use correct Node.js stream type
  ```

### Validation After Fix
- [ ] `npm run type-check` - Should pass
- [ ] `npm run unit-test` - Should pass all 71 test suites

---

## Phase 2: NestJS Core Updates (11.x → 12.x)

### Step 1: Update Core Packages
```bash
npm update @nestjs/core@^12 @nestjs/common@^12 @nestjs/platform-express@^12 \
           @nestjs/testing@^12 --save --legacy-peer-deps
```

**Files to Review After Update:**
- [ ] `src/main.ts` - Main app bootstrap
- [ ] `src/main.module.ts` - Module configuration
- [ ] `src/app.ts` - App initialization

### Step 2: Validation Checklist
- [ ] `npm run build` - Should complete without errors
- [ ] `npm run type-check` - Should pass
- [ ] `npm run lint` - Should pass
- [ ] No new warnings in console output

### Step 3: Commit
```bash
git add package.json package-lock.json
git commit -m "chore(deps): update NestJS core packages to v12"
```

---

## Phase 3: Update TypeScript

### Step 1: Install TypeScript 7
```bash
npm install --save-dev typescript@^7.0.2
```

**Files to Review After Update:**
- [ ] `tsconfig.json` - May need adjustments for new TypeScript options
- [ ] `tsconfig.build.json` - Build configuration

### Step 2: Validation Checklist
- [ ] `npm run type-check` - Should pass (this is the key validation)
- [ ] `npm run build` - Should complete without errors
- [ ] Review any new type errors or warnings

### Step 3: Commit
```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade TypeScript to v7"
```

---

## Phase 4: Update NestJS Ecosystem Packages

### Step 4.1: Update Config Module (4.0.4 → 12.1.1)
```bash
npm update @nestjs/config@^12 --save --legacy-peer-deps
```

**Files to Review:**
- [ ] `src/main.module.ts` - ConfigModule setup
- [ ] `src/config/*.ts` - Config registration files
- [ ] All `.env` loading patterns

**Tests to Run:**
```bash
npm run unit-test -- --testPathPattern="config" --verbose
```

### Step 4.2: Update Cache Manager (3.1.0 → 12.0.5)
```bash
npm update @nestjs/cache-manager@^12 --save --legacy-peer-deps
```

**Files to Review:**
- [ ] Search for `@Cacheable`, `@CacheKey`, `@CacheTTL` decorators
- [ ] Check cache configuration in module setup
- [ ] Review cache invalidation patterns

**Command to Find Usage:**
```bash
grep -r "@Cacheable\|@CacheKey\|@CacheTTL\|CacheModule" src --include="*.ts"
```

### Step 4.3: Update Axios Module (4.0.1 → 12.0.2)
```bash
npm update @nestjs/axios@^12 --save --legacy-peer-deps
```

**Files to Review:**
- [ ] `src/modules/mdm/mdm.service.ts` - HttpService usage
- [ ] Check for any HTTP client configuration
- [ ] Verify timeout/retry settings

**Command to Find Usage:**
```bash
grep -r "HttpModule\|HttpService" src --include="*.ts"
```

### Step 4.4: Update Passport Module (10.0.3 → 12.0.2)
```bash
npm update @nestjs/passport@^12 --save --legacy-peer-deps
```

**Files to Review:**
- [ ] `src/modules/auth/` - Authentication setup
- [ ] Guard decorators and strategy configuration
- [ ] Header API key authentication

**Tests to Run:**
```bash
npm run unit-test -- --testPathPattern="auth" --verbose
npm run api-test -- --testPathPattern="auth" --verbose
```

### Step 4.5: Update Swagger Module (11.2.7 → 12.1.2)
```bash
npm update @nestjs/swagger@^12 --save --legacy-peer-deps
```

**Files to Review:**
- [ ] `src/swagger.ts` - Swagger configuration
- [ ] Check for deprecated decorators

### Step 4.6: Update Schematics (11.0.10 → 12.0.16)
```bash
npm install --save-dev @nestjs/schematics@^12 --legacy-peer-deps
```

**Validation:**
```bash
nest generate service test-service  # Should work
rm -rf src/test-service              # Cleanup
```

### Step 4.7: Update Testing Types (@types/supertest)
```bash
npm install --save-dev @types/supertest@^7.2.1 --legacy-peer-deps
```

**Files to Review:**
- [ ] All `.test.ts` files using supertest
- [ ] Check request/response type hints
- [ ] Verify test helper functions still work

### Step 4.8: Update Testing Library (nock)
```bash
npm install --save-dev nock@^15.0.6 --legacy-peer-deps
```

**Files to Review:**
- [ ] All test files using `nock()` for HTTP mocking
- [ ] Check matcher patterns and request interception

**Command to Find Usage:**
```bash
grep -r "nock(" test --include="*.ts" | head -5
```

---

## Phase 5: Clean Install & Full Validation

### Step 1: Clean Install
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 2: Comprehensive Testing
- [ ] `npm run type-check` - Full type checking
  ```bash
  npm run type-check
  ```
  
- [ ] `npm run build` - Full build
  ```bash
  npm run build
  ```
  
- [ ] `npm run lint` - Full linting
  ```bash
  npm run lint
  ```
  
- [ ] `npm run unit-test` - All unit tests (should pass 71 test suites)
  ```bash
  npm run unit-test
  ```
  
- [ ] `npm run api-test` - All API tests
  ```bash
  npm run api-test
  ```

### Step 3: Smoke Test
```bash
npm run start:dev &
# Wait for server to start
# Test an endpoint:
curl http://localhost:3000/api/health  # Adjust endpoint as needed
# Kill the server: Ctrl+C
```

### Step 4: Final Commit
```bash
git add package.json package-lock.json
git commit -m "chore(deps): update all remaining ecosystem packages

- @nestjs/config: 4.0.4 → 12.1.1
- @nestjs/cache-manager: 3.1.0 → 12.0.5
- @nestjs/axios: 4.0.1 → 12.0.2
- @nestjs/passport: 10.0.3 → 12.0.2
- @nestjs/swagger: 11.2.7 → 12.1.2
- @types/supertest: 2.0.16 → 7.2.1
- nock: 14.0.12 → 15.0.6"
```

---

## Phase 6: Code Review & PR

### Documentation Updates
- [ ] Update CHANGELOG.md with version changes
- [ ] Add notes about breaking changes (if any)
- [ ] Document any new dependencies or removals
- [ ] Update README.md if setup instructions changed

### PR Description Template
```markdown
## Chore: Update outdated dependencies

### Overview
Updated 13 outdated dependencies to their latest versions, including major NestJS ecosystem packages and TypeScript.

### Changes
- **NestJS Core:** 11.x → 12.x (all core packages)
- **TypeScript:** 6.0.2 → 7.0.2
- **NestJS Ecosystem:** Config, Cache-Manager, Axios, Passport, Swagger updated
- **Testing:** @types/supertest, nock updated

### Testing
- ✅ All 71 unit test suites passing
- ✅ API tests passing
- ✅ TypeScript compilation (type-check) passing
- ✅ ESLint validation passing
- ✅ Build successful
- ✅ Smoke test passed

### Breaking Changes
None detected - all updates are backward compatible.

### Migration Notes
Fixed existing TypeScript error in `test/support/mocks/dtfs-storage-client.service.mock.ts`.

Closes #<issue-number> (if applicable)
```

---

## Troubleshooting Guide

### Issue: Type checking still fails after updates
**Solution:**
```bash
# Clear TypeScript cache and rebuild
rm -rf dist
npm run type-check
```

### Issue: Tests fail with module not found errors
**Solution:**
```bash
# Clean install with latest lock file
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run unit-test
```

### Issue: Import/export errors in NestJS modules
**Solution:**
- Check NestJS 12 migration guide for export changes
- Verify all `@Module()` decorators are correctly structured
- Check if any providers have changed names or moved locations

### Issue: Cache-manager or Config not initializing
**Solution:**
- Verify `ConfigModule.forRoot()` syntax is still correct
- Check `.env` file format and variable names
- Review cache configuration in module setup

### Issue: Passport strategies failing
**Solution:**
- Verify authentication strategy setup
- Check guard decorators on routes
- Ensure header authentication works

### Issue: Type errors in test files
**Solution:**
```bash
# Update test types
npm install --save-dev @types/jest@latest @types/node@latest

# If supertest types still have issues:
npm list @types/supertest
npm update @types/supertest --save-dev
```

---

## Success Criteria

✅ All criteria must be met before PR approval:

1. **Build:** `npm run build` exits with code 0
2. **Type Check:** `npm run type-check` exits with code 0  
3. **Unit Tests:** All 71 test suites pass (`npm run unit-test`)
4. **API Tests:** All API tests pass (`npm run api-test`)
5. **Linting:** `npm run lint` exits with code 0
6. **No Console Errors:** No warnings or deprecation messages in test output
7. **Smoke Test:** Application starts and responds to requests
8. **Git Commits:** Clean, atomic commits with descriptive messages
9. **Documentation:** CHANGELOG.md updated

---

## Rollback Plan

If critical issues arise that cannot be fixed:

```bash
# Reset to initial state
git reset --hard origin/main
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Or, revert to specific package
git checkout HEAD -- package.json package-lock.json
npm install --legacy-peer-deps
```

---

## Timeline

| Phase | Tasks | Est. Time | Actual |
|-------|-------|-----------|--------|
| 1 | Fix existing error | 30 min | __ |
| 2 | NestJS core updates | 1-1.5 hrs | __ |
| 3 | TypeScript update | 1-1.5 hrs | __ |
| 4.1-4.8 | Ecosystem packages | 2-3 hrs | __ |
| 5 | Clean install & validate | 1-1.5 hrs | __ |
| 6 | Documentation & PR | 1 hr | __ |
| **Total** | | **7-10 hrs** | **__** |

---

## Sign-off

- [ ] Developer: Updated and tested locally
- [ ] Code Review: Reviewed for breaking changes
- [ ] QA: Verified all tests passing
- [ ] Ready for Merge

**Branch:** `chore/update-dependencies`  
**Date Started:** ____________  
**Date Completed:** ____________  
**Reviewed By:** ____________
