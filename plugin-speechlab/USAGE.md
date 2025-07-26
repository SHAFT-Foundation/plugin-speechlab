# 🤖 SpeechLab Plugin Usage Guide

This guide provides detailed instructions on how to use the SpeechLab plugin in your ElizaOS agent.

## 📦 Installation

Install the plugin via npm:

```bash
npm install @elizaos/plugin-speechlab
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root with your SpeechLab credentials:

```bash
SPEECHLAB_EMAIL=your_email@example.com
SPEECHLAB_PASSWORD=your_password
```

### Character Configuration

Add the plugin to your character's configuration file:

```json
{
  "name": "MyAgent",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "your_email@example.com",
    "SPEECHLAB_PASSWORD": "your_password",
    "SPEECHLAB_SOURCE_LANGUAGE": "en",
    "SPEECHLAB_MAX_WAIT_TIME_MINUTES": "60",
    "SPEECHLAB_CHECK_INTERVAL_SECONDS": "30"
  }
}
```

## 🚀 Usage Examples

### Basic Usage

```javascript
import { ModelType } from '@elizaos/core';

// Basic dubbing example
const result = await runtime.invokeModel('AUDIO_DUBBING', {
  audioUrl: 'https://example.com/audio.mp3',
  targetLanguage: 'es'
});

console.log('Project ID:', result.projectId);
console.log('Sharing Link:', result.sharingLink);
console.log('Status:', result.status);
```

### Advanced Usage with Custom Project Name

```javascript
const result = await runtime.invokeModel('AUDIO_DUBBING', {
  audioUrl: 'https://example.com/podcast-episode-1.mp3',
  targetLanguage: 'fr',
  projectName: 'Podcast Episode 1 - French Version'
});
```

### Multiple Language Dubbing

```javascript
const languages = ['es', 'fr', 'de', 'it', 'pt'];
const audioUrl = 'https://example.com/video-audio.mp3';

for (const lang of languages) {
  try {
    const result = await runtime.invokeModel('AUDIO_DUBBING', {
      audioUrl,
      targetLanguage: lang,
      projectName: `Video Audio - ${lang.toUpperCase()}`
    });
    
    console.log(`✅ ${lang}: ${result.sharingLink}`);
  } catch (error) {
    console.error(`❌ Failed to dub to ${lang}:`, error.message);
  }
}
```

## 🔍 API Response Format

The plugin returns the following response structure:

```typescript
interface DubbingResult {
  projectId: string;           // Unique project identifier
  status: string;              // Project status (COMPLETE, FAILED, etc.)
  targetLanguage: string;      // Target language code
  sharingLink: string;         // URL to access the dubbed audio
  projectDetails: {            // Full project details
    id: string;
    job: {
      name: string;
      sourceLanguage: string;
      targetLanguage: string;
      status: string;
    };
    translations?: Array<{
      id: string;
      language: string;
      dub?: Array<{
        id?: string;
        language?: string;
        voiceMatchingMode?: string;
        medias?: Array<{
          _id: string;
          uri: string;
          category: string;
          presignedURL?: string;
        }>;
      }>;
    }>;
  };
}
```

## ⚡ Performance Considerations

- **Processing Time**: Dubbing typically takes 5-30 minutes depending on audio length
- **Polling**: The plugin automatically polls for completion status
- **Timeout**: Default timeout is 60 minutes (configurable)
- **Rate Limits**: Be mindful of SpeechLab API rate limits

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```
   Error: Missing required credentials
   ```
   - Ensure `SPEECHLAB_EMAIL` and `SPEECHLAB_PASSWORD` are set correctly
   - Verify your SpeechLab account is active

2. **Timeout Errors**
   ```
   Error: Maximum wait time exceeded
   ```
   - Increase `SPEECHLAB_MAX_WAIT_TIME_MINUTES` for longer audio files
   - Check SpeechLab dashboard for project status

3. **Invalid Audio URL**
   ```
   Error: Failed to create dubbing project
   ```
   - Ensure the audio URL is publicly accessible
   - Verify the audio format is supported (MP3, WAV, etc.)

### Debug Mode

Enable debug logging for troubleshooting:

```json
{
  "settings": {
    "SPEECHLAB_DEBUG": "true"
  }
}
```

## 📊 Monitoring

Monitor your dubbing projects through:

1. **Plugin Logs**: Check console output for detailed status updates
2. **SpeechLab Dashboard**: View all projects at https://speechlab.ai/dashboard
3. **Sharing Links**: Access dubbed audio directly via generated links

## 🔐 Security Best Practices

1. **Credentials**: Never commit credentials to version control
2. **Audio URLs**: Use HTTPS URLs for audio files
3. **Access Control**: Implement proper access controls for sharing links
4. **API Keys**: Rotate credentials regularly

## 📚 Additional Resources

- [SpeechLab API Documentation](https://docs.speechlab.ai)
- [ElizaOS Plugin Development](https://elizaos.github.io/eliza/docs/plugins)
- [SpeechLab Support](https://speechlab.ai/support)

## 💡 Tips

1. **Batch Processing**: Process multiple files sequentially to avoid rate limits
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Status Checking**: Use the `projectDetails` to access detailed status information
4. **Language Codes**: Use standard ISO 639-1 language codes (es, fr, de, etc.)

For more examples and advanced usage, check the `/examples` directory in the plugin repository.