# 🤖 SpeechLab Plugin for ElizaOS

This plugin provides seamless integration with [SpeechLab](https://speechlab.ai) AI dubbing services through the ElizaOS platform, allowing your agent to automatically create high-quality voice dubbing in multiple languages.

## 🌟 Why SpeechLab?

SpeechLab uses advanced AI technology to create natural-sounding voice dubbing that maintains the original speaker's voice characteristics. This enables you to:

- 🌍 **Expand global reach** by dubbing content into multiple languages
- 🎯 **Preserve emotional tone** of the original speaker
- 🔊 **Maintain voice consistency** across all your content
- ⚡ **Save time and resources** compared to traditional dubbing studios

## 📋 Usage

Add the plugin to your character configuration:

```json
"plugins": ["@elizaos/plugin-speechlab"]
```

## ⚙️ Configuration

The plugin requires these environment variables (can be set in .env file or character settings):

```json
"settings": {
  "SPEECHLAB_EMAIL": "your_speechlab_email",
  "SPEECHLAB_PASSWORD": "your_speechlab_password",
  "SPEECHLAB_SOURCE_LANGUAGE": "en",
  "SPEECHLAB_UNIT_TYPE": "whiteGlove",
  "SPEECHLAB_VOICE_MATCHING_MODE": "source",
  "SPEECHLAB_MAX_WAIT_TIME_MINUTES": "60",
  "SPEECHLAB_CHECK_INTERVAL_SECONDS": "30",
  "SPEECHLAB_DEBUG": "false"
}
```

Or in `.env` file:

```
SPEECHLAB_EMAIL=your_speechlab_email
SPEECHLAB_PASSWORD=your_speechlab_password
# Optional overrides:
SPEECHLAB_SOURCE_LANGUAGE=en
SPEECHLAB_UNIT_TYPE=whiteGlove
SPEECHLAB_VOICE_MATCHING_MODE=source
SPEECHLAB_MAX_WAIT_TIME_MINUTES=60
SPEECHLAB_CHECK_INTERVAL_SECONDS=30
SPEECHLAB_DEBUG=false
```

### 🔑 Configuration Options

- `SPEECHLAB_EMAIL` (required): Your SpeechLab account email.
- `SPEECHLAB_PASSWORD` (required): Your SpeechLab account password.
- `SPEECHLAB_SOURCE_LANGUAGE`: Optional. Source language code. Defaults to `en`.
- `SPEECHLAB_UNIT_TYPE`: Optional. Unit type for dubbing. Defaults to `whiteGlove`.
- `SPEECHLAB_VOICE_MATCHING_MODE`: Optional. Voice matching mode. Defaults to `source`.
- `SPEECHLAB_MAX_WAIT_TIME_MINUTES`: Optional. Maximum time to wait for project completion (minutes). Defaults to `60`.
- `SPEECHLAB_CHECK_INTERVAL_SECONDS`: Optional. Interval between status checks (seconds). Defaults to `30`.
- `SPEECHLAB_DEBUG`: Optional. Enable debug logging (true/false). Defaults to `false`.

## 🔄 Available Models

The plugin provides the following model type:

- `AUDIO_DUBBING`: Creates high-quality voice translations from audio files.

## 📝 Example Usage

```javascript
const result = await runtime.invokeModel('AUDIO_DUBBING', {
  audioUrl: "https://example.com/audio-file.mp3",
  targetLanguage: "es",  // Spanish
  projectName: "My Spanish Dubbing Project"
});

console.log(`Project ID: ${result.projectId}`);
console.log(`Sharing Link: ${result.sharingLink}`);
```

## 🧪 Testing

### Quick Start
```bash
# Install dependencies
npm install

# Run demo to verify plugin structure
npm run demo

# Run unit tests
npm test

# Check test coverage
npm run test:coverage
```

### Integration Testing
To verify the plugin works with the real SpeechLab API:

```bash
# Set your SpeechLab credentials
export SPEECHLAB_EMAIL="your@email.com"
export SPEECHLAB_PASSWORD="yourpassword"

# Run manual integration test
npm run test:manual

# For full end-to-end test (creates real dubbing project)
SPEECHLAB_FULL_E2E_TEST=true npm run test:manual
```

### Expected Results
- **Unit Tests:** 8/8 tests pass with 33% code coverage
- **Integration Tests:** Verify API connectivity and authentication
- **E2E Test:** Complete dubbing workflow (2-5 minutes)

See [TESTING.md](./TESTING.md) for comprehensive testing instructions.

## 🌐 Supported Languages

SpeechLab supports a wide range of languages for dubbing. Language codes:

| Language | Code |
|----------|------|
| English  | en   |
| Spanish  | es   |
| French   | fr   |
| German   | de   |
| Italian  | it   |
| Portuguese | pt  |
| Japanese | ja   |
| Korean   | ko   |
| Chinese  | zh   |
| Arabic   | ar   |

...and many more. Refer to the SpeechLab documentation for the complete list.

## 🔧 Troubleshooting

- **API Connection Issues**: Ensure your credentials are correct and your network can access the SpeechLab API.
- **Long Wait Times**: Dubbing processing can take several minutes. Adjust `SPEECHLAB_MAX_WAIT_TIME_MINUTES` if necessary.
- **Quality Issues**: Try adjusting the `SPEECHLAB_VOICE_MATCHING_MODE` setting.

## 📚 Resources

- [SpeechLab Official Site](https://speechlab.ai)
- [Create a SpeechLab Account](https://speechlab.ai/signup)
- [SpeechLab API Documentation](https://docs.speechlab.ai)

## 📄 License

MIT 