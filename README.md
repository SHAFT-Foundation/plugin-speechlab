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

## Real-World Agent Use Cases

### 1. Content Creator Assistant Agent

**Scenario**: A YouTube creator has an ElizaOS agent that automatically processes new video uploads and creates multilingual versions.

```json
{
  "name": "ContentCreatorBot",
  "bio": "I help content creators expand their global reach by automatically dubbing videos into multiple languages.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "creator@example.com",
    "SPEECHLAB_PASSWORD": "secure_password"
  },
  "actions": ["PROCESS_NEW_UPLOAD"]
}
```

**Agent Conversation:**
```
User: "Hey, I just uploaded a new tech review video. Can you create Spanish and French versions?"

Agent: "I'll process your video and create dubbed versions in Spanish and French while preserving your voice. Let me get the audio from your latest upload..."

Agent: "✅ Dubbing complete! Here are your multilingual versions:
🇪🇸 Spanish: https://speechlab.ai/share/spanish-tech-review-xyz
🇫🇷 French: https://speechlab.ai/share/french-tech-review-abc

Both versions maintain your original voice and enthusiasm!"
```

**Implementation:**
```javascript
const processUploadAction = {
  name: "PROCESS_NEW_UPLOAD",
  handler: async (runtime, message, state) => {
    const audioUrl = extractAudioFromVideo(message.content);
    const targetLanguages = ['es', 'fr'];
    const results = [];
    
    for (const lang of targetLanguages) {
      const result = await runtime.invokeModel('AUDIO_DUBBING', {
        audioUrl,
        targetLanguage: lang,
        projectName: `${state.videoTitle} - ${lang.toUpperCase()}`
      });
      
      results.push({
        language: lang,
        sharingLink: result.sharingLink
      });
    }
    
    return {
      text: `✅ Dubbing complete! Created ${results.length} versions:\n${
        results.map(r => `🌍 ${r.language.toUpperCase()}: ${r.sharingLink}`).join('\n')
      }`,
      content: { dubbingResults: results }
    };
  }
};
```

### 2. Corporate Training Agent

**Scenario**: A multinational company uses an ElizaOS agent to automatically localize training materials for different regional offices.

```json
{
  "name": "TrainingLocalizer",
  "bio": "I automatically convert corporate training materials into local languages for global teams.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "training@company.com",
    "SPEECHLAB_PASSWORD": "corporate_pass"
  },
  "actions": ["LOCALIZE_TRAINING"]
}
```

**Agent Conversation:**
```
HR Manager: "We need to localize the new leadership training for our European offices - German, Spanish, and Italian teams."

Agent: "I'll create localized versions of your leadership training that maintain the instructor's authoritative voice in German, Spanish, and Italian. This will help preserve the impact of the original presentation.

✅ Training localization complete!

🇩🇪 German Team: https://speechlab.ai/share/leadership-de-xyz
🇪🇸 Spanish Team: https://speechlab.ai/share/leadership-es-abc  
🇮🇹 Italian Team: https://speechlab.ai/share/leadership-it-def

Each version preserves the instructor's confident delivery style."
```

### 3. Podcast Distribution Agent

**Scenario**: A podcast network uses an ElizaOS agent to automatically create international versions of their shows.

```json
{
  "name": "PodcastGlobalizer",
  "bio": "I expand podcast reach by creating authentic multilingual versions that preserve each host's unique personality.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "podcasts@network.com",
    "SPEECHLAB_PASSWORD": "podcast_secure"
  },
  "actions": ["GLOBALIZE_EPISODE"]
}
```

**Agent Conversation:**
```
Producer: "Our 'Tech Talk Tuesday' episode about AI just went live. Can you create versions for our international markets?"

Agent: "Perfect! I'll create international versions of your AI episode while keeping each host's personality intact. Based on your audience analytics, I'll prioritize Spanish, French, German, and Japanese markets.

🎙️ International versions ready!

🇪🇸 Spanish: https://speechlab.ai/share/tech-talk-es-042
🇫🇷 French: https://speechlab.ai/share/tech-talk-fr-042  
🇩🇪 German: https://speechlab.ai/share/tech-talk-de-042
🇯🇵 Japanese: https://speechlab.ai/share/tech-talk-ja-042

All versions preserve the hosts' enthusiasm and technical expertise."
```

### 4. Educational Institution Agent

**Scenario**: A university uses an ElizaOS agent to make lectures accessible to international students.

**Agent Conversation:**
```
Professor: "I've recorded my machine learning lecture series. Can you make it accessible to our international students?"

Agent: "I'll create multilingual versions of your lecture series while preserving your teaching style and technical explanations. This will help international students follow along in their native language.

✅ Lecture series localized!

📚 All lectures now available in 4 languages:
🇪🇸 Spanish Lectures: [Portal Link]
🇨🇳 Mandarin Lectures: [Portal Link]  
🇸🇦 Arabic Lectures: [Portal Link]
🇫🇷 French Lectures: [Portal Link]

Your teaching personality and technical clarity are preserved in every language."
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