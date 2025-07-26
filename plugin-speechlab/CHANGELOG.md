# Changelog

All notable changes to the SpeechLab plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-26

### Added
- Initial release of the SpeechLab plugin for ElizaOS
- Support for AUDIO_DUBBING model type
- Automatic audio dubbing with voice preservation
- Multi-language support (es, fr, de, it, pt, ja, ko, zh, ar, and more)
- Automatic project status polling
- Sharing link generation for completed projects
- Comprehensive error handling with retry logic
- Token caching for improved performance
- Configurable timeout and polling intervals
- Built-in credential validation tests
- API connection health checks

### Features
- **Voice Matching**: Preserves original speaker's voice characteristics
- **Language Mapping**: Automatic mapping for language variants (e.g., es → es_la)
- **Project Tracking**: Third-party ID system for reliable project management
- **Status Monitoring**: Real-time progress updates during processing
- **Error Recovery**: Automatic token refresh on authentication failures

### Configuration Options
- `SPEECHLAB_EMAIL`: Account email (required)
- `SPEECHLAB_PASSWORD`: Account password (required)
- `SPEECHLAB_SOURCE_LANGUAGE`: Source language code (default: "en")
- `SPEECHLAB_UNIT_TYPE`: Processing unit type (default: "whiteGlove")
- `SPEECHLAB_VOICE_MATCHING_MODE`: Voice matching mode (default: "source")
- `SPEECHLAB_MAX_WAIT_TIME_MINUTES`: Maximum wait time (default: 60)
- `SPEECHLAB_CHECK_INTERVAL_SECONDS`: Status check interval (default: 30)
- `SPEECHLAB_DEBUG`: Enable debug logging (default: false)

### Documentation
- Comprehensive README with quick start guide
- Detailed USAGE guide with examples
- API response format documentation
- Troubleshooting section
- Contributing guidelines

### Development
- TypeScript support with full type definitions
- Vitest test suite with mocked dependencies
- ESM module format
- Prettier code formatting
- TSup build configuration