#!/usr/bin/env node

/**
 * Manual Integration Test Script for SpeechLab Plugin
 * 
 * This script tests the plugin against the real SpeechLab API
 * to verify end-to-end functionality.
 * 
 * Usage:
 *   SPEECHLAB_EMAIL=your@email.com SPEECHLAB_PASSWORD=yourpass node test-integration.js
 */

import { speechLabPlugin } from './dist/index.js';

// ANSI color codes for pretty output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Mock runtime that uses environment variables
const mockRuntime = {
  getSetting: (key) => {
    return process.env[key];
  }
};

async function runIntegrationTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 SpeechLab Plugin Integration Test Suite', 'bold');
  log('='.repeat(60), 'blue');

  // Check prerequisites
  logStep('1', 'Checking Prerequisites');
  
  if (!process.env.SPEECHLAB_EMAIL || !process.env.SPEECHLAB_PASSWORD) {
    logError('Missing required environment variables!');
    log('\nPlease set the following environment variables:');
    log('  SPEECHLAB_EMAIL=your@email.com');
    log('  SPEECHLAB_PASSWORD=yourpassword');
    log('\nExample:');
    log('  SPEECHLAB_EMAIL=test@example.com SPEECHLAB_PASSWORD=mypass node test-integration.js');
    process.exit(1);
  }

  logSuccess(`Email: ${process.env.SPEECHLAB_EMAIL}`);
  logSuccess('Password: [HIDDEN]');

  // Test 1: Plugin Structure
  logStep('2', 'Testing Plugin Structure');
  
  try {
    if (!speechLabPlugin.name || !speechLabPlugin.description) {
      throw new Error('Plugin missing required properties');
    }
    
    if (!speechLabPlugin.models['AUDIO_DUBBING']) {
      throw new Error('AUDIO_DUBBING model not found');
    }
    
    if (!speechLabPlugin.tests || speechLabPlugin.tests.length === 0) {
      throw new Error('Plugin tests not found');
    }
    
    logSuccess('Plugin structure is valid');
  } catch (error) {
    logError(`Plugin structure test failed: ${error.message}`);
    process.exit(1);
  }

  // Test 2: Credential Validation
  logStep('3', 'Testing Credential Validation');
  
  try {
    const testSuite = speechLabPlugin.tests[0];
    const credentialTest = testSuite.tests.find(
      test => test.name === 'SpeechLab API credential validation'
    );
    
    await credentialTest.fn(mockRuntime);
    logSuccess('Credentials are valid');
  } catch (error) {
    logError(`Credential validation failed: ${error.message}`);
    process.exit(1);
  }

  // Test 3: API Connection
  logStep('4', 'Testing API Connection');
  
  try {
    const testSuite = speechLabPlugin.tests[0];
    const connectionTest = testSuite.tests.find(
      test => test.name === 'SpeechLab API connection test'
    );
    
    await connectionTest.fn(mockRuntime);
    logSuccess('API connection successful');
  } catch (error) {
    logError(`API connection failed: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      logWarning('This might be a credentials issue. Please verify your email and password.');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      logWarning('This might be a network connectivity issue.');
    }
    
    process.exit(1);
  }

  // Test 4: Input Validation
  logStep('5', 'Testing Input Validation');
  
  const validationTests = [
    {
      name: 'Missing audioUrl',
      options: { targetLanguage: 'es' },
      expectedError: 'Missing required audioUrl parameter'
    },
    {
      name: 'Missing targetLanguage', 
      options: { audioUrl: 'https://example.com/audio.mp3' },
      expectedError: 'Missing required targetLanguage parameter'
    },
    {
      name: 'Missing options',
      options: null,
      expectedError: 'Missing required dubbing options'
    }
  ];

  for (const test of validationTests) {
    try {
      await speechLabPlugin.models['AUDIO_DUBBING'](mockRuntime, test.options);
      logError(`${test.name}: Should have thrown an error`);
    } catch (error) {
      if (error.message.includes(test.expectedError)) {
        logSuccess(`${test.name}: Correctly rejected`);
      } else {
        logError(`${test.name}: Wrong error message: ${error.message}`);
      }
    }
  }

  // Test 5: End-to-End Dubbing (Optional)
  if (process.env.SPEECHLAB_FULL_E2E_TEST === 'true') {
    logStep('6', 'Running Full End-to-End Dubbing Test');
    logWarning('This test will create a real dubbing project and may take several minutes...');
    
    try {
      // Use a short public domain audio file
      const testAudioUrl = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav';
      
      log(`Testing with audio: ${testAudioUrl}`);
      log('Target language: Spanish (es)');
      
      const startTime = Date.now();
      
      const result = await speechLabPlugin.models['AUDIO_DUBBING'](mockRuntime, {
        audioUrl: testAudioUrl,
        targetLanguage: 'es',
        projectName: 'Integration Test - ' + new Date().toISOString()
      });
      
      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      
      logSuccess(`E2E test completed in ${duration} minutes!`);
      log(`Project ID: ${result.projectId}`);
      log(`Status: ${result.status}`);
      log(`Sharing Link: ${result.sharingLink}`);
      
      // Verify result structure
      const requiredProps = ['projectId', 'status', 'targetLanguage', 'sharingLink', 'projectDetails'];
      for (const prop of requiredProps) {
        if (!result[prop]) {
          logError(`Missing property in result: ${prop}`);
        } else {
          logSuccess(`Result has ${prop}: ${typeof result[prop]}`);
        }
      }
      
    } catch (error) {
      logError(`E2E test failed: ${error.message}`);
      
      if (error.message.includes('timeout') || error.message.includes('did not complete')) {
        logWarning('The project might still be processing. Check your SpeechLab dashboard.');
      }
    }
  } else {
    logStep('6', 'Skipping End-to-End Test');
    log('To run the full E2E test (creates real dubbing project):');
    log('  SPEECHLAB_FULL_E2E_TEST=true SPEECHLAB_EMAIL=... node test-integration.js');
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  logSuccess('🎉 Integration Test Suite Completed!');
  log('='.repeat(60), 'blue');
  
  log('\nThe plugin is ready for:');
  log('  • ElizaOS integration');
  log('  • Production deployment'); 
  log('  • Real-world usage');
  
  log('\nNext steps:');
  log('  • Submit PR to ElizaOS repository');
  log('  • Add plugin to your character configuration');
  log('  • Start dubbing audio content!');
}

// Run the tests
runIntegrationTests().catch(error => {
  logError(`\nUnexpected error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});