# SpeechLab Plugin

This plugin provides integration with [SpeechLab](https://speechlab.ai) AI dubbing services through the ElizaOS platform, allowing your agent to automatically create high-quality voice dubbing in multiple languages while preserving the original speaker's voice characteristics.

## Features

- 🎭 **Voice Preservation** - Maintains original speaker's unique vocal characteristics
- 🌍 **25+ Languages** - Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, and more
- ⚡ **Automated Processing** - Complete dubbing workflow with status monitoring
- 🔗 **Instant Sharing** - Get shareable links immediately upon completion
- 🛡️ **Enterprise Ready** - Secure, reliable, and scalable for production use

## Usage

Add the plugin to your character configuration:

```json
{
  "plugins": ["@elizaos/plugin-speechlab"]
}
```

## Configuration

The plugin requires these environment variables (can be set in .env file or character settings):

```json
{
  "settings": {
    "SPEECHLAB_EMAIL": "your_speechlab_email",
    "SPEECHLAB_PASSWORD": "your_speechlab_password",
    "SPEECHLAB_SOURCE_LANGUAGE": "en",
    "SPEECHLAB_MAX_WAIT_TIME_MINUTES": "60",
    "SPEECHLAB_CHECK_INTERVAL_SECONDS": "30"
  }
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

### Configuration Options

- `SPEECHLAB_EMAIL` (required): Your SpeechLab account email.
- `SPEECHLAB_PASSWORD` (required): Your SpeechLab account password.
- `SPEECHLAB_SOURCE_LANGUAGE`: Optional. Source language code. Defaults to `en`.
- `SPEECHLAB_UNIT_TYPE`: Optional. Unit type for dubbing. Defaults to `whiteGlove`.
- `SPEECHLAB_VOICE_MATCHING_MODE`: Optional. Voice matching mode. Defaults to `source`.
- `SPEECHLAB_MAX_WAIT_TIME_MINUTES`: Optional. Maximum time to wait for project completion (minutes). Defaults to `60`.
- `SPEECHLAB_CHECK_INTERVAL_SECONDS`: Optional. Interval between status checks (seconds). Defaults to `30`.
- `SPEECHLAB_DEBUG`: Optional. Enable debug logging (true/false). Defaults to `false`.

## Available Models

The plugin provides the following model type:

- `AUDIO_DUBBING`: Creates high-quality voice translations from audio files.

## Example Usage

### Basic Dubbing

```javascript
const result = await runtime.invokeModel('AUDIO_DUBBING', {
  audioUrl: "https://example.com/audio-file.mp3",
  targetLanguage: "es",  // Spanish
  projectName: "My Spanish Dubbing Project"
});

console.log(`Project ID: ${result.projectId}`);
console.log(`Sharing Link: ${result.sharingLink}`);
```

### Character Integration Example

```json
{
  "name": "GlobalContentCreator",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "your@speechlab.ai",
    "SPEECHLAB_PASSWORD": "your_password"
  },
  "actions": [
    {
      "name": "CREATE_MULTILINGUAL_CONTENT",
      "description": "Create dubbed versions of audio content in multiple languages"
    }
  ]
}
```

### Action Implementation

```javascript
// In your character's action handler
const dubbingAction = {
  name: "CREATE_MULTILINGUAL_CONTENT",
  handler: async (runtime, message, state) => {
    const audioUrl = extractAudioUrl(message.content);
    const targetLanguages = ['es', 'fr', 'de', 'it'];
    
    const results = [];
    for (const lang of targetLanguages) {
      const result = await runtime.invokeModel('AUDIO_DUBBING', {
        audioUrl,
        targetLanguage: lang,
        projectName: `Content - ${lang.toUpperCase()}`
      });
      results.push(`${lang}: ${result.sharingLink}`);
    }
    
    return {
      text: `✅ Dubbing complete!\n${results.join('\n')}`,
      content: { dubbingResults: results }
    };
  }
};
```

## Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| English  | en   | Spanish  | es   |
| French   | fr   | German   | de   |
| Italian  | it   | Portuguese | pt  |
| Japanese | ja   | Korean   | ko   |
| Chinese  | zh   | Arabic   | ar   |

...and many more. Refer to the SpeechLab documentation for the complete list.

## Response Format

The AUDIO_DUBBING model returns:

```javascript
{
  projectId: "speechlab_proj_abc123",
  status: "COMPLETE",
  targetLanguage: "es",
  sharingLink: "https://speechlab.ai/share/xyz789",
  projectDetails: {
    id: "speechlab_proj_abc123",
    job: {
      name: "My Spanish Project",
      sourceLanguage: "en",
      targetLanguage: "es_la",
      status: "COMPLETE"
    },
    translations: [...]
  }
}
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests (requires credentials)
SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual

# Run full end-to-end test
SPEECHLAB_FULL_E2E_TEST=true SPEECHLAB_EMAIL="your@email.com" SPEECHLAB_PASSWORD="yourpass" npm run test:manual
```

## Troubleshooting

- **API Connection Issues**: Ensure your credentials are correct and your network can access the SpeechLab API.
- **Long Wait Times**: Dubbing processing can take several minutes. Adjust `SPEECHLAB_MAX_WAIT_TIME_MINUTES` if necessary.
- **Invalid Audio URL**: Ensure the audio URL is publicly accessible (HTTPS recommended).

## Resources

- [SpeechLab Official Site](https://speechlab.ai)
- [Create a SpeechLab Account](https://speechlab.ai/signup)
- [SpeechLab API Documentation](https://docs.speechlab.ai)
- [ElizaOS Documentation](https://elizaos.github.io/eliza/)

## License

MIT