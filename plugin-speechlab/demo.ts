// Simple demo to test the plugin
import { speechLabPlugin } from './src/index';

console.log('SpeechLab Plugin Information:');
console.log('-----------------------------------');
console.log(`Name: ${speechLabPlugin.name}`);
console.log(`Description: ${speechLabPlugin.description}`);
console.log(`Models: ${Object.keys(speechLabPlugin.models).join(', ')}`);
console.log(`Tests: ${speechLabPlugin.tests?.length || 0}`);
console.log('-----------------------------------');
console.log('Plugin loaded successfully!'); 