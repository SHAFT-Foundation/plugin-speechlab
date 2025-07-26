# ElizaOS Agent Use Cases with SpeechLab Plugin

This document showcases real-world scenarios where ElizaOS agents leverage the SpeechLab plugin for automated voice dubbing.

## Use Case 1: Content Creator Assistant Agent

### Scenario
A YouTube creator has an ElizaOS agent that automatically processes new video uploads and creates multilingual versions.

### Agent Configuration
```json
{
  "name": "ContentCreatorBot",
  "bio": "I help content creators expand their global reach by automatically dubbing videos into multiple languages.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "creator@example.com",
    "SPEECHLAB_PASSWORD": "secure_password"
  },
  "actions": ["PROCESS_NEW_UPLOAD", "CREATE_MULTILINGUAL_VERSIONS"]
}
```

### Agent Conversation
```
User: "Hey, I just uploaded a new tech review video. Can you create Spanish and French versions?"

Agent: "I'll process your video and create dubbed versions in Spanish and French while preserving your voice. Let me get the audio from your latest upload..."

[Agent extracts audio URL from video]

Agent: "Creating Spanish version..."
[Calls SpeechLab plugin]

Agent: "Creating French version..."
[Calls SpeechLab plugin]

Agent: "✅ Dubbing complete! Here are your multilingual versions:
🇪🇸 Spanish: https://speechlab.ai/share/spanish-tech-review-xyz
🇫🇷 French: https://speechlab.ai/share/french-tech-review-abc

Both versions maintain your original voice and enthusiasm. You can now upload these to reach Spanish and French-speaking audiences!"
```

### Implementation
```javascript
const processUploadAction = {
  name: "PROCESS_NEW_UPLOAD",
  handler: async (runtime, message, state) => {
    const videoUrl = extractVideoUrl(message.content);
    const audioUrl = await extractAudioFromVideo(videoUrl);
    
    const targetLanguages = state.userPreferences?.languages || ['es', 'fr'];
    const results = [];
    
    for (const lang of targetLanguages) {
      const result = await runtime.invokeModel('AUDIO_DUBBING', {
        audioUrl,
        targetLanguage: lang,
        projectName: `${state.videoTitle} - ${lang.toUpperCase()}`
      });
      
      results.push({
        language: lang,
        sharingLink: result.sharingLink,
        projectId: result.projectId
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

## Use Case 2: Corporate Training Agent

### Scenario
A multinational company uses an ElizaOS agent to automatically localize training materials for different regional offices.

### Agent Configuration
```json
{
  "name": "TrainingLocalizer",
  "bio": "I automatically convert corporate training materials into local languages for global teams.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "training@company.com",
    "SPEECHLAB_PASSWORD": "corporate_pass"
  },
  "actions": ["LOCALIZE_TRAINING", "BATCH_PROCESS_MATERIALS"]
}
```

### Agent Conversation
```
HR Manager: "We need to localize the new leadership training for our European offices - German, Spanish, and Italian teams."

Agent: "I'll create localized versions of your leadership training that maintain the instructor's authoritative voice in German, Spanish, and Italian. This will help preserve the impact of the original presentation.

Processing training module: 'Effective Leadership Strategies'..."

[Agent processes the training audio]

Agent: "✅ Training localization complete!

🇩🇪 German Team: https://speechlab.ai/share/leadership-de-xyz
🇪🇸 Spanish Team: https://speechlab.ai/share/leadership-es-abc  
🇮🇹 Italian Team: https://speechlab.ai/share/leadership-it-def

Each version preserves the instructor's confident delivery style. I've also updated the training portal with these new versions and notified regional managers."
```

### Implementation
```javascript
const localizeTrainingAction = {
  name: "LOCALIZE_TRAINING",
  handler: async (runtime, message, state) => {
    const { trainingModule, targetRegions } = extractTrainingRequest(message.content);
    
    const languageMap = {
      'europe': ['de', 'es', 'it', 'fr'],
      'asia': ['ja', 'ko', 'zh'],
      'latam': ['es', 'pt']
    };
    
    const languages = targetRegions.flatMap(region => languageMap[region] || []);
    const results = [];
    
    for (const lang of languages) {
      const result = await runtime.invokeModel('AUDIO_DUBBING', {
        audioUrl: trainingModule.audioUrl,
        targetLanguage: lang,
        projectName: `${trainingModule.title} - ${lang.toUpperCase()} Training`
      });
      
      results.push({
        language: lang,
        region: getRegionForLanguage(lang),
        sharingLink: result.sharingLink
      });
      
      // Update training portal
      await updateTrainingPortal(trainingModule.id, lang, result.sharingLink);
    }
    
    // Notify regional managers
    await notifyRegionalManagers(results);
    
    return {
      text: `✅ Training localized for ${results.length} markets:\n${
        results.map(r => `🌍 ${r.language.toUpperCase()} (${r.region}): ${r.sharingLink}`).join('\n')
      }\n\nRegional managers have been notified and training portals updated.`,
      content: { localizedTraining: results }
    };
  }
};
```

## Use Case 3: Podcast Distribution Agent

### Scenario
A podcast network uses an ElizaOS agent to automatically create international versions of their shows.

### Agent Configuration
```json
{
  "name": "PodcastGlobalizer",
  "bio": "I expand podcast reach by creating authentic multilingual versions that preserve each host's unique personality.",
  "plugins": ["@elizaos/plugin-speechlab"],
  "settings": {
    "SPEECHLAB_EMAIL": "podcasts@network.com",
    "SPEECHLAB_PASSWORD": "podcast_secure"
  },
  "actions": ["GLOBALIZE_EPISODE", "SCHEDULE_INTERNATIONAL_RELEASE"]
}
```

### Agent Conversation
```
Podcast Producer: "Our 'Tech Talk Tuesday' episode about AI just went live. Can you create versions for our international markets?"

Agent: "Perfect! I'll create international versions of your AI episode while keeping each host's personality intact. Based on your audience analytics, I'll prioritize Spanish, French, German, and Japanese markets.

Processing 'The Future of AI in Healthcare' - Episode 42..."

[Agent processes podcast audio]

Agent: "🎙️ International versions ready!

🇪🇸 Spanish: https://speechlab.ai/share/tech-talk-es-042
🇫🇷 French: https://speechlab.ai/share/tech-talk-fr-042  
🇩🇪 German: https://speechlab.ai/share/tech-talk-de-042
🇯🇵 Japanese: https://speechlab.ai/share/tech-talk-ja-042

All versions preserve the hosts' enthusiasm and technical expertise. I've scheduled these for release on your international feeds and updated your podcast analytics dashboard."
```

### Implementation
```javascript
const globalizeEpisodeAction = {
  name: "GLOBALIZE_EPISODE",
  handler: async (runtime, message, state) => {
    const { episodeId, audioUrl, episodeTitle } = extractEpisodeInfo(message.content);
    
    // Get target markets based on audience analytics
    const targetMarkets = await getTargetMarkets(state.podcastId);
    const results = [];
    
    for (const market of targetMarkets) {
      const result = await runtime.invokeModel('AUDIO_DUBBING', {
        audioUrl,
        targetLanguage: market.language,
        projectName: `${episodeTitle} - ${market.language.toUpperCase()} Edition`
      });
      
      results.push({
        market: market.name,
        language: market.language,
        sharingLink: result.sharingLink,
        projectId: result.projectId
      });
      
      // Schedule release on international feeds
      await scheduleInternationalRelease({
        episodeId,
        language: market.language,
        audioUrl: result.sharingLink,
        releaseTime: market.preferredReleaseTime
      });
    }
    
    // Update analytics dashboard
    await updateAnalyticsDashboard(episodeId, results);
    
    return {
      text: `🎙️ Episode globalized for ${results.length} markets:\n${
        results.map(r => `🌍 ${r.market}: ${r.sharingLink}`).join('\n')
      }\n\nReleases scheduled for optimal local times. Analytics dashboard updated.`,
      content: { 
        globalizedEpisode: {
          episodeId,
          internationalVersions: results
        }
      }
    };
  }
};
```

## Use Case 4: Educational Institution Agent

### Scenario
A university uses an ElizaOS agent to make lectures accessible to international students.

### Agent Conversation
```
Professor: "I've recorded my machine learning lecture series. Can you make it accessible to our international students?"

Agent: "I'll create multilingual versions of your lecture series while preserving your teaching style and technical explanations. This will help international students follow along in their native language.

Based on your student demographics, I'll create versions in:
- Spanish (for Latin American exchange students)
- Mandarin (for Chinese students) 
- Arabic (for Middle Eastern students)
- French (for Francophone African students)

Processing Lecture 1: 'Introduction to Neural Networks'..."

Agent: "✅ Lecture series localized!

📚 All lectures now available in 4 languages:
🇪🇸 Spanish Lectures: [Portal Link]
🇨🇳 Mandarin Lectures: [Portal Link]  
🇸🇦 Arabic Lectures: [Portal Link]
🇫🇷 French Lectures: [Portal Link]

I've updated the student portal and sent notifications to international student advisors. Your teaching personality and technical clarity are preserved in every language."
```

## Use Case 5: News Agency Agent

### Scenario
A digital news agency uses an ElizaOS agent to rapidly distribute breaking news in multiple languages.

### Agent Conversation
```
News Editor: "BREAKING: Major tech acquisition announced. We need this story out in Spanish, French, and German markets immediately."

Agent: "Breaking news protocols activated! I'll create multilingual versions of your tech acquisition story while maintaining the urgency and authority of the original report.

Processing: 'Tech Giant Acquires AI Startup for $2.4 Billion'
Preserving: Reporter's authoritative tone and breaking news urgency..."

Agent: "🚨 BREAKING NEWS DISTRIBUTED:

🇪🇸 Spanish Markets: https://speechlab.ai/share/breaking-es-tech
🇫🇷 French Markets: https://speechlab.ai/share/breaking-fr-tech
🇩🇪 German Markets: https://speechlab.ai/share/breaking-de-tech

All versions maintain the reporter's authoritative delivery. Stories pushed to international news feeds. Estimated reach: 2.3M additional listeners across European markets."
```

## Key Benefits Across All Use Cases

1. **Voice Consistency** - Maintains speaker personality across languages
2. **Rapid Scaling** - Instant global reach without recording delays  
3. **Cost Efficiency** - Eliminates need for multilingual voice talent
4. **Automation** - Agents handle the entire workflow autonomously
5. **Quality Preservation** - Technical accuracy and emotional impact maintained
6. **Analytics Integration** - Agents track performance across markets

These examples show how ElizaOS agents with the SpeechLab plugin become powerful content globalization tools that preserve human authenticity while enabling instant international reach.