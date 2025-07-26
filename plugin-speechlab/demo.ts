// Demo script to test plugin structure and basic functionality
import { speechLabPlugin } from './src/index';

// ANSI color codes for pretty output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color = 'reset') {
  console.log(`${colors[color as keyof typeof colors]}${message}${colors.reset}`);
}

log('\n' + '='.repeat(50), 'blue');
log('🤖 SpeechLab Plugin Demo', 'bold');
log('='.repeat(50), 'blue');

log('\n📋 Plugin Information:', 'cyan');
log(`   Name: ${speechLabPlugin.name}`, 'green');
log(`   Description: ${speechLabPlugin.description}`, 'green');
log(`   Available Models: ${Object.keys(speechLabPlugin.models).join(', ')}`, 'green');
log(`   Built-in Tests: ${speechLabPlugin.tests?.length || 0}`, 'green');

log('\n🔧 Configuration Options:', 'cyan');
const configOptions = [
  'SPEECHLAB_EMAIL (required)',
  'SPEECHLAB_PASSWORD (required)', 
  'SPEECHLAB_SOURCE_LANGUAGE (optional, default: "en")',
  'SPEECHLAB_MAX_WAIT_TIME_MINUTES (optional, default: 60)',
  'SPEECHLAB_CHECK_INTERVAL_SECONDS (optional, default: 30)',
  'SPEECHLAB_DEBUG (optional, default: false)'
];

configOptions.forEach(option => {
  log(`   • ${option}`, 'green');
});

log('\n🌐 Supported Languages:', 'cyan');
const languages = [
  'English (en)', 'Spanish (es)', 'French (fr)', 'German (de)',
  'Italian (it)', 'Portuguese (pt)', 'Japanese (ja)', 'Korean (ko)',
  'Chinese (zh)', 'Arabic (ar)', '...and more'
];

languages.forEach(lang => {
  log(`   • ${lang}`, 'green');
});

log('\n📖 Usage Example:', 'cyan');
log(`   const result = await runtime.invokeModel('AUDIO_DUBBING', {`, 'yellow');
log(`     audioUrl: 'https://example.com/audio.mp3',`, 'yellow');
log(`     targetLanguage: 'es',`, 'yellow');
log(`     projectName: 'My Spanish Dub'`, 'yellow');
log(`   });`, 'yellow');

log('\n🧪 Testing Commands:', 'cyan');
log('   npm test                    # Run unit tests', 'green');
log('   npm run test:coverage       # Run with coverage', 'green');
log('   npm run test:manual         # Manual integration test', 'green');
log('   npm run demo               # This demo script', 'green');

log('\n✅ Plugin Structure Validation:', 'cyan');

// Test plugin structure
const tests = [
  { name: 'Plugin name exists', check: () => !!speechLabPlugin.name },
  { name: 'Plugin description exists', check: () => !!speechLabPlugin.description },
  { name: 'AUDIO_DUBBING model exists', check: () => !!speechLabPlugin.models['AUDIO_DUBBING'] },
  { name: 'Model is a function', check: () => typeof speechLabPlugin.models['AUDIO_DUBBING'] === 'function' },
  { name: 'Built-in tests exist', check: () => !!speechLabPlugin.tests && speechLabPlugin.tests.length > 0 },
  { name: 'Credential validation test exists', check: () => {
    const testSuite = speechLabPlugin.tests?.[0];
    return !!testSuite?.tests?.find(t => t.name === 'SpeechLab API credential validation');
  }},
  { name: 'Connection test exists', check: () => {
    const testSuite = speechLabPlugin.tests?.[0];
    return !!testSuite?.tests?.find(t => t.name === 'SpeechLab API connection test');
  }}
];

tests.forEach(test => {
  try {
    const passed = test.check();
    log(`   ${passed ? '✅' : '❌'} ${test.name}`, passed ? 'green' : 'red');
  } catch (error) {
    log(`   ❌ ${test.name} (error: ${error})`, 'red');
  }
});

log('\n' + '='.repeat(50), 'blue');
log('🎉 Plugin Demo Complete!', 'bold');
log('='.repeat(50), 'blue');

log('\nNext steps:');
log('1. Set up your SpeechLab credentials');
log('2. Run integration tests to verify functionality');
log('3. Add plugin to your ElizaOS character configuration');
log('4. Start dubbing audio content!');

log('\nFor detailed testing instructions, see TESTING.md'); 