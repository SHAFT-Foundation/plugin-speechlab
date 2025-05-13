import { speechLabPlugin } from './src/index';

// Mock the agent runtime
const mockRuntime = {
  getSetting: (key: string) => {
    // Replace with actual values for testing
    const settings: Record<string, string> = {
      'SPEECHLAB_EMAIL': process.env.SPEECHLAB_EMAIL || '',
      'SPEECHLAB_PASSWORD': process.env.SPEECHLAB_PASSWORD || '',
      'SPEECHLAB_SOURCE_LANGUAGE': 'en',
      'SPEECHLAB_UNIT_TYPE': 'whiteGlove',
      'SPEECHLAB_VOICE_MATCHING_MODE': 'source',
      'SPEECHLAB_MAX_WAIT_TIME_MINUTES': '60',
      'SPEECHLAB_CHECK_INTERVAL_SECONDS': '30',
      'SPEECHLAB_DEBUG': 'true'
    };
    return settings[key] || null;
  },
  // Add other required runtime methods here
};

async function runTests() {
  console.log('🧪 Starting SpeechLab Plugin Tests\n');
  
  if (!speechLabPlugin.tests || speechLabPlugin.tests.length === 0) {
    console.log('No tests found in the plugin.');
    return;
  }
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testGroup of speechLabPlugin.tests) {
    console.log(`\n📋 Test Group: ${testGroup.name}`);
    
    for (const test of testGroup.tests) {
      process.stdout.write(`   ⏳ Running test: ${test.name}...`);
      
      try {
        await test.fn(mockRuntime);
        console.log('✅ PASSED');
        passedTests++;
      } catch (error) {
        console.log('❌ FAILED');
        console.log(`     Error: ${error.message}`);
        failedTests++;
      }
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📝 Total: ${passedTests + failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n⚠️ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 