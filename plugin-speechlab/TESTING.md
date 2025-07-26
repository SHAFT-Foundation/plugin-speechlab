# 🧪 SpeechLab Plugin Testing Guide

This document provides comprehensive testing instructions to verify the plugin works correctly with the real SpeechLab API.

## 📋 Test Types

### 1. Unit Tests (No API Calls)
These test the plugin structure and input validation without making real API calls.

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Coverage:** Currently covers 33% of code including:
- ✅ Plugin structure validation
- ✅ Input parameter validation  
- ✅ Error handling for missing credentials
- ✅ Configuration parsing

### 2. Integration Tests (Real API)
These tests verify the plugin works with the actual SpeechLab API.

**Prerequisites:**
- Valid SpeechLab account
- SpeechLab credentials (email/password)

```bash
# Set your credentials
export SPEECHLAB_EMAIL="your@email.com"
export SPEECHLAB_PASSWORD="yourpassword"

# Run integration tests
npm run test:integration
```

**What's tested:**
- ✅ Authentication with real API
- ✅ Invalid credential handling
- ✅ Error scenarios (invalid URLs, unsupported languages)
- ✅ Language mapping (es → es_la)
- 🔄 Full dubbing workflow (optional, requires SPEECHLAB_INTEGRATION_TEST=true)

### 3. Manual End-to-End Test
Interactive test script that walks through the complete plugin functionality.

```bash
# Quick validation test
SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual

# Full E2E test (creates real dubbing project)
SPEECHLAB_FULL_E2E_TEST=true SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual
```

## 🚀 Quick Verification

To quickly verify the plugin works:

1. **Check plugin loads correctly:**
   ```bash
   npm run demo
   ```

2. **Validate your credentials:**
   ```bash
   SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual
   ```

3. **Run a real dubbing test:**
   ```bash
   SPEECHLAB_FULL_E2E_TEST=true SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual
   ```

## 🔍 Test Scenarios Covered

### Authentication Tests
- ✅ Valid credentials → Success
- ✅ Invalid credentials → Proper error
- ✅ Missing credentials → Validation error
- ✅ Network issues → Graceful handling

### Input Validation Tests  
- ✅ Missing audioUrl → Error
- ✅ Missing targetLanguage → Error
- ✅ Invalid options → Error
- ✅ Malformed parameters → Error

### API Integration Tests
- ✅ Authentication flow
- ✅ Project creation
- ✅ Status polling
- ✅ Sharing link generation
- ✅ Error retry logic (401 handling)
- ✅ Language mapping (es → es_la)

### End-to-End Workflow
- 🔄 Complete dubbing process
- 🔄 Timeout handling
- 🔄 Project failure scenarios
- 🔄 Network interruption recovery

## 📊 Expected Test Results

### Unit Tests Output
```
✓ src/index.test.ts  (8 tests) 5ms

Test Files  1 passed (1)
Tests  8 passed (8)
```

### Integration Test Output (with credentials)
```
✓ should authenticate with valid credentials
✓ should fail with invalid credentials  
✓ should handle invalid audio URL
✓ should handle unsupported language
✓ should handle Spanish language mapping
```

### Manual Test Output
```
🧪 SpeechLab Plugin Integration Test Suite
============================================================
[1] Checking Prerequisites
✅ Email: your@email.com
✅ Password: [HIDDEN]

[2] Testing Plugin Structure  
✅ Plugin structure is valid

[3] Testing Credential Validation
✅ Credentials are valid

[4] Testing API Connection
✅ API connection successful

[5] Testing Input Validation
✅ Missing audioUrl: Correctly rejected
✅ Missing targetLanguage: Correctly rejected
✅ Missing options: Correctly rejected

[6] Running Full End-to-End Dubbing Test
✅ E2E test completed in 2.3 minutes!
Project ID: abc123
Status: COMPLETE
Sharing Link: https://speechlab.ai/share/xyz789

🎉 Integration Test Suite Completed!
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing credentials" error**
   ```
   Solution: Set SPEECHLAB_EMAIL and SPEECHLAB_PASSWORD environment variables
   ```

2. **"API connection failed" error**
   ```
   Check: Network connectivity, credential validity, SpeechLab service status
   ```

3. **"Project did not complete" error**
   ```
   Check: Audio file accessibility, SpeechLab processing status, increase timeout
   ```

4. **"Unsupported language" error**
   ```
   Check: Language code format (use ISO 639-1 codes like 'es', 'fr', 'de')
   ```

### Environment Variables

Required for integration tests:
```bash
SPEECHLAB_EMAIL=your@speechlab.ai
SPEECHLAB_PASSWORD=your_password
```

Optional configuration:
```bash
SPEECHLAB_SOURCE_LANGUAGE=en                    # Default source language
SPEECHLAB_MAX_WAIT_TIME_MINUTES=60             # Timeout for dubbing completion
SPEECHLAB_CHECK_INTERVAL_SECONDS=30            # Status check frequency
SPEECHLAB_DEBUG=true                           # Enable detailed logging
SPEECHLAB_INTEGRATION_TEST=true                # Enable integration tests
SPEECHLAB_FULL_E2E_TEST=true                   # Enable full E2E workflow
```

## 📈 Testing Best Practices

1. **Development Workflow:**
   ```bash
   # During development
   npm run test:watch
   
   # Before committing
   npm test && npm run typecheck && npm run lint
   
   # Before PR submission
   npm run test:manual
   ```

2. **CI/CD Integration:**
   ```bash
   # In CI pipeline (no credentials)
   npm test
   npm run typecheck  
   npm run lint
   npm run build
   ```

3. **Production Verification:**
   ```bash
   # With production credentials
   npm run test:integration
   SPEECHLAB_FULL_E2E_TEST=true npm run test:manual
   ```

## 🎯 Test Coverage Goals

- **Unit Tests:** Cover all input validation and error scenarios
- **Integration Tests:** Verify API connectivity and basic functionality  
- **E2E Tests:** Confirm complete dubbing workflow works end-to-end

The current test suite provides confidence that the plugin will work correctly in production ElizaOS environments.